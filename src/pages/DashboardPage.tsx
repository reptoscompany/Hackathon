import { useNavigate } from 'react-router-dom'
import { Activity, AlertTriangle, Crosshair, ShieldCheck, Siren } from 'lucide-react'
import { useEffect, useState } from 'react'
import { alerts, hotspots, incidents } from '../data/mockData'
import { api, mapIncident } from '../lib/api'
import type { Hotspot, Incident } from '../types'
import { AIIntelligence } from '../components/AIIntelligence'
import { CrimeMap } from '../components/CrimeMap'
import { HotspotPanel } from '../components/HotspotPanel'
import { IncidentTable } from '../components/IncidentTable'
import { Button, Eyebrow, KPIBlock, LinkAction, SectionHeading, Surface } from '../components/ui'
import { RiskList } from '../components/RiskList'
import { TrendChart } from '../components/Charts'

export function DashboardPage() {
  const navigate = useNavigate()
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(hotspots[0])
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [backendStats, setBackendStats] = useState<{ today_incidents: number; high_risk_zones: number; active_alerts: number; patrol_coverage: number } | null>(null)
  const [backendIncidents, setBackendIncidents] = useState<Incident[]>(incidents)
  useEffect(() => { api.dashboard().then(setBackendStats).catch(() => undefined); api.incidents().then((rows) => setBackendIncidents(rows.map(mapIncident))).catch(() => undefined) }, [])
  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><Eyebrow className="mb-2">Night shift Â· 13 October 2026 Â· 19:42 IST</Eyebrow><h2 className="max-w-[640px] text-[28px] font-semibold tracking-[-.055em] text-warm sm:text-[34px]">Operational picture <span className="text-softred">/ live.</span></h2><p className="mt-2 max-w-[560px] text-xs leading-5 text-muted">Synthetic signal across Puducherry jurisdiction. Confirm the context, review the risk window, and move the next unit with confidence.</p></div><Button onClick={() => navigate('/reports')} variant="secondary"><Siren size={14} /> Open daily brief <span className="mono text-muted">â†—</span></Button></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KPIBlock label="Today's incidents" value={String(backendStats?.today_incidents ?? 27)} trend="LIVE" detail="from SQLite database" icon={Activity} accent /><KPIBlock label="High risk zones" value={String(backendStats?.high_risk_zones ?? 8).padStart(2, '0')} trend="RANKED" detail="explainable estimate" icon={Crosshair} /><KPIBlock label="Active alerts" value={String(backendStats?.active_alerts ?? 3).padStart(2, '0')} trend="LIVE" detail="backend alert stream" icon={AlertTriangle} /><KPIBlock label="Patrol coverage" value={`${backendStats?.patrol_coverage ?? 92}%`} trend="OPTIMIZED" detail="current shift plan" icon={ShieldCheck} /></div>
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.75fr)]"><div className="min-w-0"><SectionHeading eyebrow="Geospatial intelligence" title="Live crime map" detail="Synthetic incident signals Â· Puducherry district" action={<LinkAction onClick={() => navigate('/crime-map')}>Open full map</LinkAction>} /><CrimeMap className="min-h-[560px]" onHotspotSelect={setSelectedHotspot} onIncidentSelect={setSelectedIncident} focusArea={selectedHotspot} /></div><div className="min-w-0"><SectionHeading eyebrow="Decision support" title="Intelligence console" detail="Risk-ranked response context" /><AIIntelligence onViewMap={() => navigate('/crime-map')} /></div></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(320px,.8fr)_minmax(0,1.2fr)]"><div className="space-y-5"><HotspotPanel hotspot={selectedHotspot} onViewMap={() => navigate('/crime-map')} onPatrol={() => navigate('/patrol-planning')} /><Surface className="p-5"><div className="mb-4 flex items-center justify-between"><div><Eyebrow className="mb-1">Current attention</Eyebrow><div className="text-sm font-semibold text-warm">Active alerts</div></div><span className="mono text-[10px] text-softred">{backendStats?.active_alerts ?? 3} OPEN</span></div><div className="space-y-3">{alerts.map((alert) => <div key={alert.id} className="flex gap-3 border-b border-border/70 pb-3 last:border-0 last:pb-0"><div className="mt-1 h-2 w-2 rounded-full bg-signal" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div className="text-xs font-medium text-warm">{alert.title}</div><div className="mono text-[9px] text-muted">{alert.time}</div></div><div className="mt-1 text-[10px] text-muted">{alert.area} Â· {alert.detail}</div></div></div>)}</div></Surface></div><div className="min-w-0"><SectionHeading eyebrow="Records pulse" title="Recent incidents" detail="Click a record to inspect its operational context" action={<LinkAction onClick={() => navigate('/incidents')}>View register</LinkAction>} /><IncidentTable data={backendIncidents} onSelect={setSelectedIncident} compact /></div></div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><TrendChart compact /><RiskList /></div>
    {selectedIncident && <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[420px]"><div className="h-full"><div className="absolute inset-0" onClick={() => setSelectedIncident(null)} /><div className="relative h-full"><IncidentMiniDrawer incident={selectedIncident} onClose={() => setSelectedIncident(null)} /></div></div></div>}
  </div>
}

function IncidentMiniDrawer({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  return <div className="absolute right-0 top-0 h-full w-full border-l border-border bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><div><Eyebrow>Selected incident</Eyebrow><div className="mt-2 text-lg font-semibold text-warm">{incident.id} Â· {incident.crime}</div></div><button onClick={onClose} className="text-muted hover:text-warm">Ã—</button></div><div className="mt-6 space-y-3"><div className="rounded-lg border border-border bg-surface p-4"><div className="eyebrow">Location</div><div className="mt-2 text-sm text-warm">{incident.location}</div><div className="mono mt-1 text-[10px] text-muted">{incident.date} Â· {incident.time}</div></div><div className="rounded-lg border border-[#bdd3c7] bg-[#e8f0eb] p-4"><div className="eyebrow">Operational note</div><p className="mt-2 text-xs leading-5 text-[#5f6c65]">{incident.summary}</p></div></div><Button variant="secondary" className="mt-5 w-full" onClick={onClose}>Close detail</Button></div>
}
