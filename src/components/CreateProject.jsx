import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FolderGit2,
  Globe,
  Lock,
  Users,
  Tag,
  FileText,
  Zap,
  Plus,
  X,
  Github,
  UserPlus,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { projectsApi, requestsApi } from '../utils/api'

// ── Tech-stack suggestions ────────────────────────────────────────────────────
const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue', 'Svelte', 'Angular',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Flask',
  'TypeScript', 'Python', 'Go', 'Rust', 'Java',
  'PostgreSQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase',
  'Tailwind CSS', 'GraphQL', 'Docker', 'Kubernetes', 'AWS',
]

const CATEGORIES = [
  { id: 'web',     label: 'Web App',       icon: '🌐' },
  { id: 'mobile',  label: 'Mobile',        icon: '📱' },
  { id: 'ai',      label: 'AI / ML',       icon: '🤖' },
  { id: 'game',    label: 'Game Dev',      icon: '🎮' },
  { id: 'tool',    label: 'Dev Tool',      icon: '🔧' },
  { id: 'open',    label: 'Open Source',   icon: '🔓' },
  { id: 'design',  label: 'Design / UI',   icon: '🎨' },
  { id: 'data',    label: 'Data Science',  icon: '📊' },
]

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`transition-all duration-300 rounded-full flex items-center justify-center
              ${i < current
                ? 'w-6 h-6 bg-brand-500 text-white'
                : i === current
                  ? 'w-6 h-6 bg-brand-500/20 border-2 border-brand-400 text-brand-300'
                  : 'w-5 h-5 bg-surface-hover border border-surface-border text-slate-600'
              } text-[10px] font-bold`}
          >
            {i < current ? <Check size={10} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`h-px w-8 transition-all duration-500
                ${i < current ? 'bg-brand-500' : 'bg-surface-border'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Stack pill ────────────────────────────────────────────────────────────────
function StackPill({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full
                     bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs">
      {label}
      <button onClick={onRemove} className="hover:text-red-400 transition-colors ml-0.5">
        <X size={10} />
      </button>
    </span>
  )
}

// ── STEP 1: Basic Info ────────────────────────────────────────────────────────
function StepBasicInfo({ data, onChange }) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Project Name <span className="text-brand-400">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="e.g. StudySync, HackMate, OpenResume…"
          className="w-full px-4 py-3 rounded-xl bg-surface-card border border-surface-border
                     text-slate-100 placeholder-slate-600 outline-none
                     focus:border-brand-500/60 focus:shadow-glow-sm transition-all duration-200
                     text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Short Description <span className="text-brand-400">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="What does your project do? What problem does it solve?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-surface-card border border-surface-border
                     text-slate-100 placeholder-slate-600 outline-none resize-none
                     focus:border-brand-500/60 focus:shadow-glow-sm transition-all duration-200
                     text-sm leading-relaxed"
        />
        <p className="text-xs text-slate-600 mt-1.5 text-right">
          {data.description.length}/200
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange('category', cat.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm
                          transition-all duration-200
                          ${data.category === cat.id
                            ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
                            : 'border-surface-border bg-surface-card text-slate-400 hover:border-brand-500/30 hover:text-slate-200'
                          }`}
            >
              <span>{cat.icon}</span>
              <span className="font-medium text-xs">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── STEP 2: Tech Stack + Visibility ──────────────────────────────────────────
