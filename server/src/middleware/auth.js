import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  const token =
    (header && header.startsWith("Bearer ") && header.slice(7)) ||
    req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }

  try {
    const user = await User.findById(decoded.id).select("-password");
    if (!user || user.status !== "active" || !user.emailVerified) {
      return res.status(401).json({ message: "Account unavailable" });
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this action" });
    }
    next();
  };
}

export function scopeQuery(req, extra = {}) {
  const q = { tenantId: req.user.tenantId, ...extra };
  if (req.user.role === "agent") {
    q.$or = [
      { assignedTo: req.user._id },
      { listedBy: req.user._id },
      { agent: req.user._id },
      { createdBy: req.user._id },
    ];
  }
  return q;
}
