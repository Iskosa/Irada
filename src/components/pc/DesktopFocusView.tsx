import { useState, useEffect, useRef } from 'react'
import type { Task } from '../../types'
import { playChime } from '../../utils/audio'
import { soundscapes, type SoundscapeState } from '../../utils/soundscapes'
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Hourglass,
  Sparkles,
  Volume2,
  VolumeX,
  LayoutGrid,
  CloudRain,
  Wind,
  Activity,
} from 'lucide-react'

interface DesktopFocusViewProps {
  tasks: Task[]
  currentFocusTask: Task | null
  onCompleteTask: (taskId: string) => void
  onPostponeOneHour: (taskId: string) => void
  onToggleComplete: (taskId: string) => void
  onSwitchToColumns: () => void
}

export function DesktopFocusView({
  tasks,
  currentFocusTask,
  onCompleteTask,
  onPostponeOneHour,
  onToggleComplete,
  onSwitchToColumns,
}: DesktopFocusViewProps) {
  const POMODORO_WORK = 25 * 60
  const POMODORO_BREAK = 5 * 60

  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState<number>(POMODORO_WORK)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [soundState, setSoundState] = useState<SoundscapeState>(soundscapes.getState())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setIsRunning(false)
    setTimeLeft(timerMode === 'work' ? POMODORO_WORK : POMODORO_BREAK)
  }, [currentFocusTask?.id, timerMode])

  useEffect(() => {
    const unsub = soundscapes.subscribe(setSoundState)
    return () => unsub()
  }, [])

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

  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const plannedTasks = tasks.filter((t) => t.status === 'planned')

  return (
    <div className="flex-1 w-full max-w-[1720px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-5 h-[calc(100vh-5.5rem)] min-h-[620px] overflow-hidden select-none">
      {/* Left Sidebar (Matching Image 2 & 3) */}
      <aside className="w-full lg:w-60 flex flex-col justify-between p-4 rounded-3xl bg-[#161820]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl shrink-0">
        <div className="space-y-6">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 blur-sm" />
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-lg">
                <img src="/orb-crystal.png" alt="irada" className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-xl font-light tracking-wide text-white">
              irada
            </span>
          </div>

          {/* Navigation Items (Match Image 2) */}
          <nav className="space-y-1 text-xs">
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-white/[0.08] text-white font-medium border border-cyan-400/30 shadow-[0_0_12px_rgba(56,189,248,0.15)] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>focus</span>
            </button>

            <button
              onClick={onSwitchToColumns}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-slate-500" />
              <span>штаб (3 колонки)</span>
            </button>
          </nav>
        </div>

        {/* Ambient Soundscapes Compact Mixer (Match Image 3) */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>soundscapes</span>
            </span>
            <button
              onClick={() => soundscapes.toggle()}
              className={`text-[9px] px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                soundState.isPlaying
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              {soundState.isPlaying ? 'вкл' : 'выкл'}
            </button>
          </div>

          <div className="space-y-1.5 text-[10px] text-slate-400">
            {/* Rain */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-slate-400">
                <CloudRain className="w-3 h-3 text-cyan-400" /> rain
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundState.rain}
                onChange={(e) => soundscapes.setRain(Number(e.target.value))}
                className="w-20 accent-cyan-400 cursor-pointer h-1 bg-white/[0.08] rounded"
              />
            </div>
            {/* Wind */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-slate-400">
                <Wind className="w-3 h-3 text-teal-300" /> wind
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundState.wind}
                onChange={(e) => soundscapes.setWind(Number(e.target.value))}
                className="w-20 accent-teal-400 cursor-pointer h-1 bg-white/[0.08] rounded"
              />
            </div>
            {/* Aurora */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3 h-3 text-purple-400" /> aurora
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundState.aurora}
                onChange={(e) => soundscapes.setAurora(Number(e.target.value))}
                className="w-20 accent-purple-400 cursor-pointer h-1 bg-white/[0.08] rounded"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Center Stage (Match Image 2 & 3) */}
      <div className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
        {/* Top Hero: Focus Timer Card with Giant Luminous Crystal Orb */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-[#161820]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl flex flex-col items-center justify-center overflow-hidden">
          {/* Subtle Ambient Ripples & Glows */}
          <div className="absolute w-80 h-80 rounded-full border border-cyan-500/10 pointer-events-none scale-125" />
          <div className="absolute w-96 h-96 rounded-full border border-purple-500/10 pointer-events-none scale-150" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

          {/* Stardust points */}
          <span className="absolute top-8 left-16 text-cyan-300 opacity-60 text-xs animate-pulse">✦</span>
          <span className="absolute top-12 right-20 text-purple-300 opacity-60 text-xs animate-pulse" style={{ animationDelay: '1s' }}>✦</span>
          <span className="absolute bottom-12 left-24 text-teal-300 opacity-50 text-[10px] animate-pulse" style={{ animationDelay: '2s' }}>✦</span>

          {/* Header row in card */}
          <div className="w-full flex items-center justify-between mb-2 z-10">
            <span className="text-xs font-light tracking-widest text-slate-400 uppercase">
              focus timer
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => switchMode('work')}
                className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  timerMode === 'work'
                    ? 'bg-white/10 text-cyan-300 border border-cyan-400/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                25м фокус
              </button>
              <button
                onClick={() => switchMode('break')}
                className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  timerMode === 'break'
                    ? 'bg-white/10 text-purple-300 border border-purple-400/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                5м отдых
              </button>
              <button
                onClick={resetTimer}
                className="p-1 rounded-full bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08] cursor-pointer"
                title="Сбросить"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="p-1 rounded-full bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08] cursor-pointer"
                title={soundEnabled ? 'Звук включен' : 'Звук выключен'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Giant Luminous Crystal Orb Centerpiece */}
          <div className="relative my-2 sm:my-4 flex items-center justify-center z-10">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden animate-orb-pulse shadow-[0_0_60px_rgba(56,189,248,0.4),0_0_90px_rgba(192,132,252,0.3)] flex items-center justify-center">
              <img
                src="/orb-crystal.png"
                alt="crystal orb"
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Countdown Digits centered inside the sphere */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-6xl sm:text-7xl font-light font-sans tracking-tight text-white select-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]">
                  {timeFormatted}
                </div>
              </div>
            </div>
          </div>

          {/* Control Pills beneath the orb (Match Image 3: ❚❚ pause, + extend) */}
          <div className="flex items-center gap-3 mt-2 z-10">
            <button
              onClick={toggleTimer}
              className={`px-8 py-2.5 rounded-full text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                isRunning
                  ? 'bg-white/[0.08] border border-cyan-400/50 text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                  : 'bg-white/[0.06] border border-white/20 text-white hover:bg-white/[0.12]'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'pause' : 'start'}</span>
            </button>

            {currentFocusTask && (
              <>
                <button
                  onClick={() => onPostponeOneHour(currentFocusTask.id)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Hourglass className="w-3.5 h-3.5 text-purple-300" />
                  <span>+ extend</span>
                </button>

                <button
                  onClick={() => onCompleteTask(currentFocusTask.id)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-500 text-slate-950 font-semibold text-xs shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>done</span>
                </button>
              </>
            )}
          </div>

          {/* Current Task Display */}
          {currentFocusTask ? (
            <div className="mt-4 text-center z-10">
              <span className="text-[10px] uppercase font-sans tracking-widest text-slate-500">
                текущий фокус
              </span>
              <h3 className="text-base sm:text-lg font-medium text-white tracking-tight mt-0.5">
                {currentFocusTask.title}
              </h3>
            </div>
          ) : (
            <div className="mt-4 text-xs text-slate-500 z-10">
              Все задачи выполнены! Переключитесь в штаб для добавления новых.
            </div>
          )}
        </div>

        {/* Bottom Split Row: Progress Charts & Daily Intentions (Match Image 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Progress Charts Card (Match Image 2) */}
          <div className="p-5 rounded-3xl bg-[#161820]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>progress charts</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                completed sessions: {completedTasks.length}
              </span>
            </div>

            {/* Glowing Waveform Chart */}
            <div className="relative h-24 w-full overflow-hidden flex items-end my-2">
              <svg className="w-full h-full" viewBox="0 0 300 90" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cyanGradDesk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="purpleGradDesk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#C084FC" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Wave 1 */}
                <path
                  d="M0,70 C40,85 80,40 130,65 C180,85 220,35 260,60 C280,70 300,65 300,90 L0,90 Z"
                  fill="url(#purpleGradDesk)"
                />
                <path
                  d="M0,70 C40,85 80,40 130,65 C180,85 220,35 260,60 C280,70 300,65 300,65"
                  fill="none"
                  stroke="#C084FC"
                  strokeWidth="2"
                  className="drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                />
                {/* Wave 2 */}
                <path
                  d="M0,80 C50,50 90,75 140,30 C190,10 230,55 270,40 C285,35 300,45 300,90 L0,90 Z"
                  fill="url(#cyanGradDesk)"
                />
                <path
                  d="M0,80 C50,50 90,75 140,30 C190,10 230,55 270,40 C285,35 300,45 300,45"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  className="drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]"
                />
              </svg>
            </div>

            {/* Days axis labels */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-white/[0.04]">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>
          </div>

          {/* Daily Intentions Checklist Card (Match Image 2) */}
          <div className="p-5 rounded-3xl bg-[#161820]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>daily intentions</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {plannedTasks.length} запланировано
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-36 custom-scrollbar pr-1">
              {plannedTasks.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-4 text-center">
                  Все намерения на сегодня выполнены
                </div>
              ) : (
                plannedTasks.map((t, idx) => {
                  const isDone = t.status === 'completed'
                  const isCyan = idx % 2 === 0
                  return (
                    <div
                      key={t.id}
                      className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => onToggleComplete(t.id)}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${
                            isDone
                              ? 'bg-teal-500 border-teal-500 text-slate-950'
                              : isCyan
                              ? 'border-cyan-400/50 bg-white/[0.02]'
                              : 'border-purple-400/50 bg-white/[0.02]'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span className={`truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {t.title}
                        </span>
                      </div>

                      {t.scheduledHour !== null && (
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {String(t.scheduledHour).padStart(2, '0')}:00
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <button
              onClick={onSwitchToColumns}
              className="mt-3 w-full py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 font-medium border border-white/[0.08] transition-all cursor-pointer text-center"
            >
              Перейти в штаб 3-х колонок ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
