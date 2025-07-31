
import express from "express";

import { checkAuth, login, logout, signup, updateProfile, changePassword, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();
// Unlink Google account (must be authenticated)
// router.post("/unlink-google", protectRoute, unlinkGoogle); // Removed as Google unlink is no longer supported
// Password management
router.post("/change-password", protectRoute, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;
