import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STORAGE_FLIGHTS = "sr_flights";
const STORAGE_BOOKINGS = "sr_bookings";

/* ---------- Seed data (used only the first time) ---------- */
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
];

const SEED_BOOKINGS = [
  {
    id: "B-001",
    bookingRef: "SR-204-3501",
    userName: "Rihan Pathan",
    userEmail: "rp3948430@gmail.com",
    flightNumber: "6E-204",
    route: "Mumbai → Delhi",
    passengers: 1,
    amount: 5240,
    status: "Confirmed",
  },
  {
    id: "B-002",
    bookingRef: "SR-805-9204",
    userName: "Ananya Sharma",
    userEmail: "ananya@example.com",
    flightNumber: "AI-805",
    route: "Pune → Bengaluru",
    passengers: 2,
    amount: 13780,
    status: "Confirmed",
  },
  {
    id: "B-003",
    bookingRef: "SR-112-1180",
    userName: "Rohan Verma",
    userEmail: "rohan@example.com",
    flightNumber: "SG-112",
    route: "Chennai → Hyderabad",
    passengers: 1,
    amount: 3290,
    status: "Completed",
  },
];

/* ---------- Storage helpers ---------- */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFlights() {
  const data = readJSON(STORAGE_FLIGHTS, null);
  if (!Array.isArray(data) || data.length === 0) {
    writeJSON(STORAGE_FLIGHTS, SEED_FLIGHTS);
    return SEED_FLIGHTS;
  }
  return data;
}

function loadBookings() {
  const data = readJSON(STORAGE_BOOKINGS, null);
  if (!Array.isArray(data) || data.length === 0) {
    writeJSON(STORAGE_BOOKINGS, SEED_BOOKINGS);
    return SEED_BOOKINGS;
  }
  return data;
}

/* ---------- Admin guard ---------- */
function getStoredAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem("sr_user") || "null");
    return user && user.role === "admin" ? user : null;
  } catch {
    return null;
  }
}

/* ---------- Empty form template ---------- */
const EMPTY_FORM = {
  flightNumber: "",
  airline: "",
  source: "",
  destination: "",
  departureTime: "",
  arrivalTime: "",
  date: "",
  duration: "",
  price: "",
  totalSeats: "",
  availableSeats: "",
};

/* =========================================================
   Main component
   ========================================================= */
