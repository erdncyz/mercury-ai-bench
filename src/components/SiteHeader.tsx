import { NavLink } from 'react-router-dom'
import { ChartBar, House, Scales } from '@phosphor-icons/react'
import { useI18n } from '../i18n/I18nProvider'
import type { Locale } from '../i18n/messages'

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n()

  return (
    <header className="glass-header sticky top-0 z-30 border-b border-white/8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
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
              `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
                isActive ? 'bg-white/5 text-mercury' : 'text-mercury-mute hover:text-mercury'
              }`
            }
          >
            <House size={15} weight="duotone" />
            {t('navHome')}
          </NavLink>
          <NavLink
            to="/bench"
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
                isActive ? 'bg-white/5 text-mercury' : 'text-mercury-mute hover:text-mercury'
              }`
            }
          >
            <ChartBar size={15} weight="duotone" />
            {t('navBench')}
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
                isActive ? 'bg-white/5 text-mercury' : 'text-mercury-mute hover:text-mercury'
              }`
            }
          >
            <Scales size={15} weight="duotone" />
            {t('navCompare')}
          </NavLink>
          <div className="ml-2 flex overflow-hidden rounded-md border border-white/10">
            {(['en', 'tr'] as Locale[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`px-2.5 py-1 font-mono text-[11px] tracking-wider transition ${
                  locale === code
                    ? 'bg-cyan/15 text-cyan'
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
