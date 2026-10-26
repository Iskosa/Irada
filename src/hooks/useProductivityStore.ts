import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Task, TaskWeight, ToastMessage } from '../types'
import { WEIGHT_CONFIG } from '../types'
import { playChime } from '../utils/audio'
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  getSupabaseClient,
  fetchRemoteTasks,
  upsertRemoteTask,
  deleteRemoteTask,
  uploadAllTasks,
  fetchRemoteAppState,
  upsertRemoteAppState,
  type SupabaseConfig,
} from '../services/supabase'

const STORAGE_KEYS = {
  TASKS: 'irada_tasks_v1',
  LOW_ENERGY: 'irada_low_energy_v1',
  SCRATCHPAD: 'irada_scratchpad_v1',
  VIEW_MODE: 'irada_view_mode_v1',
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'seed-1',
    title: '🚀 Спроектировать архитектуру и ключевой флоу релиза',
    weight: 'boss',
    status: 'planned',
    scheduledHour: 10,
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'seed-2',
    title: '⚡ Провести глубокое код-ревью компонентов таймбоксинга',
    weight: 'medium',
    status: 'planned',
    scheduledHour: 13,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'seed-3',
    title: '⚡ Синхронизировать задачи спринта с командой',
    weight: 'medium',
    status: 'planned',
    scheduledHour: 15,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'seed-4',
    title: '🪶 Ответить на приоритетные сообщения и письма',
    weight: 'small',
    status: 'planned',
    scheduledHour: 9,
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'seed-5',
    title: '🪶 Обновить зависимости и проверить сборку Vite',
    weight: 'small',
    status: 'planned',
    scheduledHour: 17,
    createdAt: Date.now() - 900000,
  },
  {
    id: 'seed-6',
    title: 'Заказать новый эргономичный коврик для мыши',
    weight: 'unassigned',
    status: 'inbox',
    scheduledHour: null,
    createdAt: Date.now() - 600000,
  },
  {
    id: 'seed-7',
    title: 'Посмотреть доклад про архитектуру Linear и оффлайн-персистентность',
    weight: 'unassigned',
    status: 'inbox',
    scheduledHour: null,
    createdAt: Date.now() - 300000,
  },
]

