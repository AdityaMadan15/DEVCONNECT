import { useState } from 'react'
import { Search, Send, Plus, Phone, Video, MoreHorizontal, MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const [input, setInput]   = useState('')
  const [search, setSearch] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setInput('')
    // In a real app, this would update the messages list
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── Sidebar panel ── */}
      <div className="w-72 flex-shrink-0 border-r border-surface-border hidden md:flex md:flex-col">
        {/* Header */}
        <div className="p-4 border-b border-surface-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-100">Messages</h3>
            <button className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center
                               text-brand-400 hover:bg-brand-500/25 transition-all">
              <Plus size={13} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-card border border-surface-border">
            <Search size={13} className="text-slate-500" />
            <input
              type="text" placeholder="Search chats…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1"
            />
          </div>
        </div>
        {/* Chat list */}
        <div className="flex-1 overflow-y-auto py-2 flex items-center justify-center">
          <div className="text-center px-4">
            <MessageSquare size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No conversations yet</p>
            <p className="text-xs text-slate-600 mt-1">Start a new chat to get started</p>
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">No Messages Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Start a conversation with your team members to collaborate on projects and share ideas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
