import { Users, Circle } from 'lucide-react'

export default function TeamChatCard({ chat }) {
  return (
    <div
      className="glass-card px-4 py-3 flex items-center gap-3 group cursor-pointer
                 flex-shrink-0 w-64 sm:w-72
                 hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Room avatar / emoji */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-surface-hover
                      flex items-center justify-center text-lg
                      group-hover:ring-1 group-hover:ring-brand-500/40 transition-all">
        {chat.avatar}
        {chat.unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center
                           rounded-full bg-brand-500 text-[9px] font-bold text-white">
            {chat.unread > 9 ? '9+' : chat.unread}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-100 truncate
                        group-hover:text-white transition-colors">
            {chat.name}
          </p>
          <span className="flex-shrink-0 flex items-center gap-1 text-[10px] text-emerald-400">
            <Circle size={6} fill="currentColor" />
            {chat.online} online
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {chat.lastMessage}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Users size={10} className="text-slate-600" />
          <span className="text-[10px] text-slate-600">{chat.members} members</span>
        </div>
      </div>
    </div>
  )
}
