import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: String,
    type: { type: String, enum: ["followup", "deal", "booking", "system", "commission"], default: "system" },
    read: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
