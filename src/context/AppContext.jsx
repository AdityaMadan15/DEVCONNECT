import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

// ─── Shared project data helpers ──────────────────────────────────────────────
// Projects that are collaborated on need their mutable data (messages, resources,
// activity, stars, collaborators) to be visible to BOTH the owner and all
// collaborators. We store that data in a SHARED localStorage key keyed by
// project id so any user that has that project can read and write to it.

function sharedProjectKey(projectId) {
  return `devconnect_shared_project_${projectId}`
}

function readSharedProject(projectId) {
  try {
    const raw = localStorage.getItem(sharedProjectKey(projectId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// Merge two arrays deduplicating entries by their `id` field, then sort by
// timestamp. `descending = true` for activity (newest first); false for messages
// and resources (oldest/insertion order first).
function mergeArraysById(existing, incoming, descending = false) {
  const a = existing || []
  const b = incoming || []
  if (a.length === 0 && b.length === 0) return []
  if (a.length === 0) return b
  if (b.length === 0) return a
  const seen = new Map()
  ;[...a, ...b].forEach(item => {
    const key = String(item.id)
    if (!seen.has(key)) seen.set(key, item)
  })
  const merged = Array.from(seen.values())
  if (merged.length === a.length && merged.every((x, i) => String(x.id) === String(a[i].id))) {
    return a // nothing added — return stable reference to avoid spurious writes
  }
  merged.sort((x, y) => {
    const tx = x.timestamp ? new Date(x.timestamp).getTime() : (typeof x.id === 'number' ? x.id : 0)
    const ty = y.timestamp ? new Date(y.timestamp).getTime() : (typeof y.id === 'number' ? y.id : 0)
    return descending ? ty - tx : tx - ty
  })
  return merged
}

// Strip heavy binary fields before writing to the shared slot.
// fileData (base64) can be several MB — writing it for every project on every
// state change would fill the 5 MB localStorage quota almost immediately.
// Collaborators who need to download the file will do so from the owner's copy.
function stripHeavyFields(resource) {
  // eslint-disable-next-line no-unused-vars
  const { fileData: _fd, ...meta } = resource
  return meta
}

// Write shared data for a project.
// ONLY writes for projects that are actually shared (have collaborators or are
// a collaboration themselves). Solo projects don't need a shared slot.
// IMPORTANT: We merge with the existing shared slot rather than replacing it.
// This prevents a collaborator's empty-array copy from overwriting the owner's
// messages/resources, and allows both users to accumulate data independently.
// Only triggers a localStorage write when the merged result is actually different
// from what's already stored, preventing spurious storage events / sync loops.
function writeSharedProject(project) {
  // Skip solo projects — nothing to share
  const hasCollabs = (project.collaborators || []).length > 0
  const isCollab   = !!project.isCollaboration
  if (!hasCollabs && !isCollab) return

  try {
    const key        = sharedProjectKey(project.id)
    const existingRaw = localStorage.getItem(key)
    let existingData  = null
    if (existingRaw) { try { existingData = JSON.parse(existingRaw) } catch {} }

    // Strip fileData from resources to keep the shared slot small
    const projectResourcesMeta = (project.resources || []).map(stripHeavyFields)
    const existingResourcesMeta = (existingData?.resources || []).map(stripHeavyFields)

    const merged = {
      messages:      mergeArraysById(existingData?.messages,   project.messages,   false), // asc (oldest→newest)
      resources:     mergeArraysById(existingResourcesMeta,    projectResourcesMeta, false), // metadata only
      activity:      mergeArraysById(existingData?.activity,   project.activity,   true),  // desc (newest→oldest)
      // Stars: take the higher value — un-starring doesn't reduce below existing count
      stars:         Math.max(existingData?.stars || 0, project.stars || 0),
      collaborators: [...new Set([...(existingData?.collaborators || []), ...(project.collaborators || [])])],
    }

    const newVal = JSON.stringify(merged)
    if (existingRaw !== newVal) {
      localStorage.setItem(key, newVal)
    }
  } catch { /* ignore storage errors */ }
}

// Merge the shared slot data into a project object on load.
// Both the user's private copy AND the shared slot may have unsync'd data
// (e.g. the other user added messages while this user was offline).
// We union them so nothing is lost. Per-user fields (starred) are preserved.
//
// LOCAL data is passed as first arg to mergeArraysById so that when the same
// item exists in both copies the LOCAL version wins — this preserves fileData
// on resources (the shared slot only stores metadata, not the binary blob).
function mergeSharedIntoProject(p) {
  try {
    const shared = readSharedProject(p.id)
    if (!shared) return p
    // For resources: merge metadata from shared into local. Local items keep
    // their fileData; items only in the shared slot appear without fileData.
    const mergedResources = mergeArraysById(p.resources, shared.resources, false)
    return {
      ...p,
      messages:      mergeArraysById(p.messages,  shared.messages,  false),
      resources:     mergedResources,
      activity:      mergeArraysById(p.activity,  shared.activity,  true),
      stars:         Math.max(shared.stars || 0, p.stars || 0),
      collaborators: [...new Set([...(p.collaborators || []), ...(shared.collaborators || [])])],
      starred: p.starred, // per-user: only THIS user knows if they starred it
    }
  } catch {
    return p // if anything goes wrong, keep the project's original data intact
  }
}

// ─── Per-user storage key helpers ─────────────────────────────────────────────
function getStorageKey(authUser) {
  if (authUser?.githubId) return `devconnect_data_github_${authUser.githubId}`
  if (authUser?.googleId) return `devconnect_data_google_${authUser.googleId}`
  // Local/email users — each user gets their own isolated slot
  try {
    const dcUser = JSON.parse(localStorage.getItem('dc_user') || 'null')
    if (dcUser?.email) return `devconnect_data_local_${dcUser.email}`
  } catch {}
  return 'devconnect_data'
}

// Returns the correct storage key even when the backend is offline and
// authUser is null. The first time a user authenticates online we cache
// their key against a fingerprint of their token so it survives offline visits.
function getEffectiveStorageKey(authUser) {
  const direct = getStorageKey(authUser)
  if (direct !== 'devconnect_data') return direct   // known ID → use it directly
  const token = localStorage.getItem('authToken')
  if (!token) return direct                          // no token → guest/local user
  try {
    const cached = localStorage.getItem('devconnect_keymap_' + token.slice(-16))
    if (cached) return cached
  } catch { /* ignore */ }
  return direct
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
  notificationSettings: {
    collabRequests: true,
    projectUpdates: true,
    messages:       true,
    announcements:  false,
    emailDigest:    false,
  },
  ready: false,          // becomes true after the first LOAD from localStorage completes
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'LOAD':
      return { ...INITIAL_STATE, ...action.payload, ready: true }

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

    // Sync shared project data arriving from another user's tab.
    // Only updates fields that actually changed; returns same state reference
    // if nothing changed to avoid triggering unnecessary re-renders / saves.
    case 'SYNC_PROJECT': {
      const { projectId, messages, resources, activity, stars, collaborators } = action.payload
      // Coerce to the same type (project ids might be numbers; key is a string)
      const id = String(projectId)
      const target = state.projects.find(p => String(p.id) === id)
      if (!target) return state // this user doesn't have this project — no-op

      // For resources: merge incoming (metadata-only from shared slot) into
      // local (which has fileData). Local version wins for existing ids so we
      // don't overwrite the actual file binary with the stripped shared copy.
      const newMessages      = mergeArraysById(target.messages      || [], messages      || [], false)
      const newResources     = mergeArraysById(target.resources     || [], resources     || [], false) // local first → preserves fileData
      const newActivity      = mergeArraysById(target.activity      || [], activity      || [], true)
      const newStars         = Math.max(stars ?? 0, target.stars ?? 0)
      const newCollaborators = [...new Set([...(target.collaborators || []), ...(collaborators || [])])]

      const changed =
        newMessages.length      !== (target.messages      || []).length ||
        newResources.length     !== (target.resources     || []).length ||
        newActivity.length      !== (target.activity      || []).length ||
        newStars                !== (target.stars         || 0)          ||
        newCollaborators.length !== (target.collaborators || []).length

      if (!changed) return state // data is already up to date

      const updated = state.projects.map(p =>
        String(p.id) === id
          ? { ...p, messages: newMessages, resources: newResources, activity: newActivity, stars: newStars, collaborators: newCollaborators }
          : p
      )
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

    case 'SET_NOTIFICATION_SETTINGS':
      return {
        ...state,
        notificationSettings: { ...state.notificationSettings, ...action.payload },
      }

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
  let base
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return INITIAL_STATE
    const parsed = JSON.parse(saved)
    base = {
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
      notificationSettings: {
        ...INITIAL_STATE.notificationSettings,
        ...(parsed.notificationSettings || {}),
      },
    }
  } catch {
    return INITIAL_STATE
  }

  // Merge shared project data so the loading user always sees the latest
  // messages, resources, activity, and stars from collaborators.
  // Each project is merged individually — one bad shared slot cannot wipe
  // the entire projects array (mergeSharedIntoProject has its own try/catch).
  try {
    base.projects = (base.projects || []).map(p => mergeSharedIntoProject(p))
  } catch {
    // If the map itself somehow throws, keep the raw (unmerged) projects
    base.projects = base.projects || []
  }

  return base
}

export function AppProvider({ children }) {
  // Start with blank state; populate from the correct per-user key once auth resolves
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const { user: authUser, loading: authLoading } = useAuth()

  // Stable ref so focus/polling sync can always see the latest projects list
  // without needing to re-register event listeners on every state change.
  const projectsRef = useRef(state.projects)
  useEffect(() => { projectsRef.current = state.projects }, [state.projects])

  // When auth check finishes (or the logged-in user changes), load the right data
  useEffect(() => {
    if (authLoading) return
    dispatch({ type: 'LOAD', payload: loadState(getEffectiveStorageKey(authUser)) })
  }, [authLoading, authUser])

  // Re-load when a local (email) user logs in or out in the same tab.
  // LoginPage / RegisterPage / logout handlers dispatch 'dc_local_login' after
  // writing or removing dc_user so AppContext loads the correct per-user slot.
  useEffect(() => {
    if (authUser) return  // OAuth handled by the effect above
    const reload = () =>
      dispatch({ type: 'LOAD', payload: loadState(getStorageKey(null)) })
    window.addEventListener('dc_local_login', reload)
    // Also handle the cross-tab case (storage event fires in all OTHER tabs)
    const handleStorage = (e) => { if (e.key === 'dc_user') reload() }
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('dc_local_login', reload)
      window.removeEventListener('storage', handleStorage)
    }
  }, [authUser])

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

  // Cache the storage key against the current token the moment we have a
  // confirmed (online) auth so we can recover it on future offline visits.
  useEffect(() => {
    if (!authUser || authUser.offline) return
    const key = getStorageKey(authUser)
    if (key === 'devconnect_data') return          // nothing useful to cache
    const token = localStorage.getItem('authToken')
    if (!token) return
    try { localStorage.setItem('devconnect_keymap_' + token.slice(-16), key) } catch { /* ignore */ }
  }, [authUser])

  // Persist to the correct per-user key on every state change.
  // Also write shared project data so collaborators in other tabs can sync.
  //
  // Guard: state.ready is false in INITIAL_STATE and set to true only by the LOAD
  // reducer. Because state comes from useReducer it resets to INITIAL_STATE on
  // every remount, so this guard is safe under React StrictMode (which
  // mount→unmount→remounts in dev). skipNextSaveRef was used before but a useRef
  // survives StrictMode remount — meaning the guard got cleared on the first pass
  // and the second pass wrote INITIAL_STATE (empty projects) over real data.
  useEffect(() => {
    if (!state.ready) return   // LOAD hasn't completed yet — never overwrite with blank state
    const key = getEffectiveStorageKey(authUser)
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Storage full — retry with a slimmed state:
      // strip bulky base64 fileData from resources AND project snapshots in collabRequests
      try {
        const slim = {
          ...state,
          projects: state.projects.map(p => ({
            ...p,
            resources: (p.resources || []).map(stripHeavyFields),
          })),
          collabRequests: state.collabRequests.map(({ project: _p, ...rest }) => rest),
        }
        localStorage.setItem(key, JSON.stringify(slim))
      } catch { /* truly full — nothing we can do */ }
    }

    // Write mutable project data to shared slots so the other user's tab can pick
    // up changes via the storage event listener below.
    // writeSharedProject only writes for collaborated projects and only when the
    // value actually changed, preventing spurious storage events / sync loops.
    state.projects.forEach(p => writeSharedProject(p))

    // Write this user's public profile (name, username, avatar) to a shared slot
    // so teammates can look it up by username to show real names and photos in
    // the Team tab, even when viewing another user's project.
    if (state.profile.username) {
      try {
        const pub = JSON.stringify({
          name: state.profile.name,
          username: state.profile.username,
          avatar: state.profile.avatar,
        })
        localStorage.setItem(`devconnect_profile_${state.profile.username}`, pub)
      } catch { /* ignore storage errors */ }
    }

  }, [state, authUser])

  // ── One-time migration: clean up oversized shared slots ───────────────────
  // Older code wrote full base64 fileData into shared slots for EVERY project,
  // which could fill the 5 MB localStorage quota. This effect runs once on
  // mount and rewrites any such slot without the heavy fileData field so that
  // localStorage quota is freed and future saves can succeed again.
  useEffect(() => {
    try {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith('devconnect_shared_project_')) keys.push(k)
      }
      keys.forEach(k => {
        try {
          const raw = localStorage.getItem(k)
          if (!raw) return
          const data = JSON.parse(raw)
          if (!data.resources?.some(r => r.fileData)) return // already clean
          const cleaned = { ...data, resources: data.resources.map(stripHeavyFields) }
          localStorage.setItem(k, JSON.stringify(cleaned))
        } catch { /* ignore individual slot errors */ }
      })
    } catch { /* ignore */ }
  }, []) // run exactly once on mount

  // ── Cross-tab shared project sync ─────────────────────────────────────────
  // When the OTHER user (owner or collaborator) updates project data their save
  // effect writes to devconnect_shared_project_<id>. We pick that up here and
  // dispatch SYNC_PROJECT to merge it into our copy. The reducer is a no-op if
  // nothing actually changed, so we won't get stuck in a loop.
  useEffect(() => {
    const handleProjectSync = (e) => {
      if (!e.key?.startsWith('devconnect_shared_project_') || !e.newValue) return
      const projectId = e.key.replace('devconnect_shared_project_', '')
      try {
        const shared = JSON.parse(e.newValue)
        dispatch({ type: 'SYNC_PROJECT', payload: { projectId, ...shared } })
      } catch { /* malformed */ }
    }
    window.addEventListener('storage', handleProjectSync)
    return () => window.removeEventListener('storage', handleProjectSync)
  }, []) // Register once — dispatch is always stable

  // ── Reliable shared-slot sync (focus + visibility + poll) ────────────────
  // The storage event only fires in OTHER simultaneously-open tabs.
  // To cover single-tab account-switching and different browser windows we
  // also re-read every collaborated project's shared slot:
  //   • when this tab gains focus (user switches tabs)
  //   • when this document becomes visible (user un-minimises the window)
  //   • every 8 seconds (background polling fallback)
  // The SYNC_PROJECT reducer is a no-op when nothing actually changed, so
  // calling this frequently is safe and won't trigger unnecessary re-renders.
  useEffect(() => {
    const syncAllSharedSlots = () => {
      projectsRef.current.forEach(p => {
        const hasCollabs = (p.collaborators || []).length > 0
        const isCollab   = !!p.isCollaboration
        if (!hasCollabs && !isCollab) return
        const shared = readSharedProject(p.id)
        if (!shared) return
        dispatch({ type: 'SYNC_PROJECT', payload: { projectId: p.id, ...shared } })
      })
    }

    const onVisibilityChange = () => { if (!document.hidden) syncAllSharedSlots() }

    window.addEventListener('focus', syncAllSharedSlots)
    document.addEventListener('visibilitychange', onVisibilityChange)
    const poll = setInterval(syncAllSharedSlots, 3000)

    return () => {
      window.removeEventListener('focus', syncAllSharedSlots)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      clearInterval(poll)
    }
  }, []) // register once — uses projectsRef which is always current

  // ── One-time backend sync on app start ────────────────────────────────────
  // After localStorage loads (state.ready) and the username is known, fetch
  // the user's projects and pending requests from the backend. New items
  // (created on another device) are added; existing items are synced via
  // the normal SYNC_PROJECT / ADD_COLLAB_REQUEST dedup paths.
  // A ref flag ensures this runs at most once per page load.
  const backendSyncedRef = useRef(false)
  useEffect(() => {
    const username = authUser?.username || state.profile.username?.replace(/^@/, '')
    if (!state.ready || !username) return
    if (backendSyncedRef.current) return
    backendSyncedRef.current = true

    const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const safe = (p) => p.then(r => r.ok ? r.json() : null).catch(() => null)

    Promise.all([
      safe(fetch(`${API}/projects?owner=${encodeURIComponent(username)}`)),
      safe(fetch(`${API}/requests?to=${encodeURIComponent(username)}`)),
    ]).then(([projectsData, requestsData]) => {
      if (projectsData?.projects) {
        projectsData.projects.forEach(sp => {
          const already = projectsRef.current.find(p => String(p.id) === String(sp.id))
          if (!already) {
            dispatch({ type: 'ADD_PROJECT', payload: sp })
          } else {
            dispatch({
              type: 'SYNC_PROJECT',
              payload: {
                projectId:     sp.id,
                messages:      sp.messages      || [],
                resources:     sp.resources     || [],
                activity:      sp.activity      || [],
                stars:         sp.stars         || 0,
                collaborators: sp.collaborators || [],
              },
            })
          }
        })
      }
      if (requestsData?.requests) {
        requestsData.requests.forEach(req => {
          dispatch({ type: 'ADD_COLLAB_REQUEST', payload: req })
        })
      }
    })
  }, [state.ready, state.profile.username, authUser?.username]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Cross-tab invite delivery via localStorage ────────────────────────────
  useEffect(() => {
    const username = state.profile.username || authUser?.username
    if (!username) return

    const inboxKey = `devconnect_inbox_${username}`

    const processInbox = () => {
      try {
        const raw = localStorage.getItem(inboxKey)
        if (!raw) return
        const invites = JSON.parse(raw)
        if (!Array.isArray(invites) || invites.length === 0) return
        invites.forEach(invite => {
          dispatch({ type: 'ADD_COLLAB_REQUEST', payload: { ...invite, status: 'pending' } })
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now() + Math.random(),
              type: 'collab_invite',
              message: `@${invite.from} invited you to collaborate${invite.projectTitle ? ` on "${invite.projectTitle}"` : ''}`,
              read: false,
              createdAt: new Date().toISOString(),
            },
          })
        })
        localStorage.removeItem(inboxKey)
      } catch { /* malformed */ }
    }

    // Drain any invites that arrived while this user was away / logged out
    processInbox()

    // Receive real-time invites from other tabs
    const handleStorage = (e) => { if (e.key === inboxKey) processInbox() }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
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
