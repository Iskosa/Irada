import React, { useState } from 'react'
import type { Task, TaskWeight } from '../../types'
import { Trash2, CornerDownLeft, Activity } from 'lucide-react'

interface QuickDumpTabProps {
  tasks: Task[]
  onAddTask: (title: string) => boolean
  onAssignWeight: (taskId: string, weight: TaskWeight) => boolean
  onDeleteTask: (taskId: string) => void
  lowEnergyMode: boolean
}

export function QuickDumpTab({
  tasks,
  onAddTask,
  onAssignWeight,
  onDeleteTask,
  lowEnergyMode,
}: QuickDumpTabProps) {
  const [text, setText] = useState('')
  const inboxTasks = tasks.filter((t) => t.status === 'inbox')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    const success = onAddTask(trimmed)
    if (success) {
      setText('')
    }
  }

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 overflow-y-auto bg-[#0C0E14] custom-scrollbar text-slate-100">
      {/* Header */}
      <div className="pt-1">
        <h2 className="text-xl font-light tracking-wide text-white">
          быстрый сброс
        </h2>
        <p className="text-xs text-slate-400 font-sans">Очистите разум — запишите мысль в один тап</p>
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-2.5">
        <textarea
          autoFocus
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="О чем вы сейчас думаете? Задача, идея или звонок..."
          className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none shadow-lg font-sans"
        />

        {/* Pill Submit Button */}
        <button
          onClick={() => handleSend()}
          disabled={!text.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-500 hover:opacity-95 active:scale-98 disabled:opacity-30 text-slate-950 font-semibold text-sm shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
        >
          <CornerDownLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Записать в Инбокс</span>
        </button>
      </div>

      {/* "your balance" Bioluminescent Wave Card (Match Image 1 Right Phone) */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] space-y-3 shadow-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>your balance</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">Weekly</span>
        </div>

        {/* Bioluminescent Multi-Wave Graph (Cyan + Purple Waves) */}
        <div className="relative h-20 w-full overflow-hidden flex items-end">
          <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C084FC" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#C084FC" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Wave 1: Purple Wave */}
            <path
              d="M0,60 C40,75 80,30 130,55 C180,75 220,25 260,50 C280,60 300,55 300,80 L0,80 Z"
              fill="url(#purpleGrad)"
            />
            <path
              d="M0,60 C40,75 80,30 130,55 C180,75 220,25 260,50 C280,60 300,55 300,55"
              fill="none"
              stroke="#C084FC"
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]"
            />
            {/* Wave 2: Cyan Wave */}
            <path
              d="M0,70 C50,40 90,65 140,25 C190,5 230,45 270,30 C285,25 300,35 300,80 L0,80 Z"
              fill="url(#cyanGrad)"
            />
            <path
              d="M0,70 C50,40 90,65 140,25 C190,5 230,45 270,30 C285,25 300,35 300,35"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]"
            />
          </svg>
        </div>

        {/* Balance Metrics (Match Image 1) */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-xs">
          <div>
            <div className="text-base font-semibold text-white tracking-tight">
              {completedTasks.length * 0.5} hrs
            </div>
            <div className="text-[10px] text-slate-400">focused today</div>
          </div>
          <div className="text-right">
            <div className="text-base font-semibold text-cyan-300 tracking-tight">
              {Math.min(100, Math.round((completedTasks.length / Math.max(1, tasks.length)) * 100))}%
            </div>
            <div className="text-[10px] text-slate-400">consistency</div>
          </div>
        </div>
      </div>

      {/* Inbox List on Mobile */}
      <div className="flex-1 space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">
            Входящие мысли ({inboxTasks.length})
          </span>
          <span className="text-[11px] text-slate-500">нажмите для веса</span>
        </div>

        {inboxTasks.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] text-center text-xs text-slate-500 font-sans italic">
            Инбокс пуст. Разум спокоен и свободен ✨
          </div>
        ) : (
          <div className="space-y-2">
            {inboxTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-md flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-slate-200 leading-relaxed font-medium break-words">
                    {t.title}
                  </span>
                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Удалить"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick weight assignment chips */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => onAssignWeight(t.id, 'boss')}
                    disabled={lowEnergyMode}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all cursor-pointer ${
                      lowEnergyMode
                        ? 'opacity-30 border-white/5 text-slate-600'
                        : 'border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 shadow-[0_0_8px_rgba(192,132,252,0.15)]'
                    }`}
                  >
                    <span>🔥</span>
                    <span>Босс</span>
                  </button>
                  <button
                    onClick={() => onAssignWeight(t.id, 'medium')}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 shadow-[0_0_8px_rgba(56,189,248,0.15)] transition-all cursor-pointer"
                  >
                    <span>⚡</span>
                    <span>Средняя</span>
                  </button>
                  <button
                    onClick={() => onAssignWeight(t.id, 'small')}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 transition-all cursor-pointer"
                  >
                    <span>🪶</span>
                    <span>Мелкая</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
