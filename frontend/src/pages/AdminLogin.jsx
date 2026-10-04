import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("sr_user", JSON.stringify(data.user));
      localStorage.setItem("sr_token", data.token);

      navigate("/admin/dashboard");
    } catch {
      setError("Cannot reach the server. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="admin-login-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </span>
          <h1 className="admin-login-title">SkyReserve Admin</h1>
          <p className="admin-login-subtitle">
            Sign in with your administrator credentials.
          </p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span className="admin-field-label">Username</span>
            <input
              type="text"
              name="username"
              className="admin-input"
              placeholder="admin"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>

          <label className="admin-field">
            <span className="admin-field-label">Password</span>
            <input
              type="password"
              name="password"
              className="admin-input"
              placeholder="••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="app-btn app-btn-primary admin-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="admin-link">
            ← Back to SkyReserve
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AdminLogin;