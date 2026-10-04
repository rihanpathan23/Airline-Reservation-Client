// One-time helper: creates or updates the default admin.
// Run from the backend folder:  node seedAdmin.js

const db = require("./database/database");

const username = "rohit";
const password = "8010";

db.prepare(
  `INSERT INTO admins (username, password)
   VALUES (?, ?)
   ON CONFLICT(username) DO UPDATE SET password = excluded.password`
).run(username, password);

console.log("Admin saved:", username, "/", password);

const admins = db.prepare("SELECT id, username, password FROM admins").all();
console.log("Current admins:", admins);