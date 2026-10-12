import { Property } from "../models/Property.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/error.js";
import { paginate, searchRegex } from "../utils/paginate.js";
import { omitEmpty } from "../utils/sanitize.js";

function propertyScope(req) {
  const filter = { tenantId: req.user.tenantId };
  if (req.user.role === "agent") filter.listedBy = req.user._id;
  return filter;
}

export const listProperties = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { tenantId: req.user.tenantId };
  if (req.user.role === "agent" && req.query.mine === "1") filter.listedBy = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.listingType) filter.listingType = req.query.listingType;
  if (req.query.city) filter.city = req.query.city;
  if (req.query.minPrice) filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };
  const rx = searchRegex(req.query.q);
  if (rx) filter.$or = [{ title: rx }, { area: rx }, { reference: rx }, { city: rx }];

  const [items, total] = await Promise.all([
    Property.find(filter)
      .populate("listedBy", "name avatar")
      .sort({ featured: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Property.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({
    tenantId: req.user.tenantId,
    _id: req.params.id,
  }).populate("listedBy", "name email phone avatar");
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json({ property });
});

export const createProperty = asyncHandler(async (req, res) => {
  const { title, type, price } = req.body;
  if (!title || !type || price == null) {
    return res.status(400).json({ message: "Title, type and price are required" });
  }
  const body = omitEmpty(req.body);
  const allowed = [
    "title",
    "reference",
    "type",
    "listingType",
    "status",
    "price",
    "currency",
    "city",
    "area",
    "address",
    "beds",
    "baths",
    "areaSize",
    "areaUnit",
    "yearBuilt",
    "amenities",
    "description",
    "images",
    ...(req.user.role === "admin" ? ["featured"] : []),
  ];
  const payload = Object.fromEntries(
    allowed.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field]])
  );
  if (req.user.role === "admin" && body.listedBy) {
    const listedBy = await User.findOne({
      _id: body.listedBy,
      tenantId: req.user.tenantId,
      role: "agent",
      status: "active",
    }).select("_id");
    if (!listedBy) return res.status(400).json({ message: "Choose an active agent in this workspace." });
    payload.listedBy = listedBy._id;
  }
  const count = await Property.countDocuments({ tenantId: req.user.tenantId });
  const property = await Property.create({
    ...payload,
    tenantId: req.user.tenantId,
    listedBy: payload.listedBy || req.user._id,
    reference: body.reference || `AUR-${String(count + 1).padStart(4, "0")}`,
  });
  res.status(201).json({ property });
});

export const updateProperty = asyncHandler(async (req, res) => {
  const filter = { tenantId: req.user.tenantId, _id: req.params.id };
  if (req.user.role === "agent") filter.listedBy = req.user._id;
  const allowed = [
    "title",
    "reference",
    "type",
    "listingType",
    "status",
    "price",
    "currency",
    "city",
    "area",
    "address",
    "beds",
    "baths",
    "areaSize",
    "areaUnit",
    "yearBuilt",
    "amenities",
    "description",
    "images",
    ...(req.user.role === "admin" ? ["featured"] : []),
  ];
  const payload = Object.fromEntries(
    allowed.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
  );
  if (req.user.role === "admin" && Object.hasOwn(req.body, "listedBy")) {
    if (!req.body.listedBy) {
      payload.listedBy = req.user._id;
    } else {
      const listedBy = await User.findOne({
        _id: req.body.listedBy,
        tenantId: req.user.tenantId,
        role: "agent",
        status: "active",
      }).select("_id");
      if (!listedBy) return res.status(400).json({ message: "Choose an active agent in this workspace." });
      payload.listedBy = listedBy._id;
    }
  }
  const property = await Property.findOneAndUpdate(filter, payload, {
    new: true,
    runValidators: true,
  });
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json({ property });
});

export const deleteProperty = asyncHandler(async (req, res) => {
  const filter = { tenantId: req.user.tenantId, _id: req.params.id };
  if (req.user.role === "agent") filter.listedBy = req.user._id;
  const property = await Property.findOneAndDelete(filter);
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json({ message: "Property removed" });
});
