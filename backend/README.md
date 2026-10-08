# CRIMEMAP AI Backend

FastAPI + SQLite + SQLAlchemy backend for the synthetic Puducherry Police geospatial intelligence prototype.

## Run locally

From `backend/` using the bundled Python runtime or any Python 3.11+ environment:

```powershell
python -m pip install -r requirements.txt
python seed_database.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The API is available at `http://127.0.0.1:8000` and interactive docs at `/docs`.

## Endpoints

- `GET /health`
- `GET /api/dashboard/stats`
- `GET /api/incidents?limit=100&area=White%20Town`
- `GET /api/incidents/{id}`
- `GET /api/hotspots`
- `GET /api/analytics`
- `POST /api/prediction`
- `POST /api/patrol/optimize`
- `POST /api/patrol/simulate`
- `POST /api/ai/query`
- `GET /api/alerts`
- `GET /api/areas`
- `GET /api/patrol/units`

All data is synthetic. Risk results are explainable estimates, not literal predictions about individuals.
