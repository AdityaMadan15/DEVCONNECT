import { TrendingUp, Users, Star, GitMerge } from 'lucide-react'

const stats = [
  {
    label: 'Projects',
    value: '4',
    change: '+1 this month',
    icon: GitMerge,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    label: 'Collaborators',
    value: '13',
    change: '+4 this week',
    icon: Users,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    label: 'Total Stars',
    value: '118',
    change: '+12 this week',
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    label: 'Contributions',
    value: '342',
    change: '+28 this month',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
]

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div
            key={s.label}
            className={`glass-card px-5 py-4 flex items-center gap-4
                        border ${s.border} group`}
          >
            <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center
                             group-hover:scale-110 transition-transform duration-200`}>
              <Icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100 leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-emerald-400 mt-1">{s.change}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
