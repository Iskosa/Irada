import type { Task } from '../../types'
import { TIMEBOX_HOURS, WEIGHT_CONFIG } from '../../types'
import { Check, RotateCcw, Clock, Sparkles } from 'lucide-react'

interface DayTimelineTabProps {
  tasks: Task[]
  onToggleComplete: (taskId: string) => void
  onSetHour: (taskId: string, hour: number | null) => void
  onReturnToInbox?: (taskId: string) => void
}

export function DayTimelineTab({
  tasks,
  onToggleComplete,
  onSetHour,
  onReturnToInbox,
}: DayTimelineTabProps) {
  const currentHour = new Date().getHours()

  const plannedAndCompleted = tasks.filter(
    (t) => (t.status === 'planned' || t.status === 'completed') && t.weight !== 'unassigned'
  )

  const unassignedHourTasks = plannedAndCompleted.filter(
    (t) => t.scheduledHour === null
  )

  const scheduledTasks = plannedAndCompleted.filter(
    (t) => t.scheduledHour !== null
  )

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 overflow-y-auto bg-[#0C0E14] custom-scrollbar text-slate-100">
      {/* Header "today's journey" (Match Image 1) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-light tracking-wide text-white">
            today's journey
          </h2>
          <p className="text-xs text-slate-400 font-sans">Почасовой маршрут вашего фокуса</p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
          {plannedAndCompleted.length} задач
        </span>
      </div>

      {/* Featured Focus Session Pills (Like in Image 1 Middle Phone) */}
      {scheduledTasks.length > 0 && (
        <div className="space-y-2 pt-1">
          {scheduledTasks.slice(0, 3).map((task, idx) => {
            const isDone = task.status === 'completed'
            const isCyan = idx % 2 === 0
            const pillBorder = isDone
              ? 'border-white/10 bg-white/[0.02] text-slate-400'
              : isCyan
              ? 'border-cyan-400/40 bg-cyan-950/20 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
              : 'border-purple-400/40 bg-purple-950/20 text-purple-200 shadow-[0_0_15px_rgba(192,132,252,0.15)]'

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-3 transition-all ${pillBorder}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isDone ? 'bg-slate-500' : isCyan ? 'bg-cyan-400 animate-pulse' : 'bg-purple-400 animate-pulse'
                    }`}
                  />
                  <span className={`text-sm font-medium truncate ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-slate-400">
                    {String(task.scheduledHour).padStart(2, '0')}:00
                  </span>
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      isDone
                        ? 'bg-teal-500 border-teal-500 text-slate-950'
                        : 'border-white/20 hover:border-cyan-400 bg-white/[0.04]'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Daily Intentions / Unscheduled Tasks Checklist (Match Image 1 Middle Phone) */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-light tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>daily intentions</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {unassignedHourTasks.length} в очереди
          </span>
        </div>

        {unassignedHourTasks.length === 0 ? (
          <div className="py-2 text-center text-xs text-slate-500 italic">
            Все задачи распределены по часам
          </div>
        ) : (
          <div className="space-y-2">
            {unassignedHourTasks.map((t, idx) => {
              const conf = WEIGHT_CONFIG[t.weight]
              const isDone = t.status === 'completed'
              const checkboxBorder = idx % 2 === 0 ? 'border-cyan-400/50 text-cyan-400' : 'border-purple-400/50 text-purple-400'

              return (
                <div
                  key={t.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 text-xs transition-all ${
                    isDone
                      ? 'bg-white/[0.02] border-white/[0.05] opacity-50'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleComplete(t.id)}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-teal-500 border-teal-500 text-slate-950'
                          : `${checkboxBorder} bg-white/[0.02]`
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span
                      className={`truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value=""
                      onChange={(e) => onSetHour(t.id, Number(e.target.value))}
                      className="bg-white/[0.04] border border-white/[0.1] text-[10px] text-slate-300 rounded-full px-2 py-0.5 focus:outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#1B1E26] text-slate-200">+ Час</option>
                      {TIMEBOX_HOURS.map((h) => (
                        <option key={h} value={h} className="bg-[#1B1E26] text-slate-200">
                          {String(h).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${conf.badgeBg}`}
                    >
                      {conf.icon} {conf.energy}⚡
                    </span>

                    {onReturnToInbox && (
                      <button
                        onClick={() => onReturnToInbox(t.id)}
                        className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                        title="Вернуть в Инбокс"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Vertical Hourly Timeline */}
      <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
        {TIMEBOX_HOURS.map((hr) => {
          const isNow = hr === currentHour
          const tasksAtHour = tasks.filter((t) => t.scheduledHour === hr)
          const hourLabel = `${String(hr).padStart(2, '0')}:00`

          return (
            <div key={hr} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute -left-6 top-2.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  isNow
                    ? 'bg-cyan-400 border-[#121316] ring-4 ring-cyan-500/30'
                    : tasksAtHour.length > 0
                    ? 'bg-purple-400 border-[#121316]'
                    : 'bg-slate-700 border-[#121316]'
                }`}
              />

              <div
                className={`p-3 rounded-2xl border transition-all ${
                  isNow
                    ? 'bg-cyan-950/20 border-cyan-400/40 shadow-[0_0_15px_rgba(56,189,248,0.15)] ring-1 ring-cyan-400/20'
                    : 'bg-white/[0.03] border-white/[0.07]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-medium ${
                      isNow ? 'text-cyan-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {hourLabel}
                  </span>

                  {isNow && (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      СЕЙЧАС
                    </span>
                  )}
                </div>

                {tasksAtHour.length > 0 ? (
                  <div className="space-y-1.5">
                    {tasksAtHour.map((task) => {
                      const isDone = task.status === 'completed'
                      const conf = WEIGHT_CONFIG[task.weight]

                      return (
                        <div
                          key={task.id}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                            isDone
                              ? 'bg-white/[0.02] border-white/[0.04] opacity-50'
                              : isNow
                              ? 'bg-cyan-900/30 border-cyan-500/30'
                              : 'bg-white/[0.03] border-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <button
                              onClick={() => onToggleComplete(task.id)}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                isDone
                                  ? 'bg-teal-500 border-teal-500 text-slate-950'
                                  : 'border-white/20 hover:border-cyan-400 bg-white/[0.02]'
                              }`}
                            >
                              {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>
                            <span
                              className={`truncate ${
                                isDone
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-200 font-medium'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${conf.badgeBg}`}
                            >
                              {conf.icon} {conf.energy}⚡
                            </span>
                            <button
                              onClick={() => onSetHour(task.id, null)}
                              className="text-[10px] text-slate-500 hover:text-rose-400 px-1 py-0.5 rounded transition-colors cursor-pointer"
                              title="Отвязать от часа"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600 font-sans italic flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>Свободный слот</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
