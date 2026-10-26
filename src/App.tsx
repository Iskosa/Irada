import { useState, useEffect, useRef } from 'react'
import type { ViewMode, MobileTab, Task } from './types'
import { useProductivityStore } from './hooks/useProductivityStore'
import { useWindowSize } from './hooks/useWindowSize'
import { useTimeboxReminders } from './hooks/useTimeboxReminders'
import { Header } from './components/Header'
import { PcDashboard } from './components/pc/PcDashboard'
import { MobileFrame } from './components/mobile/MobileFrame'
import { ToastContainer } from './components/Toast'
import { SyncModal } from './components/SyncModal'
import { AtmosphericBackground } from './components/AtmosphericBackground'
import { TaskReminderModal } from './components/TaskReminderModal'

export default function App() {
  const store = useProductivityStore()
  const reminders = useTimeboxReminders(store.tasks)
  const { isMobile } = useWindowSize()

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('focus')

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('irada_view_mode_v1')
      if (saved === 'auto' || saved === 'pc' || saved === 'phone') {
        return saved
      }
    } catch {
      // ignore
    }
    return 'auto'
  })

  const inboxInputRef = useRef<HTMLInputElement | null>(null)

  // Persist view mode
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    try {
      localStorage.setItem('irada_view_mode_v1', mode)
    } catch {
      // ignore
    }
  }

  // Determine whether to display the phone view
  const isPhoneView =
    viewMode === 'phone' || (viewMode === 'auto' && isMobile)

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (inboxInputRef.current) {
          inboxInputRef.current.focus()
          inboxInputRef.current.select()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // When user clicks "Взять в фокус" from reminder modal
  const handleFocusFromReminder = (_task: Task) => {
    if (isPhoneView) {
      setMobileTab('focus')
    }
  }

  const completedCount = store.tasks.filter((t) => t.status === 'completed').length

  return (
    <div className="min-h-screen bg-[#0B0D13] text-[#F1F5F9] flex flex-col font-sans selection:bg-[#38BDF8]/20 selection:text-[#38BDF8] relative">
      <AtmosphericBackground />

      {/* Top Header: rendered on PC, completely hidden on real mobile phone */}
      {!isMobile && (
        <Header
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          lowEnergyMode={store.lowEnergyMode}
          onToggleLowEnergyMode={store.toggleLowEnergyMode}
          plannedEnergy={store.plannedEnergy}
          maxEnergy={store.maxEnergy}
          isOverloaded={store.isOverloaded}
          onClearCompleted={store.clearCompletedTasks}
          completedCount={completedCount}
          onOpenSync={() => setIsSyncModalOpen(true)}
          syncStatus={store.syncStatus}
          showModeSwitcher={!isPhoneView}
          onTriggerTestReminder={reminders.triggerTestReminder}
        />
      )}

      {/* Main Workspace: PC 3-Column HQ or Mobile Focus Terminal */}
      {isPhoneView ? (
        <MobileFrame
          tasks={store.tasks}
          currentFocusTask={store.currentFocusTask}
          onAddTask={store.addTaskToInbox}
          onAssignWeight={store.assignWeightAndPlan}
          onDeleteTask={store.deleteTask}
          onToggleComplete={store.toggleTaskComplete}
          onCompleteTask={store.completeTask}
          onPostponeOneHour={store.postponeTaskOneHour}
          onSetHour={store.setTaskScheduledHour}
          onReturnToInbox={store.returnToInbox}
          lowEnergyMode={store.lowEnergyMode}
          onToggleLowEnergyMode={store.toggleLowEnergyMode}
          plannedEnergy={store.plannedEnergy}
          maxEnergy={store.maxEnergy}
          isSimulatedOnPc={!isMobile}
          onOpenSync={() => setIsSyncModalOpen(true)}
          syncStatus={store.syncStatus}
          controlledTab={mobileTab}
          onTabChange={setMobileTab}
        />
      ) : (
        <PcDashboard
          tasks={store.tasks}
          onAddTask={store.addTaskToInbox}
          onAssignWeight={store.assignWeightAndPlan}
          onDeleteTask={store.deleteTask}
          lowEnergyMode={store.lowEnergyMode}
          onToggleLowEnergyMode={store.toggleLowEnergyMode}
          scratchpadText={store.scratchpadText}
          onScratchpadChange={store.setScratchpadText}
          plannedEnergy={store.plannedEnergy}
          maxEnergy={store.maxEnergy}
          isOverloaded={store.isOverloaded}
          slotCounts={store.slotCounts}
          onToggleComplete={store.toggleTaskComplete}
          onReturnToInbox={store.returnToInbox}
          onSetHour={store.setTaskScheduledHour}
          onAssignNextAvailableHour={store.assignToNextAvailableHour}
          inboxInputRef={inboxInputRef}
          currentFocusTask={store.currentFocusTask}
          onCompleteTask={store.completeTask}
          onPostponeOneHour={store.postponeTaskOneHour}
        />
      )}

      {/* Hourly Timebox Reminder Alert Modal */}
      <TaskReminderModal
        task={reminders.activeReminderTask}
        onClose={reminders.dismissReminder}
        onFocusTask={handleFocusFromReminder}
        onPostponeOneHour={store.postponeTaskOneHour}
        notificationPermission={reminders.permission}
        onRequestPermission={reminders.requestPermission}
      />

      {/* Cloud Sync Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onConfigSaved={store.setSupabaseConfig}
        onManualSyncPush={store.manualSyncPush}
        onManualSyncPull={store.manualSyncPull}
        syncStatus={store.syncStatus}
      />

      {/* Global Notifications */}
      <ToastContainer toasts={store.toasts} onRemove={store.removeToast} />
    </div>
  )
}
