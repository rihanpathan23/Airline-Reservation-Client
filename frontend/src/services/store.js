/**
 * SkyReserve — frontend demo store
 * --------------------------------------------------
 * Shares flight + booking data across pages using localStorage.
 * Uses the SAME keys the Admin Dashboard already reads:
 *   sr_flights, sr_bookings
 *
 * When the backend is ready, only this file needs to change.
 */

const FLIGHTS_KEY = "sr_flights";
const BOOKINGS_KEY = "sr_bookings";
const SEED_VERSION_KEY = "sr_seed_version";

// Bump this number whenever SEED_FLIGHTS changes,
// so existing browsers pick up the new seed data.
const SEED_VERSION = 2;

/* ---------- Seed flights (12 Indian routes) ---------- */
const SEED_FLIGHTS = [
  {
    id: "F-001",
    flightNumber: "6E-204",
    airline: "IndiGo",
    source: "Mumbai",
    destination: "Delhi",
    departureTime: "08:15",
    arrivalTime: "10:30",
    date: "2025-05-12",
    duration: "2h 15m",
    price: 5240,
    totalSeats: 180,
    availableSeats: 24,
  },
  {
    id: "F-002",
    flightNumber: "AI-805",
    airline: "Air India",
    source: "Pune",
    destination: "Bengaluru",
    departureTime: "14:00",
    arrivalTime: "16:10",
    date: "2025-05-12",
    duration: "2h 10m",
    price: 6890,
    totalSeats: 200,
    availableSeats: 8,
  },
  {
    id: "F-003",
    flightNumber: "UK-953",
    airline: "Vistara",
    source: "Delhi",
    destination: "Goa",
    departureTime: "19:45",
    arrivalTime: "22:20",
    date: "2025-05-13",
    duration: "2h 35m",
    price: 6480,
    totalSeats: 160,
    availableSeats: 12,
  },
  {
    id: "F-004",
    flightNumber: "SG-112",
    airline: "SpiceJet",
    source: "Chennai",
    destination: "Hyderabad",
    departureTime: "06:30",
    arrivalTime: "07:55",
    date: "2025-05-14",
    duration: "1h 25m",
    price: 3290,
    totalSeats: 180,
    availableSeats: 30,
  },
  {
    id: "F-005",
    flightNumber: "6E-517",
    airline: "IndiGo",
    source: "Bengaluru",
    destination: "Kolkata",
    departureTime: "10:20",
    arrivalTime: "13:15",
    date: "2025-05-12",
    duration: "2h 55m",
    price: 7150,
    totalSeats: 180,
    availableSeats: 42,
  },
  {
    id: "F-006",
    flightNumber: "AI-441",
    airline: "Air India",
    source: "Delhi",
    destination: "Mumbai",
    departureTime: "17:30",
    arrivalTime: "19:45",
    date: "2025-05-13",
    duration: "2h 15m",
    price: 5890,
    totalSeats: 200,
    availableSeats: 15,
  },
  {
    id: "F-007",
    flightNumber: "QP-1102",
    airline: "Akasa Air",
    source: "Mumbai",
    destination: "Ahmedabad",
    departureTime: "09:00",
    arrivalTime: "10:20",
    date: "2025-05-12",
    duration: "1h 20m",
    price: 2980,
    totalSeats: 170,
    availableSeats: 60,
  },
  {
    id: "F-008",
    flightNumber: "UK-875",
    airline: "Vistara",
    source: "Bengaluru",
    destination: "Delhi",
    departureTime: "21:10",
    arrivalTime: "23:55",
    date: "2025-05-14",
    duration: "2h 45m",
    price: 6240,
    totalSeats: 160,
    availableSeats: 5,
  },
  {
    id: "F-009",
    flightNumber: "IX-342",
    airline: "Air India Express",
    source: "Kochi",
    destination: "Chennai",
    departureTime: "07:45",
    arrivalTime: "09:10",
    date: "2025-05-15",
    duration: "1h 25m",
    price: 3540,
    totalSeats: 180,
    availableSeats: 50,
  },
  {
    id: "F-010",
    flightNumber: "6E-773",
    airline: "IndiGo",
    source: "Hyderabad",
    destination: "Pune",
    departureTime: "12:40",
    arrivalTime: "14:05",
    date: "2025-05-12",
    duration: "1h 25m",
    price: 3120,
    totalSeats: 180,
    availableSeats: 38,
  },
  {
    id: "F-011",
    flightNumber: "SG-289",
    airline: "SpiceJet",
    source: "Kolkata",
    destination: "Guwahati",
    departureTime: "16:20",
    arrivalTime: "17:45",
    date: "2025-05-13",
    duration: "1h 25m",
    price: 2860,
    totalSeats: 170,
    availableSeats: 22,
  },
  {
    id: "F-012",
    flightNumber: "QP-1408",
    airline: "Akasa Air",
    source: "Delhi",
    destination: "Jaipur",
    departureTime: "06:00",
    arrivalTime: "07:05",
    date: "2025-05-14",
    duration: "1h 05m",
    price: 2650,
    totalSeats: 170,
    availableSeats: 45,
  },
];

