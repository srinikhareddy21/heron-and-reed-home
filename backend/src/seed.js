import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./config/db.js";
import { Product } from "./models/Product.js";
import { Category } from "./models/Category.js";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  await connectDB();

  const products = JSON.parse(fs.readFileSync(path.join(__dirname, "data/products.json"), "utf-8"));
  const categories = JSON.parse(fs.readFileSync(path.join(__dirname, "data/categories.json"), "utf-8"));

  for (const category of categories) {
    await Category.findOneAndUpdate({ slug: category.slug }, category, { upsert: true, new: true });
  }
  console.log(`[seed] upserted ${categories.length} categories`);

  for (const product of products) {
    await Product.findOneAndUpdate({ slug: product.slug }, product, { upsert: true, new: true });
  }
  console.log(`[seed] upserted ${products.length} products`);

  await mongoose.disconnect();
  console.log("[seed] done");
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
