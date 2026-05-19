import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GitBranch, Clock, FolderGit2, Github,
  UserPlus, X, Trash2, ExternalLink, Star,
  Users, Shield, Globe, Lock,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { projectsApi, requestsApi, usersApi } from '../../utils/api'

// ── Category colours ──────────────────────────────────────────────────────────
const CAT = {
  web:    { grad: 'from-cyan-600  via-brand-600   to-blue-600',  glow: 'rgba(34,211,238,0.35)',  icon: '🌐' },
  mobile: { grad: 'from-cyan-600    via-sky-600      to-brand-600',   glow: 'rgba(6,182,212,0.35)',   icon: '📱' },
  ai:     { grad: 'from-violet-600  via-fuchsia-600  to-purple-600',  glow: 'rgba(139,92,246,0.35)',  icon: '🤖' },
  game:   { grad: 'from-amber-600   via-orange-600   to-red-600',     glow: 'rgba(245,158,11,0.35)',  icon: '🎮' },
  tool:   { grad: 'from-slate-600   via-zinc-600     to-brand-600',   glow: 'rgba(100,116,139,0.35)', icon: '🔧' },
  open:   { grad: 'from-emerald-600 via-teal-600     to-cyan-600',    glow: 'rgba(16,185,129,0.35)',  icon: '🔓' },
  design: { grad: 'from-pink-600    via-rose-600     to-fuchsia-600', glow: 'rgba(236,72,153,0.35)',  icon: '🎨' },
  data:   { grad: 'from-cyan-600    via-sky-600      to-emerald-600', glow: 'rgba(6,182,212,0.35)',   icon: '📊' },
}
const DEFAULT_CAT = { grad: 'from-brand-600 via-blue-600 to-cyan-600', glow: 'rgba(34,211,238,0.35)', icon: '📁' }

const STATUS = {
  active:    { label: 'Active',    pulse: 'bg-emerald-400', ring: 'ring-emerald-400/30', text: 'text-emerald-300' },
  review:    { label: 'In Review', pulse: 'bg-amber-400',   ring: 'ring-amber-400/30',   text: 'text-amber-300'   },
  draft:     { label: 'Draft',     pulse: 'bg-slate-400',   ring: 'ring-slate-400/30',   text: 'text-slate-400'   },
  planning:  { label: 'Planning',  pulse: 'bg-amber-400',   ring: 'ring-amber-400/30',   text: 'text-amber-300'   },
  completed: { label: 'Done',      pulse: 'bg-brand-400',   ring: 'ring-brand-400/30',   text: 'text-brand-300'   },
  paused:    { label: 'Paused',    pulse: 'bg-slate-500',   ring: 'ring-slate-500/30',   text: 'text-slate-500'   },
}

const VISIBILITY_ICON = { public: Globe, invite: Shield, private: Lock }

