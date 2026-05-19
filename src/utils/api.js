// ─── DevConnect API Client ───────────────────────────────────────────────────
// Thin wrapper around fetch for all backend endpoints.
// Every function returns null (instead of throwing) when the server is offline,
// so the app keeps working via localStorage even without a running backend.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function apiFetch(path, options = {}) {
  try {
    const token = localStorage.getItem('authToken')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null // server offline — fail silently, localStorage still works
  }
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  /** Create a new project. Requires { title } at minimum. Owner set server-side. */
  create: (project) =>
    apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(project) }),

  /** Update allowed fields on an existing project. */
  update: (id, updates) =>
    apiFetch(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  /** Delete a project by id. */
  remove: (id) =>
    apiFetch(`/api/projects/${id}`, { method: 'DELETE' }),

  /** Leave a project (remove self from members). */
  leave: (id) =>
    apiFetch(`/api/projects/${id}/leave`, { method: 'DELETE' }),

  /** Fetch all projects, with optional query filters (owner, etc.). */
  getAll: (params = {}) =>
    apiFetch(`/api/projects?${new URLSearchParams(params)}`),

  /** Fetch a single project by id. */
  getById: (id) =>
    apiFetch(`/api/projects/${id}`),
}

// ─── Collab Requests ──────────────────────────────────────────────────────────
export const requestsApi = {
  /** Create a new collab request. Requires { from, to, projectId }. */
  create: (request) =>
    apiFetch('/api/requests', { method: 'POST', body: JSON.stringify(request) }),

  /** Update a request (e.g. status: 'accepted' / 'rejected'). */
  update: (id, updates) =>
    apiFetch(`/api/requests/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  /** Delete a request by id. */
  remove: (id) =>
    apiFetch(`/api/requests/${id}`, { method: 'DELETE' }),

  /** Fetch requests with optional filters (to, from, projectId). */
  getAll: (params = {}) =>
    apiFetch(`/api/requests?${new URLSearchParams(params)}`),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  /** Fetch all users (public fields only — password stripped server-side). */
  getAll: () =>
    apiFetch('/api/users'),

  /** Fetch a single user by id. */
  getById: (id) =>
    apiFetch(`/api/users/${id}`),

  /** Update allowed profile fields (name, avatar, skills) for own profile. */
  update: (id, updates) =>
    apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messagesApi = {
  /** Fetch all messages for a project room (sorted oldest → newest). */
  getByProject: (projectId) =>
    apiFetch(`/api/messages/${projectId}`),
}
