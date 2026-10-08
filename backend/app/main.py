from datetime import datetime, timedelta
from pathlib import Path
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import Alert, Area, Incident, PatrolUnit
from .schemas import AIQueryRequest, PatrolOptimizeRequest, PatrolSimulateRequest, PredictionRequest
from .services import ai_answer, analytics, area_metrics, hotspots, incident_dict, patrol_plan, risk_for

Base.metadata.create_all(bind=engine)
app = FastAPI(title='CRIMEMAP AI Backend', version='1.0.0', description='Synthetic Puducherry Police geospatial intelligence API')
app.add_middleware(CORSMiddleware, allow_origins=['http://127.0.0.1:3000', 'http://localhost:3000'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.get('/health')
def health(db: Session = Depends(get_db)):
    return {'status': 'ok', 'incidents': db.scalar(select(func.count(Incident.id))) or 0, 'database': 'sqlite'}

@app.get('/api/dashboard/stats')
def dashboard_stats(db: Session = Depends(get_db)):
    rows = db.scalars(select(Incident)).all(); now = datetime(2026, 10, 13, 20, 0)
    today = [row for row in rows if row.timestamp.date() == now.date()]
    spots = hotspots(db); trend = analytics(db)['crime_trend']
    return {'today_incidents': len(today), 'high_risk_zones': sum(1 for item in spots if item['risk_score'] >= 75), 'active_alerts': db.scalar(select(func.count(Alert.id)).where(Alert.level.in_(['HIGH', 'MEDIUM']))) or 0, 'patrol_coverage': patrol_plan(db)['patrol_coverage'], 'crime_trend': trend, 'top_crime_types': analytics(db)['crime_distribution'][:5], 'top_risk_areas': spots[:5]}

@app.get('/api/incidents')
def list_incidents(db: Session = Depends(get_db), limit: int = Query(100, ge=1, le=1000), area: str | None = None, crime_type: str | None = None, severity: str | None = None):
    statement = select(Incident).order_by(Incident.timestamp.desc()).limit(limit)
    if area: statement = statement.where(Incident.area == area)
    if crime_type: statement = statement.where(Incident.crime_type == crime_type)
    if severity: statement = statement.where(Incident.severity == severity)
    return [incident_dict(row) for row in db.scalars(statement).all()]

@app.get('/api/incidents/{incident_id}')
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    row = db.get(Incident, incident_id)
    if not row: raise HTTPException(status_code=404, detail='Incident not found')
    return incident_dict(row)

@app.get('/api/hotspots')
def get_hotspots(db: Session = Depends(get_db)): return hotspots(db)

@app.get('/api/analytics')
def get_analytics(db: Session = Depends(get_db)): return analytics(db)

@app.post('/api/prediction')
def predict(payload: PredictionRequest, db: Session = Depends(get_db)):
    ranked = hotspots(db); results = []
    for item in ranked:
        rows = area_metrics(db, item['name'])[item['name']]
        metrics = risk_for([row for row in rows if payload.crime_type == 'Other' or row.crime_type == payload.crime_type] or rows)
        results.append({'area': item['name'], 'risk_score': metrics['risk_score'], 'factors': metrics['factors'], 'primary_crime': metrics['dominant_crime'], 'peak_time': metrics['peak_time']})
    if payload.area: results.sort(key=lambda item: (item['area'] != payload.area, -item['risk_score']))
    return {'model': 'explainable-risk-estimate-v1', 'disclaimer': 'Analytical risk estimate based on historical synthetic patterns; not a literal crime prediction.', 'results': results[:5]}

@app.post('/api/patrol/optimize')
def optimize(payload: PatrolOptimizeRequest, db: Session = Depends(get_db)): return patrol_plan(db, payload.available_units, payload.priority_crime_types)

@app.post('/api/patrol/simulate')
def simulate(payload: PatrolSimulateRequest, db: Session = Depends(get_db)):
    current = patrol_plan(db, payload.available_units); remaining = max(1, payload.available_units - 1); simulated = patrol_plan(db, remaining)
    diff = simulated['patrol_coverage'] - current['patrol_coverage']
    return {'scenario': f'{payload.unavailable_unit} unavailable', 'current_coverage': current['patrol_coverage'], 'simulated_coverage': simulated['patrol_coverage'], 'coverage_difference': diff, 'recommended_redistribution': simulated['assignments'], 'updated_plan': simulated}

@app.post('/api/ai/query')
def query_ai(payload: AIQueryRequest, db: Session = Depends(get_db)): return ai_answer(db, payload.question)

@app.get('/api/alerts')
def get_alerts(db: Session = Depends(get_db)):
    return [{'id': row.id, 'title': row.title, 'area': row.area, 'level': row.level, 'time': row.created_at.strftime('%H:%M'), 'detail': row.detail} for row in db.scalars(select(Alert).order_by(Alert.created_at.desc())).all()]

@app.get('/api/areas')
def get_areas(db: Session = Depends(get_db)): return [{'id': row.id, 'name': row.name, 'district': row.district, 'coordinates': [row.longitude, row.latitude]} for row in db.scalars(select(Area)).all()]

@app.get('/api/patrol/units')
def get_units(db: Session = Depends(get_db)): return [{'id': row.unit_code, 'location': row.area, 'shift': f'{row.shift_start}–{row.shift_end}', 'status': row.status, 'coverage': row.coverage} for row in db.scalars(select(PatrolUnit)).all()]
