import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    relatedType: { type: String, enum: ["lead", "deal", "property"], default: "lead" },
    relatedId: { type: mongoose.Schema.Types.ObjectId, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueAt: { type: Date, required: true },
    status: { type: String, enum: ["open", "done", "missed"], default: "open" },
    channel: { type: String, enum: ["call", "whatsapp", "email", "meeting"], default: "call" },
    notes: String,
  },
  { timestamps: true }
);

export const FollowUp = mongoose.model("FollowUp", followUpSchema);
