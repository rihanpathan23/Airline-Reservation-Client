import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Flights", to: "/flights" },
  { label: "My Bookings", to: "/my-bookings" },
  { label: "About", to: "/about" },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("sr_user") || "null");
  } catch {
    return null;
  }
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);

  // Re-read the login flag whenever we arrive from another page.
  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("sr_user");
    setUser(null);
    closeMenu();
    window.location.href = "/";
  };

  return (
    <header className="sr-navbar">
      <div className="sr-nav-inner">
        <Link to="/" className="sr-brand" onClick={closeMenu}>
          <span className="sr-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </span>
          <span className="sr-brand-name">SkyReserve</span>
        </Link>

        <nav className="sr-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `sr-nav-link${isActive ? " active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sr-nav-actions">
          {user ? (
            <>
              <span className="sr-user-chip" title={user.email}>
                <span className="sr-user-avatar" aria-hidden="true">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </span>
                <span className="sr-user-name">
                  {user.name || user.email.split("@")[0]}
                </span>
              </span>
              <button
                type="button"
                className="sr-btn sr-btn-ghost"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="sr-btn sr-btn-ghost">
                Login
              </Link>
              <Link to="/signup" className="sr-btn sr-btn-ghost">
                Sign Up
              </Link>
            </>
          )}
          <Link to="/admin/login" className="sr-btn sr-btn-primary">
            Admin Login
          </Link>
        </div>

        <button
          type="button"
          className="sr-menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="sr-mobile-menu">
          <nav className="sr-mobile-links" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `sr-mobile-link${isActive ? " active" : ""}`
                }
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="sr-mobile-actions">
            {user ? (
              <button
                type="button"
                className="sr-btn sr-btn-ghost"
                onClick={handleLogout}
              >
                Logout ({user.name || user.email.split("@")[0]})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="sr-btn sr-btn-ghost"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="sr-btn sr-btn-ghost"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
            <Link
              to="/admin/login"
              className="sr-btn sr-btn-primary"
              onClick={closeMenu}
            >
              Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;