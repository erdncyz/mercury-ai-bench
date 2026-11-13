import { DownloadSimple, ArrowSquareOut, DeviceMobile, X } from '@phosphor-icons/react'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const InstallContext = createContext({ installed: false, openGuide: () => {} })

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function initialPlatform(): 'ios' | 'android' | 'desktop' {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'
  return /Android/i.test(navigator.userAgent) ? 'android' : 'desktop'
}

const PLATFORM_STEPS: Record<ReturnType<typeof initialPlatform>, MessageKey[]> = {
  ios: ['installIos1', 'installIos2', 'installIos3'],
  android: ['installAndroid1', 'installAndroid2', 'installAndroid3'],
  desktop: ['installDesktop1', 'installDesktop2', 'installDesktop3'],
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  const { installed, openGuide } = useContext(InstallContext)
  if (installed) return null

  return (
    <button type="button" onClick={openGuide} aria-haspopup="dialog"
      aria-label={t('installTitle')}
      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-sm text-cyan transition hover:bg-cyan/20"
    >
      <DownloadSimple size={18} aria-hidden />
      {t(compact ? 'installShort' : 'installTitle')}
    </button>
  )
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const dialog = useRef<HTMLDialogElement>(null)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [installing, setInstalling] = useState(false)
  const [installError, setInstallError] = useState(false)
  const [platform, setPlatform] = useState(initialPlatform)
  const [online, setOnline] = useState(() => navigator.onLine)
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.warn('Mercury offline support could not be registered.', error)
    },
  })

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)')
    const beforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const appInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      dialog.current?.close()
    }
    const displayChanged = () => setInstalled(isStandalone())
    const connectivityChanged = () => setOnline(navigator.onLine)
    window.addEventListener('beforeinstallprompt', beforeInstall)
    window.addEventListener('appinstalled', appInstalled)
    window.addEventListener('online', connectivityChanged)
    window.addEventListener('offline', connectivityChanged)
    displayMode.addEventListener('change', displayChanged)
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall)
      window.removeEventListener('appinstalled', appInstalled)
      window.removeEventListener('online', connectivityChanged)
      window.removeEventListener('offline', connectivityChanged)
      displayMode.removeEventListener('change', displayChanged)
    }
  }, [])

  const install = async () => {
    if (!installPrompt || installing) return
    setInstalling(true)
    setInstallError(false)
    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') dialog.current?.close()
    } catch {
      setInstallError(true)
    } finally {
      // Each browser event can be used only once, even when dismissed.
      setInstallPrompt(null)
      setInstalling(false)
    }
  }

  return (
    <InstallContext.Provider value={{ installed, openGuide: () => dialog.current?.showModal() }}>
      {children}
      {(!online || needRefresh) && (
        <aside role="status" className="panel fixed right-4 top-[calc(6rem+env(safe-area-inset-top,0px))] z-40 max-w-[calc(100%-2rem)] rounded-2xl p-4 text-sm shadow-2xl sm:max-w-sm">
          <p className="text-mercury">{t(!online ? 'offlineMode' : 'updateAvailable')}</p>
          {online && needRefresh && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void updateServiceWorker(true)}
                className="min-h-11 rounded-lg bg-cyan px-3 py-2 text-ink">{t('updateApp')}</button>
              <button type="button" onClick={() => setNeedRefresh(false)}
                className="min-h-11 rounded-lg border border-white/10 px-3 py-2 text-mercury-dim">{t('updateLater')}</button>
            </div>
          )}
        </aside>
      )}
      {createPortal(
        <dialog ref={dialog} aria-labelledby="install-title" aria-describedby="install-description"
          className="install-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-ink-panel p-5 text-mercury shadow-2xl sm:p-6"
        >
          <div className="flex items-start gap-3">
            <img src="/icons/pwa-192.png" width={48} height={48} alt="" className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-cyan">Mercury AI Bench</p>
              <h2 id="install-title" className="mt-1 font-display text-3xl">{t('installTitle')}</h2>
            </div>
            <button type="button" onClick={() => dialog.current?.close()} aria-label={t('installClose')}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 text-mercury-dim hover:text-mercury">
              <X size={20} />
            </button>
          </div>
          <p id="install-description" className="mt-4 text-sm leading-relaxed text-mercury-dim">{t('installDescription')}</p>
          {installPrompt && (
            <button type="button" disabled={installing} onClick={() => void install()}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan px-4 py-3 font-medium text-ink transition hover:bg-cyan-dim disabled:opacity-50">
              <DownloadSimple size={20} /> {t(installing ? 'installing' : 'installNow')}
            </button>
          )}
          {installError && <p role="alert" className="mt-3 text-sm text-gold">{t('installError')}</p>}
          {!window.isSecureContext && <p className="mt-3 text-sm text-gold">{t('installHttps')}</p>}
          <p className="mt-5 flex items-center gap-2 text-sm font-medium"><DeviceMobile size={18} className="text-cyan" />{t('installHow')}</p>
          <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label={t('installDevice')}>
            {(['ios', 'android', 'desktop'] as const).map((device) => (
              <button key={device} type="button" aria-pressed={platform === device} onClick={() => setPlatform(device)}
                className={`min-h-11 rounded-lg border px-2 py-2 text-xs transition ${platform === device ? 'border-cyan/40 bg-cyan/10 text-cyan' : 'border-white/10 text-mercury-dim'}`}>
                {t(device === 'ios' ? 'installIos' : device === 'android' ? 'installAndroid' : 'installDesktop')}
              </button>
            ))}
          </div>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-mercury-dim">
            {PLATFORM_STEPS[platform].map((step) => <li key={step} className="pl-1">{t(step)}</li>)}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-mercury-mute">{t('installBrowserHint')}</p>
          <div className="mt-5 rounded-xl border border-white/8 bg-ink p-3 text-xs leading-relaxed text-mercury-dim">
            <p className="font-medium text-cyan">{t(offlineReady ? 'offlineReady' : 'installOfflineTitle')}</p>
            <p className="mt-1">{t('installOfflineNote')}</p>
          </div>
          <a href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing"
            target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs text-cyan underline underline-offset-4">
            {t('installHelp')} <ArrowSquareOut size={14} />
          </a>
        </dialog>, document.body,
      )}
    </InstallContext.Provider>
  )
}
