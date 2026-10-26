import { useState, useEffect } from 'react'
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Key,
  Globe,
  Radio,
  ExternalLink,
  Smartphone,
  QrCode,
  Wifi,
  Zap,
} from 'lucide-react'
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  type SupabaseConfig,
} from '../services/supabase'

interface SyncModalProps {
  isOpen: boolean
  onClose: () => void
  onConfigSaved: (config: SupabaseConfig) => void
  onManualSyncPush: () => Promise<void>
  onManualSyncPull: () => Promise<void>
  syncStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  statusMessage?: string
}

const SQL_SCHEMA_TEXT = `-- 1. Таблица задач
create table if not exists public.irada_tasks (
  id text primary key,
  sync_key text not null default 'my-personal-hq',
  title text not null,
  weight text not null default 'unassigned',
  status text not null default 'inbox',
  scheduled_hour integer,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at timestamptz not null default now()
);

-- 2. Таблица состояния приложения
create table if not exists public.irada_app_state (
  sync_key text primary key default 'my-personal-hq',
  low_energy_mode boolean not null default false,
  scratchpad text not null default '',
  updated_at timestamptz not null default now()
);

-- 3. Включение Realtime
alter publication supabase_realtime add table public.irada_tasks;
alter publication supabase_realtime add table public.irada_app_state;

-- 4. Политики доступа
alter table public.irada_tasks enable row level security;
alter table public.irada_app_state enable row level security;

create policy "Allow anon on irada_tasks" on public.irada_tasks for all to anon, authenticated using (true) with check (true);
create policy "Allow anon on irada_app_state" on public.irada_app_state for all to anon, authenticated using (true) with check (true);
create index if not exists idx_irada_tasks_sync_key on public.irada_tasks (sync_key);`

const TUNNEL_URL = 'https://irada-focus.vercel.app'
const WIFI_URL = 'http://192.168.68.126:5173'

