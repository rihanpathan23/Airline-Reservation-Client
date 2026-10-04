import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Flights", to: "/flights" },
  { label: "My Bookings", to: "/my-bookings" },
  { label: "About", to: "/about" },
];

function Footer() {
  return (
    <footer className="sr-footer">
      <div className="sr-footer-inner">
        <div className="sr-footer-grid">
          <div>
            <Link to="/" className="sr-footer-brand">
              <span className="sr-footer-brand-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </span>
              <span className="sr-footer-brand-name">SkyReserve</span>
            </Link>
            <p className="sr-footer-desc">
              SkyReserve is a simple and reliable flight reservation platform
              designed to help travelers search, compare and book flights with
              ease.
            </p>
          </div>

          <div>
            <h3 className="sr-footer-heading">Quick Links</h3>
            <ul className="sr-footer-links">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="sr-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="sr-footer-heading">Support</h3>
            <div className="sr-footer-contact">
              <a href="mailto:support@skyreserve.com">support@skyreserve.com</a>
              <a href="tel:+911234567890">+91 12345 67890</a>
              <span>Mon – Sat, 9:00 AM – 6:00 PM</span>
            </div>
          </div>

          <div>
            <h3 className="sr-footer-heading">Follow Us</h3>
            <div className="sr-footer-social">
              <a href="#" className="sr-social-link" aria-label="Facebook">
                Facebook
              </a>
              <a href="#" className="sr-social-link" aria-label="Twitter">
                Twitter
              </a>
              <a
                href="https://www.instagram.com/rohit_kalwaghe_13/?hl=en"
                className="sr-social-link"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a href="#" className="sr-social-link" aria-label="LinkedIn">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="sr-footer-bottom">
          <p>© {new Date().getFullYear()} SkyReserve. All rights reserved.</p>
          <p className="sr-footer-credit">
            Made by Vaishnav Kalwaghe, Rohit Kalwaghe &amp; Saish Chaudhari
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;