function AdminDashboard() {
  const navigate = useNavigate();
  const [admin] = useState(getStoredAdmin);

  const [view, setView] = useState("dashboard");
  const [flights, setFlights] = useState(loadFlights);
  const [bookings] = useState(loadBookings);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* Guard: only admins can see this page */
  useEffect(() => {
    if (!admin) navigate("/admin/login", { replace: true });
  }, [admin, navigate]);

  /* Persist flights whenever they change */
  useEffect(() => {
    writeJSON(STORAGE_FLIGHTS, flights);
  }, [flights]);

  /* ---------- Handlers ---------- */
  const handleLogout = () => {
    localStorage.removeItem("sr_user");
    localStorage.removeItem("sr_token");
    navigate("/admin/login");
  };

  const goTo = (nextView) => {
    setView(nextView);
    setError("");
    setSuccess("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitFlight = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.flightNumber ||
      !form.airline ||
      !form.source ||
      !form.destination ||
      !form.departureTime ||
      !form.arrivalTime ||
      !form.date ||
      !form.price ||
      !form.totalSeats
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      totalSeats: Number(form.totalSeats),
      availableSeats: Number(form.availableSeats || form.totalSeats),
    };

    /* ----- Edit mode ----- */
    if (editingId) {
      setFlights((prev) =>
        prev.map((f) => (f.id === editingId ? { ...f, ...payload } : f))
      );
      setSuccess(`Flight ${payload.flightNumber} updated successfully.`);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setTimeout(() => goTo("view-flights"), 900);
      return;
    }

    /* ----- Duplicate check ----- */
    const exists = flights.some(
      (f) =>
        f.flightNumber.toLowerCase() === payload.flightNumber.toLowerCase()
    );
    if (exists) {
      setError(`A flight with number ${payload.flightNumber} already exists.`);
      return;
    }

    /* ----- Add mode ----- */
    const newFlight = { ...payload, id: `F-${Date.now()}` };
    setFlights((prev) => [newFlight, ...prev]);
    setSuccess(`Flight ${payload.flightNumber} added successfully.`);
    setForm(EMPTY_FORM);
    setTimeout(() => goTo("view-flights"), 900);
  };

  const handleEdit = (flight) => {
    setEditingId(flight.id);
    setForm({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      source: flight.source,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      date: flight.date,
      duration: flight.duration || "",
      price: String(flight.price),
      totalSeats: String(flight.totalSeats),
      availableSeats: String(flight.availableSeats),
    });
    setView("edit-flight");
    setError("");
    setSuccess("");
  };

  const handleDelete = (flight) => {
    const ok = window.confirm(
      `Delete flight ${flight.flightNumber} (${flight.airline})?\nThis cannot be undone.`
    );
    if (!ok) return;

    setFlights((prev) => prev.filter((f) => f.id !== flight.id));
    setSuccess(`Flight ${flight.flightNumber} deleted.`);
    setTimeout(() => setSuccess(""), 2500);
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    goTo("dashboard");
  };

  if (!admin) return null;

  /* =========================================================
     View renderers
     ========================================================= */
  const renderDashboard = () => (
    <>
      <section className="admin-stats">
        <article className="admin-stat-card">
          <div className="admin-stat-label">Total Flights</div>
          <div className="admin-stat-value">{flights.length}</div>
          <div className="admin-stat-hint">Flights in the system</div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Total Bookings</div>
          <div className="admin-stat-value">{bookings.length}</div>
          <div className="admin-stat-hint">Bookings recorded so far</div>
        </article>
      </section>

      <section>
        <h2 className="admin-section-title">Manage</h2>
        <div className="admin-actions">
          <ActionCard
            title="Add Flight"
            description="Create a new flight schedule."
            buttonLabel="Add Flight"
            onClick={() => goTo("add-flight")}
          />
          <ActionCard
            title="View Flights"
            description="Browse all flights currently listed."
            buttonLabel="View Flights"
            onClick={() => goTo("view-flights")}
          />
          <ActionCard
            title="Edit Flight"
            description="Update details of an existing flight."
            buttonLabel="Choose Flight"
            onClick={() => goTo("view-flights")}
          />
          <ActionCard
            title="Delete Flight"
            description="Remove a flight from the system."
            buttonLabel="Choose Flight"
            onClick={() => goTo("view-flights")}
          />
          <ActionCard
            title="View Bookings"
            description="Review bookings made by travellers."
            buttonLabel="View Bookings"
            onClick={() => goTo("view-bookings")}
          />
        </div>
      </section>
    </>
  );

  const renderAddFlight = () => (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2 className="admin-panel-title">Add New Flight</h2>
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => goTo("dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <FlightForm
        form={form}
        onChange={handleFormChange}
        onSubmit={handleSubmitFlight}
        onCancel={cancelForm}
        submitLabel="Add Flight"
      />
    </section>
  );

  const renderViewFlights = () => (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2 className="admin-panel-title">All Flights</h2>
        <div className="admin-panel-actions">
          <button
            type="button"
            className="app-btn app-btn-primary"
            onClick={() => goTo("add-flight")}
          >
            + Add Flight
          </button>
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => goTo("dashboard")}
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {success && <div className="auth-success">{success}</div>}

      {flights.length === 0 ? (
        <div className="admin-empty">
          <p>No flights in the system yet.</p>
          <button
            type="button"
            className="app-btn app-btn-primary"
            onClick={() => goTo("add-flight")}
          >
            Add your first flight
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Airline</th>
                <th>Route</th>
                <th>Date &amp; Time</th>
                <th>Seats</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight) => (
                <tr key={flight.id}>
                  <td className="admin-td-strong">{flight.flightNumber}</td>
                  <td>{flight.airline}</td>
                  <td>
                    {flight.source} → {flight.destination}
                  </td>
                  <td>
                    {flight.date}
                    <br />
                    <span className="admin-muted">
                      {flight.departureTime} – {flight.arrivalTime}
                    </span>
                  </td>
                  <td>
                    {flight.availableSeats} / {flight.totalSeats}
                  </td>
                  <td className="admin-td-price">
                    ₹{Number(flight.price).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn-edit"
                        onClick={() => handleEdit(flight)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn-delete"
                        onClick={() => handleDelete(flight)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderEditFlight = () => {
    const flight = flights.find((f) => f.id === editingId);
    if (!flight) {
      return (
        <section className="admin-panel">
          <p>Flight not found.</p>
          <button
            type="button"
            className="app-btn app-btn-primary"
            onClick={() => goTo("view-flights")}
          >
            Back to Flights
          </button>
        </section>
      );
    }

    return (
      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">
            Edit Flight — {flight.flightNumber}
          </h2>
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => goTo("view-flights")}
          >
            ← Flights
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <FlightForm
          form={form}
          onChange={handleFormChange}
          onSubmit={handleSubmitFlight}
          onCancel={cancelForm}
          submitLabel="Save Changes"
        />
      </section>
    );
  };

  const renderViewBookings = () => (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2 className="admin-panel-title">All Bookings</h2>
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => goTo("dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="admin-empty">
          <p>No bookings recorded yet.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Passenger</th>
                <th>Flight</th>
                <th>Route</th>
                <th>Travellers</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="admin-td-strong">{b.bookingRef}</td>
                  <td>
                    {b.userName}
                    <br />
                    <span className="admin-muted">{b.userEmail}</span>
                  </td>
                  <td>{b.flightNumber}</td>
                  <td>{b.route}</td>
                  <td>{b.passengers}</td>
                  <td className="admin-td-price">
                    ₹{Number(b.amount).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span
                      className={`admin-status admin-status-${b.status.toLowerCase()}`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <h1 className="admin-dashboard-title">Admin Dashboard</h1>
          <p className="admin-dashboard-subtitle">
            Signed in as <strong>{admin.name}</strong>
          </p>
        </div>
        <div className="admin-dashboard-actions">
          <Link to="/" className="app-btn app-btn-secondary">
            Back to Site
          </Link>
          <button
            type="button"
            className="app-btn app-btn-primary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {view === "dashboard" && renderDashboard()}
      {view === "add-flight" && renderAddFlight()}
      {view === "view-flights" && renderViewFlights()}
      {view === "edit-flight" && renderEditFlight()}
      {view === "view-bookings" && renderViewBookings()}
    </section>
  );
}

/* =========================================================
   Sub-components
   ========================================================= */
function ActionCard({ title, description, buttonLabel, onClick }) {
  return (
    <article className="admin-action-card">
      <h3 className="admin-action-title">{title}</h3>
      <p className="admin-action-text">{description}</p>
      <button
        type="button"
        className="app-btn app-btn-secondary admin-action-btn"
        onClick={onClick}
      >
        {buttonLabel}
      </button>
    </article>
  );
}

function FlightForm({ form, onChange, onSubmit, onCancel, submitLabel }) {
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="admin-form-grid">
        <label className="admin-form-field">
          <span className="admin-form-label">Flight Number *</span>
          <input
            type="text"
            name="flightNumber"
            value={form.flightNumber}
            onChange={onChange}
            className="admin-input"
            placeholder="e.g. 6E-204"
            required
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Airline *</span>
          <input
            type="text"
            name="airline"
            value={form.airline}
            onChange={onChange}
            className="admin-input"
            placeholder="e.g. IndiGo"
            required
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Source *</span>
          <input
            type="text"
            name="source"
            value={form.source}
            onChange={onChange}
            className="admin-input"
            placeholder="e.g. Mumbai"
            required
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Destination *</span>
          <input
            type="text"
            name="destination"
            value={form.destination}
            onChange={onChange}
            className="admin-input"
            placeholder="e.g. Delhi"
            required
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Departure Time *</span>
          <input
            type="time"
            name="departureTime"
            value={form.departureTime}
            onChange={onChange}
            className="admin-input"
            required
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Arrival Time *</span>
          <input
            type="time"
            name="arrivalTime"
            value={form.arrivalTime}
            onChange={onChange}
            className="admin-input"
            required
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Date *</span>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            className="admin-input"
            required
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Duration</span>
          <input
            type="text"
            name="duration"
            value={form.duration}
            onChange={onChange}
            className="admin-input"
            placeholder="e.g. 2h 15m"
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Price (₹) *</span>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={onChange}
            className="admin-input"
            placeholder="e.g. 5240"
            min="1"
            required
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Total Seats *</span>
          <input
            type="number"
            name="totalSeats"
            value={form.totalSeats}
            onChange={onChange}
            className="admin-input"
            placeholder="e.g. 180"
            min="1"
            required
          />
        </label>

        <label className="admin-form-field">
          <span className="admin-form-label">Available Seats</span>
          <input
            type="number"
            name="availableSeats"
            value={form.availableSeats}
            onChange={onChange}
            className="admin-input"
            placeholder="Defaults to Total Seats"
            min="0"
          />
        </label>
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="app-btn app-btn-primary">
          {submitLabel}
        </button>
        <button
          type="button"
          className="app-btn app-btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AdminDashboard;