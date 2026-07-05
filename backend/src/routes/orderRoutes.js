import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Cart } from "../models/Cart.js";

const router = Router();
router.use(requireAuth);

function generateOrderId() {
  return "HR-" + Math.floor(100000 + Math.random() * 899999).toString();
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ orders: orders.map((o) => o.toClient()) });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { items, address } = req.body ?? {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item." });
    }

    // Re-price every line against the database so a tampered client payload
    // can never change what's actually charged.
    const slugs = items.map((i) => i.slug);
    const products = await Product.find({ slug: { $in: slugs } });
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    const resolvedItems = [];
    for (const line of items) {
      const product = bySlug.get(line.slug);
      if (!product) return res.status(400).json({ error: `Unknown product: ${line.slug}` });
      const qty = Math.max(1, Number(line.qty) || 1);
      resolvedItems.push({ slug: product.slug, name: product.name, price: product.price, qty });
    }

    const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = subtotal === 0 ? 0 : subtotal >= 99 ? 0 : 19;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shipping + tax;

    let orderId = generateOrderId();
    // Extremely unlikely, but guarantee uniqueness rather than trust randomness alone.
    while (await Order.exists({ orderId })) orderId = generateOrderId();

    const order = await Order.create({
      orderId,
      user: req.userId,
      items: resolvedItems,
      subtotal,
      shipping,
      total,
      address,
    });

    // Placing an order clears the cart server-side too.
    await Cart.findOneAndUpdate({ user: req.userId }, { $set: { items: [] } }, { upsert: true });

    res.status(201).json({ order: order.toClient() });
  }),
);

export default router;
