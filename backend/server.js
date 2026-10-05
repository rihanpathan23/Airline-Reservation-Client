require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./database/database");

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- Default Admin ---------- */
const adminUsername = process.env.ADMIN_USERNAME || "rohit";
const adminPassword = process.env.ADMIN_PASSWORD || "8010";

const existingAdmin = db
  .prepare("SELECT id FROM admins WHERE username = ?")
  .get(adminUsername);

if (!existingAdmin) {
  db.prepare(
    "INSERT INTO admins (username, password) VALUES (?, ?)"
  ).run(adminUsername, adminPassword);

  console.log(`Default admin created: ${adminUsername}`);
} else {
  console.log(`Admin already exists: ${adminUsername}`);
}

/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- Health ---------- */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Flight Reservation API is running",
  });
});

/* ---------- DB test ---------- */
app.get("/api/db-test", (req, res) => {
  try {
    const ping = db.prepare("SELECT 1 AS ok").get();

    const tables = db
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
         ORDER BY name`
      )
      .all()
      .map((row) => row.name);

    res.json({
      success: true,
      message: "Database connection is working",
      ping,
      tables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

/* ---------- Auth routes ---------- */
app.use("/api/auth", require("./routes/authRoutes"));

/* ---------- Start ---------- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});