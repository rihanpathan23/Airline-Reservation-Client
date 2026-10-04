import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FlightCard from "../components/FlightCard";
import store from "../services/store";

function Flights() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allFlights] = useState(() => store.getFlights());
  const [sortBy, setSortBy] = useState("recommended");

  const fromFilter = (searchParams.get("from") || "").trim();
  const toFilter = (searchParams.get("to") || "").trim();

  /* Filter by from / to (case-insensitive, partial match) */
  const filteredFlights = useMemo(() => {
    const from = fromFilter.toLowerCase();
    const to = toFilter.toLowerCase();

    return allFlights.filter((f) => {
      if (from && !f.source.toLowerCase().includes(from)) return false;
      if (to && !f.destination.toLowerCase().includes(to)) return false;
      return true;
    });
  }, [allFlights, fromFilter, toFilter]);

  /* Sort */
  const sortedFlights = useMemo(() => {
    const arr = [...filteredFlights];
    if (sortBy === "price-low")
      arr.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "price-high")
      arr.sort((a, b) => Number(b.price) - Number(a.price));
    return arr;
  }, [filteredFlights, sortBy]);

  const hasFilters = Boolean(fromFilter || toFilter);

  const clearFilters = () => setSearchParams({});

  return (
    <section className="page">
      <div className="flights-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: "0.35rem" }}>
            Available Flights
          </h1>
          <p className="flights-subtitle">
            {sortedFlights.length} flight(s) found
            {hasFilters ? " for your search." : "."}
          </p>
        </div>

        <label className="flights-sort">
          <span className="flights-sort-label">Sort by</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="flights-sort-select"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </label>
      </div>

      {hasFilters && (
        <div className="flights-filter-banner">
          <div className="flights-filter-text">
            Showing <strong>{sortedFlights.length}</strong> flight(s)
            {fromFilter && (
              <>
                {" "}
                from <strong>{fromFilter}</strong>
              </>
            )}
            {toFilter && (
              <>
                {" "}
                to <strong>{toFilter}</strong>
              </>
            )}
          </div>
          <button
            type="button"
            className="flights-clear-btn"
            onClick={clearFilters}
          >
            Clear filters ✕
          </button>
        </div>
      )}

      {sortedFlights.length === 0 ? (
        <div className="mb-empty">
          <div className="mb-empty-icon" aria-hidden="true">
            ✈
          </div>
          <h2>No flights match your search</h2>
          <p>
            We couldn't find flights
            {fromFilter && ` from "${fromFilter}"`}
            {toFilter && ` to "${toFilter}"`}. Try different cities.
          </p>
          {hasFilters && (
            <button
              type="button"
              className="app-btn app-btn-primary"
              onClick={clearFilters}
            >
              Show all flights
            </button>
          )}
        </div>
      ) : (
        <div className="flights-grid">
          {sortedFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={{ ...flight, seats: flight.availableSeats }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Flights;