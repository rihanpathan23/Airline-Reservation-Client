import { Link } from "react-router-dom";

const highlights = [
  {
    title: "Search & Compare",
    text: "Browse available flights and compare timings, durations, and fares side by side.",
  },
  {
    title: "Quick Booking",
    text: "Reserve your preferred seat in a few clicks with a clear, distraction-free flow.",
  },
  {
    title: "Manage Easily",
    text: "View and manage all your bookings from a single personal dashboard.",
  },
];

const team = [
  { name: "Vaishnav Kalwaghe", role: "Frontend Developer" },
  { name: "Rohit Kalwaghe", role: "Backend Developer" },
  { name: "Saish Chaudhari", role: "UI / UX & Testing" },
];

function About() {
  return (
    <section className="page">
      <h1 className="page-title">About SkyReserve</h1>

      <p className="about-lead">
        SkyReserve is a simple, reliable flight reservation platform built to
        help travellers search, compare and book flights with ease. The project
        is designed as a college-level client deliverable with a clean,
        production-style interface.
      </p>

      <div className="about-highlights">
        {highlights.map((item) => (
          <article key={item.title} className="about-card">
            <h3 className="about-card-title">{item.title}</h3>
            <p className="about-card-text">{item.text}</p>
          </article>
        ))}
      </div>

      <h2 className="about-section-title">Our Team</h2>
      <div className="about-team">
        {team.map((member) => (
          <div key={member.name} className="about-member">
            <span className="about-avatar" aria-hidden="true">
              {member.name.charAt(0)}
            </span>
            <div>
              <div className="about-member-name">{member.name}</div>
              <div className="about-member-role">{member.role}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="about-cta">
        <p className="about-credit">
          Made by Vaishnav Kalwaghe, Rohit Kalwaghe &amp; Saish Chaudhari
        </p>
        <Link to="/flights" className="app-btn app-btn-primary">
          Browse Flights
        </Link>
      </div>
    </section>
  );
}

export default About;