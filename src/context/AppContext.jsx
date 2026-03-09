import { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'

// ─── Per-user storage key helpers ─────────────────────────────────────────────
function getStorageKey(authUser) {
  if (authUser?.githubId) return `devconnect_data_github_${authUser.githubId}`
  if (authUser?.googleId) return `devconnect_data_google_${authUser.googleId}`
  return 'devconnect_data'
}

// ─── Initial state ────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  profile: {
    name: '',
    username: '',
    email: '',
    bio: '',
    role: '',
    university: '',
    avatar: null,   // base64 string or null → show initials
    online: true,
    location: '',
    joinedDate: '',
    profileDescription: '',
    skills: [],
    links: { github: '', linkedin: '', gmail: '', leetcode: '' },
  },
  users: [],             // other users' public profiles
  projects: [],          // { id, title, description, techStack, status, visibility, createdAt }
  collabRequests: [],    // { id, from, projectId, message, createdAt, status: 'pending'|'accepted'|'declined' }
  notifications: [],     // { id, type, message, read, createdAt }
  messages: [],          // stub – not used yet
  theme: 'dark',         // 'dark' | 'light'
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'LOAD':
      return { ...INITIAL_STATE, ...action.payload }

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
          links: { ...(state.profile.links || {}), ...(action.payload.links || {}) },
        },
      }

    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] }

    case 'UPDATE_PROJECT': {
      const updated = state.projects.map(p =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      )
      return { ...state, projects: updated }
    }

    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.payload) }

    case 'STAR_PROJECT': {
      const updated = state.projects.map(p =>
        p.id === action.payload ? { ...p, stars: (p.stars || 0) + 1, starred: true } : p
      )
      return { ...state, projects: updated }
    }

    case 'UNSTAR_PROJECT': {
      const updated = state.projects.map(p =>
        p.id === action.payload ? { ...p, stars: Math.max((p.stars || 0) - 1, 0), starred: false } : p
      )
      return { ...state, projects: updated }
    }

    case 'ADD_PROJECT_MESSAGE': {
      const { projectId, message } = action.payload
      const updated = state.projects.map(p => {
        if (p.id === projectId) {
          const messages = p.messages || []
          return { ...p, messages: [...messages, message] }
        }
        return p
      })
      return { ...state, projects: updated }
    }

    case 'ADD_PROJECT_RESOURCE': {
      const { projectId, resource } = action.payload
      const updated = state.projects.map(p => {
        if (p.id === projectId) {
          const resources = p.resources || []
          return { ...p, resources: [...resources, resource] }
        }
        return p
      })
      return { ...state, projects: updated }
    }

    case 'ADD_PROJECT_ACTIVITY': {
      const { projectId, activity } = action.payload
      const updated = state.projects.map(p => {
        if (p.id === projectId) {
          const activities = p.activity || []
          return { ...p, activity: [activity, ...activities] }
        }
        return p
      })
      return { ...state, projects: updated }
    }

    case 'ADD_PROJECT_COLLABORATOR': {
      const { projectId, collaborator } = action.payload
      const updated = state.projects.map(p => {
        if (p.id === projectId) {
          const collaborators = p.collaborators || []
          if (!collaborators.includes(collaborator)) {
            return { ...p, collaborators: [...collaborators, collaborator] }
          }
        }
        return p
      })
      return { ...state, projects: updated }
    }

    case 'ADD_COLLAB_REQUEST':
      if (state.collabRequests.some(r => r.id === action.payload.id)) return state
      return { ...state, collabRequests: [action.payload, ...state.collabRequests] }

    case 'UPDATE_COLLAB_REQUEST': {
      const updated = state.collabRequests.map(r =>
        r.id === action.payload.id ? { ...r, ...action.payload } : r
      )
      return { ...state, collabRequests: updated }
    }

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      }

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      }

    case 'SET_THEME':
      return { ...state, theme: action.payload }

    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] }

    case 'UPDATE_USER': {
      const updated = state.users.map(u =>
        u.username === action.payload.username ? { ...u, ...action.payload } : u
      )
      return { ...state, users: updated }
    }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

// ─── Load state from a specific localStorage key ──────────────────────────────
function loadState(key) {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return INITIAL_STATE
    const parsed = JSON.parse(saved)
    return {
      ...INITIAL_STATE,
      ...parsed,
      profile: {
        ...INITIAL_STATE.profile,
        ...(parsed.profile || {}),
        links: {
          ...INITIAL_STATE.profile.links,
          ...(parsed.profile?.links || {}),
        },
        skills: parsed.profile?.skills || [],
      },
      users: parsed.users || [],
    }
  } catch {
    return INITIAL_STATE
  }
}

export function AppProvider({ children }) {
  // Start with blank state; populate from the correct per-user key once auth resolves
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const { user: authUser, loading: authLoading } = useAuth()

  // When auth check finishes (or the logged-in user changes), load the right data
  useEffect(() => {
    if (authLoading) return
    dispatch({ type: 'LOAD', payload: loadState(getStorageKey(authUser)) })
  }, [authLoading, authUser])

  // Sync OAuth user (GitHub / Google) into profile when they log in
  useEffect(() => {
    if (!authUser) return
    if (authUser.offline) return  // server unreachable — keep saved profile data as-is
    const links = {}
    if (authUser.githubUrl) links.github = authUser.githubUrl
    // For Google logins, auto-populate the gmail link from their email
    if (authUser.googleId && authUser.email) links.gmail = authUser.email
    
    // Set joined date if not already set
    const joinedDate = state.profile.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        name:     authUser.name     || '',
        username: authUser.username || '',
        email:    authUser.email    || '',
        avatar:   authUser.avatar   || null,
        bio:      authUser.bio      || '',
        joinedDate: joinedDate,
        ...(Object.keys(links).length && { links }),
      },
    })
  }, [authUser])

  // Persist to the correct per-user key on every state change
  useEffect(() => {
    if (authLoading) return  // don't overwrite user data while auth is still resolving
    try {
      localStorage.setItem(getStorageKey(authUser), JSON.stringify(state))
    } catch {
      // storage full – ignore
    }
  }, [state, authUser, authLoading])

  // ── Real-time invite delivery via SSE ─────────────────────────────────────
  useEffect(() => {
    const username = state.profile.username || authUser?.username
    if (!username) return

    const es = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/invites/stream/${username}`)

    es.onmessage = (e) => {
      try {
        const invite = JSON.parse(e.data)
        dispatch({ type: 'ADD_COLLAB_REQUEST', payload: { ...invite, status: 'pending' } })
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'collab_invite',
            message: `@${invite.from} invited you to collaborate${invite.projectTitle ? ` on "${invite.projectTitle}"` : ''}`,
            read: false,
            createdAt: new Date().toISOString(),
          },
        })
      } catch { /* malformed event */ }
    }

    return () => es.close()
  }, [state.profile.username, authUser?.username])

  // Apply dark / light class on <html>
  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [state.theme])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns initials from a name string (max 2 chars). */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'DC'
}

/**
 * Returns the best available avatar URL for a profile:
 *   1. Explicit avatar (from OAuth or manual upload)
 *   2. GitHub public avatar CDN derived from profile.links.github
 *   3. null (show initials)
 */
export function getEffectiveAvatar(profile) {
  if (profile?.avatar) return profile.avatar
  const githubLink = profile?.links?.github || ''
  const match = githubLink.match(/github\.com\/([^/\s]+)/)
  if (match?.[1]) return `https://github.com/${match[1]}.png`
  return null
}
