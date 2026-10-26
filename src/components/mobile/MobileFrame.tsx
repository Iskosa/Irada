import { useState } from 'react'
import type { MobileTab, Task, TaskWeight } from '../../types'
import { FocusTerminalTab } from './FocusTerminalTab'
import { QuickDumpTab } from './QuickDumpTab'
import { DayTimelineTab } from './DayTimelineTab'
import {
  Target,
  PlusCircle,
  CalendarDays,
  Cloud,
  Headphones,
} from 'lucide-react'
import { soundscapes } from '../../utils/soundscapes'

interface MobileFrameProps {
  tasks: Task[]
  currentFocusTask: Task | null
  onAddTask: (title: string) => boolean
  onAssignWeight: (taskId: string, weight: TaskWeight) => boolean
  onDeleteTask: (taskId: string) => void
  onToggleComplete: (taskId: string) => void
  onCompleteTask: (taskId: string) => void
  onPostponeOneHour: (taskId: string) => void
  onSetHour: (taskId: string, hour: number | null) => void
  onReturnToInbox?: (taskId: string) => void
  lowEnergyMode: boolean
  onToggleLowEnergyMode?: () => void
  plannedEnergy?: number
  maxEnergy?: number
  isSimulatedOnPc?: boolean
  onOpenSync?: () => void
  syncStatus?: 'disconnected' | 'connecting' | 'connected' | 'error'
  controlledTab?: MobileTab
  onTabChange?: (tab: MobileTab) => void
}

export function MobileFrame({
  tasks,
  currentFocusTask,
  onAddTask,
  onAssignWeight,
  onDeleteTask,
  onToggleComplete,
  onCompleteTask,
  onPostponeOneHour,
  onSetHour,
  onReturnToInbox,
  lowEnergyMode,
  onToggleLowEnergyMode,
  plannedEnergy = 0,
  maxEnergy = 15,
  isSimulatedOnPc = false,
  onOpenSync,
  syncStatus = 'disconnected',
  controlledTab,
  onTabChange,
}: MobileFrameProps) {
  const [internalTab, setInternalTab] = useState<MobileTab>('focus')
  const activeTab = controlledTab ?? internalTab
  const setActiveTab = onTabChange ?? setInternalTab

  const inboxCount = tasks.filter((t) => t.status === 'inbox').length

  const renderContent = () => {
    switch (activeTab) {
      case 'focus':
        return (
          <FocusTerminalTab
            task={currentFocusTask}
            onComplete={onCompleteTask}
            onPostponeOneHour={onPostponeOneHour}
            onReturnToInbox={onReturnToInbox}
            onGoToDump={() => setActiveTab('dump')}
          />
        )
      case 'dump':
        return (
          <QuickDumpTab
            tasks={tasks}
            onAddTask={onAddTask}
            onAssignWeight={onAssignWeight}
            onDeleteTask={onDeleteTask}
            lowEnergyMode={lowEnergyMode}
          />
        )
      case 'timeline':
        return (
          <DayTimelineTab
            tasks={tasks}
            onToggleComplete={onToggleComplete}
            onSetHour={onSetHour}
            onReturnToInbox={onReturnToInbox}
          />
        )
    }
  }

  const phoneScreen = (
    <div className="flex flex-col h-full bg-[#0C0E14] text-slate-100 select-none overflow-hidden relative">
      {/* Clean Mobile Brand & Energy Bar */}
      <div className="px-5 pt-3.5 pb-2.5 flex items-center justify-between text-xs shrink-0 bg-[#0C0E14] border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <img src="/orb-crystal.png" alt="irada" className="w-full h-full object-contain select-none pointer-events-none" />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-light tracking-wide text-white text-sm">
              irada
            </span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">
              <span className="font-semibold text-white">{plannedEnergy}</span>
              <span className="text-slate-600">/</span>
              <span>{maxEnergy}⚡</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Soundscapes quick toggle */}
          <button
            onClick={() => soundscapes.toggle()}
            className="p-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Эмбиент-звуки"
          >
            <Headphones className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {onOpenSync && (
            <button
              onClick={onOpenSync}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                syncStatus === 'connected'
                  ? 'text-teal-300 border-teal-500/40 bg-teal-950/40 shadow-[0_0_8px_rgba(45,212,191,0.2)]'
                  : syncStatus === 'connecting'
                  ? 'text-amber-300 border-amber-500/40 bg-amber-950/40 animate-pulse'
                  : 'text-slate-400 border-white/[0.08] bg-white/[0.04] hover:text-white'
              }`}
              title="Синхронизация"
            >
              <Cloud className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleLowEnergyMode && (
            <button
              onClick={onToggleLowEnergyMode}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                lowEnergyMode
                  ? 'text-purple-200 bg-purple-950/50 border border-purple-500/50 font-semibold shadow-[0_0_12px_rgba(192,132,252,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] bg-white/[0.03]'
              }`}
              title="Режим «Нет сил»: 6⚡"
            >
              <span>🪫</span>
              <span>{lowEnergyMode ? '6⚡' : 'Нет сил?'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Screen Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {renderContent()}
      </div>

      {/* Bottom Tab Bar (3 Tabs) in matching uniform background */}
      <nav className="border-t border-white/[0.04] bg-[#0C0E14] px-4 py-2 shrink-0">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          {/* Tab 1: Сейчас (Focus Terminal) */}
          <button
            onClick={() => setActiveTab('focus')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-full transition-all cursor-pointer ${
              activeTab === 'focus'
                ? 'bg-cyan-950/40 border border-cyan-400/40 text-cyan-300 font-semibold shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Target className="w-4.5 h-4.5" />
              {currentFocusTask && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">Сейчас</span>
          </button>

          {/* Tab 2: Быстрый сброс (+) */}
          <button
            onClick={() => setActiveTab('dump')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-full transition-all cursor-pointer ${
              activeTab === 'dump'
                ? 'bg-cyan-950/40 border border-cyan-400/40 text-cyan-300 font-semibold shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <PlusCircle className="w-4.5 h-4.5" />
              {inboxCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 text-[8px] font-mono rounded-full bg-purple-500 text-white">
                  {inboxCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Сброс (+)</span>
          </button>

          {/* Tab 3: Лента дня */}
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-full transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-cyan-950/40 border border-cyan-400/40 text-cyan-300 font-semibold shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-4.5 h-4.5" />
            <span className="text-[10px] tracking-tight">Лента дня</span>
          </button>
        </div>

        {/* Simulated Home Bar Indicator */}
        <div className="w-32 h-1 bg-white/10 rounded-full mx-auto mt-2" />
      </nav>
    </div>
  )

  if (isSimulatedOnPc) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Realistic Smartphone Frame Mockup with elegant dark titanium bezel */}
        <div className="relative w-full max-w-[400px] h-[780px] max-h-[calc(100vh-6rem)] rounded-[50px] p-3 bg-gradient-to-b from-[#22252E] via-[#161820] to-[#0C0E14] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-cyan-500/20">
          <div className="w-full h-full rounded-[40px] overflow-hidden border border-white/10 bg-[#0C0E14] flex flex-col">
            {phoneScreen}
          </div>
        </div>
      </div>
    )
  }

  // Full-screen on mobile
  return (
    <div className="w-full h-dvh max-w-md mx-auto flex flex-col bg-[#0C0E14]">
      {phoneScreen}
    </div>
  )
}
