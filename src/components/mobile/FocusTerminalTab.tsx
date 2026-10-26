import { useState, useEffect, useRef } from 'react'
import type { Task } from '../../types'
import { WEIGHT_CONFIG } from '../../types'
import { playChime } from '../../utils/audio'
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Hourglass,
  Volume2,
  VolumeX,
} from 'lucide-react'

interface FocusTerminalTabProps {
  task: Task | null
  onComplete: (taskId: string) => void
  onPostponeOneHour: (taskId: string) => void
  onReturnToInbox?: (taskId: string) => void
  onGoToDump: () => void
}

export function FocusTerminalTab({
  task,
  onComplete,
  onPostponeOneHour,
  onReturnToInbox,
  onGoToDump,
}: FocusTerminalTabProps) {
  // Pomodoro timer state (25 minutes = 1500 seconds, 5m break = 300s)
  const POMODORO_WORK = 25 * 60
  const POMODORO_BREAK = 5 * 60

  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState<number>(POMODORO_WORK)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset timer if task changes
  useEffect(() => {
    setIsRunning(false)
    setTimeLeft(timerMode === 'work' ? POMODORO_WORK : POMODORO_BREAK)
  }, [task?.id, timerMode])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setIsRunning(false)
            if (soundEnabled) playChime('timer-finish')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, soundEnabled])

  const toggleTimer = () => {
    if (soundEnabled) playChime('click')
    setIsRunning((prev) => !prev)
  }

  const resetTimer = () => {
    if (soundEnabled) playChime('click')
    setIsRunning(false)
    setTimeLeft(timerMode === 'work' ? POMODORO_WORK : POMODORO_BREAK)
  }

  const switchMode = (mode: 'work' | 'break') => {
    if (soundEnabled) playChime('click')
    setTimerMode(mode)
    setIsRunning(false)
    setTimeLeft(mode === 'work' ? POMODORO_WORK : POMODORO_BREAK)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Empty state if no tasks in focus
  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0C0E14]">
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center">
            <img src="/orb-crystal.png" alt="irada" className="w-full h-full object-contain" />
          </div>
        </div>
        <h2 className="text-xl font-light text-white mb-1.5 tracking-wide">
          все задачи закрыты
        </h2>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6 font-sans">
          Спокойствие и ясность достигнуты. Сбросьте новые мысли в Инбокс или отдохните.
        </p>
        <button
          onClick={onGoToDump}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs font-semibold tracking-wide shadow-[0_0_20px_rgba(45,212,191,0.35)] active:scale-95 transition-all cursor-pointer"
        >
          + Сбросить мысль в Инбокс
        </button>
      </div>
    )
  }

  const weightConf = WEIGHT_CONFIG[task.weight]
  const currentHour = new Date().getHours()
  const isScheduledForNow = task.scheduledHour === currentHour

  return (
    <div className="flex-1 flex flex-col justify-between px-5 pt-3 pb-4 space-y-3 bg-[#0C0E14] overflow-y-auto custom-scrollbar relative">
      {/* Top Header: Screen Title "focus session" */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div className="flex flex-col">
          <h1 className="text-base font-light tracking-wider text-slate-200">
            focus session
          </h1>
          <span className="text-[10px] text-slate-500 tracking-widest uppercase">
            irada terminal
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Weight Badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full border shadow-xs ${weightConf.badgeBg}`}
          >
            <span>{weightConf.icon}</span>
            <span>{weightConf.label}</span>
            <span className="opacity-40">·</span>
            <span>{weightConf.energy}⚡</span>
          </span>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Звук включен' : 'Звук выключен'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Hero Visual: Glowing Aurora Crystal Orb + Timer */}
      <div className="relative py-2 sm:py-4 flex flex-col items-center justify-center z-10">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* The Crystal Orb Graphic */}
          <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full overflow-hidden flex items-center justify-center">
            <img
              src="/orb-crystal.png"
              alt="crystal orb"
              className="w-full h-full object-contain select-none pointer-events-none"
            />

            {/* Centered Timer Typography inside the Orb */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-5xl sm:text-6xl font-light font-sans tracking-tight text-white select-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                {timeFormatted}
              </div>
            </div>
          </div>
        </div>

        {/* Frosted Glass Pill Button "pause" / "start" (Match Image 1) */}
        <div className="flex flex-col items-center gap-1.5 -mt-3">
          <button
            onClick={toggleTimer}
            className={`px-8 py-2.5 rounded-full backdrop-blur-xl text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
              isRunning
                ? 'bg-white/[0.08] hover:bg-white/[0.14] border border-cyan-400/40 text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>start</span>
              </>
            )}
          </button>

          {/* Under-pill subtitle "deep work" (Match Image 1) */}
          <span className="text-[11px] text-slate-400 font-light tracking-widest lowercase">
            deep work
          </span>
        </div>

        {/* Mode toggle capsules (25m / 5m) + Reset */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center bg-white/[0.03] p-1 rounded-full border border-white/[0.08] text-xs">
            <button
              onClick={() => switchMode('work')}
              className={`px-3 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                timerMode === 'work'
                  ? 'bg-white/10 text-cyan-300 border border-cyan-400/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              25м фокус
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`px-3 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                timerMode === 'break'
                  ? 'bg-white/10 text-purple-300 border border-purple-400/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5м отдых
            </button>
          </div>

          <button
            onClick={resetTimer}
            className="p-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
            title="Сбросить таймер"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current Focus Task Card */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-lg relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-sans tracking-widest text-slate-400">
            текущий фокус
          </span>
          {task.scheduledHour !== null ? (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isScheduledForNow
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 font-semibold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08]'
              }`}
            >
              {String(task.scheduledHour).padStart(2, '0')}:00 {isScheduledForNow && '· сейчас'}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.08]">
              в плане 1-3-5
            </span>
          )}
        </div>
        <h3 className="text-base sm:text-lg font-medium text-white tracking-tight leading-snug">
          {task.title}
        </h3>
      </div>

      {/* Two Action Pill Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
        <button
          onClick={() => onComplete(task.id)}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-500 hover:opacity-95 active:scale-95 text-slate-950 font-semibold text-sm shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-all cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Сделано</span>
        </button>

        <button
          onClick={() => onPostponeOneHour(task.id)}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-200 font-medium text-sm border border-white/[0.1] shadow-xs transition-all cursor-pointer"
        >
          <Hourglass className="w-4 h-4 text-purple-300" />
          <span>+1 час</span>
        </button>
      </div>

      {/* Return to Inbox pill button */}
      {onReturnToInbox && (
        <button
          type="button"
          onClick={() => onReturnToInbox(task.id)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>Вернуть задачу в Инбокс</span>
        </button>
      )}
    </div>
  )
}
