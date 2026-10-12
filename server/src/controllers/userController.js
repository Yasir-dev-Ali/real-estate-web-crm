import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/error.js";
import { paginate, searchRegex } from "../utils/paginate.js";

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { tenantId: req.user.tenantId };
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  const rx = searchRegex(req.query.q);
  if (rx) filter.$or = [{ name: rx }, { email: rx }, { city: rx }];

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, city, commissionRate, title } = req.body;
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 80 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (role && role !== "agent") {
    return res.status(400).json({ message: "Workspace administrators can add agents only." });
  }
  if (
    typeof password !== "string" ||
    password.length < 10 ||
    password.length > 128 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).json({
      message: "Password must be 10–128 characters and include uppercase, lowercase, and a number.",
    });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return res.status(409).json({ message: "An agent with this email already exists" });
  const user = await User.create({
    tenantId: req.user.tenantId,
    name,
    email: normalizedEmail,
    password,
    role: "agent",
    emailVerified: true,
    phone,
    city,
    commissionRate,
    title,
  });
  res.status(201).json({ user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const fields = ["name", "phone", "city", "title", "commissionRate", "status"];
  const payload = Object.fromEntries(
    fields.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
  );
  if (payload.name !== undefined && (typeof payload.name !== "string" || payload.name.trim().length < 2)) {
    return res.status(400).json({ message: "Name must contain at least 2 characters." });
  }
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    payload,
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});
