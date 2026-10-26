import type { Task } from '../../types'
import { TIMEBOX_HOURS, WEIGHT_CONFIG } from '../../types'
import {
  BatteryWarning,
  Check,
  RotateCcw,
  Clock,
  Trash2,
  Flame,
  Zap,
  Feather,
  Sparkles,
  GripVertical,
  X,
} from 'lucide-react'

interface PlanColumnProps {
  tasks: Task[]
  lowEnergyMode: boolean
  onToggleLowEnergyMode: () => void
  plannedEnergy: number
  maxEnergy: number
  isOverloaded: boolean
  slotCounts: { boss: number; medium: number; small: number }
  onToggleComplete: (taskId: string) => void
  onReturnToInbox: (taskId: string) => void
  onSetHour: (taskId: string, hour: number | null) => void
  onAssignNextAvailableHour?: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export function PlanColumn({
  tasks,
  lowEnergyMode,
  onToggleLowEnergyMode,
  plannedEnergy,
  maxEnergy,
  isOverloaded,
  slotCounts,
  onToggleComplete,
  onReturnToInbox,
  onSetHour,
  onAssignNextAvailableHour,
  onDeleteTask,
}: PlanColumnProps) {
  const activePlanTasks = tasks.filter(
    (t) =>
      (t.status === 'planned' || t.status === 'completed') &&
      t.weight !== 'unassigned' &&
      (!lowEnergyMode || t.weight !== 'boss')
  )

  const bossTasks = tasks.filter(
    (t) =>
      (t.status === 'planned' || t.status === 'completed') &&
      t.weight === 'boss'
  )
  const mediumTasks = activePlanTasks.filter((t) => t.weight === 'medium')
  const smallTasks = activePlanTasks.filter((t) => t.weight === 'small')

  const energyPercent = Math.min(100, Math.round((plannedEnergy / maxEnergy) * 100))

  const renderTaskItem = (task: Task) => {
    const isDone = task.status === 'completed'
    const weightConf = WEIGHT_CONFIG[task.weight]

    return (
      <div
        key={task.id}
        draggable={!isDone}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', task.id)
          e.dataTransfer.effectAllowed = 'move'
        }}
        className={`group p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
          isDone
            ? 'bg-white/[0.02] border-white/[0.04] opacity-50'
            : 'bg-white/[0.04] border-white/[0.08] hover:border-white/[0.16] shadow-md cursor-grab active:cursor-grabbing'
        }`}
        title={!isDone ? 'Перетащите в колонку расписания справа' : undefined}
      >
        <div className="flex items-start gap-2.5">
          {/* Drag Handle */}
          {!isDone && (
            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 mt-0.5 shrink-0 transition-colors" />
          )}

          {/* Complete Checkbox */}
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isDone
                ? 'bg-teal-500 border-teal-500 text-slate-950'
                : 'border-white/20 hover:border-cyan-400 bg-white/[0.04]'
            }`}
            title={isDone ? 'Отметить как невыполненную' : 'Завершить задачу'}
          >
            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <span
              className={`text-xs sm:text-sm leading-snug break-words transition-all ${
                isDone
                  ? 'line-through text-slate-500'
                  : 'text-white font-medium'
              }`}
            >
              {task.title}
            </span>
          </div>

          {/* Energy Weight Badge */}
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${weightConf.badgeBg}`}
          >
            {weightConf.icon} {weightConf.energy}⚡
          </span>
        </div>

        {/* Task Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] gap-2 flex-wrap">
          {/* Hour selection & auto-schedule button */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500 shrink-0" />
              <select
                value={task.scheduledHour ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  onSetHour(task.id, val === '' ? null : Number(val))
                }}
                className={`border rounded-full px-2.5 py-0.5 text-[11px] focus:outline-none transition-colors cursor-pointer ${
                  task.scheduledHour !== null
                    ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 font-medium'
                    : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
                }`}
              >
                <option value="" className="bg-[#1B1E26] text-slate-200">Без времени</option>
                {TIMEBOX_HOURS.map((hr) => (
                  <option key={hr} value={hr} className="bg-[#1B1E26] text-slate-200">
                    {String(hr).padStart(2, '0')}:00
                  </option>
                ))}
              </select>

              {task.scheduledHour !== null && (
                <button
                  type="button"
                  onClick={() => onSetHour(task.id, null)}
                  className="p-0.5 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  title="Отвязать от времени"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick 1-click Auto-schedule */}
            {task.scheduledHour === null && onAssignNextAvailableHour && !isDone && (
              <button
                type="button"
                onClick={() => onAssignNextAvailableHour(task.id)}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-[10px] font-medium transition-all cursor-pointer shadow-[0_0_8px_rgba(56,189,248,0.15)]"
                title="Назначить в свободный час"
              >
                <Zap className="w-2.5 h-2.5 text-cyan-400" />
                <span>В слот</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onReturnToInbox(task.id)}
              className="p-1 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-full transition-colors cursor-pointer"
              title="Вернуть в Инбокс"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer"
              title="Удалить задачу"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderSlotSection = (
    title: string,
    taskList: Task[],
    limit: number,
    IconComponent: React.ComponentType<{ className?: string }>,
    accentClass: string,
    cardBg: string,
    badgeBg: string
  ) => {
    const plannedCount = taskList.filter((t) => t.status === 'planned').length
    const isFull = plannedCount >= limit

    return (
      <div className={`flex flex-col gap-2.5 rounded-2xl p-3.5 border backdrop-blur-xl ${cardBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-4 h-4 ${accentClass}`} />
            <span className="text-xs font-medium tracking-wide text-white">{title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${badgeBg} ${
                isFull ? 'font-semibold' : ''
              }`}
            >
              {plannedCount} / {limit}
            </span>
          </div>
        </div>

        {/* Task list inside slot */}
        <div className="space-y-2">
          {taskList.length === 0 ? (
            <div className="p-3.5 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] text-center">
              <span className="text-[11px] text-slate-500 font-sans">
                Слот свободен. Назначьте из Инбокса.
              </span>
            </div>
          ) : (
            taskList.map(renderTaskItem)
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#161820]/80 rounded-3xl border border-white/[0.08] overflow-hidden shadow-xl backdrop-blur-2xl">
      {/* Header & Energy progress */}
      <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium tracking-wide text-white flex items-center gap-2">
              План 1-3-5
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 font-mono">
                {activePlanTasks.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {lowEnergyMode
                ? `Заполнено: ${slotCounts.medium}/3 средних, ${slotCounts.small}/5 мелких`
                : `Заполнено: ${slotCounts.boss}/1 босс, ${slotCounts.medium}/3 средних, ${slotCounts.small}/5 мелких`}
            </p>
          </div>

          <button
            onClick={onToggleLowEnergyMode}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
              lowEnergyMode
                ? 'bg-purple-950/50 border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(192,132,252,0.25)] font-semibold'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            <span>🪫</span>
            <span>{lowEnergyMode ? 'Нет сил: 6⚡' : 'Нет сил?'}</span>
          </button>
        </div>

        {/* Energy Progress Bar in Dark Glass */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            isOverloaded
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              : 'bg-white/[0.03] border-white/[0.08] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-sans mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              {isOverloaded ? (
                <BatteryWarning className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>Расход энергии дня:</span>
            </span>
            <span
              className={`font-semibold font-mono ${
                isOverloaded ? 'text-rose-400' : 'text-white'
              }`}
            >
              {plannedEnergy} / {maxEnergy} ⚡
            </span>
          </div>

          <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isOverloaded
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
              }`}
              style={{ width: `${energyPercent}%` }}
            />
          </div>

          {isOverloaded && (
            <div className="text-[10px] text-rose-300 mt-1.5 font-medium">
              ⚠️ Превышен дневной лимит! Уберите лишние задачи для сохранения баланса.
            </div>
          )}
        </div>
      </div>

      {/* 1-3-5 Slot Sections (scrollable) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
        {/* Boss Slot: Hidden in lowEnergyMode */}
        {!lowEnergyMode ? (
          renderSlotSection(
            'Главный Босс',
            bossTasks,
            1,
            Flame,
            'text-purple-400',
            'bg-purple-950/20 border-purple-500/30 glow-purple',
            'bg-purple-950/50 text-purple-200 border-purple-500/40'
          )
        ) : (
          <div className="p-3.5 rounded-2xl border border-dashed border-purple-500/30 bg-purple-950/15 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-purple-300 mb-0.5">
              <span>🪫 Слот Босса скрыт</span>
            </div>
            <p className="text-[11px] text-slate-400">
              В режиме «Нет сил» фокус держится только на простых и доступных делах.
            </p>
            {bossTasks.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex items-center justify-between gap-2 text-left">
                <span className="text-[11px] text-slate-300 truncate" title={bossTasks[0].title}>
                  «{bossTasks[0].title}» (отложена, 0⚡)
                </span>
                <button
                  type="button"
                  onClick={() => onReturnToInbox(bossTasks[0].id)}
                  className="text-[10px] text-cyan-400 hover:underline shrink-0 cursor-pointer font-medium"
                  title="Вернуть отложенного босса в Инбокс"
                >
                  В Инбокс
                </button>
              </div>
            )}
          </div>
        )}

        {/* Medium Tasks Slot */}
        {renderSlotSection(
          'Средние задачи',
          mediumTasks,
          3,
          Zap,
          'text-cyan-400',
          'bg-cyan-950/20 border-cyan-500/30 glow-cyan',
          'bg-cyan-950/50 text-cyan-200 border-cyan-500/40'
        )}

        {/* Small Tasks Slot */}
        {renderSlotSection(
          'Мелкие задачи',
          smallTasks,
          5,
          Feather,
          'text-emerald-400',
          'bg-emerald-950/15 border-emerald-500/20',
          'bg-emerald-950/40 text-emerald-200 border-emerald-500/30'
        )}
      </div>
    </div>
  )
}
