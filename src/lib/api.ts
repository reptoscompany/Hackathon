import type { AIInsight, Incident, PatrolUnit } from '../types'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export type DashboardStats = { today_incidents: number; high_risk_zones: number; active_alerts: number; patrol_coverage: number; crime_trend: { day: string; incidents: number; resolved: number }[]; top_crime_types: { name: string; value: number; percentage: number }[]; top_risk_areas: { name: string; risk_score: number }[] }
export type PredictionResponse = { results: { area: string; risk_score: number; factors: Record<string, number>; primary_crime: string; peak_time: string }[]; disclaimer: string }
export type PatrolResponse = { assignments: { unit: string; area: string; start_time: string; end_time: string; priority: string; reason: string; risk_score: number }[]; patrol_coverage: number }

export const api = {
  dashboard: () => request<DashboardStats>('/api/dashboard/stats'),
  incidents: () => request<any[]>('/api/incidents?limit=100'),
  hotspots: () => request<any[]>('/api/hotspots'),
  alerts: () => request<any[]>('/api/alerts'),
  analytics: () => request<any>('/api/analytics'),
  prediction: (payload: Record<string, unknown>) => request<PredictionResponse>('/api/prediction', { method: 'POST', body: JSON.stringify(payload) }),
  patrolOptimize: (payload: Record<string, unknown>) => request<PatrolResponse>('/api/patrol/optimize', { method: 'POST', body: JSON.stringify(payload) }),
  patrolSimulate: (payload: Record<string, unknown>) => request<any>('/api/patrol/simulate', { method: 'POST', body: JSON.stringify(payload) }),
  aiQuery: (question: string) => request<AIInsight>('/api/ai/query', { method: 'POST', body: JSON.stringify({ question }) }),
}

export function mapIncident(row: any): Incident {
  const timestamp = new Date(row.timestamp)
  return { id: `#${row.id}`, crime: row.crime_type === 'Robbery' || row.crime_type === 'Vandalism' ? 'Other' : row.crime_type, location: row.area, coordinates: [row.longitude, row.latitude], date: timestamp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), time: timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), severity: row.severity, status: row.status, nearbyIncidents: 0, similarCases: 0, summary: row.description }
}

export function mapHotspot(row: any) {
  return { id: row.id, name: row.name, district: row.district, coordinates: row.coordinates, riskScore: row.risk_score, incidentCount: row.incident_count, peakTime: row.peak_time, primaryPattern: row.dominant_crime === 'Robbery' || row.dominant_crime === 'Vandalism' ? 'Other' : row.dominant_crime, trend: row.trend, intensity: Math.min(.95, .48 + row.risk_score / 200), radius: .008, color: row.risk_score >= 80 ? '#0f766e' : row.risk_score >= 70 ? '#d97706' : '#68736e' }
}

export function mapPatrol(row: any): PatrolUnit { return { id: row.unit, location: row.area, shift: `${row.start_time}–${row.end_time}`, status: row.priority === 'HIGH' ? 'ACTIVE' : 'STANDBY', coverage: Math.min(40, row.risk_score ? Math.round(row.risk_score / 3) : 30), route: [] } }
