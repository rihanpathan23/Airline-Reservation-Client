import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import store from "../services/store";

const popularRoutes = [
  { from: "Mumbai", to: "Delhi", price: "₹5,240", tag: "Trending" },
  { from: "Pune", to: "Bengaluru", price: "₹6,890", tag: "Popular" },
  { from: "Delhi", to: "Goa", price: "₹6,480", tag: "Best value" },
];

const features = [
  {
    title: "Best Fares",
    text: "Compare live prices and lock in the most affordable fare for your route.",
  },
  {
    title: "Instant Booking",
    text: "Reserve your seat in under a minute with a clean, no-noise checkout.",
  },
  {
    title: "Secure Checkout",
    text: "Your personal details are handled with care and standard security practices.",
  },
  {
    title: "24×7 Support",
    text: "Our support team is available round the clock to help with any query.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
  });
  const [activeField, setActiveField] = useState(null);

  /* Build the list of available cities once from flight data */
  const allCities = useMemo(() => {
    const flights = store.getFlights();
    const set = new Set();
    flights.forEach((f) => {
      if (f.source) set.add(f.source);
      if (f.destination) set.add(f.destination);
    });
    return Array.from(set).sort();
  }, []);

  const getSuggestions = (value) => {
    if (!value || !value.trim()) return [];
    const v = value.toLowerCase().trim();
    return allCities
      .filter(
        (city) =>
          city.toLowerCase().includes(v) && city.toLowerCase() !== v
      )
      .slice(0, 6);
  };

  const fromSuggestions =
    activeField === "from" ? getSuggestions(form.from) : [];
  const toSuggestions = activeField === "to" ? getSuggestions(form.to) : [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const pickSuggestion = (field, city) => {
    setForm((prev) => ({ ...prev, [field]: city }));
    setActiveField(null);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (form.from.trim()) params.set("from", form.from.trim());
    if (form.to.trim()) params.set("to", form.to.trim());
    const query = params.toString();
    navigate(`/flights${query ? `?${query}` : ""}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <p className="home-hero-eyebrow">Fly smarter with SkyReserve</p>
          <h1 className="home-hero-title">
            Book your next flight in a few simple steps
          </h1>
          <p className="home-hero-sub">
            Search flights across major cities, compare fares, and reserve your
            seat with confidence.
          </p>

          <form className="home-search" onSubmit={handleSearch}>
            {/* FROM */}
            <div className="home-field home-field-suggest">
              <span className="home-field-label">From</span>
              <input
                type="text"
                name="from"
                value={form.from}
                onChange={handleChange}
                placeholder="Mumbai"
                className="home-input"
                autoComplete="off"
                onFocus={() => setActiveField("from")}
                onBlur={() => setTimeout(() => setActiveField(null), 150)}
              />
              {fromSuggestions.length > 0 && (
                <ul className="home-suggest">
                  {fromSuggestions.map((city) => (
                    <li key={city}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion("from", city)}
                      >
                        <span className="home-suggest-icon" aria-hidden="true">
                          ✈
                        </span>
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* TO */}
            <div className="home-field home-field-suggest">
              <span className="home-field-label">To</span>
              <input
                type="text"
                name="to"
                value={form.to}
                onChange={handleChange}
                placeholder="Delhi"
                className="home-input"
                autoComplete="off"
                onFocus={() => setActiveField("to")}
                onBlur={() => setTimeout(() => setActiveField(null), 150)}
              />
              {toSuggestions.length > 0 && (
                <ul className="home-suggest">
                  {toSuggestions.map((city) => (
                    <li key={city}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion("to", city)}
                      >
                        <span className="home-suggest-icon" aria-hidden="true">
                          ✈
                        </span>
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* DATE */}
            <label className="home-field">
              <span className="home-field-label">Departure</span>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="home-input"
              />
            </label>

            {/* PASSENGERS */}
            <label className="home-field">
              <span className="home-field-label">Passengers</span>
              <select
                name="passengers"
                value={form.passengers}
                onChange={handleChange}
                className="home-input"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
            </label>

            <button type="submit" className="home-search-btn">
              Search Flights
            </button>
          </form>
        </div>
      </section>

      {/* Popular routes */}
      <section className="home-section">
        <div className="home-section-head">
          <h2 className="home-section-title">Popular routes</h2>
          <Link to="/flights" className="home-section-link">
            View all flights →
          </Link>
        </div>

        <div className="home-routes">
          {popularRoutes.map((route) => (
            <Link
              key={`${route.from}-${route.to}`}
              to={`/flights?from=${route.from}&to=${route.to}`}
              className="route-card"
            >
              <span className="route-tag">{route.tag}</span>
              <div className="route-cities">
                <span className="route-city">{route.from}</span>
                <span className="route-arrow" aria-hidden="true">
                  →
                </span>
                <span className="route-city">{route.to}</span>
              </div>
              <div className="route-price">
                <span className="route-price-label">Starting from</span>
                <span className="route-price-value">{route.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="home-section">
        <h2 className="home-section-title">Why choose SkyReserve</h2>
        <div className="home-features">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                ✈
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-text">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div>
          <h2 className="home-cta-title">Ready for take-off?</h2>
          <p className="home-cta-text">
            Browse flights now and reserve your seat at the best available fare.
          </p>
        </div>
        <Link to="/flights" className="app-btn app-btn-primary">
          Browse Flights
        </Link>
      </section>
    </>
  );
}

export default Home;