import { createHmac, randomBytes, randomInt, timingSafeEqual, randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Tenant } from "../models/Tenant.js";
import { PendingRegistration } from "../models/PendingRegistration.js";
import { asyncHandler } from "../middleware/error.js";
import { signToken } from "../middleware/auth.js";
import { sendVerificationEmail } from "../utils/verificationEmail.js";

const SESSION_AGE = 7 * 24 * 60 * 60 * 1000;
const CODE_AGE = 10 * 60 * 1000;
const RESEND_DELAY = 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure:
    process.env.COOKIE_SECURE === "true" ||
    (process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production"),
  maxAge: SESSION_AGE,
  path: "/",
};

function publicUser(user, workspaceName) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    phone: user.phone,
    city: user.city,
    avatar: user.avatar,
    commissionRate: user.commissionRate,
    title: user.title,
    tenantId: user.tenantId,
    workspaceName,
  };
}

async function sessionUser(user) {
  const tenant = await Tenant.findOne({ tenantId: user.tenantId, status: "active" })
    .select("name")
    .lean();
  return publicUser(user, tenant?.name || process.env.TENANT_NAME || "Brokerage workspace");
}

function hashCode(code) {
  return createHmac("sha256", process.env.JWT_SECRET).update(code).digest();
}

function generateCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function codeMatches(code, savedHash) {
  const candidate = hashCode(code);
  return candidate.length === savedHash.length && timingSafeEqual(candidate, savedHash);
}

function registrationSlug(name) {
  const base =
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "brokerage";
  return `${base}-${randomBytes(3).toString("hex")}`;
}

async function setVerificationCode(registration) {
  const code = generateCode();
  const now = Date.now();
  registration.codeHash = hashCode(code).toString("hex");
  registration.expiresAt = new Date(now + CODE_AGE);
  registration.resendAfter = new Date(now + RESEND_DELAY);
  registration.attempts = 0;
  await registration.save();
  await sendVerificationEmail({
    email: registration.email,
    name: registration.name,
    code,
  });
}

function setSession(res, user) {
  res.cookie("token", signToken(user), cookieOpts);
}

export const register = asyncHandler(async (req, res) => {
  const { name, companyName, email, password, city } = req.body;
  const [existingUser, existingRegistration] = await Promise.all([
    User.exists({ email }),
    PendingRegistration.findOne({ email }).select("+passwordHash +codeHash"),
  ]);

  if (existingUser) {
    return res.status(409).json({
      code: "EMAIL_IN_USE",
      message: "An account with this email already exists. Sign in instead.",
    });
  }
  if (existingRegistration && existingRegistration.expiresAt > new Date()) {
    return res.status(409).json({
      code: "REGISTRATION_PENDING",
      message: "A registration is already waiting for email verification.",
    });
  }
  if (existingRegistration) await existingRegistration.deleteOne();

  const code = generateCode();
  const registration = await PendingRegistration.create({
    name,
    companyName,
    email,
    city,
    passwordHash: await User.hashPassword(password),
    codeHash: hashCode(code).toString("hex"),
    expiresAt: new Date(Date.now() + CODE_AGE),
    resendAfter: new Date(Date.now() + RESEND_DELAY),
  });
  try {
    await sendVerificationEmail({ email, name, code });
  } catch (error) {
    error.code ||= "EMAIL_DELIVERY_FAILED";
    throw error;
  }

  res.status(202).json({
    message: "A verification code has been sent to your email address.",
    email,
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const registration = await PendingRegistration.findOne({ email: req.body.email }).select(
    "+passwordHash +codeHash"
  );
  if (!registration || registration.expiresAt <= new Date()) {
    return res.status(404).json({
      code: "REGISTRATION_NOT_FOUND",
      message: "No active registration was found. Please register again.",
    });
  }
  if (registration.resendAfter > new Date()) {
    const retryAfter = Math.ceil((registration.resendAfter.getTime() - Date.now()) / 1000);
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({
      code: "RESEND_COOLDOWN",
      message: `Please wait ${retryAfter} seconds before requesting another code.`,
      retryAfter,
    });
  }

  await setVerificationCode(registration);
  res.json({ message: "A new verification code has been sent." });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const registration = await PendingRegistration.findOne({ email: req.body.email }).select(
    "+passwordHash +codeHash"
  );
  if (!registration || registration.expiresAt <= new Date()) {
    return res.status(410).json({
      code: "CODE_EXPIRED",
      message: "This registration or code has expired. Please register again.",
    });
  }
  if (registration.attempts >= MAX_CODE_ATTEMPTS) {
    return res.status(429).json({
      code: "TOO_MANY_CODE_ATTEMPTS",
      message: "Too many incorrect codes. Request a new code and try again.",
    });
  }

  if (!codeMatches(req.body.code, Buffer.from(registration.codeHash, "hex"))) {
    registration.attempts += 1;
    await registration.save();
    return res.status(400).json({
      code: "INVALID_VERIFICATION_CODE",
      message: "That verification code is incorrect.",
    });
  }

  const tenantId = randomUUID();
  let tenant;
  try {
    tenant = await Tenant.create({
      tenantId,
      name: registration.companyName,
      slug: registrationSlug(registration.companyName),
    });

    const user = new User({
      tenantId,
      name: registration.name,
      email: registration.email,
      password: registration.passwordHash,
      role: "admin",
      emailVerified: true,
      city: registration.city,
      title: "Brokerage Administrator",
      commissionRate: 0,
    });
    user.$locals.passwordIsHashed = true;
    await user.save();
    await registration.deleteOne();
    setSession(res, user);
    return res.status(201).json({
      message: "Email verified. Your brokerage workspace is ready.",
      user: await sessionUser(user),
      tenant: { id: tenant.tenantId, name: tenant.name, slug: tenant.slug },
    });
  } catch (error) {
    if (tenant) await Tenant.deleteOne({ _id: tenant._id });
    if (error instanceof mongoose.Error.ValidationError) throw error;
    if (error.code === 11000) {
      return res.status(409).json({
        code: "EMAIL_IN_USE",
        message: "An account with this email already exists. Sign in instead.",
      });
    }
    throw error;
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  if (user.status !== "active") {
    return res.status(403).json({ message: "This account is inactive." });
  }
  if (!user.emailVerified) {
    return res.status(403).json({
      code: "EMAIL_NOT_VERIFIED",
      message: "Verify your email before signing in.",
    });
  }
  setSession(res, user);
  res.json({ user: await sessionUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: await sessionUser(req.user) });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token", { ...cookieOpts, maxAge: undefined });
  res.json({ message: "Signed out" });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, city, title, password } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (city !== undefined) user.city = city;
  if (title !== undefined) user.title = title;
  if (password) {
    const strongPassword =
      password.length >= 10 &&
      password.length <= 128 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password);
    if (!strongPassword) {
      return res.status(400).json({
        message: "Password must be 10–128 characters and include uppercase, lowercase, and a number.",
      });
    }
    user.password = password;
  }
  await user.save();
  res.json({ user: await sessionUser(user) });
});
