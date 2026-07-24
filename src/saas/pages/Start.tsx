import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Check } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { GoldButton, Panel, Tag } from '../suite/ui'
import { TOOLS } from '../suite/tools'
import { BUSINESS_TYPES, PAYMENT_CHIPS, type BusinessTypeId } from '../onboarding'
import { useI18n } from '../i18n'
import { useSession, setToolkit } from '../store'

/** The business-type onboarding content (al-onboarding.html). Exported separately
 * from the routed page — same split as Hub/HubContent — so it can be tested
 * without an authenticated session. */
export function StartContent() {
  const { t } = useI18n()
  const o = t.onboarding
  const h = t.hub
  const navigate = useNavigate()
  const session = useSession()
  const region = session?.workspace.marketRegion ?? 'gulf'
  const [selected, setSelected] = useState<BusinessTypeId>(session?.workspace.businessType ?? BUSINESS_TYPES[0].id)

  const type = BUSINESS_TYPES.find((b) => b.id === selected) ?? BUSINESS_TYPES[0]
  const kitTools = type.toolkit
    .map((key) => TOOLS.find((tool) => tool.key === key))
    .filter((tool): tool is (typeof TOOLS)[number] => !!tool)

  function handleConfirm() {
    setToolkit(selected, type.toolkit)
    navigate('/app')
  }

  return (
    <div className="mx-auto max-w-[1080px] px-[30px] pb-[60px] pt-9">
      <div className="mb-[30px] text-center">
        <Tag>{o.kicker}</Tag>
        <h1 className="font-luxe mt-2.5 text-4xl font-semibold text-suite-text">{o.title}</h1>
        <p className="mt-1.5 text-[15px] text-suite-muted">{o.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 min-[821px]:grid-cols-[1.3fr_1fr]">
        <Panel className="p-[22px]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-suite-muted">{o.step1}</p>
          <div className="grid grid-cols-2 gap-3">
            {BUSINESS_TYPES.map((b) => {
              const Icon = b.icon
              const isOn = b.id === selected
              return (
                <button
                  key={b.id}
                  type="button"
                  data-testid={`biztype-${b.id}`}
                  onClick={() => setSelected(b.id)}
                  aria-pressed={isOn}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 text-start transition-colors ${
                    isOn ? 'border-suite-gold bg-[#1e1a12]' : 'border-suite-line bg-suite-panel2 hover:border-[#3a3d49]'
                  }`}
                >
                  <span
                    className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] text-suite-gold-l ${
                      isOn ? 'bg-suite-gold/15' : 'bg-[#20222b]'
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.6} aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-suite-text">{o.types[b.id]}</span>
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel className="static top-5 p-[22px] min-[821px]:sticky">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-suite-muted">{o.step2}</p>
          <div>
            {kitTools.map((tool) => {
              const Icon = tool.icon
              return (
                <div key={tool.key} className="flex items-center gap-3 border-b border-suite-line py-[11px] last:border-0">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-suite-panel2 text-suite-gold-l">
                    <Icon size={16} strokeWidth={1.6} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-suite-text">{h.tools[tool.key].name}</p>
                    <p className="text-xs text-suite-muted">{o.tools[tool.key]}</p>
                  </div>
                  <Check size={16} strokeWidth={2.2} aria-hidden className="ms-auto flex-shrink-0 text-suite-ok" />
                </div>
              )
            })}
          </div>

          <div className="mt-4 border-t border-suite-line pt-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-suite-muted">
              {o.paymentsLabel}
              <span className="rounded-full bg-suite-panel2 px-2 py-0.5 text-[10px] normal-case tracking-normal text-suite-gold-l">{o.soonTag}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_CHIPS[region].map((chip) => (
                <span key={chip} className="rounded-full border border-suite-line bg-suite-panel2 px-2.5 py-1 text-[11.5px] text-[#d8d5cc]">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <GoldButton onClick={handleConfirm} className="mt-[18px] w-full justify-center">
            {o.cta}
          </GoldButton>
          <p className="mt-3.5 text-center text-xs text-suite-muted">{o.note}</p>
        </Panel>
      </div>
    </div>
  )
}

export default function Start() {
  return (
    <SuiteShell minimal>
      <Helmet defer={false}>
        <title>AutoLeadss — set up your growth</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <StartContent />
    </SuiteShell>
  )
}
