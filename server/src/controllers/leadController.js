import { Lead } from "../models/Lead.js";
import { Note } from "../models/Note.js";
import { FollowUp } from "../models/FollowUp.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/error.js";
import { paginate, searchRegex } from "../utils/paginate.js";
import { omitEmpty } from "../utils/sanitize.js";

function leadScope(req) {
  const filter = { tenantId: req.user.tenantId };
  if (req.user.role === "agent") {
    filter.assignedTo = req.user._id;
  }
  return filter;
}

export const listLeads = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = leadScope(req);
  if (req.query.status) filter.status = req.query.status;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.interest) filter.interest = req.query.interest;
  if (req.query.city) filter.city = req.query.city;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
  const rx = searchRegex(req.query.q);
  if (rx) filter.$and = [...(filter.$and || []), { $or: [{ name: rx }, { email: rx }, { phone: rx }, { area: rx }] }];

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .populate("assignedTo", "name email avatar")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ ...leadScope(req), _id: req.params.id }).populate(
    "assignedTo",
    "name email avatar phone"
  );
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  const notes = await Note.find({ relatedType: "lead", relatedId: lead._id })
    .populate("author", "name avatar")
    .sort({ createdAt: -1 });
  const followUps = await FollowUp.find({ relatedType: "lead", relatedId: lead._id }).sort({ dueAt: 1 });
  res.json({ lead, notes, followUps });
});

export const createLead = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ message: "Name and phone are required" });
  const body = omitEmpty(req.body);
  let assignedTo = req.user._id;
  if (req.user.role === "admin" && body.assignedTo) {
    const assignee = await User.findOne({
      _id: body.assignedTo,
      tenantId: req.user.tenantId,
      role: "agent",
      status: "active",
    }).select("_id");
    if (!assignee) return res.status(400).json({ message: "Choose an active agent in this workspace." });
    assignedTo = assignee._id;
  }
  const lead = await Lead.create({
    ...body,
    tenantId: req.user.tenantId,
    createdBy: req.user._id,
    assignedTo,
  });
  if (lead.nextFollowUp) {
    await FollowUp.create({
      tenantId: req.user.tenantId,
      title: `Follow up with ${lead.name}`,
      relatedType: "lead",
      relatedId: lead._id,
      assignedTo: lead.assignedTo,
      dueAt: lead.nextFollowUp,
      channel: "call",
    });
  }
  res.status(201).json({ lead });
});

export const updateLead = asyncHandler(async (req, res) => {
  const allowed = [
    "name",
    "email",
    "phone",
    "source",
    "status",
    "interest",
    "budgetMin",
    "budgetMax",
    "city",
    "area",
    "nextFollowUp",
    "tags",
    "score",
    "notes",
  ];
  const payload = Object.fromEntries(
    allowed.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
  );
  if (req.user.role === "admin" && Object.hasOwn(req.body, "assignedTo")) {
    if (!req.body.assignedTo) {
      payload.assignedTo = req.user._id;
    } else {
      const assignee = await User.findOne({
        _id: req.body.assignedTo,
        tenantId: req.user.tenantId,
        role: "agent",
        status: "active",
      }).select("_id");
      if (!assignee) return res.status(400).json({ message: "Choose an active agent in this workspace." });
      payload.assignedTo = assignee._id;
    }
  }
  const lead = await Lead.findOneAndUpdate(
    { ...leadScope(req), _id: req.params.id },
    omitEmpty(payload),
    { new: true, runValidators: true }
  );
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  res.json({ lead });
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndDelete({ ...leadScope(req), _id: req.params.id });
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  res.json({ message: "Lead removed" });
});

export const addNote = asyncHandler(async (req, res) => {
  if (!req.body.body) return res.status(400).json({ message: "Note cannot be empty" });
  const lead = await Lead.findOne({ ...leadScope(req), _id: req.params.id });
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  const note = await Note.create({
    tenantId: req.user.tenantId,
    relatedType: "lead",
    relatedId: lead._id,
    author: req.user._id,
    body: req.body.body,
  });
  await note.populate("author", "name avatar");
  res.status(201).json({ note });
});

export const notifyAssign = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ tenantId: req.user.tenantId, _id: req.params.id });
  if (!lead || !lead.assignedTo) return res.status(404).json({ message: "Lead not found" });
  await Notification.create({
    tenantId: req.user.tenantId,
    user: lead.assignedTo,
    title: "Lead assigned to you",
    body: `${lead.name} is now on your desk.`,
    type: "followup",
    link: `/leads/${lead._id}`,
  });
  res.json({ ok: true });
});
