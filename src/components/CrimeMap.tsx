import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Layers3, LocateFixed, Minus, Plus, RadioTower } from 'lucide-react'
import { hotspots, incidents } from '../data/mockData'
import type { Hotspot, Incident, Period } from '../types'
import { Badge } from './ui'
import { riskLabel, riskTone } from '../lib/utils'

const style: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#ebece6' } }],
}

const makeHotspotCollection = () => ({
  type: 'FeatureCollection',
  features: hotspots.map((spot) => ({
    type: 'Feature',
    properties: { id: spot.id, name: spot.name, score: spot.riskScore, incidents: spot.incidentCount, risk: riskLabel(spot.riskScore), crime: spot.primaryPattern },
    geometry: { type: 'Point', coordinates: spot.coordinates },
  })),
})

const makeIncidentCollection = () => ({
  type: 'FeatureCollection',
  features: incidents.map((incident) => ({
    type: 'Feature',
    properties: { id: incident.id, crime: incident.crime, severity: incident.severity, location: incident.location, date: incident.date },
    geometry: { type: 'Point', coordinates: incident.coordinates },
  })),
})

const adminBoundary = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[79.745, 11.958], [79.81, 11.965], [79.846, 11.949], [79.848, 11.916], [79.8, 11.895], [79.748, 11.902], [79.745, 11.958]]] } }],
}

const roads = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { class: 'major' }, geometry: { type: 'LineString', coordinates: [[79.75, 11.909], [79.78, 11.919], [79.806, 11.928], [79.828, 11.935], [79.838, 11.932]] } },
    { type: 'Feature', properties: { class: 'major' }, geometry: { type: 'LineString', coordinates: [[79.809, 11.952], [79.816, 11.945], [79.826, 11.938], [79.837, 11.931]] } },
    { type: 'Feature', properties: { class: 'major' }, geometry: { type: 'LineString', coordinates: [[79.787, 11.901], [79.795, 11.922], [79.804, 11.945], [79.811, 11.959]] } },
    { type: 'Feature', properties: { class: 'minor' }, geometry: { type: 'LineString', coordinates: [[79.814, 11.941], [79.833, 11.94], [79.841, 11.938]] } },
    { type: 'Feature', properties: { class: 'minor' }, geometry: { type: 'LineString', coordinates: [[79.818, 11.925], [79.828, 11.935], [79.835, 11.944]] } },
    { type: 'Feature', properties: { class: 'minor' }, geometry: { type: 'LineString', coordinates: [[79.805, 11.93], [79.819, 11.932], [79.834, 11.931]] } },
    { type: 'Feature', properties: { class: 'minor' }, geometry: { type: 'LineString', coordinates: [[79.8, 11.913], [79.815, 11.918], [79.832, 11.924], [79.841, 11.927]] } },
  ],
}

const coastline = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[79.846, 11.96], [79.843, 11.949], [79.842, 11.938], [79.841, 11.932], [79.842, 11.924], [79.839, 11.912], [79.834, 11.9]] } }] }
const waterways = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[79.769, 11.948], [79.783, 11.942], [79.797, 11.935], [79.809, 11.921], [79.816, 11.906]] } }] }

