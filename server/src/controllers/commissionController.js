import { Commission } from "../models/Commission.js";
import { asyncHandler } from "../middleware/error.js";
import { paginate } from "../utils/paginate.js";

export const listCommissions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { tenantId: req.user.tenantId };
  if (req.user.role === "agent") filter.agent = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Commission.find(filter)
      .populate("agent", "name avatar")
      .populate({ path: "deal", populate: { path: "property", select: "title" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Commission.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const updateCommission = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can approve or pay commissions" });
  }
  const { status } = req.body;
  if (!["approved", "paid"].includes(status)) {
    return res.status(400).json({ message: "Choose an allowed commission status." });
  }
  const commission = await Commission.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
  });
  if (!commission) return res.status(404).json({ message: "Commission not found" });
  const transitions = { pending: "approved", approved: "paid" };
  if (transitions[commission.status] !== status) {
    return res.status(409).json({ message: "Commission status has changed. Refresh and try again." });
  }
  commission.status = status;
  if (status === "paid") commission.paidAt = new Date();
  await commission.save();
  res.json({ commission });
});