export default function ProjectCard({ project, className = '' }) {
  const { state, dispatch } = useApp()
  const { user: authUser }  = useAuth()
  const navigate = useNavigate()
  const [addingTeammate, setAddingTeammate] = useState(false)
  const [ghInput, setGhInput]               = useState('')
  const [confirmDelete, setConfirmDelete]   = useState(false)

  // Normalise — support both mock + real data shapes
  const title       = project.title     || project.name  || 'Untitled'
  const techStack   = project.techStack || project.stack || []
  const status      = STATUS[project.status] || STATUS.draft
  const hasProgress = typeof project.progress === 'number'
  const hasMeta     = project.stars !== undefined
  
  // Extract members safely from either backend's 'members' or frontend's 'collaborators'
  const rawCollabs = (Array.isArray(project.members) && project.members.length > 0)
    ? project.members
    : (Array.isArray(project.collaborators) ? project.collaborators : [])
    
  const realCollabs = [...new Set(rawCollabs.filter(Boolean).map(m => 
    typeof m === 'object' ? (m.name || m.username || 'unknown') : String(m)
  ))]

  const cat         = CAT[project.category] || DEFAULT_CAT
  const VisIcon     = VISIBILITY_ICON[project.visibility] || Globe
  const dateStr     = project.lastUpdated
    || (project.createdAt
        ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
        : 'Recently')
  // Extract owner name safely (backend returns populated object, frontend local state might use string)
  const ownerName   = typeof project.owner === 'object' && project.owner !== null
    ? (project.owner.name || project.owner.username || 'Unknown')
    : (project.owner || 'Unknown')

  // First letter for the big avatar
  const initial = title.charAt(0).toUpperCase()

  const addTeammate = async () => {
    const u = ghInput.trim().replace(/^@/, '')
    if (!u || realCollabs.includes(u)) return

    setAddingTeammate(false)
    setGhInput('')

    // Look up the recipient to get their MongoDB ObjectId
    try {
      const usersData = await usersApi.getAll()
      const allUsers  = usersData?.data || []
      const searchString = u.toLowerCase()
      const recipient = allUsers.find(
        user => (user.username || '').toLowerCase() === searchString
          || (user.name || '').toLowerCase() === searchString
          || (user.email || '').toLowerCase().startsWith(searchString)
      )

      if (!recipient) {
        alert(`User "${u}" not found. Make sure they are registered on DevConnect.`)
        return
      }

      const invite = {
        from:      authUser.id,
        to:        recipient._id,
        projectId: project.id,
        status:    'pending',
      }

      await requestsApi.create(invite)

      // They will appear in the team list ONLY after they accept the request.

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id:        Date.now() + 1,
          type:      'collab_invite',
          message:   `Collaboration invitation sent to @${u} for "${title}".`,
          read:      false,
          createdAt: new Date().toISOString(),
        },
      })
    } catch (err) {
      console.error('Failed to post collab request:', err)
      alert('Failed to send invitation.')
    }
  }
  const removeTeammate = (u) => {
    const filtered = rawCollabs.filter(c => {
      const key = typeof c === 'object' ? (c.name || c.username || 'unknown') : String(c)
      return key !== u
    })
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, collaborators: filtered } })
    
    // We must send 'members' to backend with ObjectIds
    const memberIds = filtered
      .map(c => typeof c === 'object' ? c._id : null)
      .filter(id => id && id.length === 24)

    projectsApi.update(project.id, { members: memberIds })
  }
  const handleDelete = () => {
    if (project.isCollaboration) {
      // Leave: remove this user from the project's collaborators on backend,
      // but don't delete the project itself (it belongs to the owner)
      const myUsername = (state.profile?.username || '').replace(/^@/, '')
      dispatch({ type: 'DELETE_PROJECT', payload: project.id })
      projectsApi.leave(project.id)
    } else {
      dispatch({ type: 'DELETE_PROJECT', payload: project.id })
      projectsApi.remove(project.id)
    }
  }
  
  const handleCardClick = () => {
    if (project.id) {
      navigate(`/projects/${project.id}`)
    }
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative flex flex-col rounded-2xl overflow-hidden
                     border border-white/[0.06] bg-[#0d1117]
                     hover:border-white/[0.12]
                     transition-all duration-300 hover:-translate-y-0.5
                     hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                     cursor-pointer ${className}`}
      style={{ boxShadow: `0 1px 3px rgba(0,0,0,0.3)` }}
    >

      {/* ══ HEADER — gradient hero ═══════════════════════════════════════════ */}
      <div className={`relative bg-gradient-to-br ${cat.grad} p-5 overflow-hidden`}
           style={{ filter: 'brightness(0.85)' }}>
        {/* ambient glow blob */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30 blur-2xl"
             style={{ background: cat.glow }} />

        {/* top row: icon + title + visibility */}
        <div className="relative flex items-start justify-between gap-3">
          {/* Big letter avatar */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20
                            flex items-center justify-center text-lg font-black text-white
                            shadow-inner flex-shrink-0 select-none">
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-white truncate leading-tight tracking-tight">
                {title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <VisIcon size={10} className="text-white/50" />
                <span className="text-[10px] text-white/50 capitalize">{project.visibility || 'public'}</span>
                <span className="text-white/30">·</span>
                <span className="text-[10px] text-white/50">{cat.icon} {project.category || 'web'}</span>
              </div>
              {project.isCollaboration && project.owner && (
                <div className="flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-black/25 w-fit">
                  <Users size={9} className="text-brand-300" />
                  <span className="text-[10px] text-brand-300 font-medium">@{ownerName}'s project</span>
                </div>
              )}
            </div>
          </div>

          {/* Status pill */}
          <div className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                           bg-black/25 backdrop-blur-sm border border-white/15`}>
            <span className={`relative flex h-1.5 w-1.5`}>
              {project.status === 'active' && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.pulse} opacity-75`} />
              )}
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status.pulse}`} />
            </span>
            <span className="text-[10px] font-semibold text-white/80">{status.label}</span>
          </div>
        </div>

        {/* Description */}
        <p className="relative mt-3 text-xs text-white/60 leading-relaxed line-clamp-2">
          {project.description || <span className="italic text-white/30">No description provided.</span>}
        </p>
      </div>

      {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-3 px-5 py-4 flex-1">

        {/* Tech stack */}
        {techStack.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {techStack.slice(0, 5).map(t => (
              <span key={t}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium
                           bg-white/[0.04] border border-white/[0.08] text-slate-400
                           hover:border-white/20 hover:text-slate-300 transition-colors cursor-default">
                {t}
              </span>
            ))}
            {techStack.length > 5 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] text-slate-600
                               bg-white/[0.03] border border-white/[0.06]">
                +{techStack.length - 5}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-700 italic">No tech stack added yet</p>
        )}

        {/* Progress (mock data only) */}
        {hasProgress && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Progress</span><span className="font-mono">{project.progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${cat.grad} transition-all`}
                   style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-auto">
          <span className="flex items-center gap-1.5 text-slate-500">
            <GitBranch size={10} className="text-slate-600" />main
          </span>
          {hasMeta && (
            <>
              <span className="flex items-center gap-1"><Star size={10} className="text-amber-500" />{project.stars}</span>
              <span className="flex items-center gap-1"><Users size={10} />{realCollabs.length}</span>
            </>
          )}
          <span className="flex items-center gap-1.5 ml-auto text-slate-600">
            <Clock size={10} />{dateStr}
          </span>
        </div>
      </div>

      {/* ══ TEAMMATES ════════════════════════════════════════════════════════ */}
      {(true) && (
        <div className="border-t border-white/[0.06] px-5 py-3 bg-white/[0.015]"
             onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
              <Users size={10} />
              Team {project.isCollaboration
                ? <span className="normal-case tracking-normal text-slate-600">(1)</span>
                : realCollabs.length > 0 && <span className="normal-case tracking-normal text-slate-600">({realCollabs.length})</span>}
            </span>
            {!project.isCollaboration && (
              <button
                onClick={(e) => { e.stopPropagation(); setAddingTeammate(v => !v); setGhInput('') }}
                className={`flex items-center gap-1 text-[11px] font-medium transition-all duration-150
                           ${addingTeammate
                             ? 'text-slate-500 hover:text-slate-300'
                             : 'text-brand-400 hover:text-brand-300'}`}
              >
                {addingTeammate ? <X size={11} /> : <UserPlus size={11} />}
                {addingTeammate ? 'Cancel' : 'Invite'}
              </button>
            )}
          </div>

          {/* Teammate chips */}
          {project.isCollaboration ? (
            // Collab view: show the owner as the team member
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full
                               bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[11px]">
                <Github size={9} className="text-brand-400" />
                <span>@{ownerName}</span>
              </span>
            </div>
          ) : (
            <>
              {realCollabs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {realCollabs.map(u => (
                    <span key={u}
                      className="group/chip flex items-center gap-1.5 pl-1.5 pr-1 py-0.5 rounded-full
                                 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[11px]">
                      <Github size={9} className="text-brand-400" />
                      <span>@{u}</span>
                      <button onClick={(e) => { e.stopPropagation(); removeTeammate(u) }}
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center
                                   opacity-0 group-hover/chip:opacity-100 hover:bg-red-500/20
                                   hover:text-red-400 transition-all">
                        <X size={8} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {realCollabs.length === 0 && !addingTeammate && (
                <p className="text-[11px] text-slate-700 italic mb-1">No teammates yet — invite via GitHub username</p>
              )}
            </>
          )}

          {addingTeammate && (
            <div className="flex gap-1.5 mt-1">
              <div className="relative flex-1">
                <Github size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input autoFocus type="text" value={ghInput}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setGhInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTeammate(); if (e.key === 'Escape') setAddingTeammate(false) }}
                  placeholder="github-username"
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]
                             text-slate-200 placeholder-slate-600 outline-none text-xs
                             focus:border-brand-500/50 focus:bg-white/[0.06] transition-all" />
              </div>
              <button onClick={(e) => { e.stopPropagation(); addTeammate() }}
                className="px-3 py-1.5 rounded-lg bg-brand-500/20 border border-brand-500/30
                           text-brand-300 hover:bg-brand-500/30 text-xs font-semibold transition-all">
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══ FOOTER — actions ═════════════════════════════════════════════════ */}
      {(true) && (
        <div className="border-t border-white/[0.06] px-4 py-2.5 flex items-center justify-between
                        bg-black/20"
             onClick={e => e.stopPropagation()}>

          {/* Open link */}
          <button className="group/open flex items-center gap-1.5 text-[11px] text-slate-600
                             hover:text-slate-300 transition-colors">
            <ExternalLink size={11} className="group-hover/open:text-brand-400 transition-colors" />
            <span>Open</span>
          </button>

          {/* Delete control */}
          {!confirmDelete ? (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="group/del relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                         text-[11px] font-semibold overflow-hidden
                         text-slate-500 hover:text-red-400
                         bg-white/[0.03] hover:bg-red-500/10
                         border border-white/[0.06] hover:border-red-500/30
                         transition-all duration-200 active:scale-95"
            >
              <Trash2 size={11} className="group-hover/del:rotate-12 transition-transform duration-200" />
              {project.isCollaboration ? 'Leave' : 'Delete'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">{project.isCollaboration ? 'Leave project?' : 'Remove project?'}</span>
              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
                className="px-2.5 py-1 rounded-lg text-[11px] text-slate-500 hover:text-slate-300
                           bg-white/[0.04] border border-white/[0.08] transition-all hover:bg-white/[0.07]">
                Cancel
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete() }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold
                           text-white bg-gradient-to-r from-red-600 to-rose-600
                           hover:from-red-500 hover:to-rose-500
                           shadow-[0_0_16px_rgba(239,68,68,0.5)]
                           hover:shadow-[0_0_24px_rgba(239,68,68,0.7)]
                           border border-red-500/40 active:scale-95 transition-all duration-150">
                <Trash2 size={10} />
                Confirm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
