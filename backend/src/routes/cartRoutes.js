import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { Cart } from "../models/Cart.js";

const router = Router();
router.use(requireAuth);

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.userId);
    res.json({ items: cart.items });
  }),
);

// Add or increment an item.
router.post(
  "/items",
  asyncHandler(async (req, res) => {
    const { slug, qty = 1 } = req.body ?? {};
    if (!slug) return res.status(400).json({ error: "slug is required." });

    const cart = await getOrCreateCart(req.userId);
    const existing = cart.items.find((i) => i.slug === slug);
    if (existing) existing.qty += qty;
    else cart.items.push({ slug, qty });
    await cart.save();
    res.json({ items: cart.items });
  }),
);

// Set an item's quantity (0 removes it).
router.patch(
  "/items/:slug",
  asyncHandler(async (req, res) => {
    const { qty } = req.body ?? {};
    const cart = await getOrCreateCart(req.userId);
    if (qty <= 0) {
      cart.items = cart.items.filter((i) => i.slug !== req.params.slug);
    } else {
      const existing = cart.items.find((i) => i.slug === req.params.slug);
      if (existing) existing.qty = qty;
      else cart.items.push({ slug: req.params.slug, qty });
    }
    await cart.save();
    res.json({ items: cart.items });
  }),
);

router.delete(
  "/items/:slug",
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.userId);
    cart.items = cart.items.filter((i) => i.slug !== req.params.slug);
    await cart.save();
    res.json({ items: cart.items });
  }),
);

router.delete(
  "/",
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.userId);
    cart.items = [];
    await cart.save();
    res.json({ items: cart.items });
  }),
);

export default router;
