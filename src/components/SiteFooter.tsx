import { useI18n } from '../i18n/I18nProvider'

export function SiteFooter({
  fetchedAt,
  source,
}: {
  fetchedAt?: string
  source?: string
}) {
  const { t, locale } = useI18n()

  const updated =
    fetchedAt &&
    new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(fetchedAt))

  const sourceLabel =
    source === 'live'
      ? t('sourceLive')
      : source === 'cache'
        ? t('sourceCache')
        : source
          ? t('sourceFallback')
          : null

  return (
    <footer className="mt-auto border-t border-ink-line/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-mercury-mute md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-display text-lg text-mercury/80">{t('brand')}</p>
          <p className="mt-1 text-mercury-mute">{t('footerTagline')}</p>
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          <a
            href="https://artificialanalysis.ai/"
            target="_blank"
            rel="noreferrer"
            className="text-mercury-dim underline-offset-4 hover:text-cyan hover:underline"
          >
            {t('attribution')}
          </a>
          {(updated || sourceLabel) && (
            <p className="font-mono text-[11px] tracking-wide">
              {t('lastUpdated')}
              {updated ? `: ${updated}` : ''}
              {sourceLabel ? ` · ${sourceLabel}` : ''}
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
