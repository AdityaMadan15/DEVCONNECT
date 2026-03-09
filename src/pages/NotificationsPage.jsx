import { useState, useEffect } from 'react'
import { Bell, Trash2, MessageCircle, Star, Users, UserPlus, GitBranch, Activity, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'

const NOTIF_TYPES = [
  { id: 'all',   label: 'All' },
  { id: 'collab',  label: 'Collaborations' },
  { id: 'message', label: 'Messages' },
  { id: 'star',    label: 'Stars' },
  { id: 'invite',  label: 'Invites' },
  { id: 'success', label: 'Updates' },
]

const ICON_MAP = {
  collab: GitBranch,
  message: MessageCircle,
  star: Star,
  invite: UserPlus,
  success: CheckCheck,
  info: Bell,
  activity: Activity,
  team: Users,
}

export default function NotificationsPage() {
  const { state, dispatch } = useApp()
  const [filter, setFilter] = useState('all')
  
  // Automatically mark all notifications as read when user visits this page
  useEffect(() => {
    const unreadNotifs = state.notifications.filter(n => !n.read)
    if (unreadNotifs.length > 0) {
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })
    }
  }, []) // Run only once on mount
  
  const notifs = state.notifications || []
  const visible = filter === 'all' 
    ? notifs 
    : notifs.filter(n => n.type === filter)

  const handleDelete = (notifId) => {
    const updatedNotifications = state.notifications.filter(n => n.id !== notifId)
    dispatch({ 
      type: 'LOAD', 
      payload: { ...state, notifications: updatedNotifications } 
    })
  }

  const getRelativeTime = (timestamp) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return then.toLocaleDateString()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Notifications</h2>
          <p className="text-sm text-slate-500 mt-1">
            {notifs.length === 0 ? 'No notifications' : `${notifs.length} notification${notifs.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {NOTIF_TYPES.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
              ${filter === t.id
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'border-white/10 text-slate-500 hover:text-slate-200 bg-white/[0.02]'
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {visible.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {visible.map((notif, idx) => {
              const Icon = ICON_MAP[notif.type] || Bell
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-4 transition-all hover:border-cyan-500/30"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5">
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed text-slate-300">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">
                        {getRelativeTime(notif.createdAt)}
                      </p>
                    </div>

                    {/* Actions (on hover) */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(notif.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty state */
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl flex flex-col items-center justify-center gap-4 py-20 text-center">
          <Bell size={48} className="text-slate-700" />
          <div>
            <p className="text-lg font-semibold text-slate-400">
              {filter === 'all' ? 'No Notifications' : `No ${filter} notifications`}
            </p>
            <p className="text-slate-600 text-sm mt-2">
              {filter === 'all' 
                ? "You'll see notifications about collaborations, messages, and updates here."
                : `No ${filter} notifications yet.`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
