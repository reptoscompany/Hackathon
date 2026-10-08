import type { AIInsight, Alert, Area, ChartPoint, Hotspot, Incident, PatrolUnit } from '../types'

export const areas: Area[] = [
  { id: 'white-town', name: 'White Town', district: 'Heritage District', coordinates: [79.8353, 11.9312], riskScore: 92, incidentCount: 27, peakTime: '19:00 â€“ 23:00', primaryPattern: 'Vehicle Theft', trend: 42 },
  { id: 'mg-road', name: 'M.G. Road', district: 'Central Puducherry', coordinates: [79.8275, 11.9346], riskScore: 84, incidentCount: 19, peakTime: '20:00 â€“ 22:00', primaryPattern: 'Theft', trend: 28 },
  { id: 'lawspet', name: 'Lawspet', district: 'North Puducherry', coordinates: [79.8086, 11.9481], riskScore: 68, incidentCount: 14, peakTime: '18:00 â€“ 21:00', primaryPattern: 'Burglary', trend: 12 },
  { id: 'reddiarpalayam', name: 'Reddiarpalayam', district: 'West Puducherry', coordinates: [79.7958, 11.9257], riskScore: 64, incidentCount: 11, peakTime: '21:00 â€“ 00:00', primaryPattern: 'Assault', trend: -8 },
  { id: 'villianur', name: 'Villianur', district: 'South Puducherry', coordinates: [79.7557, 11.9106], riskScore: 56, incidentCount: 8, peakTime: '18:00 â€“ 20:00', primaryPattern: 'Other', trend: 4 },
  { id: 'beach-road', name: 'Beach Road', district: 'Coastal Precinct', coordinates: [79.8376, 11.9279], riskScore: 73, incidentCount: 16, peakTime: '22:00 â€“ 01:00', primaryPattern: 'Theft', trend: 18 },
  { id: 'heritage-town', name: 'Heritage Town', district: 'Heritage District', coordinates: [79.832, 11.934], riskScore: 76, incidentCount: 17, peakTime: '18:00 â€“ 22:00', primaryPattern: 'Burglary', trend: 21 },
]

export const hotspots: Hotspot[] = areas.map((area, index) => ({
  ...area,
  intensity: Math.min(0.95, 0.48 + area.riskScore / 200),
  radius: 0.008 + index * 0.0006,
  color: area.riskScore >= 80 ? '#2563EB' : area.riskScore >= 70 ? '#7CA99B' : '#87958D',
}))

export const incidents: Incident[] = [
  { id: '#1024', crime: 'Vehicle Theft', location: 'M.G. Road', coordinates: [79.8275, 11.9346], date: '13 Oct 2026', time: '19:22', severity: 'HIGH', status: 'INVESTIGATING', nearbyIncidents: 4, similarCases: 7, summary: 'Two-wheeler reported missing from a high-footfall curbside cluster. Camera coverage is being reviewed.' },
  { id: '#1023', crime: 'Theft', location: 'White Town', coordinates: [79.8353, 11.9312], date: '13 Oct 2026', time: '18:48', severity: 'HIGH', status: 'MONITORING', nearbyIncidents: 6, similarCases: 11, summary: 'Bag snatch reported near the promenade entrance during evening peak activity.' },
  { id: '#1022', crime: 'Burglary', location: 'Heritage Town', coordinates: [79.832, 11.934], date: '13 Oct 2026', time: '17:15', severity: 'MEDIUM', status: 'INVESTIGATING', nearbyIncidents: 3, similarCases: 5, summary: 'Forced entry signal from a residential lane with repeated nighttime activity.' },
  { id: '#1021', crime: 'Assault', location: 'Reddiarpalayam', coordinates: [79.7958, 11.9257], date: '13 Oct 2026', time: '16:40', severity: 'MEDIUM', status: 'RESOLVED', nearbyIncidents: 2, similarCases: 3, summary: 'Dispute resolved on site. No further escalation detected in the surrounding grid.' },
  { id: '#1020', crime: 'Theft', location: 'Beach Road', coordinates: [79.8376, 11.9279], date: '12 Oct 2026', time: '22:11', severity: 'LOW', status: 'MONITORING', nearbyIncidents: 4, similarCases: 6, summary: 'Personal item theft reported near the late-evening promenade flow.' },
  { id: '#1019', crime: 'Vehicle Theft', location: 'White Town', coordinates: [79.8353, 11.9312], date: '12 Oct 2026', time: '21:04', severity: 'HIGH', status: 'INVESTIGATING', nearbyIncidents: 5, similarCases: 9, summary: 'Vehicle theft cluster overlaps the White Town north access corridor.' },
  { id: '#1018', crime: 'Other', location: 'Lawspet', coordinates: [79.8086, 11.9481], date: '12 Oct 2026', time: '20:16', severity: 'LOW', status: 'RESOLVED', nearbyIncidents: 1, similarCases: 2, summary: 'Noise disturbance logged and closed after patrol verification.' },
]

