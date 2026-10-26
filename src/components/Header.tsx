import { useEffect, useState } from 'react'
import type { ViewMode } from '../types'
import {
  Monitor,
  Smartphone,
  SlidersHorizontal,
  Cloud,
  CheckCheck,
  Headphones,
  Bell,
} from 'lucide-react'
import { soundscapes, type SoundscapeState } from '../utils/soundscapes'

interface HeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  lowEnergyMode: boolean
  onToggleLowEnergyMode: () => void
  plannedEnergy: number
  maxEnergy: number
  isOverloaded: boolean
  onClearCompleted?: () => void
  completedCount?: number
  onOpenSync?: () => void
  syncStatus?: 'disconnected' | 'connecting' | 'connected' | 'error'
  showModeSwitcher?: boolean
  onTriggerTestReminder?: () => void
}

export function Header({
  viewMode,
  onViewModeChange,
  lowEnergyMode,
  onToggleLowEnergyMode,
  plannedEnergy,
  maxEnergy,
  isOverloaded,
  onClearCompleted,
  completedCount = 0,
  onOpenSync,
  syncStatus = 'disconnected',
  showModeSwitcher = true,
  onTriggerTestReminder,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [soundState, setSoundState] = useState<SoundscapeState>(soundscapes.getState())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const unsub = soundscapes.subscribe(setSoundState)
    return () => {
      clearInterval(timer)
      unsub()
    }
  }, [])

  const energyPercent = Math.min(100, Math.round((plannedEnergy / maxEnergy) * 100))
  const timeStr = currentTime.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <header className="border-b border-white/[0.08] bg-[#14161D]/80 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-2.5 select-none transition-colors">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity with Glowing Crystal Orb Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img
              src="/orb-crystal.png"
              alt="irada"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-light tracking-wider text-white select-none">
              irada
            </span>
            <span className="hidden sm:inline-block text-[11px] font-sans tracking-widest uppercase text-slate-400 opacity-60">
              focus
            </span>
          </div>
        </div>

        {/* Center: Energy Gauge + Low Energy Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Energy Progress Meter in Dark Glass */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
              isOverloaded
                ? 'border-rose-500/50 bg-rose-950/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                : 'border-white/[0.08] bg-white/[0.03] text-slate-200'
            }`}
            title="Индикатор когнитивной энергии дня"
          >
            <span className="text-xs">⚡</span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-semibold text-white">{plannedEnergy}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{maxEnergy}⚡</span>
            </div>

            <div className="w-14 sm:w-20 h-1.5 rounded-full bg-white/[0.08] overflow-hidden ml-1">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isOverloaded
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>

          {/* Low Energy Mode Toggle */}
          <button
            onClick={onToggleLowEnergyMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
              lowEnergyMode
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(192,132,252,0.25)] font-semibold'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Режим «Нет сил»: лимит 6⚡"
          >
            <span className="text-xs">🪫</span>
            <span>Нет сил</span>
            {lowEnergyMode && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200">
                6⚡
              </span>
            )}
          </button>

          {/* Clear completed if any */}
          {completedCount > 0 && onClearCompleted && (
            <button
              onClick={onClearCompleted}
              className="hidden md:flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Очистить выполненные задачи"
            >
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Очистить ({completedCount})</span>
            </button>
          )}
        </div>

        {/* Right: Ambient Soundscapes, Reminders, Cloud Sync, Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hourly Timebox Reminder Test Button */}
          {onTriggerTestReminder && (
            <button
              onClick={onTriggerTestReminder}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-950/20 transition-all cursor-pointer"
              title="Проверить напоминалку таймбокса (звонок и уведомление задачи)"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Напоминалка</span>
            </button>
          )}

          {/* Ambient Soundscapes Toggle (Rain, Wind, Aurora) */}
          <button
            onClick={() => soundscapes.toggle()}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
              soundState.isPlaying
                ? 'bg-cyan-950/40 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)] animate-pulse'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title={soundState.isPlaying ? 'Фоновый эмбиент играет (клик чтобы выключить)' : 'Включить атмосферный звук (дождь, ветер, полярное сияние)'}
          >
            <Headphones className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">
              {soundState.isPlaying ? 'Звук: ВКЛ' : 'Эмбиент'}
            </span>
          </button>

          {/* Supabase Sync Button */}
          {onOpenSync && (
            <button
              onClick={onOpenSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                syncStatus === 'connected'
                  ? 'bg-teal-950/40 border-teal-400/50 text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.25)]'
                  : syncStatus === 'connecting'
                  ? 'bg-amber-950/40 border-amber-400/50 text-amber-300 animate-pulse'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
              title={
                syncStatus === 'connected'
                  ? 'Supabase синхронизация активна'
                  : syncStatus === 'connecting'
                  ? 'Подключение к Supabase...'
                  : 'Настроить синхронизацию'
              }
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                {syncStatus === 'connected'
                  ? 'В сети'
                  : syncStatus === 'connecting'
                  ? 'Связь...'
                  : 'Синхрон'}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'connected'
                    ? 'bg-teal-400'
                    : syncStatus === 'connecting'
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
            </button>
          )}

          {/* Current clock */}
          <div className="hidden xl:flex items-center gap-1 text-xs font-mono text-slate-400 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
            <span>{timeStr}</span>
          </div>

          {/* Mode Switcher: visible on PC dashboard */}
          {showModeSwitcher ? (
            <div className="flex items-center bg-white/[0.04] p-1 rounded-full border border-white/[0.08] text-xs">
              <button
                onClick={() => onViewModeChange('auto')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  viewMode === 'auto'
                    ? 'bg-white/10 text-white shadow-xs font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Автоматический режим по ширине экрана"
              >
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                <span>Авто</span>
              </button>

              <button
                onClick={() => onViewModeChange('pc')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  viewMode === 'pc'
                    ? 'bg-white/10 text-white shadow-xs font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Штаб на ПК"
              >
                <Monitor className="w-3 h-3 text-cyan-400" />
                <span>ПК</span>
              </button>

              <button
                onClick={() => onViewModeChange('phone')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  viewMode === 'phone'
                    ? 'bg-white/10 text-white shadow-xs font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Терминал фокуса на телефоне"
              >
                <Smartphone className="w-3 h-3 text-purple-400" />
                <span>Телефон</span>
              </button>
            </div>
          ) : viewMode === 'phone' ? (
            <button
              onClick={() => onViewModeChange('pc')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              title="Вернуться в штаб планирования на ПК"
            >
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>Режим ПК</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
