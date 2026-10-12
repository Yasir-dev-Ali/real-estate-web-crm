import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export const Tenant = mongoose.model("Tenant", tenantSchema);