export function SyncModal({
  isOpen,
  onClose,
  onConfigSaved,
  onManualSyncPush,
  onManualSyncPull,
  syncStatus,
  statusMessage,
}: SyncModalProps) {
  const [activeTab, setActiveTab] = useState<'phone' | 'supabase'>('phone')
  const [config, setConfig] = useState<SupabaseConfig>(getSavedSupabaseConfig())
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [copiedSql, setCopiedSql] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<'tunnel' | 'wifi' | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedConnectionType, setSelectedConnectionType] = useState<'tunnel' | 'wifi'>('tunnel')

  useEffect(() => {
    if (isOpen) {
      setConfig(getSavedSupabaseConfig())
      setTestResult(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    saveSupabaseConfig(config)
    onConfigSaved(config)
    onClose()
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const res = await testSupabaseConnection(config)
    setTestResult(res)
    setTesting(false)
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_TEXT)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  const isSupabaseConfigured = Boolean(config.enabled && config.url && config.anonKey)

  const handleCopyUrl = (type: 'tunnel' | 'wifi') => {
    const base = type === 'tunnel' ? TUNNEL_URL : WIFI_URL
    const url = isSupabaseConfigured
      ? `${base}?sb_url=${encodeURIComponent(config.url)}&sb_key=${encodeURIComponent(
          config.anonKey
        )}&sb_room=${encodeURIComponent(config.syncKey)}`
      : base
    navigator.clipboard.writeText(url)
    setCopiedUrl(type)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const handlePush = async () => {
    setIsSyncing(true)
    await onManualSyncPush()
    setIsSyncing(false)
  }

  const handlePull = async () => {
    setIsSyncing(true)
    await onManualSyncPull()
    setIsSyncing(false)
  }

  const basePhoneUrl = selectedConnectionType === 'tunnel' ? TUNNEL_URL : WIFI_URL
  const currentPhoneUrl = isSupabaseConfigured
    ? `${basePhoneUrl}?sb_url=${encodeURIComponent(config.url)}&sb_key=${encodeURIComponent(
        config.anonKey
      )}&sb_room=${encodeURIComponent(config.syncKey)}`
    : basePhoneUrl

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentPhoneUrl
  )}&bgcolor=15-18-26&color=56-189-248&margin=6`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#13161F]/95 border border-white/10 text-white shadow-2xl p-6 flex flex-col gap-5 custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              {activeTab === 'phone' ? <Smartphone className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-light tracking-wide text-white flex items-center gap-2">
                Синхронизация с телефоном
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono border ${
                    syncStatus === 'connected'
                      ? 'bg-teal-950/50 text-teal-300 border-teal-500/40 shadow-[0_0_8px_rgba(45,212,191,0.2)]'
                      : syncStatus === 'connecting'
                      ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                      : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                  }`}
                >
                  {syncStatus === 'connected'
                    ? '🟢 Синхронизация активна'
                    : syncStatus === 'connecting'
                    ? '🟡 Подключение...'
                    : '⚪ Оффлайн'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {statusMessage || 'Мгновенный обмен данными между ПК и телефоном'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>📱 QR-код и Ссылка (Мгновенно)</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'supabase'
                ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-purple-400" />
            <span>☁️ Облако Supabase</span>
          </button>
        </div>

        {/* TAB 1: PHONE & QR SYNC */}
        {activeTab === 'phone' && (
          <div className="space-y-4">
            {/* Realtime Status Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-sky-950/20 to-purple-950/40 border border-cyan-500/20 flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-cyan-400/10 text-cyan-400 mt-0.5 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <div className="font-medium text-white">Встроенная автосинхронизация активна</div>
                <div className="text-slate-400 leading-relaxed text-[11px]">
                  Сервер <b>irada</b> на ПК автоматически передает любые изменения на телефон в реальном времени. Просто откройте приложение на смартфоне по QR-коду!
                </div>
              </div>
            </div>

            {/* Connection Selector (Tunnel vs Wi-Fi) */}
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setSelectedConnectionType('tunnel')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                  selectedConnectionType === 'tunnel'
                    ? 'bg-cyan-950/40 border-cyan-400/40 text-cyan-300 font-medium'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Интернет (Cloudflare Tunnel)</span>
              </button>
              <button
                onClick={() => setSelectedConnectionType('wifi')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                  selectedConnectionType === 'wifi'
                    ? 'bg-cyan-950/40 border-cyan-400/40 text-cyan-300 font-medium'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Локальный Wi-Fi</span>
              </button>
            </div>

            {/* QR Code and Instructions Display */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-center gap-5">
              {/* QR Image */}
              <div className="p-2.5 rounded-2xl bg-[#0F121A] border border-cyan-500/30 shadow-[0_0_20px_rgba(56,189,248,0.15)] shrink-0 flex flex-col items-center">
                <img
                  src={qrCodeApiUrl}
                  alt="QR код для телефона"
                  className="w-44 h-44 rounded-xl object-contain select-none"
                  loading="lazy"
                />
                <span className="text-[10px] font-mono text-cyan-400/80 mt-1.5 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Наведите камеру
                </span>
              </div>

              {/* URL and Copy Buttons */}
              <div className="flex-1 w-full space-y-3 text-xs">
                <div>
                  <div className="text-[11px] font-medium text-slate-300 mb-1">
                    {selectedConnectionType === 'tunnel'
                      ? '🌍 Ссылка через интернет (работает с любой мобильной сети LTE/5G):'
                      : '📶 Локальная ссылка (когда телефон в одном Wi-Fi с ПК):'}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentPhoneUrl}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono text-cyan-300 select-all focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedConnectionType)}
                      className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white transition-colors cursor-pointer"
                      title="Скопировать ссылку"
                    >
                      {copiedUrl === selectedConnectionType ? (
                        <Check className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-cyan-400" />
                      )}
                    </button>
                    <a
                      href={currentPhoneUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white transition-colors"
                      title="Открыть в новой вкладке"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-300" />
                    </a>
                  </div>
                </div>

                {/* 3 Steps Guide */}
                <div className="space-y-1.5 text-[11px] text-slate-400 pt-1">
                  <div className="text-white font-medium">Как запустить на телефоне:</div>
                  <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                    <li>Откройте камеру телефона и наведите на QR-код (или отправьте ссылку в Telegram/WhatsApp).</li>
                    <li>Все задачи мгновенно появятся на экране телефона.</li>
                    <li>
                      В браузере Safari/Chrome нажмите <b>«Поделиться» → «На экран “Домой”»</b>, чтобы приложение открывалось как нативное без рамок браузера!
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUPABASE CLOUD SYNC */}
        {activeTab === 'supabase' && (
          <div className="space-y-4 text-xs font-sans">
            {/* Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div>
                <div className="font-semibold text-white">Включить облачную синхронизацию Supabase</div>
                <div className="text-[11px] text-slate-400">
                  Позволяет синхронизировать данные через удаленную базу данных, даже если ПК выключен
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Supabase URL */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 font-medium text-slate-300">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Project URL</span>
              </label>
              <input
                type="text"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value.trim() })}
                placeholder="https://your-project-id.supabase.co"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60"
              />
            </div>

            {/* Anon Key */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 font-medium text-slate-300">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>Anon Public Key</span>
              </label>
              <input
                type="password"
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value.trim() })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60"
              />
            </div>

            {/* Sync Key / Room */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 font-medium text-slate-300">
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                <span>Ключ комнаты (Sync Key)</span>
              </label>
              <input
                type="text"
                value={config.syncKey}
                onChange={(e) => setConfig({ ...config, syncKey: e.target.value.trim() })}
                placeholder="my-personal-hq"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60"
              />
              <p className="text-[11px] text-slate-500">
                Укажите одинаковый ключ на ПК и телефоне, чтобы они подключились к одному и тому же расписанию.
              </p>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-teal-950/40 border-teal-500/40 text-teal-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Manual Push / Pull buttons */}
            {config.enabled && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.08]">
                <button
                  onClick={handlePush}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-200 font-medium transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Выгрузить в облако</span>
                </button>
                <button
                  onClick={handlePull}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-200 font-medium transition-colors cursor-pointer"
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-purple-400" />
                  <span>Загрузить из облака</span>
                </button>
              </div>
            )}

            {/* Step-by-Step Instructions & Copy SQL Button */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center justify-between text-white font-medium">
                <span>📋 Инструкция по настройке Supabase:</span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-teal-400" />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>Скопировать SQL</span>
                    </>
                  )}
                </button>
              </div>
              <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                <li>
                  Зайдите в проект на{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline inline-flex items-center gap-0.5 font-medium"
                  >
                    supabase.com <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>Откройте вкладку <b>SQL Editor</b>, вставьте скопированный SQL-скрипт и нажмите <b>Run</b>.</li>
                <li>В <b>Project Settings → API</b> скопируйте Project URL и Anon Key и вставьте сюда.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          {activeTab === 'supabase' ? (
            <button
              onClick={handleTest}
              disabled={testing || !config.url || !config.anonKey}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.08] disabled:opacity-30 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Проверка...' : 'Проверить связь'}</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Сервер активен</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Закрыть
            </button>
            {activeTab === 'supabase' && (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-500 hover:opacity-95 text-slate-950 text-xs font-semibold shadow-[0_0_15px_rgba(56,189,248,0.35)] transition-all cursor-pointer"
              >
                Сохранить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
