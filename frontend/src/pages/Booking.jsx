import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import store from "../services/store";

const STEP_LABELS = ["Passenger Details", "Payment", "Confirmation"];

const BANKS = [
  "HDFC Bank",
  "ICICI Bank",
  "State Bank of India",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
];

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card" },
  { id: "upi", label: "UPI" },
  { id: "qr", label: "Scan QR Code" },
  { id: "netbanking", label: "Net Banking" },
];

/* ---------- Helpers ---------- */
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("sr_user") || "null");
  } catch {
    return null;
  }
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function generateBookingRef(flightNumber) {
  const tail = (flightNumber || "000").replace(/\D/g, "").slice(-3) || "000";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SR-${tail}-${rand}`;
}

function generateTxnId() {
  return "TXN-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

const EMPTY_DETAILS = {
  passengerName: "",
  passengerAge: "",
  passengerGender: "Male",
  mobile: "",
  passengers: 1,
  seatPreference: "Window",
};

const EMPTY_PAYMENT = {
  method: "card",
  cardNumber: "",
  cardName: "",
  expiry: "",
  cvv: "",
  upiId: "",
  bank: BANKS[0],
};

/* =========================================================
   Dummy QR renderer (pure SVG, no library)
   ========================================================= */
function DummyQR({ size = 220, seed = "SKYRESERVE" }) {
  const N = 29;
  const cell = size / N;

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  const seedNum = hashString(seed);

  function pseudoRandom(i, j) {
    let x =
      seedNum ^
      Math.imul(i + 1, 73856093) ^
      Math.imul(j + 1, 19349663);
    x = Math.imul(x ^ (x >>> 16), 2246822507);
    x = Math.imul(x ^ (x >>> 13), 3266489909);
    x = (x ^ (x >>> 16)) >>> 0;
    return x / 4294967296;
  }

  const cells = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      /* Finder patterns in three corners */
      const isInFinder =
        (i < 7 && j < 7) ||
        (i < 7 && j >= N - 7) ||
        (i >= N - 7 && j < 7);

      if (isInFinder) {
        const fi = i < 7 ? i : i - (N - 7);
        const fj = j < 7 ? j : j - (N - 7);
        const ring = Math.max(Math.abs(fi - 3), Math.abs(fj - 3));
        cells.push({ i, j, on: ring !== 2 });
        continue;
      }

      /* Separation zones around finders */
      const nearFinder =
        (i < 8 && j < 8) ||
        (i < 8 && j >= N - 8) ||
        (i >= N - 8 && j < 8);
      if (nearFinder) continue;

      /* Timing patterns */
      if (i === 6 || j === 6) {
        if ((i + j) % 2 === 0) cells.push({ i, j, on: true });
        continue;
      }

      cells.push({ i, j, on: pseudoRandom(i, j) > 0.5 });
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="qr-svg"
      role="img"
      aria-label="Payment QR code"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {cells
        .filter((c) => c.on)
        .map((c, idx) => (
          <rect
            key={idx}
            x={c.j * cell}
            y={c.i * cell}
            width={cell}
            height={cell}
            fill="#0f172a"
          />
        ))}
    </svg>
  );
}

/* =========================================================
   Page
   ========================================================= */
function Booking() {
  const [searchParams] = useSearchParams();
  const user = getStoredUser();

  const [flights] = useState(() => store.getFlights());
  const [selectedId, setSelectedId] = useState(
    () => searchParams.get("flight") || ""
  );

  const flight = useMemo(
    () => flights.find((f) => f.id === selectedId) || null,
    [flights, selectedId]
  );

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState(() => ({
    ...EMPTY_DETAILS,
    passengerName: user?.name || "",
  }));
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const passengerCount = Number(details.passengers) || 1;
  const total = flight ? Number(flight.price) * passengerCount : 0;
  const seatsLeft = flight ? Number(flight.availableSeats) : 0;

  /* ---------- Guards ---------- */
  if (!user) {
    return (
      <section className="page">
        <h1 className="page-title">Book a Flight</h1>
        <div className="mb-empty">
          <div className="mb-empty-icon" aria-hidden="true">
            🔒
          </div>
          <h2>Please sign in to continue</h2>
          <p>You need an account to book flights on SkyReserve.</p>
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

  if (!flight) {
    return (
      <section className="page">
        <h1 className="page-title">Book a Flight</h1>
        <div className="bk-card">
          <h2 className="bk-section-title">Select a flight to continue</h2>
          <p className="bk-help">
            Choose one of the available flights below, then continue to booking.
          </p>

          {flights.length === 0 ? (
            <p className="bk-help">No flights are available right now.</p>
          ) : (
            <>
              <label className="bk-field">
                <span className="bk-label">Available flights</span>
                <select
                  className="bk-input"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">— Select a flight —</option>
                  {flights.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.airline} {f.flightNumber} · {f.source} → {f.destination}{" "}
                      · ₹{Number(f.price).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          <div style={{ marginTop: "1rem" }}>
            <Link to="/flights" className="bk-change-link">
              Browse all flights →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Handlers ---------- */
  const handleDetailsChange = (event) => {
    const { name, value } = event.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setError("");

    if (name === "cardNumber") {
      setPayment((prev) => ({ ...prev, cardNumber: formatCardNumber(value) }));
      return;
    }
    if (name === "expiry") {
      setPayment((prev) => ({ ...prev, expiry: formatExpiry(value) }));
      return;
    }
    if (name === "cvv") {
      setPayment((prev) => ({
        ...prev,
        cvv: value.replace(/\D/g, "").slice(0, 4),
      }));
      return;
    }
    setPayment((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailsSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!details.passengerName.trim()) {
      setError("Please enter the passenger name.");
      return;
    }
    const mobileDigits = details.mobile.replace(/\D/g, "");
    if (mobileDigits.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    const age = Number(details.passengerAge);
    if (!age || age < 1 || age > 120) {
      setError("Please enter a valid passenger age (1–120).");
      return;
    }
    if (passengerCount < 1 || passengerCount > seatsLeft) {
      setError(`Only ${seatsLeft} seat(s) are available on this flight.`);
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validatePayment = () => {
    if (payment.method === "card") {
      const digits = payment.cardNumber.replace(/\D/g, "");
      if (digits.length !== 16) return "Card number must be 16 digits.";
      if (!payment.cardName.trim())
        return "Please enter the name on the card.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiry))
        return "Expiry must be in MM/YY format.";
      if (!/^\d{3,4}$/.test(payment.cvv))
        return "CVV must be 3 or 4 digits.";
    }
    if (payment.method === "upi") {
      if (!/^[\w.\-]+@[\w.\-]+$/.test(payment.upiId))
        return "Please enter a valid UPI ID (example: name@bank).";
    }
    return "";
  };

  const handlePaymentSubmit = (event) => {
    event.preventDefault();

    const validationError = validatePayment();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setProcessing(true);

    /* Payment processing simulation */
    setTimeout(() => {
      const booking = {
        id: `B-${Date.now()}`,
        bookingRef: generateBookingRef(flight.flightNumber),
        userName: details.passengerName,
        userEmail: user.email,
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        route: `${flight.source} → ${flight.destination}`,
        date: flight.date,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        passengers: passengerCount,
        amount: total,
        passengerName: details.passengerName,
        passengerAge: Number(details.passengerAge),
        passengerGender: details.passengerGender,
        mobile: details.mobile,
        seatPreference: details.seatPreference,
        paymentMethod: payment.method,
        status: "Confirmed",
        createdAt: new Date().toISOString(),
      };

      store.addBooking(booking);
      store.decreaseSeats(flight.id, passengerCount);

      setConfirmed({ ...booking, txnId: generateTxnId() });
      setProcessing(false);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1800);
  };

  /* =========================================================
     Render
     ========================================================= */
  return (
    <section className="page">
      <h1 className="page-title">Complete Your Booking</h1>

      {/* Stepper */}
      <div className="bk-steps">
        {STEP_LABELS.map((label, index) => {
          const number = index + 1;
          const state = step === number ? "active" : step > number ? "done" : "";
          return (
            <div key={label} className={`bk-step ${state}`}>
              <span className="bk-step-num">{number}</span>
              {label}
            </div>
          );
        })}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="bk-layout">
        <div>
          {/* ---------------- STEP 1 : PASSENGER DETAILS ---------------- */}
          {step === 1 && (
            <form className="bk-form" onSubmit={handleDetailsSubmit}>
              <div className="bk-card">
                <h2 className="bk-section-title">Passenger details</h2>

                <div className="bk-grid">
                  <label className="bk-field">
                    <span className="bk-label">Passenger name *</span>
                    <input
                      type="text"
                      name="passengerName"
                      value={details.passengerName}
                      onChange={handleDetailsChange}
                      className="bk-input"
                      placeholder="e.g. Vaishnav Kalwaghe"
                      required
                    />
                  </label>

                  <label className="bk-field">
                    <span className="bk-label">Age *</span>
                    <input
                      type="number"
                      name="passengerAge"
                      value={details.passengerAge}
                      onChange={handleDetailsChange}
                      className="bk-input"
                      placeholder="e.g. 22"
                      min="1"
                      max="120"
                      required
                    />
                  </label>

                  <label className="bk-field">
                    <span className="bk-label">Gender *</span>
                    <select
                      name="passengerGender"
                      value={details.passengerGender}
                      onChange={handleDetailsChange}
                      className="bk-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label className="bk-field">
                    <span className="bk-label">Mobile number *</span>
                    <input
                      type="tel"
                      name="mobile"
                      value={details.mobile}
                      onChange={handleDetailsChange}
                      className="bk-input"
                      placeholder="10-digit number"
                      required
                    />
                  </label>

                  <label className="bk-field">
                    <span className="bk-label">Email (account)</span>
                    <input
                      type="email"
                      value={user.email}
                      className="bk-input"
                      readOnly
                    />
                  </label>

                  <label className="bk-field">
                    <span className="bk-label">Number of passengers *</span>
                    <select
                      name="passengers"
                      value={details.passengers}
                      onChange={handleDetailsChange}
                      className="bk-input"
                    >
                      {Array.from(
                        { length: Math.max(1, seatsLeft) },
                        (_, i) => i + 1
                      )
                        .slice(0, 6)
                        .map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label className="bk-field">
                    <span className="bk-label">Seat preference</span>
                    <select
                      name="seatPreference"
                      value={details.seatPreference}
                      onChange={handleDetailsChange}
                      className="bk-input"
                    >
                      <option value="Window">Window</option>
                      <option value="Aisle">Aisle</option>
                      <option value="Middle">Middle</option>
                    </select>
                  </label>
                </div>

                <p className="bk-help">
                  Bookings are linked to your account email, so you can view
                  them anytime under <strong>My Bookings</strong>.
                </p>
              </div>

              <button
                type="submit"
                className="app-btn app-btn-primary bk-submit"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {/* ---------------- STEP 2 : PAYMENT ---------------- */}
          {step === 2 && (
            <form className="bk-form" onSubmit={handlePaymentSubmit}>
              <div className="bk-card">
                <h2 className="bk-section-title">Payment</h2>

                <div className="pay-notice">
                  <span aria-hidden="true">🔒</span>
                  <span>
                    <strong>Secure Payment.</strong> Your card details are
                    encrypted and processed through a secure checkout.
                  </span>
                </div>

                <div className="pay-tabs">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`pay-tab${
                        payment.method === method.id ? " active" : ""
                      }`}
                      onClick={() => {
                        setPayment((prev) => ({
                          ...prev,
                          method: method.id,
                        }));
                        setError("");
                      }}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                {/* ---------- CARD ---------- */}
                {payment.method === "card" && (
                  <>
                    <div className="pay-card-preview">
                      <div className="pay-card-top">
                        <span className="pay-card-chip" />
                        <span className="pay-card-brand">SKYPAY</span>
                      </div>
                      <div className="pay-card-number">
                        {payment.cardNumber || "•••• •••• •••• ••••"}
                      </div>
                      <div className="pay-card-bottom">
                        <div>
                          <span className="pay-card-label">Card holder</span>
                          <span className="pay-card-value">
                            {payment.cardName || "YOUR NAME"}
                          </span>
                        </div>
                        <div>
                          <span className="pay-card-label">Expires</span>
                          <span className="pay-card-value">
                            {payment.expiry || "MM/YY"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bk-grid">
                      <label className="bk-field bk-field-wide">
                        <span className="bk-label">Card number *</span>
                        <input
                          type="text"
                          name="cardNumber"
                          value={payment.cardNumber}
                          onChange={handlePaymentChange}
                          className="bk-input"
                          placeholder="1234 5678 9012 3456"
                          inputMode="numeric"
                          required
                        />
                      </label>

                      <label className="bk-field">
                        <span className="bk-label">Name on card *</span>
                        <input
                          type="text"
                          name="cardName"
                          value={payment.cardName}
                          onChange={handlePaymentChange}
                          className="bk-input"
                          placeholder="e.g. ROHIT KALWAGHE"
                          required
                        />
                      </label>

                      <div className="pay-row">
                        <label className="bk-field">
                          <span className="bk-label">Expiry (MM/YY) *</span>
                          <input
                            type="text"
                            name="expiry"
                            value={payment.expiry}
                            onChange={handlePaymentChange}
                            className="bk-input"
                            placeholder="09/28"
                            inputMode="numeric"
                            required
                          />
                        </label>

                        <label className="bk-field">
                          <span className="bk-label">CVV *</span>
                          <input
                            type="password"
                            name="cvv"
                            value={payment.cvv}
                            onChange={handlePaymentChange}
                            className="bk-input"
                            placeholder="•••"
                            inputMode="numeric"
                            required
                          />
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* ---------- UPI ---------- */}
                {payment.method === "upi" && (
                  <div className="bk-grid">
                    <label className="bk-field bk-field-wide">
                      <span className="bk-label">UPI ID *</span>
                      <input
                        type="text"
                        name="upiId"
                        value={payment.upiId}
                        onChange={handlePaymentChange}
                        className="bk-input"
                        placeholder="yourname@upi"
                        required
                      />
                    </label>
                    <p className="bk-help">
                      A payment request will be sent to this UPI ID. Approve it
                      in your UPI app to complete the booking.
                    </p>
                  </div>
                )}

                {/* ---------- QR ---------- */}
                {payment.method === "qr" && (
                  <div className="qr-wrap">
                    <p className="qr-instruction">
                      Scan this QR code with any UPI app to complete your
                      payment.
                    </p>

                    <div className="qr-frame">
                      <DummyQR
                        size={220}
                        seed={`SKY-${flight.flightNumber}-${total}`}
                      />
                    </div>

                    <div className="qr-details">
                      <div className="qr-row">
                        <span>Amount</span>
                        <strong>₹{total.toLocaleString("en-IN")}</strong>
                      </div>
                      <div className="qr-row">
                        <span>Merchant</span>
                        <strong>SkyReserve Flights</strong>
                      </div>
                      <div className="qr-row">
                        <span>Reference</span>
                        <strong>
                          SR-
                          {(flight.flightNumber || "")
                            .replace(/\D/g, "")
                            .slice(-3) || "000"}
                        </strong>
                      </div>
                    </div>

                    <p className="qr-hint">
                      <span className="pay-spinner" aria-hidden="true" />
                      Waiting for payment confirmation…
                    </p>
                  </div>
                )}

                {/* ---------- NET BANKING ---------- */}
                {payment.method === "netbanking" && (
                  <div className="bk-grid">
                    <label className="bk-field bk-field-wide">
                      <span className="bk-label">Select your bank *</span>
                      <select
                        name="bank"
                        value={payment.bank}
                        onChange={handlePaymentChange}
                        className="bk-input"
                      >
                        {BANKS.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="bk-help">
                      You will be redirected to your bank's secure login page to
                      authorise this payment.
                    </p>
                  </div>
                )}
              </div>

              <div className="bk-form-actions">
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  disabled={processing}
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="pay-spinner" aria-hidden="true" />
                      Processing…
                    </>
                  ) : (
                    `Pay ₹${total.toLocaleString("en-IN")}`
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ---------------- STEP 3 : CONFIRMATION ---------------- */}
          {step === 3 && confirmed && (
            <div className="bk-card pay-success">
              <div className="pay-success-icon" aria-hidden="true">
                ✓
              </div>
              <h2 className="bk-section-title">Booking Confirmed!</h2>
              <p className="bk-help">
                Your payment was successful and your seat is reserved. A
                confirmation has been recorded against your account.
              </p>

              <div className="pay-receipt">
                <div className="pay-receipt-row">
                  <span>Booking reference</span>
                  <strong>{confirmed.bookingRef}</strong>
                </div>
                <div className="pay-receipt-row">
                  <span>Transaction ID</span>
                  <strong>{confirmed.txnId}</strong>
                </div>
                <div className="pay-receipt-row">
                  <span>Flight</span>
                  <strong>
                    {confirmed.airline} · {confirmed.flightNumber}
                  </strong>
                </div>
                <div className="pay-receipt-row">
                  <span>Route</span>
                  <strong>{confirmed.route}</strong>
                </div>
                <div className="pay-receipt-row">
                  <span>Departure</span>
                  <strong>
                    {confirmed.date} · {confirmed.departureTime}
                  </strong>
                </div>
                <div className="pay-receipt-row">
                  <span>Passengers</span>
                  <strong>{confirmed.passengers}</strong>
                </div>
                <div className="pay-receipt-row pay-receipt-total">
                  <span>Amount paid</span>
                  <strong>
                    ₹{Number(confirmed.amount).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="pay-success-actions">
                <Link to="/my-bookings" className="app-btn app-btn-primary">
                  Go to My Bookings
                </Link>
                <Link to="/flights" className="app-btn app-btn-secondary">
                  Book another flight
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- SIDE SUMMARY ---------------- */}
        <aside className="bk-summary">
          <div className="bk-card">
            <h3 className="bk-summary-title">Trip summary</h3>

            <div className="bk-summary-flight">
              <div className="bk-summary-airline">
                <span className="fc-airline-logo">
                  {flight.airline.charAt(0)}
                </span>
                <div>
                  <div className="fc-airline-name">{flight.airline}</div>
                  <div className="fc-flight-number">
                    Flight {flight.flightNumber}
                  </div>
                </div>
              </div>

              <div className="bk-summary-route">
                <span>
                  {flight.source} → {flight.destination}
                </span>
                <span className="bk-summary-date">
                  {flight.date} · {flight.departureTime} – {flight.arrivalTime}
                </span>
              </div>
            </div>

            <div className="bk-summary-row">
              <span>Price per seat</span>
              <span>₹{Number(flight.price).toLocaleString("en-IN")}</span>
            </div>
            <div className="bk-summary-row">
              <span>Passengers</span>
              <span>{passengerCount}</span>
            </div>
            <div className="bk-summary-row">
              <span>Taxes &amp; fees</span>
              <span>Included</span>
            </div>
            <div className="bk-summary-row bk-summary-total">
              <span>Total payable</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>

            <p className="bk-help">
              {seatsLeft} seat(s) available on this flight.
            </p>

            <Link to="/flights" className="bk-change-link">
              Change flight
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Booking;