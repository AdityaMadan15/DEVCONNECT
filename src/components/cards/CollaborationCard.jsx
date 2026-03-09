import { Check, X, Clock } from 'lucide-react'

function SkillChip({ skill }) {
  return (
    <span className="badge bg-surface-hover text-slate-400 text-[10px]">
      {skill}
    </span>
  )
}

export default function CollaborationCard({ request }) {
  return (
    <div className="glass-card p-4 group flex-shrink-0 w-72 sm:w-80">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={request.user.avatar}
            alt={request.user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                           bg-brand-400 ring-2 ring-[#0a0a14]" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-100">{request.user.name}</p>
              <p className="text-xs text-slate-500">{request.user.role}</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-slate-600 flex-shrink-0">
              <Clock size={9} />
              {request.time}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            <span className="text-brand-400 font-medium">→ {request.project}: </span>
            {request.message}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {request.skills.map((s) => <SkillChip key={s} skill={s} />)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                         bg-brand-600/20 text-brand-300 border border-brand-500/30
                         hover:bg-brand-600/40 hover:shadow-glow-sm transition-all duration-200"
            >
              <Check size={11} />
              Accept
            </button>
            <button
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                         bg-red-500/10 text-red-400 border border-red-500/20
                         hover:bg-red-500/20 transition-all duration-200"
            >
              <X size={11} />
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
