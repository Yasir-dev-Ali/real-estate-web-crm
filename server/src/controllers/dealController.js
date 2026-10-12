import { Deal } from "../models/Deal.js";
import { Commission } from "../models/Commission.js";
import { User } from "../models/User.js";
import { Property } from "../models/Property.js";
import { Lead } from "../models/Lead.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../middleware/error.js";
import { paginate } from "../utils/paginate.js";
import { omitEmpty } from "../utils/sanitize.js";

function dealScope(req) {
  const filter = { tenantId: req.user.tenantId };
  if (req.user.role === "agent") filter.agent = req.user._id;
  return filter;
}

const STAGE_PROB = {
  inquiry: 15,
  viewing: 30,
  offer: 50,
  token: 70,
  contract: 90,
  closed: 100,
  lost: 0,
};

export const listDeals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = dealScope(req);
  if (req.query.stage) filter.stage = req.query.stage;
  if (req.query.agent) filter.agent = req.query.agent;

  const [items, total] = await Promise.all([
    Deal.find(filter)
      .populate("lead", "name phone")
      .populate("property", "title city price")
      .populate("agent", "name avatar")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Deal.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const getDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({ ...dealScope(req), _id: req.params.id })
    .populate("lead")
    .populate("property")
    .populate("agent", "name email commissionRate avatar");
  if (!deal) return res.status(404).json({ message: "Deal not found" });
  const commission = await Commission.findOne({ deal: deal._id });
  res.json({ deal, commission });
});

export const createDeal = asyncHandler(async (req, res) => {
  const { title, lead, property, value } = req.body;
  if (!title || !lead || value == null) {
    return res.status(400).json({ message: "Title, lead and value are required" });
  }
  const [leadRecord, propertyRecord] = await Promise.all([
    Lead.findOne({
      _id: lead,
      tenantId: req.user.tenantId,
      ...(req.user.role === "agent" ? { assignedTo: req.user._id } : {}),
    }).select("_id"),
    property
      ? Property.findOne({ _id: property, tenantId: req.user.tenantId }).select("_id")
      : null,
  ]);
  if (!leadRecord) return res.status(400).json({ message: "Choose a lead in your workspace." });
  if (property && !propertyRecord) {
    return res.status(400).json({ message: "Choose a property in your workspace." });
  }
  const body = omitEmpty(req.body);
  const allowed = ["title", "lead", "property", "stage", "value", "currency", "expectedClose", "lostReason"];
  const payload = Object.fromEntries(
    allowed.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field]])
  );
  const stage = body.stage || "inquiry";
  const deal = await Deal.create({
    ...payload,
    tenantId: req.user.tenantId,
    agent: req.user._id,
    probability: STAGE_PROB[stage] ?? 20,
  });
  res.status(201).json({ deal });
});

export const updateDeal = asyncHandler(async (req, res) => {
  const existing = await Deal.findOne({ ...dealScope(req), _id: req.params.id });
  if (!existing) return res.status(404).json({ message: "Deal not found" });

  const allowed = ["title", "value", "expectedClose", "lostReason", "stage"];
  const payload = Object.fromEntries(
    allowed.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
  );
  const nextStage = payload.stage || existing.stage;
  if (payload.stage) payload.probability = STAGE_PROB[nextStage] ?? existing.probability;
  if (nextStage === "closed" && existing.stage !== "closed") {
    payload.closedAt = new Date();
  }

  const deal = await Deal.findOneAndUpdate(
    { _id: existing._id, tenantId: req.user.tenantId },
    payload,
    { new: true, runValidators: true }
  );

  if (nextStage === "closed" && existing.stage !== "closed") {
    const agent = await User.findOne({ _id: deal.agent, tenantId: deal.tenantId });
    const rate = agent?.commissionRate ?? 2.5;
    const amount = Math.round((deal.value * rate) / 100);
    const commission = await Commission.findOneAndUpdate(
      { deal: deal._id },
      {
        tenantId: deal.tenantId,
        deal: deal._id,
        agent: deal.agent,
        rate,
        amount,
        status: "pending",
      },
      { upsert: true, new: true }
    );
    if (deal.property) {
      await Property.findOneAndUpdate(
        { _id: deal.property, tenantId: deal.tenantId },
        { status: "sold" }
      );
    }
    await Lead.findOneAndUpdate(
      { _id: deal.lead, tenantId: deal.tenantId },
      { status: "won" }
    );
    await Notification.create({
      tenantId: deal.tenantId,
      user: deal.agent,
      title: "Commission generated",
      body: `PKR ${amount.toLocaleString()} pending on a closed deal.`,
      type: "commission",
      link: "/commissions",
    });
    return res.json({ deal, commission });
  }

  res.json({ deal });
});
