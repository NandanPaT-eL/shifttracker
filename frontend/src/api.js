const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "API is unavailable (got HTML instead of JSON). In Vercel, set Root Directory to the repo root — leave it blank, not frontend."
    );
  }

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return body;
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
