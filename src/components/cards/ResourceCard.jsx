import { Download, FileText, Database, Figma, FileCode, Trash2, Eye, Image, Lock } from 'lucide-react'

const typeIcon = {
  PDF:   { icon: FileText, label: 'pdf'  },
  CSV:   { icon: Database, label: 'csv'  },
  Figma: { icon: Figma,    label: 'fig'  },
  FIG:   { icon: Figma,    label: 'fig'  },
  MD:    { icon: FileCode, label: 'md'   },
  DOC:   { icon: FileText, label: 'doc'  },
  DOCX:  { icon: FileText, label: 'docx' },
  XLS:   { icon: Database, label: 'xls'  },
  XLSX:  { icon: Database, label: 'xlsx' },
  TXT:   { icon: FileCode, label: 'txt'  },
  ZIP:   { icon: FileText, label: 'zip'  },
  PNG:   { icon: Image,    label: 'png'  },
  JPG:   { icon: Image,    label: 'jpg'  },
  JPEG:  { icon: Image,    label: 'jpeg' },
  GIF:   { icon: Image,    label: 'gif'  },
  SVG:   { icon: Image,    label: 'svg'  },
}

export default function ResourceCard({ resource, onView, onDownload, onDelete }) {
  const IconMeta = typeIcon[resource.type] || typeIcon.MD
  const Icon = IconMeta.icon

  return (
    <div className="glass-card px-4 py-3 flex items-center gap-3 group
                    hover:-translate-y-0.5 transition-all duration-200">
      {/* File icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                       ${resource.bg} group-hover:scale-105 transition-transform relative`}>
        <Icon size={18} className={resource.color} />
        {resource.projectId && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-900 
                          border border-blue-500/40 flex items-center justify-center"
               title="Project-restricted resource">
            <Lock size={8} className="text-blue-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
          {resource.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-mono font-semibold uppercase ${resource.color}`}>
            {resource.type}
          </span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-500">{resource.size}</span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-500 truncate">{resource.sharedBy}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            {resource.projectName || resource.project || 'Unknown Project'}
          </span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-600">{resource.time}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
        {onView && resource.fileData && (
          <button
            onClick={() => onView(resource)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-slate-600 hover:text-blue-400 hover:bg-blue-500/10
                       transition-all"
            title="View"
          >
            <Eye size={13} />
          </button>
        )}
        {onDownload && resource.fileData && (
          <button
            onClick={() => onDownload(resource)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-slate-600 hover:text-brand-400 hover:bg-brand-500/10
                       transition-all"
            title="Download"
          >
            <Download size={13} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('Delete "' + resource.name + '"?')) {
                onDelete(resource.id)
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-slate-600 hover:text-red-400 hover:bg-red-500/10
                       transition-all"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
