import type { ToastMessage } from '../types'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let Icon = Info
        let iconColor = 'text-cyan-400'
        let borderColor = 'border-white/10'
        let bgCard = 'bg-[#181B22]/95 border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)]'

        if (toast.type === 'error') {
          Icon = AlertCircle
          iconColor = 'text-rose-400'
          borderColor = 'border-rose-500/40'
          bgCard = 'bg-[#181B22]/95 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle
          iconColor = 'text-amber-400'
          borderColor = 'border-amber-500/40'
          bgCard = 'bg-[#181B22]/95 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
        } else if (toast.type === 'success') {
          Icon = CheckCircle2
          iconColor = 'text-teal-400'
          borderColor = 'border-teal-500/40'
          bgCard = 'bg-[#181B22]/95 border-teal-500/30 shadow-[0_0_20px_rgba(45,212,191,0.2)]'
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-xl text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0 font-sans">
              <div className="text-sm font-medium tracking-tight text-white">{toast.title}</div>
              {toast.description && (
                <div className="text-xs text-slate-400 mt-0.5 leading-relaxed break-words">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-slate-500 hover:text-white transition-colors p-0.5 rounded-full -mr-1 -mt-1 cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