export const patrolUnits: PatrolUnit[] = [
  { id: 'UNIT 01', location: 'White Town', shift: '18:00â€“20:00', status: 'ACTIVE', coverage: 34, route: [[79.828, 11.935], [79.8353, 11.9312], [79.838, 11.928]] },
  { id: 'UNIT 02', location: 'M.G. Road', shift: '20:00â€“22:00', status: 'ACTIVE', coverage: 31, route: [[79.818, 11.938], [79.8275, 11.9346], [79.832, 11.934]] },
  { id: 'UNIT 03', location: 'Heritage Town', shift: '19:00â€“23:00', status: 'STANDBY', coverage: 27, route: [[79.829, 11.932], [79.832, 11.934], [79.836, 11.932]] },
]

export const alerts: Alert[] = [
  { id: 'ALT-07', title: 'Vehicle theft cluster', area: 'White Town', level: 'HIGH', time: '19:31', detail: 'Four linked incidents in the last 72 hours.' },
  { id: 'ALT-06', title: 'Patrol coverage gap', area: 'M.G. Road', level: 'MEDIUM', time: '19:12', detail: 'Unit handoff window begins in 28 minutes.' },
  { id: 'ALT-05', title: 'Night activity uplift', area: 'Beach Road', level: 'LOW', time: '18:54', detail: 'Activity is 18% above the rolling baseline.' },
]

export const chartData: ChartPoint[] = [
  { day: '14 Sep', incidents: 16, resolved: 10 }, { day: '17 Sep', incidents: 21, resolved: 14 }, { day: '20 Sep', incidents: 18, resolved: 13 }, { day: '23 Sep', incidents: 24, resolved: 16 }, { day: '26 Sep', incidents: 22, resolved: 17 }, { day: '29 Sep', incidents: 28, resolved: 19 }, { day: '02 Oct', incidents: 25, resolved: 18 }, { day: '05 Oct', incidents: 31, resolved: 22 }, { day: '08 Oct', incidents: 27, resolved: 20 }, { day: '11 Oct', incidents: 34, resolved: 24 }, { day: '13 Oct', incidents: 27, resolved: 21 },
]

export const crimeDistribution = [
  { name: 'Theft', value: 34, color: '#2563EB' },
  { name: 'Assault', value: 22, color: '#7CA99B' },
  { name: 'Vehicle Theft', value: 18, color: '#1D4ED8' },
  { name: 'Burglary', value: 12, color: '#B8CFC3' },
  { name: 'Other', value: 14, color: '#87958D' },
]

export const aiInsight: AIInsight = {
  title: 'Analysis complete',
  body: '3 high-risk areas identified across the current evening window.',
  areas: [{ name: 'White Town', score: 91 }, { name: 'M.G. Road', score: 84 }, { name: 'Heritage Town', score: 76 }],
  peakTime: '20:00 â€“ 23:00',
  recommendation: 'Increase patrol presence in White Town and M.G. Road.',
}

export const predictionResult = [
  { name: 'White Town', score: 91, reason: 'Vehicle theft frequency is elevated after 19:00.' },
  { name: 'M.G. Road', score: 84, reason: 'Recent incidents overlap with the evening commuter pattern.' },
  { name: 'Heritage Town', score: 78, reason: 'Residential density and repeat cases raise exposure.' },
]

export const formatRisk = (score: number) => score >= 80 ? 'HIGH' : score >= 65 ? 'MEDIUM' : 'LOW'
