from collections import Counter, defaultdict
from datetime import datetime, timedelta
from math import ceil
import re
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sklearn.cluster import DBSCAN
from sklearn.ensemble import IsolationForest
import numpy as np
from .models import Area, Incident, PatrolUnit

SEVERITY_WEIGHT = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3}

def incident_dict(row: Incident):
    return {'id': row.id, 'crime_type': row.crime_type, 'latitude': row.latitude, 'longitude': row.longitude, 'area': row.area, 'timestamp': row.timestamp, 'severity': row.severity, 'status': row.status, 'description': row.description}

def area_rows(db: Session):
    return db.scalars(select(Area).order_by(Area.id)).all()

def area_metrics(db: Session, area: str | None = None):
    rows = db.scalars(select(Incident).where(Incident.area == area) if area else select(Incident)).all()
    grouped = defaultdict(list)
    for row in rows: grouped[row.area].append(row)
    return grouped

def risk_for(rows: list[Incident], now: datetime | None = None):
    if not rows: return {'risk_score': 0, 'factors': {'historical_frequency': 0, 'recent_activity': 0, 'time_pattern': 0, 'spatial_concentration': 0, 'severity_factor': 0}, 'dominant_crime': 'Other', 'peak_time': '18:00–22:00', 'trend': 0}
    now = now or datetime(2026, 10, 13, 20, 0)
    total = len(rows)
    historical = min(32, round(total / 22))
    recent = min(21, round(sum(1 for row in rows if row.timestamp >= now - timedelta(days=14)) / 10))
    evening = sum(1 for row in rows if 18 <= row.timestamp.hour <= 23) / total
    time_factor = round(18 * evening)
    spatial = min(14, round(14 * min(1, total / 75)))
    severity = min(15, round(sum(SEVERITY_WEIGHT.get(row.severity, 1) for row in rows) / max(1, total) * 4))
    factors = {'historical_frequency': historical, 'recent_activity': recent, 'time_pattern': time_factor, 'spatial_concentration': spatial, 'severity_factor': severity}
    score = min(99, sum(factors.values()))
    crime = Counter(row.crime_type for row in rows).most_common(1)[0][0]
    hours = Counter(row.timestamp.hour for row in rows).most_common(2)
    start = min((h for h, _ in hours), default=18)
    peak = f'{start:02d}:00–{min(23, start + 4):02d}:00'
    recent_count = sum(1 for row in rows if row.timestamp >= now - timedelta(days=7))
    prior_count = sum(1 for row in rows if now - timedelta(days=14) <= row.timestamp < now - timedelta(days=7))
    trend = round(((recent_count - prior_count) / max(1, prior_count)) * 100)
    return {'risk_score': score, 'factors': factors, 'dominant_crime': crime, 'peak_time': peak, 'trend': trend}

def hotspots(db: Session):
    groups = area_metrics(db)
    areas = {item.name: item for item in area_rows(db)}
    result = []
    for name, rows in groups.items():
        metrics = risk_for(rows)
        center = areas.get(name)
        points = np.array([[row.latitude, row.longitude] for row in rows])
        labels = DBSCAN(eps=0.0025, min_samples=12).fit_predict(points)
        cluster_count = len({label for label in labels if label >= 0})
        result.append({'id': name.lower().replace(' ', '-').replace('.', ''), 'name': name, 'district': center.district if center else '', 'coordinates': [center.longitude, center.latitude] if center else [rows[0].longitude, rows[0].latitude], 'incident_count': len(rows), 'spatial_clusters': cluster_count, **metrics})
    return sorted(result, key=lambda item: item['risk_score'], reverse=True)

def analytics(db: Session):
    rows = db.scalars(select(Incident).order_by(Incident.timestamp)).all()
    by_day = Counter(row.timestamp.strftime('%d %b') for row in rows)
    by_type = Counter(row.crime_type for row in rows)
    by_area = Counter(row.area for row in rows)
    by_hour = Counter(row.timestamp.hour for row in rows)
    by_severity = Counter(row.severity for row in rows)
    return {'crime_trend': [{'day': day, 'incidents': count, 'resolved': round(count * .72)} for day, count in sorted(by_day.items())[-30:]], 'crime_distribution': [{'name': name, 'value': count, 'percentage': round(count / max(1, len(rows)) * 100, 1)} for name, count in by_type.most_common()], 'crime_by_hour': [{'hour': hour, 'count': by_hour[hour]} for hour in range(24)], 'crime_by_area': [{'area': name, 'count': count} for name, count in by_area.most_common()], 'severity_distribution': dict(by_severity), 'total_incidents': len(rows), 'anomalies': anomalies(db)}

