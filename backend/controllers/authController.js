/**
 * SkyReserve — Auth controller
 * --------------------------------------------------
 * Handles user registration, user login, and admin login.
 * Passwords stored as plaintext for simplicity (college demo).
 */

const db = require("../database/database");
const {
  createSession,
  destroySession,
} = require("../middleware/authMiddleware");

/* ---------- User: register ---------- */
function registerUser(req, res) {
  const { name, email, password, mobile } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  const result = db
    .prepare(
      "INSERT INTO users (name, email, password, mobile) VALUES (?, ?, ?, ?)"
    )
    .run(name, email, password, mobile || null);

  const user = db
    .prepare("SELECT id, name, email, mobile FROM users WHERE id = ?")
    .get(result.lastInsertRowid);

  const token = createSession({
    id: user.id,
    role: "user",
    name: user.name,
    email: user.email,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: { ...user, role: "user" },
    token,
  });
}

/* ---------- User: login ---------- */
function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const user = db
    .prepare(
      "SELECT id, name, email, mobile, password FROM users WHERE email = ?"
    )
    .get(email);

  if (!user || user.password !== password) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const token = createSession({
    id: user.id,
    role: "user",
    name: user.name,
    email: user.email,
  });

  const { password: _pw, ...safeUser } = user;

  res.json({
    success: true,
    message: "Logged in successfully",
    user: { ...safeUser, role: "user" },
    token,
  });
}

/* ---------- Admin: login ---------- */
function loginAdmin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const admin = db
    .prepare("SELECT id, username, password FROM admins WHERE username = ?")
    .get(username);

  if (!admin || admin.password !== password) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid username or password" });
  }

  const token = createSession({
    id: admin.id,
    role: "admin",
    name: admin.username,
    email: "",
  });

  res.json({
    success: true,
    message: "Admin logged in successfully",
    user: {
      id: admin.id,
      name: admin.username,
      email: "",
      role: "admin",
    },
    token,
  });
}

/* ---------- Current session info ---------- */
function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

/* ---------- Logout ---------- */
function logout(req, res) {
  if (req.token) destroySession(req.token);
  res.json({ success: true, message: "Logged out successfully" });
}

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getMe,
  logout,
};