import { ArrowUpRight } from 'lucide-react'
import { areas } from '../data/mockData'
import { Badge, Surface } from './ui'
import { riskTone } from '../lib/utils'

export function RiskList({ limit = 5 }: { limit?: number }) {
  return <Surface className="p-5"><div className="mb-4 flex items-center justify-between"><div><div className="eyebrow mb-1">Priority zones</div><div className="text-sm font-semibold text-warm">Top risk areas</div></div><ArrowUpRight size={15} className="text-muted" /></div><div className="space-y-3">{areas.slice(0, limit).map((area, index) => <div key={area.id} className="flex items-center gap-3"><span className="mono w-5 text-[10px] text-muted">0{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-medium text-warm">{area.name}</span><span className="mono text-[11px] text-softred">{area.riskScore}</span></div><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-signal" style={{ width: `${area.riskScore}%`, opacity: .8 }} /></div></div><Badge tone={riskTone(area.riskScore)}>{area.riskScore >= 80 ? 'high' : area.riskScore >= 65 ? 'med' : 'low'}</Badge></div>)}</div></Surface>
}
