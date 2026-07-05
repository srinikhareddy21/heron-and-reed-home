import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { Product } from "../models/Product.js";

const router = Router();

// GET /api/products?category=living-room&badge=New&search=oak
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, badge, search, isNew, isBestseller } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (badge) filter.badge = badge;
    if (isNew !== undefined) filter.isNewArrival = isNew === "true";
    if (isBestseller !== undefined) filter.isBestseller = isBestseller === "true";
    if (search) filter.$text = { $search: String(search) };

    const products = await Product.find(filter).sort({ createdAt: 1 }).lean();
    res.json({ products: products.map((p) => new Product(p).toClient()) });
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json({ product: product.toClient() });
  }),
);

export default router;
