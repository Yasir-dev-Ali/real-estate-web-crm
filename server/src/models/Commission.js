import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "paid"], default: "pending" },
    paidAt: Date,
  },
  { timestamps: true }
);

export const Commission = mongoose.model("Commission", commissionSchema);
