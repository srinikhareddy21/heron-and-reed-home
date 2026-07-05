import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { signup, login, me, updateProfile, saveAddress } from "../controllers/authController.js";

const router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));
router.put("/profile", requireAuth, asyncHandler(updateProfile));
router.put("/address", requireAuth, asyncHandler(saveAddress));

export default router;
