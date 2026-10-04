-- =========================================================
-- SkyReserve — Database Schema
-- SQLite (better-sqlite3)
-- All tables use CREATE TABLE IF NOT EXISTS so re-running is safe.
-- =========================================================

-- ---------- Users (passengers) ----------
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  mobile      TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Admins ----------
CREATE TABLE IF NOT EXISTS admins (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Flights ----------
CREATE TABLE IF NOT EXISTS flights (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_number   TEXT NOT NULL UNIQUE,
  airline         TEXT NOT NULL,
  source          TEXT NOT NULL,
  destination     TEXT NOT NULL,
  departure_time  TEXT NOT NULL,
  arrival_time    TEXT NOT NULL,
  date            TEXT NOT NULL,
  duration        TEXT,
  price           REAL NOT NULL,
  total_seats     INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Bookings ----------
CREATE TABLE IF NOT EXISTS bookings (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id               INTEGER,
  flight_id             INTEGER NOT NULL,
  passenger_name        TEXT NOT NULL,
  passenger_age         INTEGER NOT NULL,
  passenger_gender      TEXT NOT NULL,
  mobile                TEXT NOT NULL,
  email                 TEXT NOT NULL,
  number_of_passengers  INTEGER NOT NULL DEFAULT 1,
  booking_date          DATETIME DEFAULT CURRENT_TIMESTAMP,
  status                TEXT NOT NULL DEFAULT 'Confirmed',
  FOREIGN KEY (user_id)   REFERENCES users(id),
  FOREIGN KEY (flight_id) REFERENCES flights(id)
);