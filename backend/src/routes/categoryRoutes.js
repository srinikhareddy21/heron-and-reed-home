import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { Category } from "../models/Category.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ createdAt: 1 }).lean();
    res.json({ categories: categories.map((c) => new Category(c).toClient()) });
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ error: "Category not found." });
    res.json({ category: category.toClient() });
  }),
);

export default router;
