import { Star, GitFork, TrendingUp, ArrowUpRight } from 'lucide-react'

function StackPill({ tech }) {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-mono
                     font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20 whitespace-nowrap">
      {tech}
    </span>
  )
}

export default function TrendingProjectCard({ project }) {
  return (
    <div
      className="glass-card p-5 group cursor-pointer flex-shrink-0 w-72 sm:w-80
                 hover:shadow-glow-sm transition-all duration-300"
    >
      {/* Top: gradient bar */}
      <div className={`h-1 w-full rounded-full bg-gradient-to-r ${project.color} mb-4 opacity-80
                       group-hover:opacity-100 transition-opacity`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
            {project.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <img
              src={project.authorAvatar}
              alt={project.author}
              className="w-4 h-4 rounded-full"
            />
            <span className="text-[11px] text-slate-500">{project.author}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`badge border text-[10px] ${project.tagColor}`}>{project.tag}</span>
          <ArrowUpRight size={13} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
        {project.description}
      </p>

      {/* Stack */}
      <div className="flex flex-wrap gap-1 mb-4">
        {project.stack.map((t) => <StackPill key={t} tech={t} />)}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Star size={11} className="text-amber-400" />
            {project.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={11} />
            {project.forks}
          </span>
        </div>
        <span className="flex items-center gap-1 text-emerald-400">
          <TrendingUp size={11} />
          {project.trending}
        </span>
      </div>
    </div>
  )
}
