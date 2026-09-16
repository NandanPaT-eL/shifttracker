const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getShifts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/shifts${qs ? `?${qs}` : ""}`);
  },
  createShift: (data) => request("/shifts", { method: "POST", body: JSON.stringify(data) }),
  updateShift: (id, data) => request(`/shifts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteShift: (id) => request(`/shifts/${id}`, { method: "DELETE" }),

  getCategories: () => request("/categories"),
  createCategory: (data) => request("/categories", { method: "POST", body: JSON.stringify(data) }),

  getAnalytics: (period, date) =>
    request(`/analytics/${period}${date ? `?date=${date}` : ""}`),
};
