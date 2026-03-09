import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, Github, Users, MessageCircle, FolderOpen, Activity,
  UserPlus, Edit3, ExternalLink, Download, FileText,
  FileCode, FileImage, Calendar, GitBranch,
  CheckCircle2, Upload, Send, TrendingUp, Eye, Trash2, RefreshCw
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const STATUS_CONFIG = {
  active: { label: 'Active', pulse: 'bg-emerald-400', ring: 'ring-emerald-400/30', text: 'text-emerald-300', bg: 'bg-emerald-500/10' },
  planning: { label: 'Planning', pulse: 'bg-amber-400', ring: 'ring-amber-400/30', text: 'text-amber-300', bg: 'bg-amber-500/10' },
  completed: { label: 'Completed', pulse: 'bg-cyan-400', ring: 'ring-cyan-400/30', text: 'text-cyan-300', bg: 'bg-cyan-500/10' },
  review: { label: 'In Review', pulse: 'bg-blue-400', ring: 'ring-blue-400/30', text: 'text-blue-300', bg: 'bg-blue-500/10' },
  draft: { label: 'Draft', pulse: 'bg-slate-400', ring: 'ring-slate-400/30', text: 'text-slate-400', bg: 'bg-slate-500/10' },
}

const FILE_ICONS = {
  PDF: { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10' },
  CSV: { icon: FileCode, color: 'text-green-400', bg: 'bg-green-500/10' },
  ZIP: { icon: FolderOpen, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  PNG: { icon: FileImage, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  JPG: { icon: FileImage, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  JS: { icon: FileCode, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  DEFAULT: { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10' },
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'resources', label: 'Resources', icon: FolderOpen },
  { id: 'activity', label: 'Activity', icon: TrendingUp },
]

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('overview')
  const [messageInput, setMessageInput] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Try both string and number comparison since IDs might be stored differently
  const project = state.projects.find(p => p.id === projectId || p.id === parseInt(projectId) || String(p.id) === projectId)

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white mb-2">Project not found</h2>
          <p className="text-slate-400">Project ID: {projectId}</p>
          {state.projects.length === 0 && (
            <p className="text-red-400">⚠️ No projects in state. Create a project first!</p>
          )}
          {state.projects.length > 0 && (
            <div className="text-slate-500 text-sm">
              <p>Available project IDs:</p>
              <p>{state.projects.map(p => p.id).join(', ')}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/projects')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    )
  }

  // Normalize project fields
  const projectName = project.title || project.name || 'Untitled Project'
  const techStack = project.techStack || project.stack || []
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft
  const collaborators = project.collaborators || []
  const resources = project.resources || []
  const messages = project.messages || []
  const activity = project.activity || []
  const starred = project.starred || false

  // ─── Real-time Action Handlers ─────────────────────────────────────────────

  const handleStarToggle = () => {
    if (starred) {
      dispatch({ type: 'UNSTAR_PROJECT', payload: project.id })
      addActivity('unstarred the project')
    } else {
      dispatch({ type: 'STAR_PROJECT', payload: project.id })
      addActivity('starred the project')
    }
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    
    const newMessage = {
      id: Date.now(),
      user: state.profile.name || 'You',
      avatar: state.profile.avatar,
      message: messageInput,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      isOwn: true
    }

    dispatch({
      type: 'ADD_PROJECT_MESSAGE',
      payload: { projectId: project.id, message: newMessage }
    })

    addActivity(`posted a message`)
    setMessageInput('')
  }

  const handleUploadResource = (file) => {
    if (!file) return

    // Check file size limit (10MB for localStorage)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      alert('File is too large. Maximum size is 10MB.')
      return
    }

    const fileExt = file.name.split('.').pop()?.toUpperCase() || 'FILE'
    const fileSizeKB = (file.size / 1024).toFixed(1)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
    const displaySize = file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`
    
    // Read file and convert to base64 for storage
    const reader = new FileReader()
    reader.onload = (e) => {
      const newResource = {
        id: Date.now(),
        name: file.name,
        type: fileExt,
        size: displaySize,
        fileSize: file.size,
        mimeType: file.type,
        fileData: e.target.result, // base64 data URL
        sharedBy: state.profile.name || 'You',
        time: 'Just now',
        timestamp: new Date().toISOString()
      }

      dispatch({
        type: 'ADD_PROJECT_RESOURCE',
        payload: { projectId: project.id, resource: newResource }
      })

      addActivity(`uploaded ${file.name}`)
    }
    reader.onerror = () => {
      alert('Error reading file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteResource = (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    const updatedResources = resources.filter(r => r.id !== resourceId)
    dispatch({
      type: 'UPDATE_PROJECT',
      payload: { id: project.id, resources: updatedResources }
    })

    addActivity('deleted a resource')
  }

  const handleReUploadResource = (oldResource) => {
    // Create a file input element to trigger file selection
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '*/*'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        // Update the existing resource with new file data
        const updatedResources = resources.map(r => {
          if (r.id === oldResource.id) {
            const fileExt = file.name.split('.').pop()?.toUpperCase() || 'FILE'
            const fileSizeKB = (file.size / 1024).toFixed(1)
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
            const displaySize = file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`
            
            return {
              ...r,
              name: file.name,
              type: fileExt,
              size: displaySize,
              fileSize: file.size,
              mimeType: file.type,
              fileData: event.target.result,
              time: 'Just now',
              timestamp: new Date().toISOString()
            }
          }
          return r
        })

        dispatch({
          type: 'UPDATE_PROJECT',
          payload: { id: project.id, resources: updatedResources }
        })

        addActivity(`re-uploaded ${file.name}`)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleInviteCollaborator = () => {
    if (!inviteEmail.trim()) return

    // Add to collaborators list
    dispatch({
      type: 'ADD_PROJECT_COLLABORATOR',
      payload: { projectId: project.id, collaborator: inviteEmail }
    })

    addActivity(`invited ${inviteEmail} to collaborate`)
    setInviteEmail('')
    setShowInviteModal(false)

    // Also create a success notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'success',
        message: `Invitation sent to ${inviteEmail}`,
        read: false,
        createdAt: new Date().toISOString()
      }
    })
  }

  const handleEditProject = () => {
    const newTitle = prompt('Enter new project title:', projectName)
    if (!newTitle || newTitle === projectName) return

    dispatch({
      type: 'UPDATE_PROJECT',
      payload: { id: project.id, title: newTitle }
    })

    addActivity(`renamed project to "${newTitle}"`)
  }

  // Helper to add activity
  const addActivity = (text) => {
    const newActivity = {
      id: Date.now(),
      text: `${state.profile.name || 'You'} ${text}`,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      user: state.profile.name || 'You'
    }

    dispatch({
      type: 'ADD_PROJECT_ACTIVITY',
      payload: { projectId: project.id, activity: newActivity }
    })
  }
  
  const stats = [
    { label: 'Stars', value: project.stars || 0, icon: Star, color: 'from-amber-500 to-orange-500' },
    { label: 'Team Members',value: collaborators.length + 1, icon: Users, color: 'from-cyan-500 to-blue-500' },
    { label: 'Resources', value: resources.length, icon: FolderOpen, color: 'from-purple-500 to-pink-500' },
    { label: 'Messages', value: messages.length, icon: MessageCircle, color: 'from-emerald-500 to-teal-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/projects')}
          className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm"
        >
          ← Back to Projects
        </motion.button>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              
              {/* Left: Project Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${project.color || 'from-cyan-600 via-blue-600 to-purple-600'} flex items-center justify-center text-2xl shadow-lg`}>
                    {projectName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{projectName}</h1>
                    <p className="text-slate-400 text-lg">{project.description}</p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2">
                  {techStack.map(tech => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Status & GitHub */}
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg} border border-white/10`}>
                    <span className={`w-2 h-2 rounded-full ${statusConfig.pulse} animate-pulse`} />
                    <span className={`text-sm font-medium ${statusConfig.text}`}>{statusConfig.label}</span>
                  </div>
                  
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all"
                    >
                      <Github className="w-4 h-4" />
                      <span className="text-sm font-medium">View Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap lg:flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditProject}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStarToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    starred
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-500/50 text-slate-300 hover:text-amber-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${starred ? 'fill-amber-300' : ''}`} />
                  {starred ? 'Starred' : 'Star'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group cursor-pointer"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-xl opacity-0 group-hover:opacity-50 blur transition-all duration-300`} />
              <div className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5 text-cyan-400" />
                  <span className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-2"
        >
          <div className="flex flex-wrap gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && <OverviewTab project={project} techStack={techStack} />}
            {activeTab === 'team' && <TeamTab collaborators={collaborators} projectOwner={state.profile} />}
            {activeTab === 'messages' && <MessagesTab messages={messages} messageInput={messageInput} setMessageInput={setMessageInput} onSendMessage={handleSendMessage} />}
            {activeTab === 'resources' && <ResourcesTab resources={resources} onUpload={handleUploadResource} onReUpload={handleReUploadResource} onDelete={handleDeleteResource} />}
            {activeTab === 'activity' && <ActivityTab activities={activity} />}
          </motion.div>
        </AnimatePresence>

        {/* Invite Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowInviteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Invite Collaborator</h3>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInviteCollaborator()}
                  placeholder="Enter email address..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none text-white placeholder:text-slate-500 mb-6"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteCollaborator}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    Send Invite
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────
function OverviewTab({ project, techStack }) {
  const createdDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'
  
  return (
    <div className="space-y-6">
      
      {/* Description */}
      <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Project Description
        </h3>
        <p className="text-slate-300 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Tech Stack Details */}
      {techStack.length > 0 && (
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            Technology Stack
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {techStack.map(tech => (
              <div key={tech} className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20">
                <div className="text-cyan-300 font-semibold mb-1">{tech}</div>
                <div className="text-slate-400 text-sm">Core technology</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Info */}
      <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Project Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/5">
            <GitBranch className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-sm text-slate-400">Created</div>
            <div className="text-white font-semibold">{createdDate}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/5">
            <FileCode className="w-5 h-5 text-green-400 mb-2" />
            <div className="text-sm text-slate-400">Status</div>
            <div className="text-white font-semibold capitalize">{project.status || 'Active'}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/5">
            <Activity className="w-5 h-5 text-purple-400 mb-2" />
            <div className="text-sm text-slate-400">Visibility</div>
            <div className="text-white font-semibold capitalize">{project.visibility || 'Public'}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-sm text-slate-400">Technologies</div>
            <div className="text-white font-semibold">{techStack.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Team Tab ─────────────────────────────────────────────────────────────
function TeamTab({ collaborators, projectOwner }) {
  const allMembers = [
    { 
      id: 'owner', 
      name: projectOwner.name || 'Project Owner', 
      avatar: projectOwner.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${projectOwner.name}`,
      role: 'Project Owner',
      skills: [],
      online: projectOwner.online
    },
    ...collaborators.map(collab => ({
      id: collab,
      name: typeof collab === 'string' ? collab : collab.name,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${typeof collab === 'string' ? collab : collab.name}`,
      role: 'Collaborator',
      skills: [],
      online: false
    }))
  ]

  return (
    <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-cyan-400" />
        Team Members ({allMembers.length})
      </h3>
      {allMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allMembers.map(member => (
            <motion.div
              key={member.id}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-300" />
              <div className="relative p-6 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-0.5"
                    />
                    {member.online && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{member.name}</h4>
                    <p className="text-cyan-400 text-sm mb-2">{member.role}</p>
                    {member.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {member.skills.map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs">No skills listed</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} message="No team members yet" />
      )}
    </div>
  )
}

// ─── Messages Tab ─────────────────────────────────────────────────────────
function MessagesTab({ messages, messageInput, setMessageInput, onSendMessage }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-cyan-400" />
        Project Chat
      </h3>
      
      {messages.length > 0 ? (
        <>
          {/* Messages */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img
                  src={msg.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${msg.user}`}
                  alt={msg.user}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-0.5"
                />
                <div className={`flex-1 max-w-md ${msg.isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1" style={{ justifyContent: msg.isOwn ? 'flex-end' : 'flex-start' }}>
                    <span className="text-sm font-medium text-slate-300">{msg.user}</span>
                    <span className="text-xs text-slate-500">{msg.time}</span>
                  </div>
                  <div
                    className={`inline-block p-3 rounded-xl ${
                      msg.isOwn
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                        : 'bg-white/5 border border-white/10 text-slate-300'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none text-white placeholder:text-slate-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSendMessage}
              disabled={!messageInput.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Send
            </motion.button>
          </div>
        </>
      ) : (
        <>
          <EmptyState icon={MessageCircle} message="No messages yet. Start a conversation!" />
          {/* Input for first message */}
          <div className="flex gap-3 mt-6">
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none text-white placeholder:text-slate-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSendMessage}
              disabled={!messageInput.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Send
            </motion.button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Resources Tab ────────────────────────────────────────────────────────
function ResourcesTab({ resources, onUpload, onReUpload, onDelete }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  const handleDownload = (resource) => {
    if (!resource.fileData) {
      alert('File data not available for download')
      return
    }

    // Create a temporary link element and trigger download
    const link = document.createElement('a')
    link.href = resource.fileData
    link.download = resource.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (resource) => {
    if (!resource.fileData) {
      alert('File data not available for viewing')
      return
    }

    // Open file in new tab for preview
    const newWindow = window.open()
    if (newWindow) {
      // For images, PDFs, and text files, display directly
      if (resource.mimeType?.startsWith('image/') || resource.mimeType === 'application/pdf') {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${resource.name}</title>
              <style>
                body { margin: 0; padding: 0; background: #1a1a1a; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                iframe { width: 100vw; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              ${resource.mimeType?.startsWith('image/') 
                ? `<img src="${resource.fileData}" alt="${resource.name}" />` 
                : `<iframe src="${resource.fileData}"></iframe>`
              }
            </body>
          </html>
        `)
      } else {
        // For other files, trigger download
        newWindow.location.href = resource.fileData
      }
    }
  }

  return (
    <div 
      className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 bg-cyan-500/20 border-2 border-dashed border-cyan-400 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-3 animate-bounce" />
            <p className="text-cyan-300 font-semibold text-lg">Drop file to upload</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-cyan-400" />
          Shared Resources ({resources.length})
        </h3>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </motion.button>
      </div>

      {resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map((resource, idx) => {
            const fileExt = (resource.type || resource.name?.split('.').pop()?.toUpperCase() || 'DEFAULT')
            const FileIcon = FILE_ICONS[fileExt]?.icon || FILE_ICONS.DEFAULT.icon
            const iconColor = FILE_ICONS[fileExt]?.color || FILE_ICONS.DEFAULT.color
            const iconBg = FILE_ICONS[fileExt]?.bg || FILE_ICONS.DEFAULT.bg

            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                  <FileIcon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{resource.name}</h4>
                  <p className="text-slate-400 text-sm">
                    {resource.size || 'Unknown size'} {resource.sharedBy && `· Shared by ${resource.sharedBy}`} {resource.time && `· ${resource.time}`}
                  </p>
                  {!resource.fileData && (
                    <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      File content not stored - click Re-upload to enable preview
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {resource.fileData ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleView(resource)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 transition-all text-sm font-medium"
                        title="View file"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(resource)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-300 transition-all text-sm font-medium"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(resource.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all text-sm font-medium"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onReUpload(resource)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 transition-all text-sm font-medium"
                        title="Re-upload to enable preview and download"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Re-upload</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(resource.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all text-sm font-medium"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <EmptyState icon={FolderOpen} message="No resources shared yet" />
          <p className="text-slate-500 text-sm mt-4">Click "Upload File" or drag and drop files here</p>
        </div>
      )}
    </div>
  )
}

// ─── Activity Tab ─────────────────────────────────────────────────────────
function ActivityTab({ activities }) {
  return (
    <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        Recent Activity
      </h3>
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-slate-300">{activity.text || activity.message || 'Activity'}</p>
                <p className="text-slate-500 text-sm">{activity.time || activity.timestamp || 'Recently'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Activity} message="No recent activity" />
      )}
    </div>
  )
}

// ─── Empty State Component ────────────────────────────────────────────────
function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
      <p className="text-slate-500">{message}</p>
    </div>
  )
}
