import { useI18n } from '../i18n/I18nProvider'
import type { ModelPricing } from '../types/models'

export function PriceMeta({ pricing }: { pricing: ModelPricing }) {
  const { t } = useI18n()
  if (!pricing.provenance?.estimated || (pricing.price_unit == null && pricing.price_1m_blended_3_to_1 == null)) return null
  return <p className="mt-1 text-[11px] text-gold">{t('estimatedPriceShort')}</p>
}
