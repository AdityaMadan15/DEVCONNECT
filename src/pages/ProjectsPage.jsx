import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Filter, FolderGit2, Star, GitFork,
  Users, Clock, ChevronRight, Zap, Globe, Lock, Rocket,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProjectCard from '../components/cards/ProjectCard'

// ── Status filter pills ───────────────────────────────────────────────────────
const FILTERS = ['All', 'Active', 'Review', 'Paused', 'Completed']

export default function ProjectsPage() {
  const navigate  = useNavigate()
  const { state } = useApp()
  const projects  = state.projects
  const [filter, setFilter]   = useState('All')
  const [search, setSearch]  = useState('')

  const filtered = projects.filter(p => {
    const matchStatus = filter === 'All' || (p.status || 'active').toLowerCase() === filter.toLowerCase()
    const title = p.title || p.name || ''
    const desc  = p.description || ''
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) ||
                        desc.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-6 space-y-8">

      {/* ── Header row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">My Projects</h2>
          <p className="text-sm text-slate-500 mt-1">
            {projects.length} projects &nbsp;·&nbsp;
            <span className="text-emerald-400">{projects.filter(p => (p.status || 'active') === 'active').length} active</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/projects/create')}
          className="btn-primary gap-2 shadow-glow px-5 py-2.5 self-start sm:self-auto"
        >
          <Plus size={15} /> Create Project
        </button>
      </div>

      {/* ── Search + filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl
                        bg-surface-card border border-surface-border
                        focus-within:border-brand-500/60 focus-within:shadow-glow-sm transition-all">
          <Search size={14} className="text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all
                ${filter === f
                  ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                  : 'border-surface-border text-slate-500 hover:text-slate-200 hover:border-surface-hover bg-surface-card'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} className="w-full" />
          ))}
          {/* Create new card */}
          <button
            onClick={() => navigate('/projects/create')}
            className="glass-card flex flex-col items-center justify-center gap-3 p-8
                       border-dashed border-brand-500/20 hover:border-brand-500/50
                       text-slate-600 hover:text-brand-400 transition-all duration-300
                       min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <Plus size={20} className="text-brand-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">New Project</p>
              <p className="text-xs text-slate-600 mt-1">Start building something awesome</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center gap-4 py-20 text-center">
          <FolderGit2 size={36} className="text-slate-700" />
          <div>
            {projects.length === 0 ? (
              <>
                <p className="text-slate-400 font-medium">No projects yet</p>
                <p className="text-slate-600 text-sm mt-1">Create your first project to get started!</p>
              </>
            ) : (
              <>
                <p className="text-slate-400 font-medium">No projects found</p>
                <p className="text-slate-600 text-sm mt-1">Try adjusting your search or filter</p>
              </>
            )}
          </div>
          {projects.length === 0 ? (
            <button onClick={() => navigate('/projects/create')} className="btn-primary text-sm gap-2">
              <Plus size={14} /> Create First Project
            </button>
          ) : (
            <button onClick={() => { setFilter('All'); setSearch('') }}
              className="btn-ghost text-sm">Clear filters</button>
          )}
        </div>
      )}

    </div>
  )
}
