import { Clock, Star, ExternalLink } from 'lucide-react'

export default function RecentlyViewedCard({ item }) {
  return (
    <div
      className={`glass-card p-4 flex-shrink-0 w-52 sm:w-56 group cursor-pointer
                  hover:shadow-glow-sm transition-all duration-300
                  bg-gradient-to-br ${item.bg} flex flex-col gap-3`}
    >
      {/* Icon row */}
      <div className="flex items-center justify-between">
        <span className="text-2xl">{item.emoji}</span>
        <span className={`badge border border-current/20 bg-current/10 text-[10px] ${item.color}`}>
          {item.type}
        </span>
      </div>

      {/* Name + author */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-100 group-hover:text-white truncate transition-colors">
          {item.name}
        </p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{item.author}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-600">
        <span className="flex items-center gap-1">
          <Clock size={9} />
          {item.lastViewed}
        </span>
        {item.stars && (
          <span className="flex items-center gap-1 text-amber-400">
            <Star size={9} />
            {item.stars}
          </span>
        )}
        <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
      </div>
    </div>
  )
}
