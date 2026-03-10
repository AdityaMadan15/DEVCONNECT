// ─── DevConnect API Client ───────────────────────────────────────────────────
// Thin wrapper around fetch for all backend endpoints.
// Every function returns null (instead of throwing) when the server is offline,
// so the app keeps working via localStorage even without a running backend.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null // server offline — fail silently, localStorage still works
  }
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  /** Create a new project. Requires { id, title, owner } at minimum. */
  create: (project) =>
    apiFetch('/projects', { method: 'POST', body: JSON.stringify(project) }),

  /** Update allowed fields on an existing project. */
  update: (id, updates) =>
    apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  /** Delete a project by id. */
  remove: (id) =>
    apiFetch(`/projects/${id}`, { method: 'DELETE' }),

  /** Fetch all projects, with optional query filters (owner, visibility). */
  getAll: (params = {}) =>
    apiFetch(`/projects?${new URLSearchParams(params)}`),
}

// ─── Collab Requests ──────────────────────────────────────────────────────────
export const requestsApi = {
  /** Create a new collab request. Requires { id, from, to, projectId }. */
  create: (request) =>
    apiFetch('/requests', { method: 'POST', body: JSON.stringify(request) }),

  /** Update a request (e.g. status: accepted / declined). */
  update: (id, updates) =>
    apiFetch(`/requests/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  /** Delete a request by id. */
  remove: (id) =>
    apiFetch(`/requests/${id}`, { method: 'DELETE' }),

  /** Fetch requests with optional filters (to, from, projectId, status). */
  getAll: (params = {}) =>
    apiFetch(`/requests?${new URLSearchParams(params)}`),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  /** Update allowed profile fields for a user by numeric id. */
  update: (id, updates) =>
    apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  /** Fetch all users (public fields only — accessToken is stripped server-side). */
  getAll: () =>
    apiFetch('/users'),
}
