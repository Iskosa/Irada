import { useState, type RefObject } from 'react'
import type { Task, TaskWeight } from '../../types'
import { InboxColumn } from './InboxColumn'
import { PlanColumn } from './PlanColumn'
import { TimeboxColumn } from './TimeboxColumn'
import { DesktopFocusView } from './DesktopFocusView'
import { Target } from 'lucide-react'

interface PcDashboardProps {
  tasks: Task[]
  onAddTask: (title: string) => boolean
  onAssignWeight: (taskId: string, weight: TaskWeight) => boolean
  onDeleteTask: (taskId: string) => void
  lowEnergyMode: boolean
  onToggleLowEnergyMode: () => void
  scratchpadText: string
  onScratchpadChange: (text: string) => void
  plannedEnergy: number
  maxEnergy: number
  isOverloaded: boolean
  slotCounts: { boss: number; medium: number; small: number }
  onToggleComplete: (taskId: string) => void
  onReturnToInbox: (taskId: string) => void
  onSetHour: (taskId: string, hour: number | null) => void
  onAssignNextAvailableHour?: (taskId: string) => void
  inboxInputRef: RefObject<HTMLInputElement | null>
  currentFocusTask?: Task | null
  onCompleteTask?: (taskId: string) => void
  onPostponeOneHour?: (taskId: string) => void
}

export function PcDashboard({
  tasks,
  onAddTask,
  onAssignWeight,
  onDeleteTask,
  lowEnergyMode,
  onToggleLowEnergyMode,
  scratchpadText,
  onScratchpadChange,
  plannedEnergy,
  maxEnergy,
  isOverloaded,
  slotCounts,
  onToggleComplete,
  onReturnToInbox,
  onSetHour,
  onAssignNextAvailableHour,
  inboxInputRef,
  currentFocusTask = null,
  onCompleteTask = () => {},
  onPostponeOneHour = () => {},
}: PcDashboardProps) {
  const [pcSubView, setPcSubView] = useState<'columns' | 'focus'>('columns')

  if (pcSubView === 'focus') {
    return (
      <DesktopFocusView
        tasks={tasks}
        currentFocusTask={currentFocusTask}
        onCompleteTask={onCompleteTask}
        onPostponeOneHour={onPostponeOneHour}
        onToggleComplete={onToggleComplete}
        onSwitchToColumns={() => setPcSubView('columns')}
      />
    )
  }

  return (
    <main className="flex-1 w-full p-4 lg:p-6 overflow-hidden max-w-[1720px] mx-auto flex flex-col gap-3">
      {/* Top Quick Bar: Toggle between 3 Columns and Focus Hero Screen */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Штаб планирования (3 колонки)</span>
        </div>

        <button
          onClick={() => setPcSubView('focus')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition-all cursor-pointer shadow-sm hover:border-cyan-400/40"
        >
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span>Открыть большой экран фокуса (Orb 25:00) ➔</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-[500px]">
        {/* Column 1: Inbox + Scratchpad */}
        <div className="lg:col-span-4 h-[calc(100vh-7.5rem)] min-h-[500px]">
          <InboxColumn
            ref={inboxInputRef}
            tasks={tasks}
            onAddTask={onAddTask}
            onAssignWeight={onAssignWeight}
            onDeleteTask={onDeleteTask}
            onReturnToInbox={onReturnToInbox}
            lowEnergyMode={lowEnergyMode}
            scratchpadText={scratchpadText}
            onScratchpadChange={onScratchpadChange}
          />
        </div>

        {/* Column 2: 1-3-5 Plan & Energy */}
        <div className="lg:col-span-4 h-[calc(100vh-7.5rem)] min-h-[500px]">
          <PlanColumn
            tasks={tasks}
            lowEnergyMode={lowEnergyMode}
            onToggleLowEnergyMode={onToggleLowEnergyMode}
            plannedEnergy={plannedEnergy}
            maxEnergy={maxEnergy}
            isOverloaded={isOverloaded}
            slotCounts={slotCounts}
            onToggleComplete={onToggleComplete}
            onReturnToInbox={onReturnToInbox}
            onSetHour={onSetHour}
            onAssignNextAvailableHour={onAssignNextAvailableHour}
            onDeleteTask={onDeleteTask}
          />
        </div>

        {/* Column 3: Timeboxing Grid */}
        <div className="lg:col-span-4 h-[calc(100vh-7.5rem)] min-h-[500px]">
          <TimeboxColumn
            tasks={tasks}
            onSetHour={onSetHour}
            onToggleComplete={onToggleComplete}
          />
        </div>
      </div>
    </main>
  )
}
