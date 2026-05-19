import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { Search, Send, Plus, MessageSquare, Paperclip, X, MoreVertical, Download, File, Trash2, Ban } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getAuthHeaders() {
  const token = localStorage.getItem('authToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function MessagesPage() {
  const { user: authUser } = useAuth()

  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  
  const [attachment, setAttachment] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [viewImage, setViewImage] = useState(null) // State for image modal

  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  const authUserId = authUser?._id || authUser?.id;

  // ── Connect Socket.IO on mount ────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const socket = io(API_BASE, { auth: { token } })
    socketRef.current = socket

    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    socket.on('message-updated', (updatedMsg) => {
      setMessages(prev => {
        // If deleted for me, remove it entirely
        if (updatedMsg.deletedFor?.includes(authUserId)) {
          return prev.filter(m => m._id !== updatedMsg._id && m.id !== updatedMsg._id)
        }
        return prev.map(m => (m._id === updatedMsg._id || m.id === updatedMsg._id) ? updatedMsg : m)
      })
    })

    return () => { socket.disconnect() }
  }, [authUser])

  // ── Fetch project list on mount ───────────────────────────────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/projects`, {
          headers: { ...getAuthHeaders() },
        })
        if (res.ok) {
          const data = await res.json()
          setProjects(data.data || [])
        }
      } catch { /* server offline */ }
    }
    fetchProjects()
  }, [])

  // ── Auto-scroll to latest message ─────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setActiveMenuId(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // ── Select a project room ─────────────────────────────────────────────────
  const selectProject = async (project) => {
    const projectId = project._id || project.id
    setActiveProject({ ...project, id: projectId })
    setMessages([])
    setLoadingMsgs(true)
    setAttachment(null)
    setActiveMenuId(null)

    // Join Socket.IO room
    socketRef.current?.emit('join-room', projectId)

    // Fetch message history
    try {
      const res = await fetch(`${API_BASE}/api/messages/${projectId}`, {
        headers: { ...getAuthHeaders() },
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.data || [])
      }
    } catch { /* server offline */ }

    setLoadingMsgs(false)
  }

  // ── File Selection ────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        fileData: ev.target.result
      })
    }
    reader.readAsDataURL(file)
    e.target.value = null // reset input
  }

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim() && !attachment) return
    if (!activeProject) return
    socketRef.current?.emit('send-message', {
      projectId: activeProject.id,
      text: input.trim(),
      file: attachment
    })
    setInput('')
    setAttachment(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Delete message ────────────────────────────────────────────────────────
  const handleDelete = (msgId, type) => {
    if (!activeProject) return
    socketRef.current?.emit('delete-message', {
      messageId: msgId,
      type,
      projectId: activeProject.id
    })
    setActiveMenuId(null)
  }

  // ── Filter project list by search ─────────────────────────────────────────
  const filteredProjects = projects.filter(p =>
    (p.title || '').toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const d = new Date(msg.createdAt || Date.now())
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(msg)
    return groups
  }, {})

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar panel */}
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

        {/* Project / Chat list */}
        <div className="flex-1 overflow-y-auto py-2">
          {filteredProjects.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <MessageSquare size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No projects yet</p>
                <p className="text-xs text-slate-600 mt-1">Create a project to start chatting</p>
              </div>
            </div>
          ) : (
            filteredProjects.map(p => {
              const pid = p._id || p.id
              const isActive = activeProject?.id === pid
              return (
                <button
                  key={pid}
                  onClick={() => selectProject(p)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-card transition-all
                    ${isActive ? 'bg-surface-card border-l-2 border-brand-400' : ''}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={15} className="text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{p.title}</p>
                    <p className="text-xs text-slate-500 truncate">{p.status || 'active'}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b1120]">
        {!activeProject ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-bold text-slate-300 mb-2">No Messages Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Select a project from the sidebar to start chatting with your team.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-surface-border bg-surface-base flex items-center gap-3 shadow-sm z-10">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                <MessageSquare size={18} className="text-brand-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-200">{activeProject.title}</p>
                <p className="text-xs text-slate-500">{activeProject.status || 'active'}</p>
              </div>
            </div>

            {/* Messages list (WhatsApp Style) */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
              {loadingMsgs && (
                <p className="text-center text-sm text-slate-500 my-4">Loading messages…</p>
              )}
              {!loadingMsgs && messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-surface-card px-4 py-2 rounded-xl border border-surface-border">
                    <p className="text-sm text-slate-400">No messages yet. Say hello! 👋</p>
                  </div>
                </div>
              )}
              
              {Object.entries(groupedMessages).map(([dateStr, msgs]) => (
                <div key={dateStr} className="flex flex-col gap-4">
                  {/* Date Separator */}
                  <div className="flex justify-center my-2">
                    <div className="bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700/50 shadow-sm">
                      <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wide">{dateStr}</p>
                    </div>
                  </div>

                  {msgs.map((msg) => {
                    const msgId = msg._id || msg.id
                    const senderId = msg.sender?._id || msg.sender?.id || msg.sender
                    const isSender = String(senderId) === String(authUserId)
                    const isDeleted = msg.deletedForEveryone

                    return (
                      <div key={msgId} className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} group`}>
                        {!isSender && !isDeleted && (
                          <span className="text-xs text-slate-400 ml-1 mb-1">{msg.sender?.name}</span>
                        )}
                        
                        <div className="flex items-center gap-2 relative">
                          
                          {/* Context Menu Trigger (Only show on hover) */}
                          <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 ${isSender ? '-left-8' : '-right-8'}`}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuId(activeMenuId === msgId ? null : msgId)
                              }}
                              className="p-1 rounded-full hover:bg-white/10 text-slate-400"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                              {activeMenuId === msgId && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className={`absolute top-6 ${isSender ? 'right-0' : 'left-0'} z-50 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden`}
                                >
                                  <div className="py-1">
                                    {msg.file && !isDeleted && (
                                      <a 
                                        href={msg.file.fileData} 
                                        download={msg.file.name}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                      >
                                        <Download size={14} /> Download File
                                      </a>
                                    )}
                                    <button 
                                      onClick={() => handleDelete(msgId, 'me')}
                                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                    >
                                      <Trash2 size={14} /> Delete for me
                                    </button>
                                    {isSender && !isDeleted && (
                                      <button 
                                        onClick={() => handleDelete(msgId, 'everyone')}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                                      >
                                        <Ban size={14} /> Delete for everyone
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Chat Bubble */}
                          <div className={`
                            relative max-w-[280px] sm:max-w-[400px] px-4 py-2.5 rounded-2xl shadow-sm
                            ${isDeleted ? 'bg-slate-800/50 border border-slate-700/50 italic text-slate-500' :
                              isSender 
                                ? 'bg-brand-600 text-white rounded-br-sm' 
                                : 'bg-surface-card text-slate-200 border border-surface-border rounded-bl-sm'}
                          `}>
                            
                            {isDeleted ? (
                              <div className="flex items-center gap-2">
                                <Ban size={14} className="opacity-50" />
                                <span className="text-sm">This message was deleted</span>
                              </div>
                            ) : (
                              <>
                                {/* Render Attachment */}
                                {msg.file && (
                                  <div className="mb-2 -mx-2 -mt-1 rounded-xl overflow-hidden">
                                    {msg.file.type?.startsWith('image/') ? (
                                      <div onClick={() => setViewImage(msg.file)}>
                                        <img 
                                          src={msg.file.fileData} 
                                          alt={msg.file.name} 
                                          className="w-full h-auto max-h-64 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                        />
                                      </div>
                                    ) : (
                                      <div className={`flex items-center gap-3 p-3 mx-2 mt-1 rounded-lg ${isSender ? 'bg-brand-700' : 'bg-slate-800'}`}>
                                        <div className={`p-2 rounded-lg ${isSender ? 'bg-brand-500' : 'bg-slate-700'}`}>
                                          <File size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{msg.file.name}</p>
                                          <p className={`text-xs ${isSender ? 'text-brand-200' : 'text-slate-400'}`}>
                                            {((msg.file.size || 0) / 1024).toFixed(1)} KB
                                          </p>
                                        </div>
                                        <a 
                                          href={msg.file.fileData} 
                                          download={msg.file.name}
                                          className={`p-2 rounded-full hover:bg-black/20 transition-colors ${isSender ? 'text-white' : 'text-brand-400'}`}
                                        >
                                          <Download size={18} />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Render Text */}
                                {msg.text && (
                                  <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                                )}
                              </>
                            )}

                            {/* Timestamp */}
                            <div className={`flex justify-end mt-1 space-x-1 items-center ${isDeleted ? 'opacity-50' : ''}`}>
                              <span className={`text-[10px] ${isSender && !isDeleted ? 'text-brand-200' : 'text-slate-500'}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
              <div ref={bottomRef} className="h-4" />
            </div>

            {/* Message input area */}
            <div className="p-4 bg-surface-base border-t border-surface-border">
              {attachment && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-surface-card rounded-xl border border-surface-border relative">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0 text-brand-400 overflow-hidden">
                    {attachment.type?.startsWith('image/') ? (
                      <img src={attachment.fileData} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <File size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{attachment.name}</p>
                    <p className="text-xs text-slate-500">{((attachment.size || 0) / 1024).toFixed(1)} KB</p>
                  </div>
                  <button 
                    onClick={() => setAttachment(null)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-slate-400 hover:text-brand-400 hover:bg-surface-card rounded-full transition-all"
                  title="Attach file"
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />

                <div className="flex-1 flex items-center px-4 py-2.5 rounded-2xl bg-surface-card border border-surface-border focus-within:border-brand-500/50 transition-colors">
                  <input
                    type="text"
                    placeholder={`Message ${activeProject.title}…`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent text-[15px] text-slate-200 placeholder-slate-500 outline-none flex-1"
                  />
                </div>
                
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && !attachment}
                  className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center
                             text-white hover:bg-brand-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Image Viewing Modal */}
      <AnimatePresence>
        {viewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setViewImage(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={() => setViewImage(null)}
            >
              <X size={24} />
            </button>
            <a 
              href={viewImage.fileData} 
              download={viewImage.name}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-6 right-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 px-4"
            >
              <Download size={18} /> <span className="text-sm font-medium">Download</span>
            </a>
            <img 
              src={viewImage.fileData} 
              alt={viewImage.name} 
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
