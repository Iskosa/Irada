import React, { useState, forwardRef } from 'react'
import type { Task, TaskWeight } from '../../types'
import {
  Inbox,
  Plus,
  Trash2,
  FileText,
  Copy,
  Check,
  GripVertical,
  ArrowDownToLine,
} from 'lucide-react'

interface InboxColumnProps {
  tasks: Task[]
  onAddTask: (title: string) => boolean
  onAssignWeight: (taskId: string, weight: TaskWeight) => boolean
  onDeleteTask: (taskId: string) => void
  onReturnToInbox?: (taskId: string) => void
  lowEnergyMode: boolean
  scratchpadText: string
  onScratchpadChange: (text: string) => void
}

export const InboxColumn = forwardRef<HTMLInputElement, InboxColumnProps>(
  (
    {
      tasks,
      onAddTask,
      onAssignWeight,
      onDeleteTask,
      onReturnToInbox,
      lowEnergyMode,
      scratchpadText,
      onScratchpadChange,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState('')
    const [copied, setCopied] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)

    const inboxTasks = tasks.filter((t) => t.status === 'inbox')

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (onAddTask(inputValue)) {
        setInputValue('')
      }
    }

    const handleCopyScratchpad = () => {
      navigator.clipboard.writeText(scratchpadText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (!isDragOver) setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragOver(false)
      }
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const taskId = e.dataTransfer.getData('text/plain')
      if (taskId && onReturnToInbox) {
        onReturnToInbox(taskId)
      }
    }

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col h-full rounded-3xl border overflow-hidden backdrop-blur-2xl transition-all shadow-xl ${
          isDragOver
            ? 'border-cyan-400/60 bg-cyan-950/20 ring-2 ring-cyan-400/30 shadow-[0_0_25px_rgba(56,189,248,0.2)]'
            : 'bg-[#161820]/80 border-white/[0.08]'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium tracking-wide text-white flex items-center gap-2">
                Инбокс
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 font-mono">
                  {inboxTasks.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Сброс мыслей · Перетащите сюда для возврата</p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.08]">
            Ctrl+K
          </div>
        </div>

        {/* Quick Input */}
        <div className="p-3.5 border-b border-white/[0.08] bg-white/[0.01]">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={ref}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Сбросить мысль в Инбокс... (Enter)"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-4 pr-11 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-500/30 shadow-inner transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-slate-950 disabled:opacity-30 transition-all cursor-pointer shadow-sm"
              title="Добавить в Инбокс"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Inbox Task List (scrollable) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 min-h-[160px] custom-scrollbar">
          {/* Drop Target Indicator when dragging over Inbox */}
          {isDragOver && (
            <div className="p-3.5 rounded-2xl border-2 border-dashed border-cyan-400/60 bg-cyan-950/30 text-cyan-300 flex items-center justify-center gap-2 text-xs font-semibold animate-pulse shadow-sm">
              <ArrowDownToLine className="w-4 h-4" />
              <span>Отпустите здесь, чтобы вернуть задачу в Инбокс 📥</span>
            </div>
          )}

          {inboxTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-slate-500">
              <span className="text-2xl mb-2">✨</span>
              <span>Инбокс пуст. Разум ясен и спокоен.</span>
            </div>
          ) : (
            inboxTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', task.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.14] transition-all shadow-md flex flex-col gap-2.5 cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                    <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 mt-0.5 shrink-0 transition-colors" />
                    <span className="text-xs sm:text-sm text-slate-200 leading-snug break-words">
                      {task.title}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                    title="Удалить"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Weight assignment buttons */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.04]">
                  <button
                    onClick={() => onAssignWeight(task.id, 'boss')}
                    disabled={lowEnergyMode}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all cursor-pointer ${
                      lowEnergyMode
                        ? 'opacity-20 border-white/5 text-slate-600 cursor-not-allowed'
                        : 'border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 shadow-[0_0_8px_rgba(192,132,252,0.15)]'
                    }`}
                    title={lowEnergyMode ? 'Режим «Нет сил»: слот Босса заблокирован' : 'Слот Босса (4⚡)'}
                  >
                    <span>🔥</span>
                    <span>Босс</span>
                  </button>

                  <button
                    onClick={() => onAssignWeight(task.id, 'medium')}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 shadow-[0_0_8px_rgba(56,189,248,0.15)] transition-all cursor-pointer"
                    title="Средняя задача (2⚡)"
                  >
                    <span>⚡</span>
                    <span>Средняя</span>
                  </button>

                  <button
                    onClick={() => onAssignWeight(task.id, 'small')}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 transition-all cursor-pointer"
                    title="Мелкая задача (1⚡)"
                  >
                    <span>🪶</span>
                    <span>Мелкая</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Scratchpad (Заметки дня) */}
        <div className="p-3.5 border-t border-white/[0.08] bg-white/[0.02] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Заметки дня</span>
            </span>
            <button
              onClick={handleCopyScratchpad}
              disabled={!scratchpadText.trim()}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] text-slate-300 disabled:opacity-30 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-teal-400" />
                  <span>Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Копировать</span>
                </>
              )}
            </button>
          </div>

          <textarea
            value={scratchpadText}
            onChange={(e) => onScratchpadChange(e.target.value)}
            rows={3}
            placeholder="Быстрый черновик мыслей, ссылки, идеи на сегодня..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 resize-none font-sans"
          />
        </div>
      </div>
    )
  }
)

InboxColumn.displayName = 'InboxColumn'
