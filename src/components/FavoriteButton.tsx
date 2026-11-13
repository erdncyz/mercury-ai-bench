import { Star } from '@phosphor-icons/react'
import { useFavorites } from '../hooks/useFavorites'
import { useI18n } from '../i18n/I18nProvider'

export function FavoriteButton({ slug, size = 18, className = '' }: { slug: string; size?: number; className?: string }) {
  const { t } = useI18n()
  const { isFavorite, toggle } = useFavorites()
  const active = isFavorite(slug)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(slug)
      }}
      aria-pressed={active}
      aria-label={active ? t('removeFavorite') : t('addFavorite')}
      title={active ? t('removeFavorite') : t('addFavorite')}
      className={`inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border transition ${
        active ? 'border-amber-300/40 bg-amber-300/10 text-amber-300' : 'border-white/15 bg-ink-panel text-mercury-dim hover:border-amber-300/40 hover:text-amber-300'
      } ${className}`}
    >
      <Star size={size} weight={active ? 'fill' : 'regular'} />
    </button>
  )
}
