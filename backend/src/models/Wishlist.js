import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: { type: [String], default: [] }, // product slugs
  },
  { timestamps: true },
);

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
