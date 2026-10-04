/**
 * SkyReserve — Auth middleware
 * --------------------------------------------------
 * Simple in-memory session store using Node's crypto.
 * No JWT library needed.
 *
 * NOTE: sessions live in memory — they reset when the
 * server restarts. That's fine for a college project.
 */

const crypto = require("crypto");

// token → { id, role, name, email, createdAt }
const sessions = new Map();

/* ---------- Session helpers ---------- */
function createSession(payload) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { ...payload, createdAt: Date.now() });
  return token;
}

function getSession(token) {
  return sessions.get(token) || null;
}

function destroySession(token) {
  sessions.delete(token);
}

/* ---------- Token extraction ---------- */
function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

/* ---------- Middleware: any authenticated user ---------- */
function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Missing authentication token" });
  }

  const session = getSession(token);
  if (!session) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }

  req.user = session;
  req.token = token;
  next();
}

/* ---------- Middleware: admin only ---------- */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Administrator access required" });
  }
  next();
}

module.exports = {
  createSession,
  getSession,
  destroySession,
  extractToken,
  requireAuth,
  requireAdmin,
};