/* ---------- Seed bookings ---------- */
const SEED_BOOKINGS = [
  {
    id: "B-001",
    bookingRef: "SR-204-3501",
    userName: "Rihan Pathan",
    userEmail: "rp3948430@gmail.com",
    flightId: "F-001",
    flightNumber: "6E-204",
    airline: "IndiGo",
    route: "Mumbai → Delhi",
    date: "2025-05-12",
    departureTime: "08:15",
    arrivalTime: "10:30",
    passengers: 1,
    amount: 5240,
    status: "Confirmed",
    createdAt: "2025-04-02T10:00:00.000Z",
  },
  {
    id: "B-002",
    bookingRef: "SR-805-9204",
    userName: "Ananya Sharma",
    userEmail: "ananya@example.com",
    flightId: "F-002",
    flightNumber: "AI-805",
    airline: "Air India",
    route: "Pune → Bengaluru",
    date: "2025-05-12",
    departureTime: "14:00",
    arrivalTime: "16:10",
    passengers: 2,
    amount: 13780,
    status: "Confirmed",
    createdAt: "2025-04-03T12:30:00.000Z",
  },
  {
    id: "B-003",
    bookingRef: "SR-112-1180",
    userName: "Rohan Verma",
    userEmail: "rohan@example.com",
    flightId: "F-004",
    flightNumber: "SG-112",
    airline: "SpiceJet",
    route: "Chennai → Hyderabad",
    date: "2025-04-02",
    departureTime: "06:30",
    arrivalTime: "07:55",
    passengers: 1,
    amount: 3290,
    status: "Completed",
    createdAt: "2025-03-25T08:00:00.000Z",
  },
];

/* ---------- Low-level helpers ---------- */
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — ignore for demo */
  }
}

/* ---------- Flights ---------- */
function getFlights() {
  const storedVersion = Number(localStorage.getItem(SEED_VERSION_KEY) || 0);
  const stored = read(FLIGHTS_KEY, null);

  // Same seed version → trust whatever is stored (including user edits)
  if (
    storedVersion === SEED_VERSION &&
    Array.isArray(stored) &&
    stored.length > 0
  ) {
    return stored;
  }

  // Version changed → refresh seed flights, but keep any custom ones
  // the admin added (custom ids don't match the "F-00N" seed pattern).
  const customFlights = Array.isArray(stored)
    ? stored.filter((f) => !/^F-00\d$/.test(f.id))
    : [];

  const merged = [...SEED_FLIGHTS, ...customFlights];
  write(FLIGHTS_KEY, merged);
  localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
  return merged;
}

function getFlightById(id) {
  if (!id) return null;
  return getFlights().find((f) => f.id === id) || null;
}

function updateFlight(id, patch) {
  const next = getFlights().map((f) =>
    f.id === id ? { ...f, ...patch } : f
  );
  write(FLIGHTS_KEY, next);
  return next;
}

function decreaseSeats(id, count) {
  const flight = getFlightById(id);
  if (!flight) return;
  const remaining = Math.max(0, Number(flight.availableSeats) - Number(count));
  updateFlight(id, { availableSeats: remaining });
}

function increaseSeats(id, count) {
  const flight = getFlightById(id);
  if (!flight) return;
  const restored = Math.min(
    Number(flight.totalSeats),
    Number(flight.availableSeats) + Number(count)
  );
  updateFlight(id, { availableSeats: restored });
}

/* ---------- Bookings ---------- */
function getBookings() {
  const data = read(BOOKINGS_KEY, null);
  if (!Array.isArray(data) || data.length === 0) {
    write(BOOKINGS_KEY, SEED_BOOKINGS);
    return [...SEED_BOOKINGS];
  }
  return data;
}

function getBookingsByEmail(email) {
  if (!email) return [];
  const target = email.toLowerCase();
  return getBookings()
    .filter((b) => (b.userEmail || "").toLowerCase() === target)
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
}

function addBooking(booking) {
  const next = [booking, ...getBookings()];
  write(BOOKINGS_KEY, next);
  return booking;
}

function cancelBooking(id) {
  const next = getBookings().map((b) =>
    b.id === id ? { ...b, status: "Cancelled" } : b
  );
  write(BOOKINGS_KEY, next);
}

/* ---------- Reset (handy for demos) ---------- */
function resetDemoData() {
  localStorage.removeItem(FLIGHTS_KEY);
  localStorage.removeItem(BOOKINGS_KEY);
  localStorage.removeItem(SEED_VERSION_KEY);
}

const store = {
  getFlights,
  getFlightById,
  updateFlight,
  decreaseSeats,
  increaseSeats,
  getBookings,
  getBookingsByEmail,
  addBooking,
  cancelBooking,
  resetDemoData,
  FLIGHTS_KEY,
  BOOKINGS_KEY,
};

export default store;