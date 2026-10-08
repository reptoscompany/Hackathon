import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, Bell, Check, ChevronRight, Radio, ShieldAlert, TrendingUp, X } from 'lucide-react'
import { api, mapHotspot } from '../lib/api'
import { Button, Eyebrow, Surface } from './ui'

type LiveAlert = { id: number | string; title: string; area: string; level: string; time: string; detail: string }
type Signal = { area: string; crime_type: string; severity: string; reason: string; incident_count: number }

const severityTone: Record<string, string> = { HIGH: 'bg-[#d97706]', MEDIUM: 'bg-[#0f766e]', LOW: 'bg-[#68736e]' }

export function LiveMapInsights() {
  const [alerts, setAlerts] = useState<LiveAlert[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [hotspots, setHotspots] = useState<any[]>([])
  const [lastSync, setLastSync] = useState('connecting')
  const [unread, setUnread] = useState(0)
  const [activeAlert, setActiveAlert] = useState<LiveAlert | null>(null)
  const [showAll, setShowAll] = useState(false)

  const refresh = async (initial = false) => {
    try {
      const [nextAlerts, analytics, nextHotspots] = await Promise.all([api.alerts(), api.analytics(), api.hotspots()])
      setAlerts(nextAlerts); setSignals(analytics.anomalies ?? []); setHotspots(nextHotspots.map(mapHotspot)); setLastSync(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      if (!initial) setUnread((value) => Math.min(9, value + 1))
    } catch { setLastSync('offline fallback') }
  }

  useEffect(() => { refresh(true); const timer = window.setInterval(() => refresh(), 15000); return () => window.clearInterval(timer) }, [])

  const visibleAlerts = useMemo(() => showAll ? alerts : alerts.slice(0, 3), [alerts, showAll])
  const maxRisk = Math.max(...hotspots.map((item) => item.riskScore), 1)

  return <div className="space-y-5">
    <Surface className="overflow-hidden"><div className="flex items-center justify-between border-b border-border px-4 py-3"><div className="flex items-center gap-2"><div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-[#bdd3c7] bg-[#e8f0eb] text-signal"><Radio size={14} /><span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-[#d97706]" /></div><div><div className="mono text-[10px] font-semibold tracking-[.08em] text-warm">LIVE SIGNAL FEED</div><div className="mono mt-0.5 text-[8px] uppercase tracking-[.1em] text-muted">Auto-refresh · 15 sec</div></div></div><button onClick={() => { setUnread(0); setShowAll(true) }} className="relative text-muted transition-colors hover:text-signal"><Bell size={14} />{unread > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d97706] px-1 text-[8px] font-bold text-white">{unread}</span>}</button></div><div className="px-4 py-3"><div className="mb-3 flex items-center justify-between"><Eyebrow>Active notifications</Eyebrow><span className="mono text-[8px] text-[#0f766e]">{lastSync === 'offline fallback' ? 'OFFLINE' : `SYNC ${lastSync}`}</span></div><div className="space-y-2">{visibleAlerts.map((alert) => <button key={String(alert.id)} onClick={() => { setActiveAlert(alert); setUnread(0) }} className="group flex w-full items-start gap-2.5 border-b border-border/70 pb-2.5 text-left last:border-0 last:pb-0"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityTone[alert.level] ?? severityTone.LOW}`} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[11px] font-semibold text-warm">{alert.title}</span><span className="mono text-[8px] text-muted">{alert.time}</span></span><span className="mt-1 block truncate text-[9px] text-muted">{alert.area} · {alert.detail}</span></span><ChevronRight size={12} className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-signal" /></button>)}</div>{alerts.length > 3 && <button onClick={() => setShowAll((value) => !value)} className="mt-3 text-[9px] font-semibold uppercase tracking-[.12em] text-signal hover:text-warm">{showAll ? 'Collapse feed' : `View ${alerts.length - 3} more alerts`}</button>}</div></Surface>

    <Surface className="p-4"><div className="mb-4 flex items-start justify-between"><div><Eyebrow className="mb-1">Risk intelligence</Eyebrow><div className="text-sm font-semibold text-warm">Area pressure index</div></div><TrendingUp size={15} className="text-signal" /></div><div className="space-y-3">{hotspots.slice(0, 5).map((spot, index) => <div key={spot.id} className="group"><div className="mb-1.5 flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="mono text-[9px] text-muted">0{index + 1}</span><span className="truncate text-[10px] font-semibold text-warm">{spot.name}</span></div><span className="mono text-[11px] font-semibold text-signal">{spot.riskScore}</span></div><div className="h-1 overflow-hidden rounded-full bg-[#e8ece5]"><div className="h-full rounded-full bg-gradient-to-r from-[#7ca99b] to-[#0f766e] transition-all duration-700" style={{ width: `${(spot.riskScore / maxRisk) * 100}%` }} /></div><div className="mt-1 flex justify-between text-[8px] text-muted"><span>{spot.primaryPattern} · {spot.incidentCount} incidents</span><span>{spot.peakTime}</span></div></div>)}</div><div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-[9px] text-muted"><Activity size={12} className="text-signal" />Scores refresh from backend hotspot analytics</div></Surface>

    <Surface className="p-4"><div className="mb-3 flex items-center justify-between"><div><Eyebrow className="mb-1">Unusual patterns</Eyebrow><div className="text-sm font-semibold text-warm">Anomaly watch</div></div><ShieldAlert size={15} className="text-[#d97706]" /></div>{signals.length ? <div className="space-y-2">{signals.slice(0, 3).map((signal, index) => <div key={`${signal.area}-${signal.crime_type}-${index}`} className="rounded-lg border border-[#ead8ba] bg-[#fff8ed] p-2.5"><div className="flex items-center gap-2"><AlertTriangle size={12} className="text-[#d97706]" /><span className="text-[10px] font-semibold text-warm">{signal.area} · {signal.crime_type}</span></div><div className="mt-1 text-[9px] leading-4 text-muted">{signal.reason} · {signal.incident_count} records</div></div>)}</div> : <div className="rounded-lg border border-dashed border-border p-3 text-[10px] text-muted">No unusual patterns detected in the latest scan.</div>}<Button variant="ghost" size="sm" className="mt-2 h-7 px-0 text-[9px]">Open analytics <ArrowUpRight size={11} /></Button></Surface>

    {activeAlert && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#102822]/25 p-4 sm:items-center"><div className="w-full max-w-[380px] rounded-2xl border border-border bg-card p-5 shadow-2xl"><div className="flex items-start justify-between"><div><Eyebrow className="mb-2">Live alert · {activeAlert.level}</Eyebrow><h3 className="text-[18px] font-semibold text-warm">{activeAlert.title}</h3></div><button onClick={() => setActiveAlert(null)} className="text-muted hover:text-warm"><X size={16} /></button></div><div className="mt-5 rounded-xl border border-border bg-panel p-4"><div className="flex items-center gap-2 text-xs font-semibold text-warm"><AlertTriangle size={14} className="text-[#d97706]" />{activeAlert.area}</div><p className="mt-2 text-xs leading-5 text-muted">{activeAlert.detail}</p><div className="mono mt-3 text-[9px] text-signal">SOURCE · SYNTHETIC BACKEND ALERT STREAM</div></div><button onClick={() => setActiveAlert(null)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f766e] py-2.5 text-[10px] font-semibold uppercase tracking-[.1em] text-white"><Check size={13} />Acknowledge alert</button></div></div>}
  </div>
}
