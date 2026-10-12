import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";
import { Deal } from "../models/Deal.js";
import { asyncHandler } from "../middleware/error.js";
import { searchRegex } from "../utils/paginate.js";

export const globalSearch = asyncHandler(async (req, res) => {
  const rx = searchRegex(req.query.q);
  if (!rx) return res.json({ leads: [], properties: [], deals: [] });
  const tenantId = req.user.tenantId;
  const agentLead = req.user.role === "agent" ? { assignedTo: req.user._id } : {};
  const agentDeal = req.user.role === "agent" ? { agent: req.user._id } : {};

  const [leads, properties, deals] = await Promise.all([
    Lead.find({ tenantId, ...agentLead, $or: [{ name: rx }, { phone: rx }, { email: rx }, { area: rx }, { city: rx }] })
      .limit(8)
      .select("name phone city area status"),
    Property.find({ tenantId, $or: [{ title: rx }, { reference: rx }, { area: rx }, { city: rx }] })
      .limit(8)
      .select("title reference city area price status listingType images"),
    Deal.find({ tenantId, ...agentDeal, title: rx })
      .limit(6)
      .select("title stage value"),
  ]);

  res.json({ leads, properties, deals });
});
