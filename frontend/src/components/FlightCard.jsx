import { Link } from "react-router-dom";

function FlightCard({ flight }) {
  if (!flight) return null;

  const {
    id,
    airline = "Airline",
    flightNumber = "—",
    source = "—",
    destination = "—",
    departureTime = "--:--",
    arrivalTime = "--:--",
    date = "Date not available",
    duration = "—",
    seats,
    price,
  } = flight;

  const formattedPrice =
    typeof price === "number"
      ? `₹${price.toLocaleString("en-IN")}`
      : price
      ? `₹${price}`
      : "—";

  const seatsLabel =
    typeof seats === "number"
      ? `${seats} seats left`
      : seats
      ? `${seats}`
      : "Seats N/A";

  const airlineInitial = airline ? airline.charAt(0).toUpperCase() : "A";

  return (
    <article className="fc-card">
      <div className="fc-top">
        <div className="fc-airline">
          <span className="fc-airline-logo" aria-hidden="true">
            {airlineInitial}
          </span>
          <div>
            <div className="fc-airline-name">{airline}</div>
            <div className="fc-flight-number">Flight {flightNumber}</div>
          </div>
        </div>
        <span className="fc-badge">{seatsLabel}</span>
      </div>

      <div className="fc-route">
        <div className="fc-point">
          <span className="fc-time">{departureTime}</span>
          <span className="fc-city">{source}</span>
        </div>

        <div className="fc-route-middle">
          <span className="fc-duration">{duration}</span>
          <span className="fc-line" aria-hidden="true" />
          <span className="fc-date">{date}</span>
        </div>

        <div className="fc-point fc-point-right">
          <span className="fc-time">{arrivalTime}</span>
          <span className="fc-city">{destination}</span>
        </div>
      </div>

      <div className="fc-meta">
        <span className="fc-meta-item">From: {source}</span>
        <span className="fc-meta-item">To: {destination}</span>
      </div>

      <div className="fc-bottom">
        <div>
          <div className="fc-price-label">Price per seat</div>
          <div className="fc-price">{formattedPrice}</div>
        </div>

        {id ? (
          <Link to={`/flight/${id}`} className="fc-btn">
            View Details
          </Link>
        ) : (
          <button type="button" className="fc-btn fc-btn-disabled" disabled>
            View Details
          </button>
        )}
      </div>
    </article>
  );
}

export default FlightCard;