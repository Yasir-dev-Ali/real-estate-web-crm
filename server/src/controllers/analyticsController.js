import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";
import { Deal } from "../models/Deal.js";
import { Booking } from "../models/Booking.js";
import { Commission } from "../models/Commission.js";
import { FollowUp } from "../models/FollowUp.js";
import { asyncHandler } from "../middleware/error.js";

export const dashboard = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const agentFilter = req.user.role === "agent" ? { agent: req.user._id } : {};
  const leadFilter = req.user.role === "agent" ? { assignedTo: req.user._id } : {};
  const listedFilter = req.user.role === "agent" ? { listedBy: req.user._id } : {};

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    leadCount,
    propertyCount,
    openDeals,
    pipeline,
    wonThisMonth,
    commissions,
    upcomingFollowUps,
    bookingsWeek,
    leadsByStatus,
    dealsByStage,
    leadsBySource,
    monthly,
  ] = await Promise.all([
    Lead.countDocuments({ tenantId, ...leadFilter }),
    Property.countDocuments({ tenantId, ...listedFilter, status: { $in: ["available", "reserved"] } }),
    Deal.countDocuments({ tenantId, ...agentFilter, stage: { $nin: ["closed", "lost"] } }),
    Deal.aggregate([
      { $match: { tenantId, ...agentFilter, stage: { $nin: ["closed", "lost"] } } },
      { $group: { _id: null, total: { $sum: "$value" } } },
    ]),
    Deal.aggregate([
      { $match: { tenantId, ...agentFilter, stage: "closed", closedAt: { $gte: startMonth } } },
      { $group: { _id: null, total: { $sum: "$value" }, count: { $sum: 1 } } },
    ]),
    Commission.aggregate([
      { $match: { tenantId, ...(req.user.role === "agent" ? { agent: req.user._id } : {}) } },
      { $group: { _id: "$status", total: { $sum: "$amount" } } },
    ]),
    FollowUp.find({
      tenantId,
      ...(req.user.role === "agent" ? { assignedTo: req.user._id } : {}),
      status: "open",
      dueAt: { $lte: new Date(Date.now() + 7 * 86400000) },
    })
      .populate("assignedTo", "name")
      .sort({ dueAt: 1 })
      .limit(8),
    Booking.find({
      tenantId,
      ...agentFilter,
      scheduledAt: { $gte: now, $lte: new Date(Date.now() + 7 * 86400000) },
    })
      .populate("property", "title")
      .populate("lead", "name")
      .sort({ scheduledAt: 1 })
      .limit(8),
    Lead.aggregate([{ $match: { tenantId, ...leadFilter } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Deal.aggregate([{ $match: { tenantId, ...agentFilter } }, { $group: { _id: "$stage", count: { $sum: 1 }, value: { $sum: "$value" } } }]),
    Lead.aggregate([{ $match: { tenantId, ...leadFilter } }, { $group: { _id: "$source", count: { $sum: 1 } } }]),
    Deal.aggregate([
      {
        $match: {
          tenantId,
          ...agentFilter,
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
      },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          value: { $sum: "$value" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
  ]);

  res.json({
    kpis: {
      leads: leadCount,
      listings: propertyCount,
      openDeals,
      pipeline: pipeline[0]?.total || 0,
      closedValue: wonThisMonth[0]?.total || 0,
      closedCount: wonThisMonth[0]?.count || 0,
      commissions,
    },
    leadsByStatus,
    dealsByStage,
    leadsBySource,
    monthly,
    upcomingFollowUps,
    bookingsWeek,
  });
});
