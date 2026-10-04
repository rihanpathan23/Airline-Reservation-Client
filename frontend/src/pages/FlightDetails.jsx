import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import store from "../services/store";

function FlightDetails() {
  const { id } = useParams();
  const [flight] = useState(() => store.getFlightById(id));

  if (!flight) {
    return (
      <section className="page">
        <h1 className="page-title">Flight not found</h1>
        <p>We could not find the flight you are looking for.</p>
        <Link to="/flights" className="app-btn app-btn-primary">
          Back to Flights
        </Link>
      </section>
    );
  }

  const available = Number(flight.availableSeats ?? 0);

  return (
    <section className="page">
      <Link to="/flights" className="fd-back">
        ← Back to Flights
      </Link>

      <div className="fd-layout">
        <div className="fd-main">
          <div className="fd-card">
            <div className="fd-airline-row">
              <div className="fd-airline">
                <span className="fd-airline-logo" aria-hidden="true">
                  {flight.airline.charAt(0)}
                </span>
                <div>
                  <div className="fd-airline-name">{flight.airline}</div>
                  <div className="fd-airline-meta">
                    Flight {flight.flightNumber}
                    {flight.duration ? ` · ${flight.duration}` : ""}
                  </div>
                </div>
              </div>
              <span className="fc-badge">{available} seats left</span>
            </div>

            <div className="fd-route">
              <div className="fd-point">
                <div className="fd-time">{flight.departureTime}</div>
                <div className="fd-city">{flight.source}</div>
              </div>

              <div className="fd-middle">
                <span className="fd-duration">{flight.duration || "—"}</span>
                <span className="fd-line" aria-hidden="true" />
                <span className="fd-date">{flight.date}</span>
              </div>

              <div className="fd-point fd-point-right">
                <div className="fd-time">{flight.arrivalTime}</div>
                <div className="fd-city">{flight.destination}</div>
              </div>
            </div>
          </div>

          <div className="fd-info-card">
            <h2 className="fd-section-title">Flight information</h2>
            <dl className="fd-info-grid">
              <div>
                <dt>Airline</dt>
                <dd>{flight.airline}</dd>
              </div>
              <div>
                <dt>Flight Number</dt>
                <dd>{flight.flightNumber}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{flight.duration || "—"}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{flight.date}</dd>
              </div>
              <div>
                <dt>Departure</dt>
                <dd>
                  {flight.source} · {flight.departureTime}
                </dd>
              </div>
              <div>
                <dt>Arrival</dt>
                <dd>
                  {flight.destination} · {flight.arrivalTime}
                </dd>
              </div>
              <div>
                <dt>Available Seats</dt>
                <dd>{available}</dd>
              </div>
              <div>
                <dt>Total Seats</dt>
                <dd>{flight.totalSeats}</dd>
              </div>
            </dl>
          </div>
        </div>

        <aside className="fd-side">
          <div className="fd-fare-card">
            <h3 className="fd-fare-title">Fare summary</h3>

            <div className="fd-fare-row">
              <span>Base fare (per seat)</span>
              <span>₹{Number(flight.price).toLocaleString("en-IN")}</span>
            </div>
            <div className="fd-fare-row">
              <span>Taxes &amp; fees</span>
              <span>Included</span>
            </div>
            <div className="fd-fare-row fd-fare-total">
              <span>Total per seat</span>
              <span>₹{Number(flight.price).toLocaleString("en-IN")}</span>
            </div>

            {available > 0 ? (
              <Link
                to={`/booking?flight=${flight.id}`}
                className="fd-book-btn"
              >
                Continue to Booking
              </Link>
            ) : (
              <button type="button" className="fd-book-btn" disabled>
                Sold Out
              </button>
            )}

            <p className="fd-fare-note">
              You can review passenger details on the next step.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default FlightDetails;