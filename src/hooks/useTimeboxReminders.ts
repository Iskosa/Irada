import { useState, useEffect, useCallback, useRef } from 'react'
import type { Task } from '../types'
import { playChime } from '../utils/audio'

function getTodayDateStr(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useTimeboxReminders(tasks: Task[]) {
  const [activeReminderTask, setActiveReminderTask] = useState<Task | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission
    }
    return 'denied'
  })

  // Track reminded tasks for today to avoid repeats in the same hour: "YYYY-MM-DD:hour:taskId"
  const remindedSetRef = useRef<Set<string>>(new Set())
  const lastCheckHourRef = useRef<number>(-1)

  // Request browser Notification permission
  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission()
        setPermission(result)
        return result
      } catch (e) {
        console.error('Failed to request notification permission:', e)
      }
    }
    return 'denied'
  }, [])

  // Fire system notification if permitted
  const sendSystemNotification = useCallback((task: Task, hour: number) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const title = `⏱️ Время для задачи: ${task.title}`
        const body = `Начался запланированный час (${String(hour).padStart(2, '0')}:00). Нажмите, чтобы открыть фокус.`
        const notif = new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `irada-task-${task.id}-${hour}`,
        })

        notif.onclick = () => {
          window.focus()
          notif.close()
        }
      } catch (e) {
        console.error('Failed to send browser notification:', e)
      }
    }
  }, [])

  // Check hourly arrival
  const checkHourArrival = useCallback(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const todayStr = getTodayDateStr()

    // Find any planned task scheduled for the current hour
    const scheduledTask = tasks.find(
      (t) => t.status === 'planned' && t.scheduledHour === currentHour
    )

    if (scheduledTask) {
      const reminderKey = `${todayStr}:${currentHour}:${scheduledTask.id}`
      if (!remindedSetRef.current.has(reminderKey)) {
        remindedSetRef.current.add(reminderKey)
        playChime('reminder')
        setActiveReminderTask(scheduledTask)
        sendSystemNotification(scheduledTask, currentHour)
      }
    }

    lastCheckHourRef.current = currentHour
  }, [tasks, sendSystemNotification])

  // Periodic check (every 20 seconds and on tab visibility/focus)
  useEffect(() => {
    checkHourArrival()

    const interval = setInterval(checkHourArrival, 20000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkHourArrival()
      }
    }

    window.addEventListener('focus', checkHourArrival)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', checkHourArrival)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkHourArrival])

  // Manual test reminder function
  const triggerTestReminder = useCallback(() => {
    const currentHour = new Date().getHours()
    const dummyTask: Task = tasks.find((t) => t.status === 'planned') || {
      id: 'test-reminder-task',
      title: '🚀 Спроектировать архитектуру и ключевой флоу релиза',
      weight: 'boss',
      status: 'planned',
      scheduledHour: currentHour,
      createdAt: Date.now(),
    }

    playChime('reminder')
    setActiveReminderTask(dummyTask)
    sendSystemNotification(dummyTask, currentHour)
  }, [tasks, sendSystemNotification])

  const dismissReminder = useCallback(() => {
    setActiveReminderTask(null)
  }, [])

  return {
    activeReminderTask,
    dismissReminder,
    triggerTestReminder,
    permission,
    requestPermission,
  }
}

