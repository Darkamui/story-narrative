import { useTranslation } from '../i18n/locale'
export function SectionDiagram() {
  const { t } = useTranslation()
  return <svg className="section-diagram" viewBox="0 0 620 350" role="img" aria-labelledby="diagram-title">
    <title id="diagram-title">{t("Schematic cross-section: anodes above bath and aluminum, within a lined shell")}</title>
    <path d="M90 120v160h365V120" fill="none" stroke="#7b8983" strokeWidth="12" />
    <path d="M108 130v133h330V130" fill="none" stroke="#b6a081" strokeWidth="18" />
    <path d="M120 250h306" stroke="#485854" strokeWidth="18" />
    <path d="M120 230h306" stroke="#d1e1dc" strokeWidth="20" />
    <path d="M120 194h306" stroke="#ac784b" strokeWidth="50" />
    <g fill="#59635e" stroke="#a2ada5"><path d="M145 85h85v105h-85zM285 85h85v105h-85z" /><path d="M182 35h10v50h-10zM322 35h10v50h-10z" /></g>
    <g fill="#e3e5d9" fontSize="13" fontFamily="sans-serif"><text x="465" y="130">{t("Anodes")}</text><text x="465" y="198">{t("Bath")}</text><text x="465" y="234">{t("Aluminum")}</text><text x="465" y="270">{t("Lined shell")}</text></g>
    <g stroke="#7b8983" strokeWidth="1"><path d="M371 125h85M430 193h26M430 230h26M451 266h5" /></g>
  </svg>
}