function StepTechStack({ data, onChange }) {
  const [techInput, setTechInput] = useState('')

  const addTech = (tech) => {
    const t = tech.trim()
    if (t && !data.stack.includes(t)) {
      onChange('stack', [...data.stack, t])
    }
    setTechInput('')
  }

  const removeTech = (t) => onChange('stack', data.stack.filter(s => s !== t))

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Tech stack selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Tech Stack
        </label>
        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {TECH_OPTIONS.filter(t => !data.stack.includes(t)).slice(0, 14).map(tech => (
            <button
              key={tech}
              type="button"
              onClick={() => addTech(tech)}
              className="px-2.5 py-1 rounded-full bg-surface-card border border-surface-border
                         text-slate-500 text-xs hover:border-brand-500/40 hover:text-brand-300
                         hover:bg-brand-500/10 transition-all duration-150"
            >
              + {tech}
            </button>
          ))}
        </div>
        {/* Custom input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(techInput) } }}
            placeholder="Type custom technology and press Enter…"
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-card border border-surface-border
                       text-slate-100 placeholder-slate-600 outline-none text-sm
                       focus:border-brand-500/60 transition-all"
          />
          <button
            type="button"
            onClick={() => addTech(techInput)}
            className="px-3 py-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30
                       text-brand-400 hover:bg-brand-500/25 transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
        {/* Selected stack */}
        {data.stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {data.stack.map(t => (
              <StackPill key={t} label={t} onRemove={() => removeTech(t)} />
            ))}
          </div>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Visibility
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'public',  icon: Globe,  label: 'Public',         desc: 'Anyone can discover and request to join' },
            { id: 'invite',  icon: Users,  label: 'Invite Only',    desc: 'Others can see but need an invite to join' },
            { id: 'private', icon: Lock,   label: 'Private',        desc: 'Only you and invited members can see it' },
          ].map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange('visibility', id)}
              className={`flex flex-col items-start gap-2 px-4 py-3 rounded-xl border text-left
                          transition-all duration-200
                          ${data.visibility === id
                            ? 'border-brand-500/60 bg-brand-500/15'
                            : 'border-surface-border bg-surface-card hover:border-brand-500/30'
                          }`}
            >
              <Icon
                size={16}
                className={data.visibility === id ? 'text-brand-400' : 'text-slate-500'}
              />
              <div>
                <p className={`text-sm font-semibold ${data.visibility === id ? 'text-brand-300' : 'text-slate-300'}`}>
                  {label}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Looking for collaborators */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-card border border-surface-border">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-200">Open to Collaborators</p>
          <p className="text-xs text-slate-500 mt-0.5">Allow other developers to request joining your project</p>
        </div>
        <button
          type="button"
          onClick={() => onChange('openCollab', !data.openCollab)}
          className={`relative w-11 h-6 rounded-full transition-all duration-300
            ${data.openCollab ? 'bg-brand-500' : 'bg-surface-hover border border-surface-border'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300
              ${data.openCollab ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
    </div>
  )
}

// ── STEP 3: Invite Teammates ─────────────────────────────────────────────────
function StepInviteCollaborators({ data, onChange }) {
  const [input, setInput] = useState('')

  const addUser = () => {
    const u = input.trim().replace(/^@/, '')
    if (u && !data.collaborators.includes(u)) {
      onChange('collaborators', [...data.collaborators, u])
    }
    setInput('')
  }

  const removeUser = (u) =>
    onChange('collaborators', data.collaborators.filter(c => c !== u))

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-500/8 border border-brand-500/20">
        <Github size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-200">Invite Teammates via GitHub Username</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Add collaborators now or skip — you can always invite them later from your project.
          </p>
        </div>
      </div>

      {/* Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">GitHub Username</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">@</span>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUser() } }}
              placeholder="e.g. octocat"
              className="w-full pl-7 pr-4 py-3 rounded-xl bg-surface-card border border-surface-border
                         text-slate-100 placeholder-slate-600 outline-none text-sm
                         focus:border-brand-500/60 focus:shadow-glow-sm transition-all duration-200"
            />
          </div>
          <button
            type="button"
            onClick={addUser}
            className="px-4 py-3 rounded-xl bg-brand-500/15 border border-brand-500/30
                       text-brand-400 hover:bg-brand-500/25 transition-all flex items-center gap-1.5 text-sm font-medium"
          >
            <UserPlus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Added users */}
      {data.collaborators.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            Invited ({data.collaborators.length})
          </p>
          <div className="space-y-2">
            {data.collaborators.map(u => (
              <div key={u}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                           bg-surface-card border border-surface-border"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500/30 to-blue-500/30
                                border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <Github size={13} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">@{u}</p>
                  <p className="text-[11px] text-slate-600">github.com/{u}</p>
                </div>
                <button
                  onClick={() => removeUser(u)}
                  className="w-6 h-6 rounded-full hover:bg-red-500/15 flex items-center
                             justify-center text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 rounded-xl border border-dashed border-surface-border">
          <Users size={22} className="text-slate-600" />
          <p className="text-sm text-slate-600">No teammates added yet</p>
          <p className="text-xs text-slate-700">You can add them later from the project page</p>
        </div>
      )}
    </div>
  )
}

// ── STEP 4: Review ────────────────────────────────────────────────────────────
function StepReview({ data }) {
  const cat = CATEGORIES.find(c => c.id === data.category)
  const visMap = { public: 'Public 🌐', invite: 'Invite Only 👥', private: 'Private 🔒' }

  return (
    <div className="space-y-4 animate-fade-up">
      <p className="text-sm text-slate-500">Review your project before creating it.</p>

      <div className="glass-card p-5 space-y-4 border border-surface-border">
        {/* Name + category */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderGit2 size={16} className="text-brand-400" />
              <h3 className="text-xl font-bold text-slate-100">
                {data.name || <span className="text-slate-600 italic">Untitled Project</span>}
              </h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {data.description || <span className="italic">No description provided.</span>}
            </p>
          </div>
          {cat && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                             bg-surface-hover border border-surface-border text-sm flex-shrink-0">
              {cat.icon} <span className="text-slate-400">{cat.label}</span>
            </span>
          )}
        </div>

        {/* Stack */}
        {data.stack.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.stack.map(t => (
                <span key={t}
                  className="px-2.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/25
                             text-brand-300 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Collaborators */}
        {data.collaborators.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Teammates Invited
            </p>
            <div className="flex flex-wrap gap-2">
              {data.collaborators.map(u => (
                <span key={u}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                             bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs">
                  <Github size={10} /> @{u}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-surface-border text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Tag size={11} /> {visMap[data.visibility] || '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={11} /> {data.openCollab ? 'Open to collaborators' : 'Not accepting collaborators'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Main Create Project Page ──────────────────────────────────────────────────
export default function CreateProject() {
  const navigate          = useNavigate()
  const { state, dispatch } = useApp()
  const onBack            = () => navigate(-1)
  const TOTAL_STEPS  = 4
  const [step, setStep] = useState(0)
  const [dir,  setDir]  = useState(1)   // 1 = forward, -1 = back
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    name          : '',
    description   : '',
    category      : 'web',
    stack         : [],
    visibility    : 'public',
    openCollab    : true,
    collaborators : [],
  })

  const onChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDir(1)
      setStep(s => s + 1)
    } else {
      // Persist to AppContext → localStorage, and to backend
      const senderUsername = state.profile?.username || 'unknown'
      const newProject = {
        id:            Date.now(),
        title:         form.name.trim(),
        description:   form.description.trim(),
        techStack:     form.stack,
        category:      form.category,
        visibility:    form.visibility,
        openCollab:    form.openCollab,
        collaborators: form.collaborators,
        status:        'active',
        createdAt:     new Date().toISOString(),
        owner:         senderUsername,
      }
      dispatch({ type: 'ADD_PROJECT', payload: newProject })
      projectsApi.create(newProject)
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id:        Date.now() + 1,
          type:      'project_created',
          message:   `Project "${newProject.title}" was created successfully.`,
          read:      false,
          createdAt: new Date().toISOString(),
        },
      })

      // Send collab invites to every teammate added in the wizard
      form.collaborators.forEach((collab, i) => {
        const invite = {
          id:           Date.now() + 10 + i,
          from:         senderUsername,
          to:           collab,
          projectId:    newProject.id,
          projectTitle: newProject.title,
          message:      `You've been invited to collaborate on "${newProject.title}"!`,
          createdAt:    new Date().toISOString(),
          status:       'pending',
          project: {
            id:           newProject.id,
            title:        newProject.title,
            description:  newProject.description,
            techStack:    newProject.techStack,
            status:       newProject.status,
            visibility:   newProject.visibility,
            category:     newProject.category,
            createdAt:    newProject.createdAt,
            openCollab:   newProject.openCollab,
            collaborators: newProject.collaborators,
          },
        }
        dispatch({ type: 'ADD_COLLAB_REQUEST', payload: invite })
        requestsApi.create(invite)
        try {
          const inboxKey = `devconnect_inbox_${collab}`
          const existing = JSON.parse(localStorage.getItem(inboxKey) || '[]')
          existing.push(invite)
          localStorage.setItem(inboxKey, JSON.stringify(existing))
        } catch { /* ignore storage errors */ }
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/invites/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invite),
        }).catch(() => {})
      })

      setDone(true)
    }
  }

  const goPrev = () => {
    if (step > 0) {
      setDir(-1)
      setStep(s => s - 1)
    } else {
      onBack()
    }
  }

  const canNext =
    step === 0 ? form.name.trim().length > 0 && form.description.trim().length > 0
    : step === 1 ? form.stack.length > 0
    : true   // steps 2 (Teammates) and 3 (Review) are always passable

  const stepLabels = ['Basic Info', 'Tech Stack', 'Teammates', 'Review']

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <main className="relative z-10 mx-auto max-w-lg px-4 py-20 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-brand-500/15 border border-brand-500/30
                        flex items-center justify-center mb-2 animate-bounce-once">
          <Check size={36} className="text-brand-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-100">Project Created! 🎉</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          <span className="text-brand-300 font-semibold">{form.name}</span> is now live on DevConnect.
          {form.openCollab && ' We\'ll notify matching collaborators right away.'}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary px-6 py-2.5 gap-2"
          >
            <ArrowLeft size={14} /> Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="btn-ghost px-6 py-2.5 gap-2"
          >
            View Projects
          </button>
        </div>
      </main>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <main className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 py-10">

      {/* ── Page header ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={goPrev}
          className="w-9 h-9 rounded-xl bg-surface-card border border-surface-border
                     flex items-center justify-center text-slate-400 hover:text-slate-100
                     hover:border-brand-500/40 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-100 leading-none">Create Project</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Step {step + 1} of {TOTAL_STEPS} — {stepLabels[step]}
          </p>
        </div>
        <StepIndicator current={step} total={TOTAL_STEPS} />
      </div>

      {/* ── Card ── */}
      <div className="glass-card p-6 sm:p-8 border border-surface-border">

        {/* Step title */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-brand-500/15 flex items-center justify-center">
            {step === 0 && <FileText size={14} className="text-brand-400" />}
            {step === 1 && <Zap      size={14} className="text-brand-400" />}
            {step === 2 && <Users    size={14} className="text-brand-400" />}
            {step === 3 && <Check    size={14} className="text-brand-400" />}
          </div>
          <h2 className="text-base font-bold text-slate-100">{stepLabels[step]}</h2>
          {step === 2 && (
            <span className="ml-auto text-[11px] text-slate-500 bg-surface-card border border-surface-border
                             px-2.5 py-1 rounded-full">
              Optional — skip if needed
            </span>
          )}
        </div>

        {/* Step content */}
        {step === 0 && <StepBasicInfo           data={form} onChange={onChange} />}
        {step === 1 && <StepTechStack           data={form} onChange={onChange} />}
        {step === 2 && <StepInviteCollaborators data={form} onChange={onChange} />}
        {step === 3 && <StepReview              data={form} />}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-surface-border">
          <button
            type="button"
            onClick={goPrev}
            className="btn-ghost gap-2 text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft size={14} />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {/* On step 2 (Teammates), show Skip option */}
          {step === 2 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goNext}
                className="btn-ghost gap-2 text-slate-500 hover:text-slate-300 text-sm"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={goNext}
                className="btn-primary gap-2 px-6 hover:shadow-glow"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              className={`btn-primary gap-2 px-6 transition-all duration-200
                ${!canNext ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-glow'}`}
            >
              {step === TOTAL_STEPS - 1 ? (
                <><Check size={14} /> Create Project</>
              ) : (
                <>Next <ArrowRight size={14} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
