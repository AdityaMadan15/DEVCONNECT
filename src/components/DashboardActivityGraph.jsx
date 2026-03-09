import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function DashboardActivityGraph() {
  const { state } = useApp()
  const [timeRange, setTimeRange] = useState(7) // 7, 30, or 90 days

  // Calculate activity data from real state
  const activityData = useMemo(() => {
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - (timeRange - 1))

    // Generate array of dates
    const dates = []
    for (let i = 0; i < timeRange; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        projects: 0,
        messages: 0,
        resources: 0,
        collaborations: 0
      })
    }

    // Count projects created per day
    state.projects.forEach(project => {
      let projectDate
      if (project.createdAt) {
        projectDate = new Date(project.createdAt).toISOString().split('T')[0]
      } else {
        // If no createdAt, assume it was created today
        projectDate = now.toISOString().split('T')[0]
      }
      const dayData = dates.find(d => d.date === projectDate)
      if (dayData) {
        dayData.projects += 1
      }
    })

    // Count messages sent per day (from all projects)
    state.projects.forEach(project => {
      if (project.messages && Array.isArray(project.messages)) {
        project.messages.forEach(msg => {
          let msgDate
          if (msg.timestamp) {
            msgDate = new Date(msg.timestamp).toISOString().split('T')[0]
          } else {
            // If no timestamp, assume sent today
            msgDate = now.toISOString().split('T')[0]
          }
          const dayData = dates.find(d => d.date === msgDate)
          if (dayData) {
            dayData.messages += 1
          }
        })
      }
    })

    // Count resources uploaded per day (from all projects)
    state.projects.forEach(project => {
      if (project.resources && Array.isArray(project.resources)) {
        project.resources.forEach(resource => {
          let resourceDate
          if (resource.uploadedAt) {
            resourceDate = new Date(resource.uploadedAt).toISOString().split('T')[0]
          } else if (resource.timestamp) {
            resourceDate = new Date(resource.timestamp).toISOString().split('T')[0]
          } else {
            // If no timestamp, assume uploaded today
            resourceDate = now.toISOString().split('T')[0]
          }
          const dayData = dates.find(d => d.date === resourceDate)
          if (dayData) {
            dayData.resources += 1
          }
        })
      }
    })

    // Count collaboration requests accepted per day
    state.collabRequests.forEach(req => {
      if (req.status === 'accepted') {
        let collabDate
        if (req.createdAt) {
          collabDate = new Date(req.createdAt).toISOString().split('T')[0]
        } else if (req.acceptedAt) {
          collabDate = new Date(req.acceptedAt).toISOString().split('T')[0]
        } else {
          // If no date, assume today
          collabDate = now.toISOString().split('T')[0]
        }
        const dayData = dates.find(d => d.date === collabDate)
        if (dayData) {
          dayData.collaborations += 1
        }
      }
    })

    return dates
  }, [state.projects, state.collabRequests, timeRange])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-lg p-3 shadow-2xl">
          <p className="text-slate-300 text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Calculate total stats for display (all-time totals)
  const totalStats = useMemo(() => {
    let totalMessages = 0
    let totalResources = 0
    
    state.projects.forEach(project => {
      if (project.messages && Array.isArray(project.messages)) {
        totalMessages += project.messages.length
      }
      if (project.resources && Array.isArray(project.resources)) {
        totalResources += project.resources.length
      }
    })
    
    return {
      projects: state.projects.length,
      messages: totalMessages,
      resources: totalResources,
      collaborations: state.collabRequests.filter(r => r.status === 'accepted').length
    }
  }, [state.projects, state.collabRequests])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-all duration-500" />
      <div className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Developer Activity</h2>
              <p className="text-xs text-slate-500">Last {timeRange} days</p>
            </div>
          </div>

          {/* Time Range Toggle */}
          <div className="flex items-center gap-2 backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-lg p-1">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeRange === days
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Projects</p>
            <p className="text-2xl font-bold text-cyan-400">{totalStats.projects}</p>
          </div>
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Messages</p>
            <p className="text-2xl font-bold text-blue-400">{totalStats.messages}</p>
          </div>
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Resources</p>
            <p className="text-2xl font-bold text-purple-400">{totalStats.resources}</p>
          </div>
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Collaborations</p>
            <p className="text-2xl font-bold text-emerald-400">{totalStats.collaborations}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={activityData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(148, 163, 184, 0.1)" 
                vertical={false}
              />
              <XAxis 
                dataKey="displayDate" 
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.7)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              />
              <YAxis 
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.7)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '12px'
                }}
                iconType="circle"
                formatter={(value) => <span style={{ color: 'rgba(203, 213, 225, 0.9)' }}>{value}</span>}
              />
              <Line 
                type="monotone" 
                dataKey="projects" 
                name="Projects Created"
                stroke="url(#colorCyan)"
                strokeWidth={2.5}
                dot={{ fill: '#06b6d4', r: 3 }}
                activeDot={{ r: 5, fill: '#06b6d4' }}
                animationDuration={1000}
              />
              <Line 
                type="monotone" 
                dataKey="messages" 
                name="Messages Sent"
                stroke="url(#colorBlue)"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5, fill: '#3b82f6' }}
                animationDuration={1000}
                animationBegin={100}
              />
              <Line 
                type="monotone" 
                dataKey="resources" 
                name="Resources Uploaded"
                stroke="url(#colorPurple)"
                strokeWidth={2.5}
                dot={{ fill: '#a855f7', r: 3 }}
                activeDot={{ r: 5, fill: '#a855f7' }}
                animationDuration={1000}
                animationBegin={200}
              />
              <Line 
                type="monotone" 
                dataKey="collaborations" 
                name="Collaborations"
                stroke="url(#colorEmerald)"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 3 }}
                activeDot={{ r: 5, fill: '#10b981' }}
                animationDuration={1000}
                animationBegin={300}
              />
              <defs>
                <linearGradient id="colorCyan" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#0891b2" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="colorPurple" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#9333ea" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="colorEmerald" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>


      </div>
    </motion.div>
  )
}
