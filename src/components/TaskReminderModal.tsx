import { Bell, Clock, ArrowRight, Hourglass, X, BellRing } from 'lucide-react'
import type { Task } from '../types'
import { WEIGHT_CONFIG } from '../types'

interface TaskReminderModalProps {
  task: Task | null
  onClose: () => void
  onFocusTask: (task: Task) => void
  onPostponeOneHour: (taskId: string) => void
  notificationPermission?: NotificationPermission
  onRequestPermission?: () => void
}

export function TaskReminderModal({
  task,
  onClose,
  onFocusTask,
  onPostponeOneHour,
  notificationPermission,
  onRequestPermission,
}: TaskReminderModalProps) {
  if (!task) return null

  const weightInfo = WEIGHT_CONFIG[task.weight] || WEIGHT_CONFIG.unassigned
  const currentHour = task.scheduledHour ?? new Date().getHours()
  const nextHour = (currentHour + 1) % 24

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#13151E] border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(56,189,248,0.2)] relative overflow-hidden text-slate-100 flex flex-col select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Header Icon + Hour Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] shrink-0">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Напоминание
              </span>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1 text-xs font-mono text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>
                  {String(currentHour).padStart(2, '0')}:00 — {String(nextHour).padStart(2, '0')}:00
                </span>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              Время для запланированной задачи!
            </h3>
          </div>
        </div>

        {/* Task Card Box */}
        <div className="w-full bg-[#1A1D27] border border-white/[0.08] rounded-2xl p-4 mb-5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${weightInfo.badgeBg}`}
            >
              <span>{weightInfo.icon}</span>
              <span>{weightInfo.label}</span>
              {weightInfo.energy > 0 && <span className="opacity-75">({weightInfo.energy}⚡)</span>}
            </span>

            <span className="text-[11px] font-mono text-slate-400">Таймбокс</span>
          </div>

          <p className="text-base font-medium text-white leading-snug">
            {task.title}
          </p>
        </div>

        {/* Browser notification permission request prompt if not granted */}
        {notificationPermission === 'default' && onRequestPermission && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Включить уведомления браузера?</span>
            </div>
            <button
              onClick={onRequestPermission}
              className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              Включить
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            onClick={() => {
              onFocusTask(task)
              onClose()
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Взять в фокус</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onPostponeOneHour(task.id)
              onClose()
            }}
            className="py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Hourglass className="w-4 h-4 text-amber-400" />
            <span>Отложить на 1 ч</span>
          </button>
        </div>
      </div>
    </div>
  )
}

