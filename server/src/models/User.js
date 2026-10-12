import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "agent"], default: "agent" },
    emailVerified: { type: Boolean, default: false },
    phone: String,
    city: String,
    avatar: String,
    commissionRate: { type: Number, default: 2.5 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    title: { type: String, default: "Sales Consultant" },
  },
  { timestamps: true }
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function hash(next) {
  if (!this.isModified("password")) return next();
  if (this.$locals.passwordIsHashed) {
    this.$locals.passwordIsHashed = false;
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 10);

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model("User", userSchema);
