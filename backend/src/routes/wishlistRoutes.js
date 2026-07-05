import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { Wishlist } from "../models/Wishlist.js";

const router = Router();
router.use(requireAuth);

async function getOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, items: [] });
  return wishlist;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const wishlist = await getOrCreateWishlist(req.userId);
    res.json({ items: wishlist.items });
  }),
);

router.post(
  "/toggle",
  asyncHandler(async (req, res) => {
    const { slug } = req.body ?? {};
    if (!slug) return res.status(400).json({ error: "slug is required." });

    const wishlist = await getOrCreateWishlist(req.userId);
    wishlist.items = wishlist.items.includes(slug)
      ? wishlist.items.filter((s) => s !== slug)
      : [...wishlist.items, slug];
    await wishlist.save();
    res.json({ items: wishlist.items });
  }),
);

export default router;
