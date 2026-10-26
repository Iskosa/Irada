export type TaskWeight = 'boss' | 'medium' | 'small' | 'unassigned'

export type TaskStatus = 'inbox' | 'planned' | 'completed'

export interface Task {
  id: string
  title: string
  weight: TaskWeight
  status: TaskStatus
  scheduledHour: number | null // hour from 8 to 22 for timeboxing
  createdAt: number
}

export type ViewMode = 'auto' | 'pc' | 'phone'

export type MobileTab = 'focus' | 'dump' | 'timeline'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type?: 'error' | 'warning' | 'info' | 'success'
}

export const WEIGHT_CONFIG: Record<
  TaskWeight,
  {
    label: string
    energy: number
    icon: string
    color: string
    badgeBg: string
    border: string
    limit: number
  }
> = {
  boss: {
    label: 'Главный Босс',
    energy: 4,
    icon: '🔥',
    color: 'text-purple-300',
    badgeBg: 'bg-purple-950/50 text-purple-200 border-purple-500/40 shadow-[0_0_12px_rgba(192,132,252,0.2)]',
    border: 'border-purple-500/40',
    limit: 1,
  },
  medium: {
    label: 'Средняя',
    energy: 2,
    icon: '⚡',
    color: 'text-cyan-300',
    badgeBg: 'bg-cyan-950/50 text-cyan-200 border-cyan-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]',
    border: 'border-cyan-500/40',
    limit: 3,
  },
  small: {
    label: 'Мелкая',
    energy: 1,
    icon: '🪶',
    color: 'text-emerald-300',
    badgeBg: 'bg-emerald-950/40 text-emerald-200 border-emerald-500/30',
    border: 'border-emerald-500/30',
    limit: 5,
  },
  unassigned: {
    label: 'Без веса',
    energy: 0,
    icon: '○',
    color: 'text-slate-400',
    badgeBg: 'bg-white/[0.04] text-slate-400 border-white/[0.08]',
    border: 'border-white/[0.08]',
    limit: 999,
  },
}

export const TIMEBOX_HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 8 to 22

