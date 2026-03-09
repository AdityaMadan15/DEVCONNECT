import { Users, Clock, Trophy, MapPin, Check } from 'lucide-react'

export default function EventCard({ event }) {
  return (
    <div
      className="glass-card p-5 flex-shrink-0 w-72 sm:w-80 group cursor-pointer
                 hover:shadow-glow-sm transition-all duration-300 flex flex-col gap-3"
    >
      {/* Gradient accent + emoji */}
      <div className={`relative h-20 rounded-xl bg-gradient-to-br ${event.color}  opacity-80
                       flex items-center justify-center text-4xl overflow-hidden
                       group-hover:opacity-100 transition-opacity`}>
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%)',
          }}
        />
        <span className="relative z-10">{event.emoji}</span>

        {event.registered && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full
                          bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5">
            <Check size={9} className="text-emerald-400" />
            <span className="text-[9px] text-emerald-400 font-medium">Registered</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors leading-tight">
            {event.name}
          </h3>
          <span className="flex-shrink-0 text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10
                           border border-amber-400/20 rounded-full px-2 py-0.5 whitespace-nowrap">
            {event.daysLeft}d left
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">by {event.organiser}</p>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Clock size={10} className="text-brand-400" />
          {event.date}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={10} className="text-brand-400" />
          {event.mode}
        </span>
        <span className="flex items-center gap-1">
          <Trophy size={10} className="text-amber-400" />
          {event.prize}
        </span>
        <span className="flex items-center gap-1">
          <Users size={10} />
          {event.attendees.toLocaleString()} going
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {event.tags.map((t) => (
          <span key={t} className="badge bg-surface-hover text-slate-400 text-[10px] border border-surface-border">
            {t}
          </span>
        ))}
      </div>

      {/* CTA */}
      {!event.registered && (
        <button
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold
                     bg-brand-600/20 text-brand-300 border border-brand-500/30
                     hover:bg-brand-600/40 hover:shadow-glow-sm transition-all duration-200 mt-auto"
        >
          Register Now
        </button>
      )}
    </div>
  )
}
