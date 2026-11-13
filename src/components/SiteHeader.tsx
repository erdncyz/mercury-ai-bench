import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChartBar, ChatTeardropText, GitBranch, House, List, Newspaper, Plugs, Scales, X } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { InstallAppButton } from './PwaProvider'
import { useI18n } from '../i18n/I18nProvider'
import type { Locale, MessageKey } from '../i18n/messages'

const NAV: { to: string; icon: Icon; label: MessageKey }[] = [
  { to: '/', icon: House, label: 'navHome' },
  { to: '/bench', icon: ChartBar, label: 'navBench' },
  { to: '/find', icon: Scales, label: 'navFinder' },
  { to: '/compare', icon: Scales, label: 'navCompare' },
  { to: '/news', icon: Newspaper, label: 'navNews' },
  { to: '/skills', icon: GitBranch, label: 'navSkills' },
  { to: '/mcp', icon: Plugs, label: 'navMcp' },
  { to: '/prompts', icon: ChatTeardropText, label: 'navPrompts' },
]

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="glass-header site-header sticky top-0 z-30 border-b border-white/8"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setMenuOpen(false)
          event.currentTarget.querySelector<HTMLButtonElement>('[aria-controls="site-navigation"]')?.focus()
        }
      }}
    >
      <div className="page-gutter mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-8">
        <NavLink to="/" onClick={() => setMenuOpen(false)} className="group flex shrink-0 flex-col">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-tight text-mercury md:text-[1.75rem]">
              {t('brand')}
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-mercury-mute transition group-hover:text-cyan sm:inline">
              {t('brandSuffix')}
            </span>
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.08em] text-cyan md:block">
            Developed by Erdinç Yılmaz
          </span>
        </NavLink>

        <div className="ml-auto flex items-center gap-2 xl:order-2">
          <InstallAppButton compact />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-mercury xl:hidden"
          >
            {menuOpen ? <X size={20} /> : <List size={20} />}
            {t('menu')}
          </button>
        </div>
        <nav id="site-navigation" aria-label={t('navigation')}
          className={`${menuOpen ? 'grid' : 'hidden'} w-full min-w-0 grid-cols-2 gap-2 border-t border-white/8 pt-3 xl:order-1 xl:flex xl:w-auto xl:items-center xl:gap-1 xl:border-0 xl:pt-0`}
        >
          {NAV.map(({ to, icon: NavIcon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `inline-flex min-h-11 min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                  isActive ? 'bg-white/5 text-mercury' : 'text-mercury-mute hover:text-mercury'
                }`
              }
            >
              <NavIcon size={15} weight="duotone" />
              <span>{t(label)}</span>
            </NavLink>
          ))}
          <div className="col-span-2 flex justify-center overflow-hidden rounded-md border border-white/10 xl:ml-2 xl:shrink-0">
            {(['en', 'tr'] as Locale[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`min-h-11 flex-1 px-3 py-2 font-mono text-[11px] tracking-wider transition ${
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
