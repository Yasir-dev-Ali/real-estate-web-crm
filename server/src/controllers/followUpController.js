import { FollowUp } from "../models/FollowUp.js";
import { Lead } from "../models/Lead.js";
import { Deal } from "../models/Deal.js";
import { Property } from "../models/Property.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/error.js";
import { paginate } from "../utils/paginate.js";

function scope(req) {
  const filter = { tenantId: req.user.tenantId };
  if (req.user.role === "agent") filter.assignedTo = req.user._id;
  return filter;
}

export const listFollowUps = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = scope(req);
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    FollowUp.find(filter)
      .populate("assignedTo", "name avatar")
      .sort({ dueAt: 1 })
      .skip(skip)
      .limit(limit),
    FollowUp.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const createFollowUp = asyncHandler(async (req, res) => {
  const { title, relatedId, dueAt, relatedType = "lead" } = req.body;
  if (!title || !relatedId || !dueAt) {
    return res.status(400).json({ message: "Title, related record and due date are required" });
  }
  const models = { lead: Lead, deal: Deal, property: Property };
  const RelatedModel = models[relatedType];
  if (!RelatedModel) {
    return res.status(400).json({ message: "Choose a valid lead, deal, or property." });
  }
  const relationScope = { _id: relatedId, tenantId: req.user.tenantId };
  if (req.user.role === "agent" && relatedType === "lead") {
    relationScope.assignedTo = req.user._id;
  }
  if (req.user.role === "agent" && relatedType === "deal") {
    relationScope.agent = req.user._id;
  }
  if (req.user.role === "agent" && relatedType === "property") {
    relationScope.listedBy = req.user._id;
  }
  const [related, assignedUser] = await Promise.all([
    RelatedModel.findOne(relationScope).select("_id"),
    req.user.role === "admin" && req.body.assignedTo
      ? User.findOne({
          _id: req.body.assignedTo,
          tenantId: req.user.tenantId,
          role: "agent",
          status: "active",
        }).select("_id")
      : null,
  ]);
  if (!related) return res.status(400).json({ message: "Choose a related record in this workspace." });
  if (req.user.role === "admin" && req.body.assignedTo && !assignedUser) {
    return res.status(400).json({ message: "Choose an active agent in this workspace." });
  }
  const allowed = ["title", "relatedType", "relatedId", "dueAt", "status", "channel", "notes"];
  const payload = Object.fromEntries(
    allowed.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
  );
  const item = await FollowUp.create({
    ...payload,
    tenantId: req.user.tenantId,
    assignedTo: assignedUser?._id || req.user._id,
  });
  res.status(201).json({ item });
});

export const updateFollowUp = asyncHandler(async (req, res) => {
  const allowed = ["title", "dueAt", "status", "channel", "notes"];
  const payload = Object.fromEntries(
    allowed.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
  );
  if (req.user.role === "admin" && Object.hasOwn(req.body, "assignedTo")) {
    if (!req.body.assignedTo) {
      payload.assignedTo = req.user._id;
    } else {
      const assignedUser = await User.findOne({
        _id: req.body.assignedTo,
        tenantId: req.user.tenantId,
        role: "agent",
        status: "active",
      }).select("_id");
      if (!assignedUser) return res.status(400).json({ message: "Choose an active agent in this workspace." });
      payload.assignedTo = assignedUser._id;
    }
  }
  const item = await FollowUp.findOneAndUpdate(
    { ...scope(req), _id: req.params.id },
    payload,
    { new: true }
  );
  if (!item) return res.status(404).json({ message: "Follow-up not found" });
  res.json({ item });
});
