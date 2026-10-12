import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["viewing", "token", "booking"], default: "viewing" },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    scheduledAt: { type: Date, required: true },
    amount: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
