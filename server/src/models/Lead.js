import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    source: {
      type: String,
      enum: ["website", "referral", "walk-in", "whatsapp", "zameen", "olx", "campaign"],
      default: "website",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "viewing", "negotiation", "won", "lost"],
      default: "new",
    },
    interest: { type: String, enum: ["buy", "rent", "invest"], default: "buy" },
    budgetMin: Number,
    budgetMax: Number,
    city: String,
    area: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    nextFollowUp: Date,
    tags: [String],
    score: { type: Number, default: 50, min: 0, max: 100 },
    notes: String,
  },
  { timestamps: true }
);

leadSchema.index({ name: "text", email: "text", phone: "text", city: "text", area: "text" });

export const Lead = mongoose.model("Lead", leadSchema);
