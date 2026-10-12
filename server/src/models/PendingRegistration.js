import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    codeHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    resendAfter: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const PendingRegistration = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema
);
