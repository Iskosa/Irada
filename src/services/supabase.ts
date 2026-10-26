import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Task, TaskWeight, TaskStatus } from '../types'

export interface SupabaseConfig {
  url: string
  anonKey: string
  syncKey: string
  enabled: boolean
}

const CONFIG_STORAGE_KEY = 'irada_supabase_config_v1'

export function getSavedSupabaseConfig(): SupabaseConfig {
  // 1. Check URL query / hash parameters (instant 1-scan mobile setup from PC)
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

      const sbUrl = urlParams.get('sb_url') || hashParams.get('sb_url')
      const sbKey = urlParams.get('sb_key') || hashParams.get('sb_key')
      const sbRoom = urlParams.get('sb_room') || hashParams.get('sb_room') || 'my-personal-hq'

      if (sbUrl && sbKey) {
        const config: SupabaseConfig = {
          url: decodeURIComponent(sbUrl),
          anonKey: decodeURIComponent(sbKey),
          syncKey: decodeURIComponent(sbRoom),
          enabled: true,
        }
        saveSupabaseConfig(config)
        // Clean URL so keys aren't exposed in browser address bar
        window.history.replaceState(null, '', window.location.pathname)
        return config
      }
    } catch (e) {
      console.error('Failed to parse URL config:', e)
    }
  }

  // 2. Load from localStorage
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        url: parsed.url || '',
        anonKey: parsed.anonKey || '',
        syncKey: parsed.syncKey || 'my-personal-hq',
        enabled: Boolean(parsed.enabled && parsed.url && parsed.anonKey),
      }
    }
  } catch (e) {
    console.error('Failed to load supabase config:', e)
  }

  // Fallback to environment variables if provided
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || ''
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
  return {
    url: envUrl,
    anonKey: envKey,
    syncKey: 'my-personal-hq',
    enabled: Boolean(envUrl && envKey),
  }
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Failed to save supabase config:', e)
  }
}

let cachedClient: SupabaseClient | null = null
let cachedClientUrl = ''
let cachedClientKey = ''

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const currentConfig = config || getSavedSupabaseConfig()
  if (!currentConfig.enabled || !currentConfig.url || !currentConfig.anonKey) {
    return null
  }

  if (
    cachedClient &&
    cachedClientUrl === currentConfig.url &&
    cachedClientKey === currentConfig.anonKey
  ) {
    return cachedClient
  }

  try {
    cachedClient = createClient(currentConfig.url, currentConfig.anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
    cachedClientUrl = currentConfig.url
    cachedClientKey = currentConfig.anonKey
    return cachedClient
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e)
    return null
  }
}

export async function testSupabaseConnection(
  config: SupabaseConfig
): Promise<{ success: boolean; message: string }> {
  try {
    if (!config.url || !config.anonKey) {
      return { success: false, message: 'Укажите URL и публичный Anon ключ проекта' }
    }

    const client = createClient(config.url, config.anonKey)
    const { error } = await client
      .from('irada_tasks')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message:
            'Таблицы еще не созданы в Supabase! Запустите SQL-скрипт (кнопка внизу модалки) в SQL Editor Supabase.',
        }
      }
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Подключение успешно! Realtime готов к работе.' }
  } catch (e: any) {
    return { success: false, message: e.message || 'Ошибка подключения к Supabase' }
  }
}

// Data synchronization API
export async function fetchRemoteTasks(config: SupabaseConfig): Promise<Task[]> {
  const client = getSupabaseClient(config)
  if (!client) return []

  const { data, error } = await client
    .from('irada_tasks')
    .select('*')
    .eq('sync_key', config.syncKey)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Failed to fetch remote tasks:', error)
    return []
  }

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    weight: row.weight as TaskWeight,
    status: row.status as TaskStatus,
    scheduledHour: row.scheduled_hour,
    createdAt: Number(row.created_at),
  }))
}

export async function upsertRemoteTask(task: Task, config: SupabaseConfig): Promise<void> {
  const client = getSupabaseClient(config)
  if (!client) return

  const row = {
    id: task.id,
    sync_key: config.syncKey,
    title: task.title,
    weight: task.weight,
    status: task.status,
    scheduled_hour: task.scheduledHour,
    created_at: task.createdAt,
    updated_at: new Date().toISOString(),
  }

  const { error } = await client.from('irada_tasks').upsert(row, { onConflict: 'id' })
  if (error) {
    console.error('Failed to upsert remote task:', error)
  }
}

export async function deleteRemoteTask(taskId: string, config: SupabaseConfig): Promise<void> {
  const client = getSupabaseClient(config)
  if (!client) return

  const { error } = await client
    .from('irada_tasks')
    .delete()
    .eq('id', taskId)
    .eq('sync_key', config.syncKey)

  if (error) {
    console.error('Failed to delete remote task:', error)
  }
}

export async function uploadAllTasks(tasks: Task[], config: SupabaseConfig): Promise<boolean> {
  const client = getSupabaseClient(config)
  if (!client || tasks.length === 0) return true

  const rows = tasks.map((t) => ({
    id: t.id,
    sync_key: config.syncKey,
    title: t.title,
    weight: t.weight,
    status: t.status,
    scheduled_hour: t.scheduledHour,
    created_at: t.createdAt,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await client.from('irada_tasks').upsert(rows, { onConflict: 'id' })
  if (error) {
    console.error('Failed to upload all tasks:', error)
    return false
  }
  return true
}

export async function fetchRemoteAppState(
  config: SupabaseConfig
): Promise<{ lowEnergyMode: boolean; scratchpad: string } | null> {
  const client = getSupabaseClient(config)
  if (!client) return null

  const { data, error } = await client
    .from('irada_app_state')
    .select('*')
    .eq('sync_key', config.syncKey)
    .single()

  if (error || !data) {
    return null
  }

  return {
    lowEnergyMode: Boolean(data.low_energy_mode),
    scratchpad: data.scratchpad || '',
  }
}

export async function upsertRemoteAppState(
  lowEnergyMode: boolean,
  scratchpad: string,
  config: SupabaseConfig
): Promise<boolean> {
  const client = getSupabaseClient(config)
  if (!client) return false

  const row = {
    sync_key: config.syncKey,
    low_energy_mode: lowEnergyMode,
    scratchpad: scratchpad,
    updated_at: new Date().toISOString(),
  }

  const { error } = await client.from('irada_app_state').upsert(row, { onConflict: 'sync_key' })
  if (error) {
    console.error('Failed to upsert app state:', error)
    return false
  }
  return true
}

