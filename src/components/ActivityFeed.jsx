export default function ActivityFeed({ activities }) {
  return (
    <div className="space-y-1">
      {activities.map((item, idx) => (
        <div
          key={item.id}
          className="flex items-start gap-3 px-4 py-3 rounded-xl
                     hover:bg-surface-hover transition-colors group cursor-pointer"
        >
          {/* Avatar + emoji badge */}
          <div className="relative flex-shrink-0">
            <img
              src={item.user.avatar}
              alt={item.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none
                         bg-surface-card rounded-full p-0.5"
            >
              {item.icon}
            </span>
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                {item.user.name}
              </span>{' '}
              <span className="text-slate-500">{item.action}</span>{' '}
              <span className="text-brand-400 font-medium">{item.target}</span>
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">{item.time}</p>
          </div>

          {/* Subtle left border accent on non-last items */}
          {idx < activities.length - 1 && (
            <span className="sr-only" />
          )}
        </div>
      ))}
    </div>
  )
}
