import { ArrowSquareOut, Check, Copy, Eye, EyeSlash, Fire, Sparkle, ThumbsUp } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useRelativeTime } from './PulseItems'
import { useI18n } from '../i18n/I18nProvider'
import type { PromptItem } from '../hooks/usePrompts'

const TYPE_STYLE: Record<string, string> = {
  TEXT: 'border-white/15 text-mercury-dim',
  SKILL: 'border-cyan/35 text-cyan',
  TASTE: 'border-violet-300/35 text-violet-200',
  IMAGE: 'border-amber-300/35 text-amber-200',
  VIDEO: 'border-rose-300/35 text-rose-200',
}

function isImage(url: string) {
  return /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url)
}

export function PromptCard({ prompt }: { prompt: PromptItem }) {
  const { t, locale } = useI18n()
  const curated = prompt.origin === 'mercury'
  const rel = useRelativeTime()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)
    } catch {
      // clipboard unavailable; ignore
    }
  }

  return (
    <article
      className={`panel flex h-full flex-col rounded-xl p-4 transition hover:border-cyan/30 ${curated ? 'border-cyan/25' : ''}`}
    >
      {prompt.mediaUrl && isImage(prompt.mediaUrl) && (
        <img
          src={prompt.mediaUrl}
          alt=""
          loading="lazy"
          className="mb-3 h-36 w-full rounded-lg border border-white/8 object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
        <span className={`rounded-full border px-1.5 py-px ${TYPE_STYLE[prompt.type] ?? TYPE_STYLE.TEXT}`}>
          {prompt.type.toLowerCase()}
        </span>
        {curated && (
          <span className="inline-flex items-center gap-1 text-cyan">
            <Sparkle size={11} weight="fill" /> {t('promptsCurated')}
          </span>
        )}
        {prompt.category && <span className="text-mercury-mute">{prompt.category}</span>}
        {prompt.trending && (
          <span className="inline-flex items-center gap-0.5 text-amber-200">
            <Fire size={11} weight="fill" />
          </span>
        )}
        {prompt.original && (
          <span className="ml-auto normal-case tracking-normal text-mercury-mute/70" title={prompt.original.title}>
            {t('promptsMachineTranslated')}
          </span>
        )}
      </div>

      {prompt.url ? (
        <a
          href={prompt.url}
          target="_blank"
          rel="noopener noreferrer"
          title={prompt.original ? prompt.original.title : undefined}
          className="mt-2 line-clamp-2 text-[15px] font-medium leading-snug text-mercury hover:text-cyan"
        >
          {prompt.title}
        </a>
      ) : (
        <h3 className="mt-2 text-[15px] font-medium leading-snug text-mercury">{prompt.title}</h3>
      )}
      {prompt.description && (
        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-mercury-mute">{prompt.description}</p>
      )}

      {prompt.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {prompt.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-mercury-mute">
              {tag}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-3">
          {(prompt.original || (curated && locale !== 'en')) && (
            <p className="mb-1.5 font-mono text-[10px] text-mercury-mute">{t('promptsEnglishNote')}</p>
          )}
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/8 bg-ink p-3 font-mono text-[11px] leading-relaxed text-mercury-dim">
            {prompt.content}
          </pre>
          {prompt.contentTruncated && (
            <p className="mt-1.5 font-mono text-[10px] text-mercury-mute">{t('promptsTruncated')}</p>
          )}
        </div>
      )}

      <div className="mt-auto pt-3">
        <div className="flex items-center gap-2 font-mono text-[11px] text-mercury-mute">
          {prompt.author?.avatar && (
            <img src={prompt.author.avatar} alt="" width={16} height={16} loading="lazy" className="h-4 w-4 rounded-full" />
          )}
          {prompt.author && <span className="truncate">@{prompt.author.username}</span>}
          {curated ? (
            <span className="truncate">{t('promptsCuratedBy')}</span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-0.5">
              <ThumbsUp size={11} /> {prompt.votes}
            </span>
          )}
          <span className="ml-auto shrink-0">{rel(prompt.createdAt)}</span>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md border border-cyan/30 bg-cyan/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-cyan transition hover:bg-cyan/20"
          >
            {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
            {copied ? t('copied') : t('promptsCopy')}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/8 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-mercury-mute transition hover:border-cyan/40 hover:text-cyan"
          >
            {open ? <EyeSlash size={13} /> : <Eye size={13} />}
            {open ? t('promptsHide') : t('promptsPreview')}
          </button>
          {prompt.url && (
            <a
              href={prompt.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('promptsOpen')}
              title={t('promptsOpen')}
              className="ml-auto inline-flex items-center rounded-md border border-white/8 p-1.5 text-mercury-mute transition hover:border-cyan/40 hover:text-cyan"
            >
              <ArrowSquareOut size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
