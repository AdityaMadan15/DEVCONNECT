import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Github, Linkedin, Mail, MapPin, Calendar, Star, Users, FolderOpen,
  TrendingUp, UserPlus, MessageSquare, Check, ArrowLeft, ExternalLink,
  GitBranch, Activity as ActivityIcon, Share2, MessageCircle
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function UserProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('projects')

  // Get user data - check if it's current user or another user
  const currentUsername = state.profile.username
  const isOwnProfile = username === currentUsername
  
  // Find user data
  let userData = null
  if (isOwnProfile) {
    userData = state.profile
  } else {
    userData = state.users.find(u => u.username === username)
  }

  // If no user found, use current profile as fallback with display message
  if (!userData) {
    userData = state.profile
  }

  // Get user's projects from state
  const userProjects = isOwnProfile ? state.projects : []

  // Calculate stats
  const stats = {
    projects: userProjects.length,
    collaborations: state.collabRequests.filter(r => r.status === 'accepted').length,
    resources: userProjects.reduce((acc, p) => acc + (p.resources?.length || 0), 0),
    stars: userProjects.reduce((acc, p) => acc + (p.stars || 0), 0)
  }

  // Generate activity from projects
  const activity = []
  userProjects.slice(0, 5).forEach(project => {
    if (project.activity && project.activity.length > 0) {
      activity.push(...project.activity.slice(0, 3).map(a => ({
        id: `${project.id}-${a.id}`,
        type: a.type || 'project',
        text: a.text,
        time: a.time
      })))
    } else {
      activity.push({
        id: project.id,
        type: 'project',
        text: `Created project "${project.title}"`,
        time: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'
      })
    }
  })

  const user = {
    username: userData.username || username,
    name: userData.name || 'User',
    avatar: userData.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`,
    role: userData.role || 'Developer',
    university: userData.university || '',
    bio: userData.bio || 'No bio available',
    location: userData.location || '',
    joinedDate: userData.joinedDate || 'Recently',
    links: userData.links || { github: '', linkedin: '', email: '', leetcode: '' },
    skills: userData.skills || [],
    stats: stats,
    projects: userProjects.map(p => ({
      id: p.id,
      name: p.title,
      description: p.description,
      techStack: p.techStack || [],
      stars: p.stars || 0,
      collaborators: (p.collaborators?.length || 0) + 1,
      color: 'from-cyan-600 to-blue-600'
    })),
    activity: activity.slice(0, 5),
    profileDescription: userData.profileDescription || userData.bio || 'No profile description available'
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'success',
        message: isFollowing ? `Unfollowed ${user.name}` : `Now following ${user.name}`,
        read: false,
        createdAt: new Date().toISOString()
      }
    })
  }

  const handleCollabRequest = () => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'success',
        message: `Collaboration request sent to ${username}`,
        read: false,
        createdAt: new Date().toISOString()
      }
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project': return GitBranch
      case 'team': return Users
      case 'resource': return Share2
      case 'comment': return MessageCircle
      case 'star': return Star
      default: return ActivityIcon
    }
  }

  const statsCards = [
    { label: 'Projects Created', value: user.stats.projects, icon: FolderOpen, color: 'from-purple-500 to-pink-500' },
    { label: 'Collaborations', value: user.stats.collaborations, icon: Users, color: 'from-cyan-500 to-blue-500' },
    { label: 'Resources Shared', value: user.stats.resources, icon: Share2, color: 'from-emerald-500 to-teal-500' },
    { label: 'Stars Received', value: user.stats.stars, icon: Star, color: 'from-amber-500 to-orange-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Avatar & Basic Info */}
              <div className="flex flex-col items-center lg:items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-50 blur" />
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-1"
                  />
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFollow}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      isFollowing
                        ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCollabRequest}
                    className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                  <p className="text-cyan-400 text-lg">@{user.username}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span>{user.role}</span>
                  </div>
                  {user.university && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-purple-400" />
                      </div>
                      <span>{user.university}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-amber-400" />
                      </div>
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span>Joined {user.joinedDate}</span>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && user.bio !== 'No bio available' && (
                  <p className="text-slate-300 leading-relaxed">{user.bio}</p>
                )}

                {/* Profile Description */}
                {user.profileDescription && user.profileDescription !== user.bio && user.profileDescription !== 'No profile description available' && (
                  <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                    <h3 className="text-sm font-semibold text-cyan-400 mb-2">About</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{user.profileDescription}</p>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex gap-3">
                  {user.links.github && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      href={user.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all"
                    >
                      <Github className="w-5 h-5" />
                    </motion.a>
                  )}
                  {user.links.linkedin && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      href={user.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all"
                    >
                      <Linkedin className="w-5 h-5" />
                    </motion.a>
                  )}
                  {user.links.email && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      href={`mailto:${user.links.email}`}
                      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all"
                    >
                      <Mail className="w-5 h-5" />
                    </motion.a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
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

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-3">
            {user.skills.map((skill, idx) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-50 blur transition-all" />
                <span className="relative px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 group-hover:border-cyan-500/50 text-cyan-300 font-medium text-sm block">
                  {skill}
                </span>
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-2"
        >
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'activity'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Activity
            </button>
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'projects' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.projects.length > 0 ? user.projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="relative group cursor-pointer"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${project.color} rounded-xl opacity-20 group-hover:opacity-40 blur transition-all duration-300`} />
                <div className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg`}>
                    {project.name.charAt(0)}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-1 rounded text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      {project.stars}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-cyan-400" />
                      {project.collaborators}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              </motion.div>
            )) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-12 text-center"
              >
                <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">No Projects Yet</h3>
                <p className="text-slate-500 text-sm">
                  {isOwnProfile ? "You haven't created any projects yet." : "This user hasn't created any projects yet."}
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-cyan-400" />
              Recent Activity
            </h2>
            {user.activity.length > 0 ? (
              <div className="space-y-4">
                {user.activity.map((item, idx) => {
                  const Icon = getActivityIcon(item.type)
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-300 group-hover:text-white transition-colors">{item.text}</p>
                        <p className="text-slate-500 text-sm mt-1">{item.time}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ActivityIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">No Activity Yet</h3>
                <p className="text-slate-500 text-sm">
                  {isOwnProfile ? "Your activity will appear here." : "This user's activity will appear here."}
                </p>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  )
}
