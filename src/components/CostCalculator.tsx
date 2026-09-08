import { useI18n } from '../i18n/I18nProvider'
import { COST_SCENARIOS } from '../lib/ranking'
import type { MessageKey } from '../i18n/messages'

const scenarioLabel: Record<string, MessageKey> = {
  chat: 'scenarioChat',
  code: 'scenarioCode',
  analysis: 'scenarioAnalysis',
}

export function CostCalculator({
  inputTokens,
  outputTokens,
  onChange,
  scenarioId,
  onScenario,
}: {
  inputTokens: number
  outputTokens: number
  onChange: (input: number, output: number) => void
  scenarioId: string
  onScenario: (id: string) => void
}) {
  const { t } = useI18n()

  return (
    <aside className="panel rounded-2xl p-5">
      <h3 className="font-display text-xl text-mercury">{t('costCalculator')}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {COST_SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              onScenario(s.id)
              onChange(s.inputTokens, s.outputTokens)
            }}
            className={`rounded-md border px-3 py-1.5 text-xs transition ${
              scenarioId === s.id
                ? 'border-cyan/40 bg-cyan/10 text-cyan'
                : 'border-ink-line text-mercury-mute hover:text-mercury'
            }`}
          >
            {t(scenarioLabel[s.id])}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onScenario('custom')}
          className={`rounded-md border px-3 py-1.5 text-xs transition ${
            scenarioId === 'custom'
              ? 'border-cyan/40 bg-cyan/10 text-cyan'
              : 'border-ink-line text-mercury-mute hover:text-mercury'
          }`}
        >
          {t('custom')}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-mercury-mute">
          {t('inputTokens')}
          <input
            type="number"
            min={0}
            value={inputTokens}
            onChange={(e) => {
              onScenario('custom')
              onChange(Number(e.target.value) || 0, outputTokens)
            }}
            className="mt-1 w-full rounded-lg border border-ink-line bg-ink px-3 py-2 font-mono text-sm text-mercury outline-none focus:border-cyan/40"
          />
        </label>
        <label className="block text-xs text-mercury-mute">
          {t('outputTokens')}
          <input
            type="number"
            min={0}
            value={outputTokens}
            onChange={(e) => {
              onScenario('custom')
              onChange(inputTokens, Number(e.target.value) || 0)
            }}
            className="mt-1 w-full rounded-lg border border-ink-line bg-ink px-3 py-2 font-mono text-sm text-mercury outline-none focus:border-cyan/40"
          />
        </label>
      </div>
    </aside>
  )
}
