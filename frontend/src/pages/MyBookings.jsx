import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import store from "../services/store";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("sr_user") || "null");
  } catch {
    return null;
  }
}

function MyBookings() {
  const navigate = useNavigate();
  const [user] = useState(getStoredUser);
  const [bookings, setBookings] = useState(() => {
    const u = getStoredUser();
    return u ? store.getBookingsByEmail(u.email) : [];
  });

  const refresh = () => {
    const u = getStoredUser();
    setBookings(u ? store.getBookingsByEmail(u.email) : []);
  };

  const handleLogout = () => {
    localStorage.removeItem("sr_user");
    localStorage.removeItem("sr_token");
    navigate("/");
  };

  const handleCancel = (booking) => {
    const ok = window.confirm(
      `Cancel booking ${booking.bookingRef}?\nThis cannot be undone.`
    );
    if (!ok) return;

    store.cancelBooking(booking.id);
    store.increaseSeats(booking.flightId, Number(booking.passengers) || 1);
    refresh();
  };

  if (!user) {
    return (
      <section className="page">
        <h1 className="page-title">My Bookings</h1>
        <div className="mb-empty">
          <div className="mb-empty-icon" aria-hidden="true">
            🔒
          </div>
          <h2>Please sign in to view your bookings</h2>
          <p>You need to be signed in to see and manage your flight bookings.</p>
          <div className="mb-empty-actions">
            <Link to="/login" className="app-btn app-btn-primary">
              Sign In
            </Link>
            <Link to="/signup" className="app-btn app-btn-secondary">
              Create an account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="mb-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: "0.35rem" }}>
            My Bookings
          </h1>
          <p className="mb-subtitle">
            Signed in as <strong>{user.email}</strong>
          </p>
        </div>
        <button
          type="button"
          className="app-btn app-btn-secondary"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="mb-empty">
          <h2>No bookings yet</h2>
          <p>Your confirmed bookings will appear here after your first flight.</p>
          <Link to="/flights" className="app-btn app-btn-primary">
            Browse Flights
          </Link>
        </div>
      ) : (
        <div className="mb-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="mb-card">
              <div className="mb-card-head">
                <div className="mb-airline">
                  <span className="fc-airline-logo">
                    {(booking.airline || "A").charAt(0)}
                  </span>
                  <div>
                    <div className="fc-airline-name">
                      {booking.airline || "Airline"}
                    </div>
                    <div className="fc-flight-number">
                      Flight {booking.flightNumber || "—"} ·{" "}
                      {booking.bookingRef}
                    </div>
                  </div>
                </div>
                <span
                  className={`mb-status mb-status-${(
                    booking.status || "confirmed"
                  ).toLowerCase()}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="mb-route">
                <div className="mb-point">
                  <div className="mb-time">{booking.departureTime || "--:--"}</div>
                  <div className="mb-city">
                    {(booking.route || "→").split("→")[0].trim()}
                  </div>
                </div>
                <div className="mb-arrow" aria-hidden="true">
                  →
                </div>
                <div className="mb-point mb-point-right">
                  <div className="mb-time">{booking.arrivalTime || "--:--"}</div>
                  <div className="mb-city">
                    {(booking.route || "→").split("→")[1]?.trim() || "—"}
                  </div>
                </div>
              </div>

              <div className="mb-meta">
                <span className="fc-meta-item">Date: {booking.date || "—"}</span>
                <span className="fc-meta-item">
                  Passengers: {booking.passengers || 1}
                </span>
                <span className="fc-meta-item">
                  Amount: ₹{Number(booking.amount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              {booking.status === "Confirmed" && (
                <div className="mb-actions">
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn-delete"
                    onClick={() => handleCancel(booking)}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBookings;