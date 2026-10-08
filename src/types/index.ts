export type CrimeType = 'Theft' | 'Assault' | 'Vehicle Theft' | 'Burglary' | 'Other'
export type Severity = 'HIGH' | 'MEDIUM' | 'LOW'
export type IncidentStatus = 'INVESTIGATING' | 'MONITORING' | 'RESOLVED'
export type Period = 'LIVE' | '24H' | '7D' | '30D'

export interface Area {
  id: string
  name: string
  district: string
  coordinates: [number, number]
  riskScore: number
  incidentCount: number
  peakTime: string
  primaryPattern: CrimeType
  trend: number
}

export interface Hotspot extends Area {
  intensity: number
  radius: number
  color: string
}

export interface Incident {
  id: string
  crime: CrimeType
  location: string
  coordinates: [number, number]
  date: string
  time: string
  severity: Severity
  status: IncidentStatus
  nearbyIncidents: number
  similarCases: number
  summary: string
}

export interface PatrolUnit {
  id: string
  location: string
  shift: string
  status: 'ACTIVE' | 'STANDBY' | 'REASSIGNED'
  coverage: number
  route: [number, number][]
}

export interface Alert {
  id: string
  title: string
  area: string
  level: Severity
  time: string
  detail: string
}

export interface ChartPoint {
  day: string
  incidents: number
  resolved: number
}

export interface AIInsight {
  title: string
  body: string
  areas: { name: string; score: number }[]
  peakTime: string
  recommendation: string
}
