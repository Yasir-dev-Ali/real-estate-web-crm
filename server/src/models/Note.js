import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    relatedType: { type: String, enum: ["lead", "deal", "property", "booking"], required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);
