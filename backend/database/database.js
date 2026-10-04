/**
 * SkyReserve — Database connection
 * --------------------------------------------------
 * Creates (or opens) flight_reservation.db,
 * enables foreign keys, and runs schema.sql on startup.
 *
 * Exports the shared better-sqlite3 database instance.
 */

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

/* ---------- Paths ---------- */
const DB_PATH = path.join(__dirname, "flight_reservation.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

/* ---------- Open / create database ---------- */
const db = new Database(DB_PATH);

/* ---------- Enable foreign key enforcement ---------- */
db.pragma("foreign_keys = ON");

/* ---------- Initialize tables from schema.sql ---------- */
function initializeDatabase() {
  try {
    const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
    db.exec(schema);
    console.log("Database initialized — all tables ready.");
  } catch (error) {
    console.error("Failed to initialize database:", error.message);
    throw error;
  }
}

initializeDatabase();

/* ---------- Export the shared connection ---------- */
module.exports = db;