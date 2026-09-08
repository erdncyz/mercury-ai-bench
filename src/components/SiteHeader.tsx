import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import type { Locale } from '../i18n/messages'

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n()

  return (
    <header className="relative z-20 border-b border-ink-line/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <NavLink to="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight text-mercury md:text-[1.75rem]">
            {t('brand')}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mercury-mute transition group-hover:text-cyan">
            {t('brandSuffix')}
          </span>
        </NavLink>

        <nav className="flex items-center gap-1 md:gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm transition ${
                isActive ? 'text-mercury' : 'text-mercury-mute hover:text-mercury'
              }`
            }
          >
            {t('navHome')}
          </NavLink>
          <NavLink
            to="/bench"
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm transition ${
                isActive ? 'text-mercury' : 'text-mercury-mute hover:text-mercury'
              }`
            }
          >
            {t('navBench')}
          </NavLink>
          <div className="ml-2 flex overflow-hidden rounded-md border border-ink-line">
            {(['en', 'tr'] as Locale[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`px-2.5 py-1 font-mono text-[11px] tracking-wider transition ${
                  locale === code
                    ? 'bg-mercury/10 text-cyan'
                    : 'text-mercury-mute hover:text-mercury'
                }`}
                aria-pressed={locale === code}
              >
                {code === 'en' ? t('langEn') : t('langTr')}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
