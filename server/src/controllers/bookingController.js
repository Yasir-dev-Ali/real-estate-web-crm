import { Booking } from "../models/Booking.js";
import { Notification } from "../models/Notification.js";
import { Property } from "../models/Property.js";
import { Lead } from "../models/Lead.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/error.js";
import { paginate } from "../utils/paginate.js";

function bookingScope(req) {
  const filter = { tenantId: req.user.tenantId };
  if (req.user.role === "agent") filter.agent = req.user._id;
  return filter;
}

export const listBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = bookingScope(req);
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate("property", "title city area images")
      .populate("lead", "name phone")
      .populate("agent", "name avatar")
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const createBooking = asyncHandler(async (req, res) => {
  const { property, lead, scheduledAt } = req.body;
  if (!property || !lead || !scheduledAt) {
    return res.status(400).json({ message: "Property, lead and schedule are required" });
  }
  const [propertyRecord, leadRecord, agentRecord] = await Promise.all([
    Property.findOne({ _id: property, tenantId: req.user.tenantId }).select("_id"),
    Lead.findOne({
      _id: lead,
      tenantId: req.user.tenantId,
      ...(req.user.role === "agent" ? { assignedTo: req.user._id } : {}),
    }).select("_id"),
    req.user.role === "admin" && req.body.agent
      ? User.findOne({
          _id: req.body.agent,
          tenantId: req.user.tenantId,
          role: "agent",
          status: "active",
        }).select("_id")
      : null,
  ]);
  if (!propertyRecord || !leadRecord) {
    return res.status(400).json({ message: "Choose a property and lead in this workspace." });
  }
  if (req.user.role === "admin" && req.body.agent && !agentRecord) {
    return res.status(400).json({ message: "Choose an active agent in this workspace." });
  }
  const allowed = ["property", "lead", "type", "status", "scheduledAt", "amount", "notes"];
  const payload = Object.fromEntries(
    allowed.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
  );
  const booking = await Booking.create({
    ...payload,
    tenantId: req.user.tenantId,
    agent: agentRecord?._id || req.user._id,
  });
  if (booking.type === "token" || booking.type === "booking") {
    await Property.findOneAndUpdate(
      { _id: property, tenantId: req.user.tenantId },
      { status: "reserved" }
    );
  }
  await Notification.create({
    tenantId: req.user.tenantId,
    user: booking.agent,
    title: "Viewing / booking scheduled",
    body: `Calendar item set for ${new Date(scheduledAt).toLocaleString()}`,
    type: "booking",
    link: "/bookings",
  });
  res.status(201).json({ booking });
});

export const updateBooking = asyncHandler(async (req, res) => {
  const allowed = ["type", "status", "scheduledAt", "amount", "notes"];
  const payload = Object.fromEntries(
    allowed.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
  );
  const booking = await Booking.findOneAndUpdate(
    { ...bookingScope(req), _id: req.params.id },
    payload,
    { new: true, runValidators: true }
  );
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json({ booking });
});