def anomalies(db: Session):
    rows = db.scalars(select(Incident)).all()
    counts = Counter((row.area, row.crime_type, row.timestamp.hour // 4) for row in rows)
    values = np.array(list(counts.values())).reshape(-1, 1)
    if len(values) < 8: return []
    labels = IsolationForest(contamination=0.08, random_state=42).fit_predict(values)
    keys = list(counts.keys())
    out = []
    for key, value, label in zip(keys, values[:, 0], labels):
        if label == -1: out.append({'area': key[0], 'crime_type': key[1], 'severity': 'MEDIUM', 'reason': f'Unusual {key[1].lower()} activity in the {key[2] * 4:02d}:00 window', 'incident_count': int(value)})
    return sorted(out, key=lambda item: item['incident_count'], reverse=True)[:8]

def patrol_plan(db: Session, units: int = 3, priority: list[str] | None = None):
    ranked = hotspots(db)
    selected = ranked[:max(1, units)]
    plan = []
    for index, item in enumerate(selected):
        unit_number = index + 1
        start = 18 + index
        end = min(23, start + 2 + (1 if index == 2 else 0))
        plan.append({'unit': f'UNIT {unit_number:02d}', 'area': item['name'], 'start_time': f'{start:02d}:00', 'end_time': f'{end:02d}:00', 'priority': 'HIGH' if item['risk_score'] >= 80 else 'MEDIUM', 'reason': f"{item['dominant_crime']} concentration; risk estimate {item['risk_score']}/100", 'risk_score': item['risk_score']})
    coverage = min(98, 60 + len(plan) * 10 + round(sum(item['risk_score'] for item in selected) / max(1, len(selected)) / 10))
    return {'assignments': plan, 'patrol_coverage': coverage}

def ai_answer(db: Session, question: str):
    q = question.lower()
    spots = hotspots(db)
    if 'hotspot' in q or 'highest risk' in q or 'risk' in q:
        filtered = [item for item in spots if item['dominant_crime'].lower() == 'vehicle theft'] if 'vehicle' in q else spots
        filtered = filtered or spots
        return {'title': 'ANALYSIS COMPLETE', 'body': f"{len(filtered[:3])} areas ranked from the synthetic incident database.", 'areas': [{'name': item['name'], 'score': item['risk_score']} for item in filtered[:3]], 'peak_time': filtered[0]['peak_time'], 'recommendation': f"Prioritize {filtered[0]['name']} based on its explainable risk estimate and recent activity."}
    if 'how many' in q or 'week' in q:
        cutoff = datetime(2026, 10, 13) - timedelta(days=7)
        rows = db.scalars(select(Incident).where(Incident.timestamp >= cutoff)).all()
        if 'theft' in q: rows = [row for row in rows if 'theft' in row.crime_type.lower()]
        return {'title': 'DATABASE RESULT', 'body': f'{len(rows)} matching synthetic incidents were logged in the last seven days.', 'areas': [], 'peak_time': 'N/A', 'recommendation': 'Use Analytics for the full time-series breakdown.'}
    if 'patrol' in q: return {'title': 'PATROL RECOMMENDATION', 'body': 'The recommendation is based on the current hotspot ranking and unit coverage model.', 'areas': [{'name': item['name'], 'score': item['risk_score']} for item in spots[:3]], 'peak_time': spots[0]['peak_time'], 'recommendation': f"Assign the first available unit to {spots[0]['name']} and preserve coverage on the next two ranked areas."}
    return {'title': 'DATABASE SUMMARY', 'body': 'The assistant can query hotspots, risk estimates, patrol areas, and recent incident counts from the synthetic database.', 'areas': [{'name': item['name'], 'score': item['risk_score']} for item in spots[:3]], 'peak_time': spots[0]['peak_time'], 'recommendation': 'Ask for a hotspot, comparison, patrol recommendation, or recent incident count.'}
