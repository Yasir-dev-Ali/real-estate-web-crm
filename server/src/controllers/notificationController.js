import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../middleware/error.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({
    tenantId: req.user.tenantId,
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(40);
  const unread = await Notification.countDocuments({
    tenantId: req.user.tenantId,
    user: req.user._id,
    read: false,
  });
  res.json({ items, unread });
});

export const markRead = asyncHandler(async (req, res) => {
  if (req.params.id === "all") {
    await Notification.updateMany(
      { tenantId: req.user.tenantId, user: req.user._id },
      { read: true }
    );
    return res.json({ ok: true });
  }
  await Notification.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId, user: req.user._id },
    { read: true }
  );
  res.json({ ok: true });
});
