import { useState, useEffect } from 'react'
import {
  Search, Plus, BookOpen, FileText, Link2,
  Video, Filter, X, Upload, File, FolderOpen, Lock,
} from 'lucide-react'
import ResourceCard from '../components/cards/ResourceCard'
import { currentUser, projects } from '../data/mockData'

const TYPE_ICONS = {
  PDF:   FileText,
  CSV:   FileText,
  Figma: FileText,
  MD:    FileText,
  DOC:   FileText,
  DOCX:  FileText,
  XLS:   FileText,
  XLSX:  FileText,
  TXT:   FileText,
  ZIP:   FileText,
}
const TYPE_OPTIONS = ['All', 'PDF', 'CSV', 'Figma', 'MD', 'DOC', 'DOCX', 'XLS', 'XLSX', 'TXT', 'ZIP']

export default function ResourcesPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [selectedProject, setSelectedProject] = useState('All')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [resources, setResources] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    file: null,
    projectId: null,
    projectName: '',
  })

  // Get user's projects (projects they're members of)
  const userProjects = projects.filter(p => p.status !== 'archived')

  // Load resources from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('devconnect_resources')
    if (saved) {
      try {
        setResources(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load resources:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save resources to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('devconnect_resources', JSON.stringify(resources))
      console.log('Saved resources:', resources.length)
    }
  }, [resources, isLoaded])

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadForm(prev => ({ ...prev, file }))
    }
  }

  // Handle resource upload
  const handleUpload = (e) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.projectId) return

    const file = uploadForm.file
    const fileType = file.name.split('.').pop().toUpperCase()
    const fileSize = file.size < 1024 * 1024 
      ? (file.size / 1024).toFixed(2) + ' KB'
      : (file.size / (1024 * 1024)).toFixed(2) + ' MB'

    const typeColors = {
      PDF: { color: 'text-red-400', bg: 'bg-red-500/10' },
      CSV: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      FIG: { color: 'text-purple-400', bg: 'bg-purple-500/10' },
      FIGMA: { color: 'text-purple-400', bg: 'bg-purple-500/10' },
      MD: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
      DOC: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
      DOCX: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
      XLS: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      XLSX: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      TXT: { color: 'text-slate-400', bg: 'bg-slate-500/10' },
      ZIP: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      PNG: { color: 'text-pink-400', bg: 'bg-pink-500/10' },
      JPG: { color: 'text-pink-400', bg: 'bg-pink-500/10' },
      JPEG: { color: 'text-pink-400', bg: 'bg-pink-500/10' },
    }

    const colors = typeColors[fileType] || { color: 'text-slate-400', bg: 'bg-slate-500/10' }

    // Read file as base64 for storage and later download/view
    const reader = new FileReader()
    reader.onload = (event) => {
      const newResource = {
        id: Date.now(),
        name: file.name,
        type: fileType,
        size: fileSize,
        sharedBy: currentUser.name,
        sharedByUsername: currentUser.username,
        projectId: uploadForm.projectId,
        projectName: uploadForm.projectName,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        mimeType: file.type,
        ...colors,
        fileData: event.target.result, // Store base64 data
      }

      setResources(prev => [newResource, ...prev])
      setShowUploadModal(false)
      setUploadForm({ file: null, projectId: null, projectName: '' })
    }
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error)
      alert('Failed to read file. Please try again.')
    }
    
    reader.readAsDataURL(file)
  }

  // Handle resource deletion
  const handleDelete = (id) => {
    setResources(prev => prev.filter(r => r.id !== id))
  }

  // Check if user has access to a resource (is member of the project)
  const hasAccess = (resource) => {
    if (!resource.projectId) return true // Legacy resources without project
    return userProjects.some(p => p.id === resource.projectId)
  }

  // Handle file view
  const handleView = (resource) => {
    if (!resource.fileData) {
      alert('File data not available')
      return
    }
    
    try {
      // Open file in new window
      const newWindow = window.open('', '_blank')
      if (!newWindow) {
        alert('Please allow pop-ups to view files')
        return
      }

      if (resource.type === 'PDF' || resource.mimeType?.includes('pdf')) {
        // PDFs can be opened directly
        newWindow.location.href = resource.fileData
      } else if (resource.mimeType?.startsWith('image/') || ['PNG', 'JPG', 'JPEG', 'GIF', 'SVG', 'WEBP'].includes(resource.type)) {
        // Images
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${resource.name}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; 
                       background: #000; min-height: 100vh; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${resource.fileData}" alt="${resource.name}" />
            </body>
          </html>
        `)
        newWindow.document.close()
      } else if (resource.type === 'TXT' || resource.type === 'MD' || resource.mimeType?.includes('text')) {
        // Text files - decode base64 and display
        const base64Data = resource.fileData.split(',')[1]
        const decodedText = atob(base64Data)
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${resource.name}</title>
              <style>
                body { font-family: 'Consolas', 'Monaco', monospace; padding: 20px; 
                       background: #1e1e1e; color: #d4d4d4; line-height: 1.6; }
                pre { white-space: pre-wrap; word-wrap: break-word; }
              </style>
            </head>
            <body>
              <h3 style="color: #4fc3f7; margin-top: 0;">${resource.name}</h3>
              <pre>${decodedText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </body>
          </html>
        `)
        newWindow.document.close()
      } else {
        // Other files - try to open directly
        newWindow.location.href = resource.fileData
      }
    } catch (error) {
      console.error('Error viewing file:', error)
      alert('Failed to view file: ' + error.message)
    }
  }

  // Handle file download
  const handleDownload = (resource) => {
    if (!resource.fileData) {
      alert('File data not available')
      return
    }
    
    try {
      const link = document.createElement('a')
      link.href = resource.fileData
      link.download = resource.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file: ' + error.message)
    }
  }

  // Real-time filtering based on search, type, and project
  const filtered = resources.filter(resource => {
    // Only show resources from projects user is a member of
    if (!hasAccess(resource)) return false

    const matchesSearch = search === '' || 
      resource.name.toLowerCase().includes(search.toLowerCase()) ||
      resource.sharedBy.toLowerCase().includes(search.toLowerCase()) ||
      (resource.projectName && resource.projectName.toLowerCase().includes(search.toLowerCase()))
    
    const matchesType = type === 'All' || resource.type === type
    
    const matchesProject = selectedProject === 'All' || resource.projectId === parseInt(selectedProject)
    
    return matchesSearch && matchesType && matchesProject
  })

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-6 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Shared Resources</h2>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} of {resources.filter(hasAccess).length} resources 
            {selectedProject !== 'All' 
              ? ` in ${userProjects.find(p => p.id === parseInt(selectedProject))?.name || 'selected project'}`
              : ' across your projects'
            }
            {resources.length > 0 && (
              <span className="ml-2 text-emerald-400 text-xs">• Saved to browser</span>
            )}
          </p>
          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
            <Lock size={10} />
            Only visible to project team members
          </p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary gap-2 self-start sm:self-auto"
        >
          <Plus size={14} /> Share Resource
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        {/* Search and Project Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl
                          bg-surface-card border border-surface-border
                          focus-within:border-brand-500/60 transition-all">
            <Search size={14} className="text-slate-500 flex-shrink-0" />
            <input
              type="text" placeholder="Search resources…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1"
            />
          </div>
          
          {/* Project Filter */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                          bg-surface-card border border-surface-border min-w-[200px]">
            <FolderOpen size={14} className="text-slate-500 flex-shrink-0" />
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="bg-transparent text-sm text-slate-300 outline-none flex-1 cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Projects</option>
              {userProjects.map(project => (
                <option key={project.id} value={project.id} className="bg-slate-900">
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TYPE_OPTIONS.map(t => {
            const Icon = TYPE_ICONS[t]
            return (
              <button key={t} onClick={() => setType(t)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border
                            flex-shrink-0 transition-all
                  ${type === t
                    ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                    : 'border-surface-border text-slate-500 hover:text-slate-200 bg-surface-card'
                  }`}>
                {Icon && <Icon size={11} />}
                <span className="capitalize">{t}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center gap-4 py-20 text-center">
          <BookOpen size={48} className="text-slate-700" />
          <div>
            <p className="text-lg font-semibold text-slate-400">
              {search || type !== 'All' || selectedProject !== 'All' ? 'No Resources Found' : 'No Resources Yet'}
            </p>
            <p className="text-slate-600 text-sm mt-2 max-w-md">
              {search || type !== 'All' || selectedProject !== 'All'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Share project resources with your team. Only team members will have access.'
              }
            </p>
            {!(search || type !== 'All' || selectedProject !== 'All') && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="btn-primary mt-4 gap-2"
              >
                <Plus size={14} /> Share Your First Resource
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(resource => (
            <ResourceCard 
              key={resource.id} 
              resource={resource}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-6 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-100">Share Resource</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadForm({ file: null, projectId: null, projectName: '' })
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-3 px-4 py-8 rounded-xl
                               border-2 border-dashed border-surface-border
                               bg-surface-card/50 hover:bg-surface-card
                               cursor-pointer transition-all group"
                  >
                    <Upload size={20} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                    <div className="text-center">
                      {uploadForm.file ? (
                        <div className="flex items-center gap-2">
                          <File size={16} className="text-brand-400" />
                          <span className="text-sm text-slate-300 font-medium">
                            {uploadForm.file.name}
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            PDF, DOC, CSV, ZIP, etc.
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Lock size={14} className="inline mr-1.5" />
                  Select Project (Only team members will access)
                </label>
                <select
                  value={uploadForm.projectId || ''}
                  onChange={(e) => {
                    const projectId = parseInt(e.target.value)
                    const project = userProjects.find(p => p.id === projectId)
                    setUploadForm(prev => ({
                      ...prev,
                      projectId: projectId,
                      projectName: project?.name || ''
                    }))
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-surface-border
                           text-slate-300 outline-none cursor-pointer
                           focus:border-brand-500/60 transition-all"
                  required
                >
                  <option value="" className="bg-slate-900">Select a project...</option>
                  {userProjects.map(project => (
                    <option key={project.id} value={project.id} className="bg-slate-900">
                      {project.name} ({project.collaborators} members)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-600 mt-2">
                  Resource will only be visible to project team members
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadForm({ file: null, projectId: null, projectName: '' })
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-surface-border
                           text-slate-400 hover:text-slate-300 hover:bg-surface-card
                           transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadForm.file || !uploadForm.projectId}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
