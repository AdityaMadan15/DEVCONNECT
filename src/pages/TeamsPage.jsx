import { useState, useEffect } from 'react'
import {
  Users, Search, Plus, Crown, MessageSquare,
  FolderGit2, Globe, ChevronRight, UserPlus, Trash2, X,
} from 'lucide-react'
import { currentUser } from '../data/mockData'

const ROLE_COLOR = {
  Owner: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Admin: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  Member: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

const AVATAR_OPTIONS = ['🤖', '🏫', '🔓', '📊', '🚀', '💡', '⚡', '🎯', '🔥', '✨']
const COLOR_OPTIONS = [
  'from-cyan-600 to-blue-600',
  'from-emerald-600 to-teal-600',
  'from-pink-600 to-rose-600',
  'from-purple-600 to-indigo-600',
  'from-orange-600 to-red-600',
]

function TeamCard({ team, onDelete }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-4 hover:border-brand-500/30 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${team.color}
                           flex items-center justify-center text-xl flex-shrink-0`}>
            {team.avatar}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{team.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLOR[team.role]}`}>
                {team.role}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onDelete(team.id)}
          className="btn-ghost text-xs px-2 py-1.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={13} />
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{team.description}</p>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users size={11} /> {team.members} members
          </span>
          <span className="flex items-center gap-1">
            <FolderGit2 size={11} /> {team.projects} projects
          </span>
        </div>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {team.online} online
        </span>
      </div>
    </div>
  )
}

export default function TeamsPage() {
  const [search, setSearch] = useState('')
  const [teams, setTeams] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: '🤖',
    color: 'from-cyan-600 to-blue-600',
    role: 'Owner',
    members: 1,
    projects: 0,
    online: 1,
  })

  // Load teams from localStorage on mount
  useEffect(() => {
    if (!isLoaded) {
      const stored = localStorage.getItem('devconnect_teams')
      if (stored) {
        setTeams(JSON.parse(stored))
      }
      setIsLoaded(true)
    }
  }, [isLoaded])

  // Save teams to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('devconnect_teams', JSON.stringify(teams))
    }
  }, [teams, isLoaded])

  const handleCreateTeam = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill all required fields')
      return
    }

    const newTeam = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      avatar: formData.avatar,
      color: formData.color,
      role: formData.role,
      members: formData.members,
      projects: formData.projects,
      online: formData.online,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    }

    setTeams([newTeam, ...teams])
    setShowCreateModal(false)
    setFormData({
      name: '',
      description: '',
      avatar: '🤖',
      color: 'from-cyan-600 to-blue-600',
      role: 'Owner',
      members: 1,
      projects: 0,
      online: 1,
    })
  }

  const handleDeleteTeam = (teamId) => {
    if (confirm('Are you sure you want to delete this team?')) {
      setTeams(teams.filter(t => t.id !== teamId))
    }
  }

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-6 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Teams</h2>
          <p className="text-sm text-slate-500 mt-1">{teams.length} teams</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary gap-2 self-start sm:self-auto">
          <Plus size={14} /> Create Team
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm px-4 py-2.5 rounded-xl
                      bg-surface-card border border-surface-border
                      focus-within:border-brand-500/60 transition-all">
        <Search size={14} className="text-slate-500 flex-shrink-0" />
        <input
          type="text" placeholder="Search teams…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1"
        />
      </div>

      {/* My teams grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">My Teams</h3>
        {filteredTeams.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <h4 className="text-lg font-bold text-slate-300 mb-2">No teams yet</h4>
            <p className="text-sm text-slate-500 mb-6">Create your first team to start collaborating</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary gap-2">
              <Plus size={14} /> Create Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
            {filteredTeams.map(t => (
              <TeamCard key={t.id} team={t} onDelete={handleDeleteTeam} />
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-100">Create New Team</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="btn-ghost p-2">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Team Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Frontend Team"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-surface-border
                           text-sm text-slate-300 placeholder-slate-600
                           focus:border-brand-500/60 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What does this team do?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-surface-border
                           text-sm text-slate-300 placeholder-slate-600
                           focus:border-brand-500/60 outline-none transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Avatar
                </label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({...formData, avatar: emoji})}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                                transition-all ${
                                  formData.avatar === emoji 
                                    ? 'bg-brand-500/20 border-2 border-brand-500' 
                                    : 'bg-surface-card border border-surface-border hover:border-brand-500/50'
                                }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Color Theme
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color}
                                transition-all ${
                                  formData.color === color 
                                    ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-[#0a0a14]' 
                                    : 'opacity-70 hover:opacity-100'
                                }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Your Role
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-surface-border
                           text-sm text-slate-300 focus:border-brand-500/60 outline-none transition-all"
                >
                  <option value="Owner">Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
