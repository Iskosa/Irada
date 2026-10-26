import { useEffect, useRef, useState } from 'react'
import type { Task } from '../../types'
import { TIMEBOX_HOURS, WEIGHT_CONFIG } from '../../types'
import {
  Clock,
  Check,
  X,
  Navigation,
  GripVertical,
  ArrowDownToLine,
  Headphones,
  Volume2,
  CloudRain,
  Wind,
  Sparkles,
} from 'lucide-react'
import { soundscapes, type SoundscapeState } from '../../utils/soundscapes'

interface TimeboxColumnProps {
  tasks: Task[]
  onSetHour: (taskId: string, hour: number | null) => void
  onToggleComplete: (taskId: string) => void
}

export function TimeboxColumn({ tasks, onSetHour, onToggleComplete }: TimeboxColumnProps) {
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours())
  const [dragOverHour, setDragOverHour] = useState<number | null>(null)
  const [soundState, setSoundState] = useState<SoundscapeState>(soundscapes.getState())
  const [showMixer, setShowMixer] = useState<boolean>(true)
  const currentHourRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Update current hour every 30 seconds
  useEffect(() => {
    const update = () => setCurrentHour(new Date().getHours())
    const interval = setInterval(update, 30000)
    const unsub = soundscapes.subscribe(setSoundState)
    return () => {
      clearInterval(interval)
      unsub()
    }
  }, [])

  // Auto-scroll to current hour on mount
  useEffect(() => {
    if (currentHourRef.current && containerRef.current) {
      currentHourRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const scrollToCurrentHour = () => {
    if (currentHourRef.current) {
      currentHourRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Planned tasks available for scheduling
  const plannedTasks = tasks.filter(
    (t) => t.status === 'planned' || t.status === 'completed'
  )

  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverHour !== hour) {
      setDragOverHour(hour)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverHour(null)
    }
  }

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault()
    setDragOverHour(null)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onSetHour(taskId, hour)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#161820]/80 rounded-3xl border border-white/[0.08] overflow-hidden shadow-xl backdrop-blur-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-medium tracking-wide text-white flex items-center gap-2">
              Таймбоксинг
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 font-mono">
                08:00 – 22:00
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Перетаскивайте задачи мышкой 🖱️</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMixer((prev) => !prev)}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
              soundState.isPlaying
                ? 'bg-cyan-950/50 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.3)] animate-pulse'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
            }`}
            title="Микшер эмбиент-звуков (дождь, ветер, полярное сияние)"
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={scrollToCurrentHour}
            className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition-all shrink-0 cursor-pointer"
            title="Прокрутить к текущему часу"
          >
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>К текущему</span>
          </button>
        </div>
      </div>

      {/* Ambient Soundscapes Mixer (Match Image 3) */}
      {showMixer && (
        <div className="p-3.5 border-b border-white/[0.08] bg-white/[0.015] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>ambient soundscapes mixer</span>
            </span>
            <button
              onClick={() => soundscapes.toggle()}
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                soundState.isPlaying
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : 'bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:bg-white/[0.08]'
              }`}
            >
              {soundState.isPlaying ? '❚❚ Пауза' : '▶ Включить'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-[10px] text-slate-400">
            {/* Night Rain Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-cyan-400" />
                  <span>rain</span>
                </span>
                <span className="font-mono text-slate-500">{Math.round(soundState.rain * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundState.rain}
                onChange={(e) => soundscapes.setRain(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1 bg-white/[0.08] rounded-lg"
              />
            </div>

            {/* Winter Wind Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-teal-300" />
                  <span>wind</span>
                </span>
                <span className="font-mono text-slate-500">{Math.round(soundState.wind * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundState.wind}
                onChange={(e) => soundscapes.setWind(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer h-1 bg-white/[0.08] rounded-lg"
              />
            </div>

            {/* Aurora Hum Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>aurora</span>
                </span>
                <span className="font-mono text-slate-500">{Math.round(soundState.aurora * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundState.aurora}
                onChange={(e) => soundscapes.setAurora(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer h-1 bg-white/[0.08] rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hourly Grid (Scrollable) */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
        {TIMEBOX_HOURS.map((hour) => {
          const isNow = hour === currentHour
          const isTarget = dragOverHour === hour
          const assignedTasks = tasks.filter((t) => t.scheduledHour === hour)
          const hourLabel = `${String(hour).padStart(2, '0')}:00`

          return (
            <div
              key={hour}
              ref={isNow ? currentHourRef : undefined}
              onDragOver={(e) => handleDragOver(e, hour)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, hour)}
              className={`p-2.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                isTarget
                  ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(56,189,248,0.3)] scale-[1.01]'
                  : isNow
                  ? 'bg-cyan-950/20 border-cyan-400/40 shadow-[0_0_15px_rgba(56,189,248,0.15)] ring-1 ring-cyan-400/20'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {/* Row Header: Hour Label + Status + Quick Assign */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs ${
                      isTarget
                        ? 'text-cyan-300 font-bold'
                        : isNow
                        ? 'text-cyan-300 font-semibold'
                        : 'text-slate-400'
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

                {/* Quick Assign Dropdown for this hour */}
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        onSetHour(e.target.value, hour)
                      }
                    }}
                    className="bg-[#1B1E26] border border-white/[0.08] hover:border-cyan-400/40 rounded-full px-2.5 py-0.5 text-[11px] text-slate-400 hover:text-white focus:text-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="" className="bg-[#1B1E26] text-slate-200">+ Привязать задачу...</option>
                    {plannedTasks.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#1B1E26] text-slate-200">
                        {WEIGHT_CONFIG[t.weight]?.icon} {t.title.slice(0, 32)}
                        {t.scheduledHour !== null && t.scheduledHour !== hour
                          ? ` (в ${String(t.scheduledHour).padStart(2, '0')}:00)`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drag over dropping prompt */}
              {isTarget && (
                <div className="flex items-center justify-center gap-2 py-2 border-2 border-dashed border-cyan-400 rounded-xl bg-cyan-950/30 text-cyan-300 text-xs font-medium">
                  <ArrowDownToLine className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Отпустите, чтобы закрепить на {hourLabel}</span>
                </div>
              )}

              {/* Assigned Tasks in this hour */}
              {assignedTasks.length > 0 ? (
                <div className="space-y-1.5 pl-0.5">
                  {assignedTasks.map((task) => {
                    const isDone = task.status === 'completed'
                    const conf = WEIGHT_CONFIG[task.weight]

                    return (
                      <div
                        key={task.id}
                        draggable={!isDone}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', task.id)
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        className={`group/task flex items-center justify-between gap-2 p-2 rounded-xl border text-xs transition-all ${
                          !isDone ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : ''
                        } ${
                          isDone
                            ? 'bg-white/[0.02] border-white/[0.04] opacity-50'
                            : isNow
                            ? 'bg-cyan-900/30 border-cyan-500/30'
                            : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.14]'
                        }`}
                        title={!isDone ? 'Перетащите на другой час для переноса' : undefined}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {!isDone && (
                            <GripVertical className="w-3 h-3 text-slate-600 group-hover/task:text-slate-400 shrink-0 transition-colors" />
                          )}

                          <button
                            onClick={() => onToggleComplete(task.id)}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              isDone
                                ? 'bg-teal-500 border-teal-500 text-slate-950'
                                : 'border-white/20 hover:border-cyan-400 bg-white/[0.02]'
                            }`}
                          >
                            {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </button>

                          <span
                            className={`truncate ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
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
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            title="Отвязать от этого часа"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                !isTarget && (
                  <div className="text-[11px] text-slate-600 font-sans italic pl-1 flex items-center justify-between">
                    <span>Свободный слот</span>
                    <span className="text-[10px] text-slate-600 hidden group-hover:inline">
                      Перетащите сюда задачу
                    </span>
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
