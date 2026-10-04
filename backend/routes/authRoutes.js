/**
 * SkyReserve — Auth routes
 * Mounted at /api/auth in server.js
 */

const express = require("express");
const {
  registerUser,
  loginUser,
  loginAdmin,
  getMe,
  logout,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);
router.get("/me", requireAuth, getMe);
router.post("/logout", requireAuth, logout);

module.exports = router;