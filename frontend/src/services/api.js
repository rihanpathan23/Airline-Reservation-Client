/**
 * SkyReserve — API service
 * -------------------------
 * Central place for every backend call.
 *
 * Example:
 *   import { flightsApi, bookingsApi, authApi } from "../services/api";
 *
 *   const flights = await flightsApi.getAll();
 *   const booking = await bookingsApi.create(payload);
 */

/* ---------- Base URL ---------- */
// Change this if your backend runs on a different host/port.
// You can also set VITE_API_URL in a .env file inside frontend/.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ---------- Storage helpers ---------- */
// Uses the same keys your pages already use ("sr_user").
// "sr_token" is reserved for the real JWT once backend login is wired.

const USER_KEY = "sr_user";
const TOKEN_KEY = "sr_token";

export const storage = {
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  clearUser() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
  isLoggedIn() {
    return Boolean(localStorage.getItem(USER_KEY));
  },
};

/* ---------- Error class ---------- */
class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/* ---------- Core request helper ---------- */
async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    auth = true, // attach JWT if available
  } = options;

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = storage.getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(
      "Network error: unable to reach the server.",
      0,
      networkError
    );
  }

  let data = null;
  const isJson = (response.headers.get("content-type") || "").includes(
    "application/json"
  );
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

/* ---------- Auth endpoints ---------- */
export const authApi = {
  login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
  },

  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  adminLogin(email, password) {
    return request("/admin/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
  },

  logout() {
    storage.clearUser();
  },
};

/* ---------- Flights endpoints ---------- */
export const flightsApi = {
  getAll(params = {}) {
    const clean = Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    );
    const query = new URLSearchParams(clean).toString();
    return request(`/flights${query ? `?${query}` : ""}`, { auth: false });
  },

  getById(id) {
    return request(`/flights/${id}`, { auth: false });
  },

  create(payload) {
    return request("/flights", { method: "POST", body: payload });
  },

  update(id, payload) {
    return request(`/flights/${id}`, { method: "PUT", body: payload });
  },

  remove(id) {
    return request(`/flights/${id}`, { method: "DELETE" });
  },
};

/* ---------- Bookings endpoints ---------- */
export const bookingsApi = {
  create(payload) {
    return request("/bookings", { method: "POST", body: payload });
  },

  getMine() {
    return request("/bookings/me");
  },

  getById(id) {
    return request(`/bookings/${id}`);
  },

  cancel(id) {
    return request(`/bookings/${id}/cancel`, { method: "POST" });
  },
};

/* ---------- Admin endpoints ---------- */
export const adminApi = {
  getStats() {
    return request("/admin/stats");
  },

  getAllBookings() {
    return request("/admin/bookings");
  },
};

/* ---------- Export ---------- */
export { ApiError, API_BASE_URL };

const api = {
  authApi,
  flightsApi,
  bookingsApi,
  adminApi,
  storage,
  ApiError,
  API_BASE_URL,
};

export default api;