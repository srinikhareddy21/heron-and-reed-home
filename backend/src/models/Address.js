import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    postal: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: true },
  },
  { timestamps: true },
);

addressSchema.methods.toClient = function toClient() {
  return {
    fullName: this.fullName,
    line1: this.line1,
    line2: this.line2,
    city: this.city,
    region: this.region,
    postal: this.postal,
    country: this.country,
  };
};

export const Address = mongoose.model("Address", addressSchema);
