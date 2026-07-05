import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderAddressSchema = new mongoose.Schema(
  {
    fullName: String,
    line1: String,
    line2: String,
    city: String,
    region: String,
    postal: String,
    country: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true }, // e.g. HR-482913
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ["Processing", "Shipped", "Delivered"], default: "Processing" },
    address: { type: orderAddressSchema },
  },
  { timestamps: true },
);

orderSchema.methods.toClient = function toClient() {
  return {
    id: this.orderId,
    date: this.createdAt.toISOString(),
    items: this.items,
    subtotal: this.subtotal,
    shipping: this.shipping,
    total: this.total,
    status: this.status,
    address: this.address ?? undefined,
  };
};

export const Order = mongoose.model("Order", orderSchema);