export function useProductivityStore() {
  // 1. Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to parse saved tasks:', e)
    }
    return INITIAL_TASKS
  })

  // 2. Low energy mode state
  const [lowEnergyMode, setLowEnergyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LOW_ENERGY) === 'true'
    } catch {
      return false
    }
  })

  // 3. Scratchpad state
  const [scratchpadText, setScratchpadText] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEYS.SCRATCHPAD) ||
        '# Быстрые заметки штаба\n- Приоритет №1: запустить терминал фокуса\n- Не распылять внимание на второстепенное\n- Делать перерывы каждые 25 минут'
      )
    } catch {
      return ''
    }
  })

  // 4. Supabase state
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(() =>
    getSavedSupabaseConfig()
  )
  const [syncStatus, setSyncStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >(() => (getSavedSupabaseConfig().enabled ? 'connecting' : 'disconnected'))
  const [isSyncing, setIsSyncing] = useState(false)

  // 5. Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // 6. Local sync state
  const [localSyncStatus, setLocalSyncStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('connecting')

  // References to keep latest state for callbacks and async operations
  const tasksRef = useRef<Task[]>(tasks)
  const lowEnergyModeRef = useRef<boolean>(lowEnergyMode)
  const scratchpadRef = useRef<string>(scratchpadText)
  const configRef = useRef<SupabaseConfig>(supabaseConfig)
  const scratchpadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isIncomingSyncRef = useRef<boolean>(false)

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    lowEnergyModeRef.current = lowEnergyMode
  }, [lowEnergyMode])

  useEffect(() => {
    scratchpadRef.current = scratchpadText
  }, [scratchpadText])

  useEffect(() => {
    configRef.current = supabaseConfig
  }, [supabaseConfig])

  // Local storage persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    } catch (e) {
      console.error('Failed to save tasks:', e)
    }
  }, [tasks])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOW_ENERGY, String(lowEnergyMode))
    } catch (e) {
      console.error('Failed to save lowEnergyMode:', e)
    }
  }, [lowEnergyMode])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCRATCHPAD, scratchpadText)
    } catch (e) {
      console.error('Failed to save scratchpad:', e)
    }
  }, [scratchpadText])

  // Toast actions
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Local sync listener & polling
  useEffect(() => {
    let active = true

    const fetchLocalSync = async () => {
      try {
        const res = await fetch('/api/sync')
        if (!res.ok) {
          if (active) setLocalSyncStatus('disconnected')
          return
        }
        const data = await res.json()
        if (!active) return

        if (Array.isArray(data.tasks)) {
          const currentJson = JSON.stringify(tasksRef.current)
          const newJson = JSON.stringify(data.tasks)
          if (currentJson !== newJson) {
            isIncomingSyncRef.current = true
            setTasks(data.tasks)
            if (data.appState) {
              if (typeof data.appState.lowEnergyMode === 'boolean') {
                setLowEnergyMode(data.appState.lowEnergyMode)
              }
              if (typeof data.appState.scratchpadText === 'string') {
                setScratchpadText(data.appState.scratchpadText)
              }
            }
            setTimeout(() => {
              isIncomingSyncRef.current = false
            }, 100)
          }
          if (active) setLocalSyncStatus('connected')
        } else {
          // Initialize server store with current state
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tasks: tasksRef.current,
              appState: {
                lowEnergyMode: lowEnergyModeRef.current,
                scratchpadText: scratchpadRef.current,
              },
              updatedAt: Date.now(),
            }),
          })
          if (active) setLocalSyncStatus('connected')
        }
      } catch {
        if (active) setLocalSyncStatus('disconnected')
      }
    }

    fetchLocalSync()

    // 1. Vite HMR WebSocket listener (0ms push from server)
    const hot = (import.meta as any).hot
    if (hot) {
      const handleSyncUpdate = (data: any) => {
        if (!data || !Array.isArray(data.tasks)) return
        const currentJson = JSON.stringify(tasksRef.current)
        const newJson = JSON.stringify(data.tasks)
        if (currentJson !== newJson) {
          isIncomingSyncRef.current = true
          setTasks(data.tasks)
          if (data.appState) {
            if (typeof data.appState.lowEnergyMode === 'boolean') {
              setLowEnergyMode(data.appState.lowEnergyMode)
            }
            if (typeof data.appState.scratchpadText === 'string') {
              setScratchpadText(data.appState.scratchpadText)
            }
          }
          setTimeout(() => {
            isIncomingSyncRef.current = false
          }, 100)
        }
        setLocalSyncStatus('connected')
      }

      hot.on('irada:sync-update', handleSyncUpdate)
    }

    // 2. Fallback polling for phones/browsers every 3 seconds
    const interval = setInterval(fetchLocalSync, 3000)
    const onFocus = () => fetchLocalSync()
    window.addEventListener('focus', onFocus)

    return () => {
      active = false
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // Push local updates to local server (debounced)
  useEffect(() => {
    if (isIncomingSyncRef.current) return

    const timer = setTimeout(async () => {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks,
            appState: {
              lowEnergyMode,
              scratchpadText,
            },
            updatedAt: Date.now(),
          }),
        })
      } catch {
        // Dev server not reachable
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [tasks, lowEnergyMode, scratchpadText])

  // 6. Supabase Realtime synchronization effect
  useEffect(() => {
    if (!supabaseConfig.enabled || !supabaseConfig.url || !supabaseConfig.anonKey) {
      setSyncStatus('disconnected')
      return
    }

    setSyncStatus('connecting')
    let isCancelled = false

    const runInitialSync = async () => {
      try {
        const [remoteTasks, remoteState] = await Promise.all([
          fetchRemoteTasks(supabaseConfig),
          fetchRemoteAppState(supabaseConfig),
        ])

        if (isCancelled) return

        if (remoteTasks !== null) {
          if (remoteTasks.length === 0 && tasksRef.current.length > 0) {
            // First time setup on this sync key: upload local tasks
            await uploadAllTasks(tasksRef.current, supabaseConfig)
            await upsertRemoteAppState(
              lowEnergyModeRef.current,
              scratchpadRef.current,
              supabaseConfig
            )
          } else if (remoteTasks.length > 0) {
            setTasks(remoteTasks)
          }
        }

        if (remoteState && !isCancelled) {
          setLowEnergyMode(remoteState.lowEnergyMode)
          setScratchpadText(remoteState.scratchpad)
        }

        setSyncStatus('connected')
      } catch (err) {
        console.error('Initial sync error:', err)
        if (!isCancelled) {
          setSyncStatus('error')
        }
      }
    }

    runInitialSync()

    const client = getSupabaseClient(supabaseConfig)
    if (!client) return

    const channelName = `irada_realtime_${supabaseConfig.syncKey}`
    const channel = client
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'irada_tasks',
          filter: `sync_key=eq.${supabaseConfig.syncKey}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new as any
            if (!row || !row.id) return
            const remoteTask: Task = {
              id: row.id,
              title: row.title,
              weight: row.weight,
              status: row.status,
              scheduledHour: row.scheduled_hour,
              createdAt: Number(row.created_at),
            }
            setTasks((prev) => {
              const idx = prev.findIndex((t) => t.id === remoteTask.id)
              if (idx >= 0) {
                const next = [...prev]
                next[idx] = remoteTask
                return next
              }
              return [remoteTask, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any
            if (oldRow?.id) {
              setTasks((prev) => prev.filter((t) => t.id !== oldRow.id))
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'irada_app_state',
          filter: `sync_key=eq.${supabaseConfig.syncKey}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new as any
            if (!row) return
            if (typeof row.low_energy_mode === 'boolean') {
              setLowEnergyMode(row.low_energy_mode)
            }
            if (typeof row.scratchpad === 'string') {
              setScratchpadText(row.scratchpad)
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSyncStatus('connected')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSyncStatus('error')
        }
      })

    return () => {
      isCancelled = true
      client.removeChannel(channel)
    }
  }, [supabaseConfig])

  // Scratchpad with debounced remote push
  const handleScratchpadChange = useCallback((text: string) => {
    setScratchpadText(text)
    if (configRef.current.enabled) {
      if (scratchpadDebounceRef.current) {
        clearTimeout(scratchpadDebounceRef.current)
      }
      scratchpadDebounceRef.current = setTimeout(() => {
        upsertRemoteAppState(lowEnergyModeRef.current, text, configRef.current)
      }, 1000)
    }
  }, [])

  // Supabase manual actions
  const setSupabaseConfig = useCallback(
    (cfg: SupabaseConfig) => {
      saveSupabaseConfig(cfg)
      setSupabaseConfigState(cfg)
      addToast({
        title: cfg.enabled ? 'Настройки Supabase сохранены' : 'Синхронизация отключена',
        description: cfg.enabled ? `Комната синхронизации: ${cfg.syncKey}` : 'Работа в оффлайн-режиме',
        type: 'info',
      })
    },
    [addToast]
  )

  const manualSyncPush = useCallback(async () => {
    setIsSyncing(true)
    try {
      const ok1 = await uploadAllTasks(tasksRef.current, configRef.current)
      const ok2 = await upsertRemoteAppState(
        lowEnergyModeRef.current,
        scratchpadRef.current,
        configRef.current
      )
      if (ok1 && ok2) {
        addToast({
          title: 'Синхронизация завершена ☁️',
          description: 'Все задачи и заметки успешно отправлены в Supabase.',
          type: 'success',
        })
      } else {
        addToast({
          title: 'Ошибка отправки данных',
          description: 'Проверьте соединение с Supabase и правильность URL/Ключа.',
          type: 'error',
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }, [addToast])

  const manualSyncPull = useCallback(async () => {
    setIsSyncing(true)
    try {
      const [remoteTasks, remoteState] = await Promise.all([
        fetchRemoteTasks(configRef.current),
        fetchRemoteAppState(configRef.current),
      ])

      if (remoteTasks !== null) {
        setTasks(remoteTasks)
      }
      if (remoteState) {
        setLowEnergyMode(remoteState.lowEnergyMode)
        setScratchpadText(remoteState.scratchpad)
      }
      addToast({
        title: 'Данные обновлены 📥',
        description: 'Успешно загружены актуальные задачи из Supabase.',
        type: 'success',
      })
    } catch (e) {
      console.error(e)
      addToast({
        title: 'Ошибка загрузки данных',
        description: 'Не удалось получить данные из облака.',
        type: 'error',
      })
    } finally {
      setIsSyncing(false)
    }
  }, [addToast])

  // Energy & Limits calculations (low energy mode strictly limits to 6⚡)
  const maxEnergy = lowEnergyMode ? 6 : 15

  const slotCounts = useMemo(() => {
    const plannedTasks = tasks.filter((t) => t.status === 'planned')
    return {
      boss: lowEnergyMode ? 0 : plannedTasks.filter((t) => t.weight === 'boss').length,
      medium: plannedTasks.filter((t) => t.weight === 'medium').length,
      small: plannedTasks.filter((t) => t.weight === 'small').length,
    }
  }, [tasks, lowEnergyMode])

  const plannedEnergy = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'planned' && (!lowEnergyMode || t.weight !== 'boss'))
      .reduce((acc, t) => acc + (WEIGHT_CONFIG[t.weight]?.energy || 0), 0)
  }, [tasks, lowEnergyMode])

  const completedEnergy = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'completed' && (!lowEnergyMode || t.weight !== 'boss'))
      .reduce((acc, t) => acc + (WEIGHT_CONFIG[t.weight]?.energy || 0), 0)
  }, [tasks, lowEnergyMode])

  const totalEnergy = plannedEnergy + completedEnergy
  const isOverloaded = plannedEnergy > maxEnergy

  // Core Actions
  const addTaskToInbox = useCallback(
    (title: string): boolean => {
      const trimmed = title.trim()
      if (!trimmed) return false

      const newTask: Task = {
        id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title: trimmed,
        weight: 'unassigned',
        status: 'inbox',
        scheduledHour: null,
        createdAt: Date.now(),
      }

      setTasks((prev) => [newTask, ...prev])
      playChime('click')
      addToast({
        title: 'Задача в Инбоксе',
        description: `«${trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed}»`,
        type: 'info',
      })

      if (configRef.current.enabled) {
        upsertRemoteTask(newTask, configRef.current)
      }
      return true
    },
    [addToast]
  )

  const assignWeightAndPlan = useCallback(
    (taskId: string, targetWeight: TaskWeight): boolean => {
      if (targetWeight === 'unassigned') {
        return false
      }

      if (lowEnergyMode && targetWeight === 'boss') {
        addToast({
          title: 'Режим «Нет сил» активен',
          description:
            'Задачи уровня «Главный Босс» заблокированы. Сконцентрируйтесь на средних и мелких делах.',
          type: 'warning',
        })
        return false
      }

      const task = tasks.find((t) => t.id === taskId)
      if (!task) return false

      if (task.status === 'planned' && task.weight === targetWeight) {
        return true
      }

      const currentInSlot = tasks.filter(
        (t) => t.status === 'planned' && t.weight === targetWeight && t.id !== taskId
      ).length

      const limit = WEIGHT_CONFIG[targetWeight].limit

      if (currentInSlot >= limit) {
        addToast({
          title: `Слот «${WEIGHT_CONFIG[targetWeight].label}» полон!`,
          description: `Максимум ${limit} по правилу 1-3-5. Завершите или переместите имеющуюся задачу.`,
          type: 'error',
        })
        return false
      }

      const updatedTask: Task = {
        ...task,
        weight: targetWeight,
        status: 'planned',
      }

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      playChime('click')
      addToast({
        title: `План 1-3-5 обновлен`,
        description: `«${
          task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title
        }» добавлена в слот ${WEIGHT_CONFIG[targetWeight].label}`,
        type: 'success',
      })

      if (configRef.current.enabled) {
        upsertRemoteTask(updatedTask, configRef.current)
      }
      return true
    },
    [lowEnergyMode, tasks, addToast]
  )

  const returnToInbox = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const updatedTask: Task = {
        ...task,
        status: 'inbox',
        weight: 'unassigned',
        scheduledHour: null,
      }

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      playChime('click')
      addToast({
        title: 'Возвращено в Инбокс',
        type: 'info',
      })

      if (configRef.current.enabled) {
        upsertRemoteTask(updatedTask, configRef.current)
      }
    },
    [tasks, addToast]
  )

  const toggleTaskComplete = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const nextStatus =
        task.status === 'completed'
          ? task.weight === 'unassigned'
            ? 'inbox'
            : 'planned'
          : 'completed'

      if (nextStatus === 'completed') {
        playChime('complete')
      } else {
        playChime('click')
      }

      const updatedTask: Task = { ...task, status: nextStatus }
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))

      if (configRef.current.enabled) {
        upsertRemoteTask(updatedTask, configRef.current)
      }
    },
    [tasks]
  )

  const completeTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      playChime('complete')
      const updatedTask: Task = { ...task, status: 'completed' }
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))

      addToast({
        title: 'Задача выполнена! 🎉',
        description: 'Отличный фокус! Энергия сохранена.',
        type: 'success',
      })

      if (configRef.current.enabled) {
        upsertRemoteTask(updatedTask, configRef.current)
      }
    },
    [tasks, addToast]
  )

  const setTaskScheduledHour = useCallback(
    (taskId: string, hour: number | null) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      // If task is currently in inbox and being scheduled directly to an hour:
      if (task.status === 'inbox' && hour !== null) {
        const plannedSmall = tasks.filter(
          (t) => t.status === 'planned' && t.weight === 'small'
        ).length
        const plannedMed = tasks.filter(
          (t) => t.status === 'planned' && t.weight === 'medium'
        ).length

        let targetWeight: TaskWeight = 'small'
        if (plannedSmall < 5) {
          targetWeight = 'small'
        } else if (plannedMed < 3) {
          targetWeight = 'medium'
        } else {
          addToast({
            title: 'Слоты плана 1-3-5 заполнены!',
            description: 'Освободите слот в плане, чтобы перетащить задачу в расписание.',
            type: 'error',
          })
          return
        }

        const updatedTask: Task = {
          ...task,
          status: 'planned',
          weight: targetWeight,
          scheduledHour: hour,
        }

        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
        playChime('click')
        addToast({
          title: `Запланировано на ${String(hour).padStart(2, '0')}:00 ⏱️`,
          description: `«${
            task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title
          }» добавлена в план (${WEIGHT_CONFIG[targetWeight].label})`,
          type: 'success',
        })

        if (configRef.current.enabled) {
          upsertRemoteTask(updatedTask, configRef.current)
        }
        return
      }

      const updatedTask: Task = {
        ...task,
        scheduledHour: hour,
      }

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      playChime('click')
      if (hour !== null) {
        addToast({
          title: `Запланировано на ${String(hour).padStart(2, '0')}:00 ⏱️`,
          description: `«${
            task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title
          }»`,
          type: 'success',
        })
      } else {
        addToast({
          title: 'Отвязано от времени',
          type: 'info',
        })
      }

      if (configRef.current.enabled) {
        upsertRemoteTask(updatedTask, configRef.current)
      }
    },
    [tasks, addToast]
  )

  const assignToNextAvailableHour = useCallback(
    (taskId: string) => {
      const nowHour = new Date().getHours()
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const occupiedHours = new Set(
        tasks
          .filter((t) => t.scheduledHour !== null && t.id !== taskId)
          .map((t) => t.scheduledHour!)
      )

      let candidateHour: number | null = null
      const startHour = Math.max(8, Math.min(22, nowHour))
      for (let h = startHour; h <= 22; h++) {
        if (!occupiedHours.has(h)) {
          candidateHour = h
          break
        }
      }

      if (candidateHour === null) {
        for (let h = 8; h < startHour; h++) {
          if (!occupiedHours.has(h)) {
            candidateHour = h
            break
          }
        }
      }

      if (candidateHour === null) {
        candidateHour = startHour
      }

      setTaskScheduledHour(taskId, candidateHour)
    },
    [tasks, setTaskScheduledHour]
  )

  const postponeTaskOneHour = useCallback(
    (taskId: string) => {
      const nowHour = new Date().getHours()
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      let targetHour = task.scheduledHour
        ? task.scheduledHour + 1
        : Math.max(8, Math.min(22, nowHour + 1))
      if (targetHour > 22) {
        targetHour = 22
      }

      const updatedTask: Task = {
        ...task,
        scheduledHour: targetHour,
      }

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      playChime('click')
      addToast({
        title: `Перенесено на ${String(targetHour).padStart(2, '0')}:00 ⏳`,
        type: 'info',
      })

      if (configRef.current.enabled) {
        upsertRemoteTask(updatedTask, configRef.current)
      }
    },
    [tasks, addToast]
  )

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    playChime('click')
    if (configRef.current.enabled) {
      deleteRemoteTask(taskId, configRef.current)
    }
  }, [])

  const updateTaskTitle = useCallback(
    (taskId: string, title: string) => {
      const trimmed = title.trim()
      if (!trimmed) return
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const updatedTask: Task = { ...task, title: trimmed }
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))

      if (configRef.current.enabled) {
        upsertRemoteTask(updatedTask, configRef.current)
      }
    },
    [tasks]
  )

  const toggleLowEnergyMode = useCallback(() => {
    setLowEnergyMode((prev) => {
      const next = !prev
      playChime('click')
      addToast({
        title: next ? 'Режим «Нет сил» ВКЛ 🪫' : 'Обычный режим энергии ⚡',
        description: next
          ? 'Лимит 6 энергии, фокус на быстрых делах, Главный Босс скрыт.'
          : 'Лимит 15 энергии, разблокированы все слоты 1-3-5.',
        type: next ? 'warning' : 'info',
      })
      if (configRef.current.enabled) {
        upsertRemoteAppState(next, scratchpadRef.current, configRef.current)
      }
      return next
    })
  }, [addToast])

  const clearCompletedTasks = useCallback(() => {
    const completed = tasks.filter((t) => t.status === 'completed')
    setTasks((prev) => prev.filter((t) => t.status !== 'completed'))
    playChime('click')
    addToast({
      title: 'Выполненные задачи очищены',
      type: 'info',
    })
    if (configRef.current.enabled) {
      completed.forEach((t) => deleteRemoteTask(t.id, configRef.current))
    }
  }, [tasks, addToast])

  // Get single active task for Phone "Сейчас" terminal
  const currentFocusTask = useMemo(() => {
    const currentHour = new Date().getHours()

    // 1. Task scheduled for current hour and not completed (exclude boss if low energy)
    const currentHourTask = tasks.find(
      (t) =>
        t.status === 'planned' &&
        t.scheduledHour === currentHour &&
        (!lowEnergyMode || t.weight !== 'boss')
    )
    if (currentHourTask) return currentHourTask

    // 2. Otherwise: first uncompleted planned task prioritized by weight (medium -> small if low energy)
    const plannedUncompleted = tasks.filter(
      (t) => t.status === 'planned' && (!lowEnergyMode || t.weight !== 'boss')
    )
    const boss = plannedUncompleted.find((t) => t.weight === 'boss')
    if (boss && !lowEnergyMode) return boss

    const medium = plannedUncompleted.find((t) => t.weight === 'medium')
    if (medium) return medium

    const small = plannedUncompleted.find((t) => t.weight === 'small')
    if (small) return small

    return null
  }, [tasks, lowEnergyMode])

  const effectiveSyncStatus = supabaseConfig.enabled ? syncStatus : localSyncStatus

  return {
    tasks,
    lowEnergyMode,
    toggleLowEnergyMode,
    scratchpadText,
    setScratchpadText: handleScratchpadChange,
    toasts,
    addToast,
    removeToast,
    // Sync
    supabaseConfig,
    setSupabaseConfig,
    syncStatus: effectiveSyncStatus,
    localSyncStatus,
    isSyncing,
    manualSyncPush,
    manualSyncPull,
    // Metrics
    maxEnergy,
    plannedEnergy,
    completedEnergy,
    totalEnergy,
    isOverloaded,
    slotCounts,
    // Actions
    addTaskToInbox,
    assignWeightAndPlan,
    returnToInbox,
    toggleTaskComplete,
    completeTask,
    setTaskScheduledHour,
    assignToNextAvailableHour,
    postponeTaskOneHour,
    deleteTask,
    updateTaskTitle,
    clearCompletedTasks,
    currentFocusTask,
  }
}
