import { useState } from 'react'
import { X, UserPlus, Github, Send, ChevronDown, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function InviteCollaborators({ onClose }) {
  const { state, dispatch } = useApp()
  const { projects, profile } = state

  const [githubUsername, setGithubUsername]   = useState('')
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '')
  const [message, setMessage]                 = useState('')
  const [projOpen, setProjOpen]               = useState(false)
  const [sent, setSent]                       = useState(false)
  const [error, setError]                     = useState('')

  const selectedProjectObj = projects.find(p => p.id === selectedProject)

  const handleSend = async () => {
    if (!githubUsername.trim()) {
      setError('Please enter a GitHub username.')
      return
    }
    setError('')

    const invite = {
      id:           Date.now(),
      from:         profile.username || 'unknown',   // sender
      to:           githubUsername.trim(),            // recipient
      projectId:    selectedProject || null,
      projectTitle: selectedProjectObj?.title || null,
      message:      message.trim() || `You've been invited to collaborate!`,
      createdAt:    new Date().toISOString(),
      status:       'pending',
    }

    // Add to sender's own records
    dispatch({ type: 'ADD_COLLAB_REQUEST', payload: invite })
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id:        Date.now() + 1,
        type:      'collab_invite',
        message:   `Collaboration invitation sent to @${githubUsername.trim()}${selectedProjectObj ? ` for "${selectedProjectObj.title}"` : ''}.`,
        read:      false,
        createdAt: new Date().toISOString(),
      },
    })

    // Deliver to recipient in real-time via server
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/invites/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(invite),
      })
    } catch (err) {
      console.error('Real-time delivery failed:', err)
    }

    setSent(true)
    setTimeout(onClose, 1800)
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md glass-card p-6 animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <UserPlus size={17} className="text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Invite Collaborator</h2>
              <p className="text-xs text-slate-500">Send a collaboration invitation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost w-8 h-8 p-0 flex items-center justify-center rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {sent ? (
          /* Success state */
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce-once">
              <Check size={28} className="text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-slate-100">Invitation Sent!</p>
            <p className="text-sm text-slate-500 text-center">
              @{githubUsername} has been invited to collaborate.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* GitHub username */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                GitHub Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={githubUsername}
                  onChange={e => { setGithubUsername(e.target.value); setError('') }}
                  placeholder="e.g. octocat"
                  className="input-themed pl-8"
                />
              </div>
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>

            {/* Project selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Project (optional)
              </label>
              {projects.length === 0 ? (
                <div className="input-themed text-slate-500 text-xs cursor-default">
                  No projects yet — invite will be sent as general request
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProjOpen(v => !v)}
                    className="input-themed flex items-center justify-between w-full text-left"
                  >
                    <span className={selectedProjectObj ? 'text-slate-200' : 'text-slate-500'}>
                      {selectedProjectObj ? selectedProjectObj.title : 'Select a project…'}
                    </span>
                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${projOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {projOpen && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl border border-surface-border
                                    bg-surface-card shadow-card overflow-hidden dropdown-enter">
                      <button
                        onClick={() => { setSelectedProject(''); setProjOpen(false) }}
                        className="w-full text-left px-3 py-2.5 text-xs text-slate-500 hover:bg-surface-hover transition-colors"
                      >
                        — No specific project —
                      </button>
                      {projects.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedProject(p.id); setProjOpen(false) }}
                          className="w-full text-left px-3 py-2.5 text-xs text-slate-200
                                     hover:bg-surface-hover transition-colors flex items-center justify-between"
                        >
                          {p.title}
                          {selectedProject === p.id && <Check size={12} className="text-brand-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Personal Message (optional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Hey! I'd love to collaborate with you on this project…"
                className="input-themed resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="btn-ghost flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handleSend} className="btn-primary flex-1 justify-center">
                <Send size={14} /> Send Invitation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
