import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    compareAt: { type: Number },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    image: { type: String, required: true },
    badge: { type: String, enum: ["New", "Sale", "Bestseller"] },
    description: { type: String, required: true },
    materials: { type: [String], default: [] },
    dimensions: { type: String, default: "" },
    features: { type: [String], default: [] },
    // Stored as `isNewArrival` because `isNew` is a reserved Mongoose document
    // property; toClient() below maps it back to `isNew` for the frontend.
    isNewArrival: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.methods.toClient = function toClient() {
  return {
    slug: this.slug,
    name: this.name,
    category: this.category,
    price: this.price,
    compareAt: this.compareAt,
    rating: this.rating,
    reviews: this.reviews,
    image: this.image,
    badge: this.badge,
    description: this.description,
    materials: this.materials,
    dimensions: this.dimensions,
    features: this.features,
    isNew: this.isNewArrival,
    isBestseller: this.isBestseller,
  };
};

export const Product = mongoose.model("Product", productSchema);
