from datetime import datetime, timedelta
from pathlib import Path
import random
from app.database import Base, SessionLocal, engine
from app.models import Alert, Area, Incident, PatrolUnit

SEED = 20261013
AREAS = [
    ('White Town', 'Heritage District', 11.9312, 79.8353, 1.25),
    ('M.G. Road', 'Central Puducherry', 11.9346, 79.8275, 1.15),
    ('Heritage Town', 'Heritage District', 11.9340, 79.8320, 1.05),
    ('Beach Road', 'Coastal Precinct', 11.9279, 79.8376, .95),
    ('Lawspet', 'North Puducherry', 11.9481, 79.8086, .82),
    ('Reddiarpalayam', 'West Puducherry', 11.9257, 79.7958, .72),
    ('Villianur', 'South Puducherry', 11.9106, 79.7557, .58),
]
CRIMES = [('Vehicle Theft', 24), ('Theft', 27), ('Burglary', 16), ('Assault', 12), ('Robbery', 7), ('Vandalism', 5), ('Other', 9)]
DESCRIPTIONS = {'Vehicle Theft': 'Synthetic vehicle theft signal on a high-footfall access corridor.', 'Theft': 'Synthetic property theft report during a monitored activity window.', 'Burglary': 'Synthetic forced-entry pattern associated with a residential lane.', 'Assault': 'Synthetic public-order incident requiring patrol context review.', 'Robbery': 'Synthetic street robbery signal requiring response prioritization.', 'Vandalism': 'Synthetic property damage report in the area activity grid.', 'Other': 'Synthetic incident record for analytical demonstration.'}

def choose_weighted(rng, items):
    total = sum(weight for _, weight in items); pick = rng.uniform(0, total)
    for value, weight in items:
        pick -= weight
        if pick <= 0: return value
    return items[-1][0]

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.query(Incident).delete(); db.query(Area).delete(); db.query(PatrolUnit).delete(); db.query(Alert).delete(); db.commit()
        for index, (name, district, lat, lon, _) in enumerate(AREAS, 1): db.add(Area(id=index, name=name, district=district, latitude=lat, longitude=lon))
        rng = random.Random(SEED); start = datetime(2026, 9, 1); statuses = ['INVESTIGATING', 'MONITORING', 'RESOLVED']
        incident_id = 1
        for _ in range(6000):
            name, district, lat, lon, area_weight = choose_weighted(rng, [(item, item[4]) for item in AREAS])
            crime = choose_weighted(rng, CRIMES)
            day = start + timedelta(days=rng.randrange(43)); hour = rng.choices([0, 3, 6, 9, 12, 15, 18, 20, 22], weights=[2, 2, 3, 4, 7, 9, 18, 22, 14])[0] + rng.randrange(2)
            ts = day.replace(hour=min(23, hour), minute=rng.randrange(60), second=0)
            severity = 'HIGH' if crime in ('Vehicle Theft', 'Robbery') and rng.random() < .45 else ('MEDIUM' if rng.random() < .48 else 'LOW')
            db.add(Incident(id=incident_id, crime_type=crime, latitude=lat + rng.uniform(-.004, .004), longitude=lon + rng.uniform(-.004, .004), area=name, timestamp=ts, severity=severity, status=rng.choices(statuses, weights=[3, 4, 2])[0], description=DESCRIPTIONS[crime]))
            incident_id += 1
        for index, (unit, area, start_time, end_time, status, coverage) in enumerate([('UNIT 01', 'White Town', '18:00', '20:00', 'ACTIVE', 34), ('UNIT 02', 'M.G. Road', '20:00', '22:00', 'ACTIVE', 31), ('UNIT 03', 'Heritage Town', '19:00', '23:00', 'STANDBY', 27)], 1): db.add(PatrolUnit(id=index, unit_code=unit, area=area, shift_start=start_time, shift_end=end_time, status=status, coverage=coverage))
        created = datetime(2026, 10, 13, 19, 42)
        for index, (title, area, level, detail) in enumerate([('Vehicle theft cluster', 'White Town', 'HIGH', 'Linked synthetic incidents in the current evening window.'), ('Patrol coverage gap', 'M.G. Road', 'MEDIUM', 'Unit handoff window begins soon.'), ('Night activity uplift', 'Beach Road', 'LOW', 'Activity is above the rolling synthetic baseline.')], 1): db.add(Alert(id=index, title=title, area=area, level=level, detail=detail, created_at=created - timedelta(minutes=index * 8)))
        db.commit(); print(f'Seeded {incident_id - 1} incidents into {Path(__file__).parent / "crimemap.db"}')
    finally: db.close()

if __name__ == '__main__': main()
