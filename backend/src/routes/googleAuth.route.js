
import express from "express";
import passport from "../lib/passport.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const router = express.Router();

// Google sign-in (only for existing users)
router.get("/login", passport.authenticate("google-login", { scope: ["profile", "email"] }));

import protectRoute from "../middleware/auth.middleware.js";

// Google link (for logged-in users to link Google account)
router.get(
  "/link",
  protectRoute,
  passport.authenticate("google-link", { scope: ["profile", "email"], session: false })
);

// Google OAuth callback for login
router.get(
  "/login/callback",
  passport.authenticate("google-login", { failureRedirect: "/login", session: false }),
  (req, res) => {
    if (!req.user) {
      // No user found, redirect with nouser flag
      return res.redirect("http://localhost:5173/login?nouser=1");
    }
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // Set JWT as httpOnly cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // send only over HTTPS in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    if (req.user.needsProfileSetup) {
      res.redirect(`http://localhost:5173/profile?setup=1`);
    } else {
      res.redirect(`http://localhost:5173`);
    }
  }
);

// Google OAuth callback for linking
router.get(
  "/link/callback",
  passport.authenticate("google-link", { failureRedirect: "http://localhost:5173/profile?error=google", session: false }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect("http://localhost:5173/profile/link-error");
    }
    // Issue a new JWT and set as httpOnly cookie (refreshes session)
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect("http://localhost:5173/profile?linked=1");
  }
);

export default router;