export function CrimeMap({ className = '', onHotspotSelect, onIncidentSelect, focusArea }: { className?: string; onHotspotSelect?: (hotspot: Hotspot) => void; onIncidentSelect?: (incident: Incident) => void; focusArea?: Hotspot | null }) {
  const mapNode = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const hotspotHandler = useRef(onHotspotSelect)
  const incidentHandler = useRef(onIncidentSelect)
  const [period, setPeriod] = useState<Period>('LIVE')
  const [crimeFilter, setCrimeFilter] = useState('All')
  const [areaFilter, setAreaFilter] = useState('All Areas')
  const [dateFilter, setDateFilter] = useState('Today')
  const [activeLayers, setActiveLayers] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { hotspotHandler.current = onHotspotSelect; incidentHandler.current = onIncidentSelect }, [onHotspotSelect, onIncidentSelect])

  useEffect(() => {
    if (!mapNode.current) return
    const map = new maplibregl.Map({ container: mapNode.current, style, center: [79.816, 11.931], zoom: 11.6, minZoom: 10.5, maxZoom: 18, attributionControl: { compact: true } })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: false }), 'bottom-right')
    map.on('load', () => {
      map.addSource('osm-base', { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' })
      map.addLayer({ id: 'osm-base', type: 'raster', source: 'osm-base', paint: { 'raster-opacity': 0.94, 'raster-saturation': -0.18, 'raster-contrast': 0.04 } })
      map.addSource('admin-boundary', { type: 'geojson', data: adminBoundary as any })
      map.addLayer({ id: 'admin-fill', type: 'fill', source: 'admin-boundary', paint: { 'fill-color': '#e3e9e1', 'fill-opacity': 0.58 } })
      map.addLayer({ id: 'admin-line', type: 'line', source: 'admin-boundary', paint: { 'line-color': '#98a69d', 'line-width': 1, 'line-opacity': 0.72, 'line-dasharray': [2, 2] } })
      map.addSource('roads', { type: 'geojson', data: roads as any })
      map.addLayer({ id: 'minor-roads', type: 'line', source: 'roads', filter: ['==', ['get', 'class'], 'minor'], paint: { 'line-color': '#b8c2ba', 'line-width': 0.7, 'line-opacity': 0.8 } })
      map.addLayer({ id: 'major-roads', type: 'line', source: 'roads', filter: ['==', ['get', 'class'], 'major'], paint: { 'line-color': '#5b6a62', 'line-width': 1.45, 'line-opacity': 0.92 } })
      map.addSource('waterways', { type: 'geojson', data: waterways as any })
      map.addLayer({ id: 'waterways', type: 'line', source: 'waterways', paint: { 'line-color': '#8fb3aa', 'line-width': 1, 'line-opacity': 0.72, 'line-dasharray': [1, 2] } })
      map.addSource('coastline', { type: 'geojson', data: coastline as any })
      map.addLayer({ id: 'coastline', type: 'line', source: 'coastline', paint: { 'line-color': '#0f766e', 'line-width': 1.5, 'line-opacity': 0.72 } })
      map.addSource('hotspots', { type: 'geojson', data: makeHotspotCollection() as any })
      map.addLayer({ id: 'hotspot-points', type: 'circle', source: 'hotspots', paint: { 'circle-radius': ['interpolate', ['linear'], ['get', 'score'], 50, 3.5, 95, 6], 'circle-color': ['match', ['get', 'risk'], 'HIGH', '#0f766e', 'MEDIUM', '#d97706', '#68736e'], 'circle-stroke-color': '#fffdf8', 'circle-stroke-width': 1.2, 'circle-opacity': 0.96 } })
      map.addLayer({ id: 'hotspot-labels', type: 'symbol', source: 'hotspots', layout: { 'text-field': ['get', 'name'], 'text-size': 10, 'text-offset': [0, 1.35], 'text-anchor': 'top', 'text-font': ['Open Sans Regular'] }, paint: { 'text-color': '#3f4d46', 'text-halo-color': '#fffdf8', 'text-halo-width': 1.3 } })
      map.addSource('incidents', { type: 'geojson', data: makeIncidentCollection() as any, cluster: true, clusterMaxZoom: 13, clusterRadius: 34 })
      map.addLayer({ id: 'incident-clusters', type: 'circle', source: 'incidents', filter: ['has', 'point_count'], paint: { 'circle-radius': 14, 'circle-color': '#fffdf8', 'circle-stroke-color': '#0f766e', 'circle-stroke-width': 1.3, 'circle-opacity': 0.98 } })
      map.addLayer({ id: 'incident-cluster-count', type: 'symbol', source: 'incidents', filter: ['has', 'point_count'], layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 10, 'text-font': ['Open Sans Bold'] }, paint: { 'text-color': '#145c55' } })
      map.addLayer({ id: 'incident-points', type: 'circle', source: 'incidents', filter: ['!', ['has', 'point_count']], paint: { 'circle-radius': 4, 'circle-color': ['match', ['get', 'severity'], 'HIGH', '#0f766e', 'MEDIUM', '#d97706', '#68736e'], 'circle-stroke-color': '#fffdf8', 'circle-stroke-width': 1, 'circle-opacity': 0.94 } })
      map.on('click', 'hotspot-points', (event) => { const id = event.features?.[0]?.properties?.id; const spot = hotspots.find((item) => item.id === id); if (spot) hotspotHandler.current?.(spot) })
      map.on('click', 'incident-points', (event) => { const id = event.features?.[0]?.properties?.id; const incident = incidents.find((item) => item.id === id); if (incident) incidentHandler.current?.(incident) })
      map.on('click', 'incident-clusters', async (event) => { const feature = map.queryRenderedFeatures(event.point, { layers: ['incident-clusters'] })[0]; const clusterId = feature?.properties?.cluster_id; const source = map.getSource('incidents') as maplibregl.GeoJSONSource | undefined; if (clusterId !== undefined && source) { const zoom = await source.getClusterExpansionZoom(clusterId); if (typeof zoom === 'number') map.easeTo({ center: (feature.geometry as any).coordinates, zoom }) } })
      ;['hotspot-points', 'incident-points', 'incident-clusters'].forEach((layer) => { map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' }); map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' }) })
      setLoaded(true)
    })
    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => { if (focusArea && mapRef.current) mapRef.current.flyTo({ center: focusArea.coordinates, zoom: 13.1, duration: 480 }) }, [focusArea])
  useEffect(() => { const map = mapRef.current; if (!map || !loaded) return; const clauses: any[] = []; if (crimeFilter !== 'All') clauses.push(['==', ['get', 'crime'], crimeFilter]); if (areaFilter !== 'All Areas') clauses.push(['==', ['get', 'location'], areaFilter]); if (dateFilter === 'Today') clauses.push(['==', ['get', 'date'], '13 Oct 2026']); if (dateFilter === 'Yesterday') clauses.push(['==', ['get', 'date'], '12 Oct 2026']); map.setFilter('incident-points', clauses.length ? ['all', ['!', ['has', 'point_count']], ...clauses] : ['!', ['has', 'point_count']]) }, [crimeFilter, areaFilter, dateFilter, loaded])

  const flyHome = () => mapRef.current?.flyTo({ center: [79.816, 11.931], zoom: 11.6, duration: 420 })
  const toggleLayers = () => { const map = mapRef.current; if (!map) return; const next = !activeLayers; setActiveLayers(next); ['admin-fill', 'admin-line', 'minor-roads', 'major-roads', 'waterways', 'coastline', 'hotspot-points', 'hotspot-labels', 'incident-clusters', 'incident-cluster-count', 'incident-points'].forEach((id) => map.setLayoutProperty(id, 'visibility', next ? 'visible' : 'none')) }

  return <div className={`relative min-h-[470px] overflow-hidden rounded-[14px] border border-[#cbd6cd] bg-[#ebece6] ${className}`}>
    <div ref={mapNode} className="absolute inset-0" />
    {!loaded && <div className="absolute inset-0 flex items-center justify-center bg-[#ebece6]"><div className="flex items-center gap-3 text-xs text-[#68736e]"><span className="h-2 w-2 rounded-full bg-[#0f766e]" />Loading GIS layerâ€¦</div></div>}
    <div className="absolute left-3 top-3 flex max-w-[calc(100%-24px)] flex-wrap items-center gap-1.5 rounded-lg border border-[#cbd6cd] bg-white/95 p-1.5 shadow-lg"><div className="flex items-center gap-1 pr-1">{(['LIVE', '24H', '7D', '30D'] as Period[]).map((item) => <button key={item} onClick={() => setPeriod(item)} className={`rounded px-2 py-1.5 font-mono text-[9px] transition-colors ${period === item ? 'bg-[#dce9e3] text-[#0f766e]' : 'text-[#68736e] hover:bg-[#f4f3ed] hover:text-[#17211f]'}`}>{item}</button>)}</div><select value={crimeFilter} onChange={(event) => setCrimeFilter(event.target.value)} className="h-7 rounded border border-[#cbd6cd] bg-white px-2 text-[9px] text-[#3f4d46] outline-none"><option>All</option><option>Theft</option><option>Assault</option><option>Vehicle Theft</option><option>Burglary</option><option>Other</option></select><select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} className="h-7 rounded border border-[#cbd6cd] bg-white px-2 text-[9px] text-[#3f4d46] outline-none"><option>All Areas</option>{hotspots.map((spot) => <option key={spot.id}>{spot.name}</option>)}</select><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-7 rounded border border-[#cbd6cd] bg-white px-2 text-[9px] text-[#3f4d46] outline-none"><option>Today</option><option>Yesterday</option><option>Last 7 days</option></select></div>
    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-[#cbd6cd] bg-white/95 p-1.5 shadow-lg"><button onClick={toggleLayers} className={`flex h-7 items-center gap-1.5 rounded px-2 text-[9px] ${activeLayers ? 'bg-[#dce9e3] text-[#0f766e]' : 'text-[#68736e]'}`}><Layers3 size={12} />Layers</button><button onClick={() => mapRef.current?.zoomIn()} className="flex h-7 w-7 items-center justify-center rounded text-[#68736e] hover:bg-[#f4f3ed] hover:text-[#17211f]"><Plus size={13} /></button><button onClick={() => mapRef.current?.zoomOut()} className="flex h-7 w-7 items-center justify-center rounded text-[#68736e] hover:bg-[#f4f3ed] hover:text-[#17211f]"><Minus size={13} /></button><button onClick={flyHome} className="flex h-7 w-7 items-center justify-center rounded text-[#68736e] hover:bg-[#f4f3ed] hover:text-[#17211f]"><LocateFixed size={13} /></button></div>
    <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-lg border border-[#cbd6cd] bg-white/95 px-3 py-2 shadow-lg"><div className="flex items-center gap-1.5 text-[9px] text-[#3f4d46]"><span className="h-2 w-2 rounded-full bg-[#0f766e]" />High risk</div><div className="flex items-center gap-1.5 text-[9px] text-[#3f4d46]"><span className="h-2 w-2 rounded-full bg-[#d97706]" />Medium</div><div className="flex items-center gap-1.5 text-[9px] text-[#3f4d46]"><span className="h-2 w-2 rounded-full bg-[#68736e]" />Low</div><div className="flex items-center gap-1.5 text-[9px] text-[#3f4d46]"><span className="h-2 w-2 rounded-full border border-[#0f766e] bg-white" />Incident cluster</div></div>
    <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-[#cbd6cd] bg-white/95 px-2.5 py-2 shadow-lg"><RadioTower size={12} className="text-[#0f766e]" /><span className="mono text-[9px] text-[#68736e]">OSM / {dateFilter.toUpperCase()} / {period}</span></div>
  </div>
}
