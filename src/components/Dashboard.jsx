import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FolderGit2, Users, Bell, MessageSquare,
  ArrowRight, Rocket, BookOpen,
  UserPlus, CheckCircle2, Zap,
  Activity, RefreshCw
} from 'lucide-react'
import { useApp, getInitials } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import InviteCollaborators from './InviteCollaborators'
import ProjectCard from './cards/ProjectCard'
import DashboardActivityGraph from './DashboardActivityGraph'

// ─── Greeting helper ──────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Avatar bubble ────────────────────────────────────────────────────────────
function AvatarBubble({ profile, size = 'md' }) {
  const dim = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm'
  if (profile.avatar) {
    return (
      <img
        src={profile.avatar}
        alt={profile.name || 'User'}
        className={`${dim} rounded-full object-cover avatar-ring flex-shrink-0`}
      />
    )
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-cyan-500 to-blue-500
                     flex items-center justify-center font-bold text-white
                     avatar-ring flex-shrink-0`}>
      {getInitials(profile.name || 'U')}
    </div>
  )
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Project Status Badge ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:     { cls: 'bg-emerald-500/15 text-emerald-400', label: 'Active' },
    planning:   { cls: 'bg-amber-500/15 text-amber-400',     label: 'Planning' },
    completed:  { cls: 'bg-brand-500/15 text-brand-400',     label: 'Completed' },
    paused:     { cls: 'bg-slate-500/15 text-slate-400',     label: 'Paused' },
  }
  const s = map[status] || map.active
  return (
    <span className={`badge ${s.cls} text-[10px]`}>{s.label}</span>
  )
}


// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, sub, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
        <Icon size={22} className="text-brand-400/60" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
      </div>
      {action && (
        <button onClick={action} className="btn-primary text-xs py-1.5 px-3 mt-1">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ─── Collab Request Item ──────────────────────────────────────────────────────
function RequestItem({ request }) {
  const { dispatch } = useApp()
  const accept  = () => dispatch({ type: 'UPDATE_COLLAB_REQUEST', payload: { id: request.id, status: 'accepted' } })
  const decline = () => dispatch({ type: 'UPDATE_COLLAB_REQUEST', payload: { id: request.id, status: 'declined' } })

  return (
    <div className="rounded-xl border border-surface-border/60 p-3 bg-surface-hover/30 space-y-2">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-blue-600
                        flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
          {(request.from || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">{request.from || 'Anonymous'}</p>
          {request.message && <p className="text-[11px] text-slate-500 line-clamp-2">{request.message}</p>}
        </div>
      </div>
      <div className="flex gap-1.5">
        <button onClick={accept}  className="flex-1 text-[11px] py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors font-medium">Accept</button>
        <button onClick={decline} className="flex-1 text-[11px] py-1 rounded-lg bg-red-500/10    text-red-400    hover:bg-red-500/20    transition-colors font-medium">Decline</button>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { state } = useApp()
  const { user: authUser } = useAuth()
  const { profile, projects, collabRequests, notifications } = state

  const [inviteOpen, setInviteOpen] = useState(false)

  const pendingCollabs  = collabRequests.filter(r => r.status === 'pending')
  const unreadNotifs    = notifications.filter(n => !n.read)
  const recentProjects  = projects.slice(0, 6)
  const recentActivity  = notifications.slice(0, 5)

  const stats = [
    { icon: FolderGit2,    label: 'Active Projects',       value: projects.length,       color: 'bg-brand-500/20 text-brand-400',   sub: projects.length === 0 ? 'Start your first project' : `${projects.length} total` },
    { icon: Users,         label: 'Team Members',          value: 0,                     color: 'bg-emerald-500/20 text-emerald-400', sub: 'Invite collaborators' },
    { icon: UserPlus,      label: 'Collab Requests',       value: pendingCollabs.length, color: 'bg-blue-500/20 text-blue-400',  sub: pendingCollabs.length === 0 ? 'None pending' : `${pendingCollabs.length} pending` },
    { icon: Bell,          label: 'Unread Notifications',  value: unreadNotifs.length,   color: 'bg-amber-500/20 text-amber-400',    sub: unreadNotifs.length === 0 ? 'All caught up'  : `${unreadNotifs.length} new` },
  ]

  return (
    <div className="page-transition px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">

      {/* Greeting Banner */}
      <div className="glass-card p-5 mb-6 flex items-center justify-between gap-4
                      bg-gradient-to-r from-brand-600/20 via-blue-600/10 to-transparent">
        <div className="flex items-center gap-4 min-w-0">
          <AvatarBubble profile={profile} size="lg" />
          <div className="min-w-0">
            <p className="text-sm text-slate-400 font-medium">{getGreeting()},</p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 truncate">
              {profile.name || authUser?.name || ''} {(profile.name || authUser?.name) && '👋'}
            </h1>
            {(profile.role || authUser?.role || profile.university) && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {profile.role || authUser?.role || ''}{profile.university ? ` · ${profile.university}` : ''}
              </p>
            )}
          </div>
        </div>
        <button onClick={() => navigate('/projects/create')} className="btn-primary flex-shrink-0 hidden sm:flex">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Activity Graph */}
      <div className="mb-6">
        <DashboardActivityGraph />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

        {/* LEFT: Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <FolderGit2 size={15} className="text-brand-400" />
              </div>
              <span className="section-title text-base">Recent Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/projects/create')} className="btn-ghost text-xs gap-1.5 sm:hidden">
                <Plus size={13} /> New
              </button>
              {projects.length > 0 && (
                <button onClick={() => navigate('/projects')} className="btn-ghost text-xs gap-1.5">
                  View all <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          {recentProjects.length === 0 ? (
            <div className="glass-card">
              <EmptyState
                icon={Rocket}
                title="No projects yet. Create your first one!"
                sub="Build something amazing and collaborate with fellow developers."
                action={() => navigate('/projects/create')}
                actionLabel="+ Create Project"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProjects.map(p => (
                <ProjectCard key={p.id} project={p} />
              ))}
              <button
                onClick={() => navigate('/projects/create')}
                className="glass-card p-4 flex flex-col items-center justify-center gap-2
                           border-dashed border-2 border-surface-border/60 hover:border-brand-500/60
                           text-slate-500 hover:text-brand-400 cursor-pointer min-h-[120px] transition-all"
              >
                <Plus size={20} />
                <span className="text-xs font-medium">New Project</span>
              </button>
            </div>
          )}
        </section>

        {/* RIGHT: Panels */}
        <aside className="flex flex-col gap-4">

          {/* Collab Requests */}
          <div className="panel">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <UserPlus size={13} className="text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-slate-100">Collab Requests</span>
                {pendingCollabs.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCollabs.length}
                  </span>
                )}
              </div>
              <button onClick={() => setInviteOpen(true)} className="btn-ghost text-xs py-1 px-2 gap-1">
                <Plus size={12} /> Invite
              </button>
            </div>

            {pendingCollabs.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2 text-center">
                <CheckCircle2 size={26} className="text-slate-600" />
                <p className="text-xs text-slate-500">No pending requests</p>
                <p className="text-[10px] text-slate-600">Invite developers to collaborate on your projects.</p>
                <button onClick={() => setInviteOpen(true)} className="btn-primary text-xs py-1.5 px-3 mt-1">
                  <UserPlus size={12} /> Invite Collaborator
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingCollabs.slice(0, 3).map(req => <RequestItem key={req.id} request={req} />)}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="panel">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Activity size={13} className="text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-slate-100">Recent Activity</span>
            </div>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2 text-center">
                <RefreshCw size={26} className="text-slate-600" />
                <p className="text-xs text-slate-500">All caught up!</p>
                <p className="text-[10px] text-slate-600">Activity from projects and collaborations will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentActivity.map(n => (
                  <div key={n.id} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="panel">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Zap size={13} className="text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-slate-100">Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Plus,          label: 'New Project',  action: () => navigate('/projects/create'), color: 'from-brand-600/20 to-brand-500/10' },
                { icon: Users,         label: 'Browse Teams', action: () => navigate('/teams'),           color: 'from-emerald-600/20 to-emerald-500/10' },
                { icon: BookOpen,      label: 'Resources',    action: () => navigate('/resources'),       color: 'from-blue-600/20 to-blue-500/10' },
                { icon: MessageSquare, label: 'Messages',     action: () => navigate('/messages'),        color: 'from-sky-600/20 to-sky-500/10' },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl
                             bg-gradient-to-br ${item.color} border border-surface-border/60
                             hover:border-brand-500/40 transition-all duration-200
                             text-slate-300 hover:text-white group`}>
                  <item.icon size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </aside>
      </div>

      {inviteOpen && <InviteCollaborators onClose={() => setInviteOpen(false)} />}
    </div>
  )
}
