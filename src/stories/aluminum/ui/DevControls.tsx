import { useTranslation } from '../i18n/locale'
import { useState } from 'react'
import { storyStore } from '../story/store'
import type { VisualState } from '../story/states'

export function DevControls() {
  const { t } = useTranslation()
  const [values, setValues] = useState<Partial<VisualState>>({})
  const fields = ['explodedAmount', 'sectionAmount', 'currentIntensity', 'feedIntensity', 'dissolutionIntensity', 'reactionIntensity', 'carbonConsumption', 'gasIntensity', 'heatIntensity', 'bubbleIntensity', 'bathVisibility', 'aluminumVisibility', 'abnormalStateMix'] as const
  return <details className="dev-controls"><summary>{t("Scene controls · development")}</summary>
    {fields.map(field => <label key={field}>{t(field)}<input type="range" min="0" max="1" step="0.01" value={values[field] ?? storyStore.get()[field]} onChange={event => {
      const next = { ...values, [field]: Number(event.target.value) }; setValues(next); storyStore.override(next)
    }} /></label>)}
    <button onClick={() => { setValues({}); storyStore.override({}) }}>{t("Reset to scroll")}</button>
  </details>
}
