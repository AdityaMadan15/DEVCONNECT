import { UserPlus, Circle, ExternalLink } from 'lucide-react'

export default function CollaboratorCard({ person }) {
  return (
    <div
      className="glass-card p-5 flex-shrink-0 w-56 sm:w-60 group cursor-pointer
                 hover:shadow-glow-sm transition-all duration-300 flex flex-col gap-3"
    >
      {/* Avatar + online */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <img
            src={person.avatar}
            alt={person.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-surface-border
                       group-hover:ring-brand-500/50 transition-all"
          />
          {person.online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                             bg-emerald-400 ring-2 ring-[#0a0a14]" />
          )}
        </div>

        {/* Match score */}
        <div className="text-right">
          <p className="text-xs font-bold text-brand-400">{person.match}%</p>
          <p className="text-[10px] text-slate-600">match</p>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
          {person.name}
        </p>
        <p className="text-xs text-slate-500 truncate">{person.role}</p>
        <p className="text-[11px] text-brand-400/70 mt-0.5">{person.university}</p>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1">
        {person.skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px]
                       bg-surface-hover text-slate-400 border border-surface-border whitespace-nowrap"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Mutual projects */}
      {person.mutualProjects > 0 && (
        <p className="text-[10px] text-slate-600">
          {person.mutualProjects} mutual project{person.mutualProjects > 1 ? 's' : ''}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-medium
                     bg-brand-600/20 text-brand-300 border border-brand-500/30
                     hover:bg-brand-600/35 hover:shadow-glow-sm transition-all duration-200"
        >
          <UserPlus size={11} />
          Connect
        </button>
        <button
          className="w-8 h-7 flex items-center justify-center rounded-xl
                     bg-surface-hover text-slate-500 hover:text-slate-300
                     border border-surface-border transition-all duration-200"
          title="View Profile"
        >
          <ExternalLink size={11} />
        </button>
      </div>
    </div>
  )
}
