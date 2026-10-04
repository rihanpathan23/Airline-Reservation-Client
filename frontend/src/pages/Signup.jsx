import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          password: form.password,
          mobile: form.phone,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("sr_user", JSON.stringify(data.user));
      localStorage.setItem("sr_token", data.token);

      navigate("/my-bookings");
    } catch {
      setError("Cannot reach the server. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="admin-login-card signup-card">
        <div className="admin-login-brand">
          <span className="admin-login-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </span>
          <h1 className="admin-login-title">Create your account</h1>
          <p className="admin-login-subtitle">
            Join SkyReserve and start booking flights in minutes.
          </p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span className="admin-field-label">Full name</span>
            <input
              type="text"
              name="fullName"
              className="admin-input"
              placeholder="e.g. Vaishnav Kalwaghe"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </label>

          <div className="signup-row">
            <label className="admin-field">
              <span className="admin-field-label">Email</span>
              <input
                type="email"
                name="email"
                className="admin-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Phone</span>
              <input
                type="tel"
                name="phone"
                className="admin-input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="signup-row">
            <label className="admin-field">
              <span className="admin-field-label">Password</span>
              <input
                type="password"
                name="password"
                className="admin-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                className="admin-input"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="app-btn app-btn-primary admin-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="admin-login-footer">
          <p className="login-note">
            Already have an account?{" "}
            <Link to="/login" className="admin-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Signup;