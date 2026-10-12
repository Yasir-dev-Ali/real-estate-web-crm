import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stage: {
      type: String,
      enum: ["inquiry", "viewing", "offer", "token", "contract", "closed", "lost"],
      default: "inquiry",
    },
    value: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    probability: { type: Number, default: 20 },
    expectedClose: Date,
    closedAt: Date,
    lostReason: String,
  },
  { timestamps: true }
);

export const Deal = mongoose.model("Deal", dealSchema);
