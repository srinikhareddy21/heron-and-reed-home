import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    image: { type: String, required: true },
  },
  { timestamps: true },
);

categorySchema.methods.toClient = function toClient() {
  return { slug: this.slug, name: this.name, tagline: this.tagline, image: this.image };
};

export const Category = mongoose.model("Category", categorySchema);
