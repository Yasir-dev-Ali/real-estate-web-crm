import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    reference: { type: String, required: true },
    type: {
      type: String,
      enum: ["apartment", "villa", "plot", "commercial", "farmhouse", "penthouse"],
      required: true,
    },
    listingType: { type: String, enum: ["sale", "rent"], default: "sale" },
    status: {
      type: String,
      enum: ["draft", "available", "reserved", "sold", "rented"],
      default: "available",
    },
    price: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    city: String,
    area: String,
    address: String,
    beds: Number,
    baths: Number,
    areaSize: Number,
    areaUnit: { type: String, default: "sqyd" },
    yearBuilt: Number,
    amenities: [String],
    description: String,
    images: [String],
    listedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

propertySchema.index({ title: "text", city: "text", area: "text", reference: "text" });

export const Property = mongoose.model("Property", propertySchema);
