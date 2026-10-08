# CRIMEMAP AI — Project Plan and Handoff

## Product

CRIMEMAP AI is a frontend-first geospatial crime intelligence and decision-support prototype for Puducherry Police. It uses synthetic aggregated data only and does not profile individuals or make automated decisions about people.

## Frontend

The application is a React, Vite, TypeScript, Tailwind CSS, MapLibre GL JS, Recharts, Framer Motion, and Lucide React interface. It includes persistent shell navigation and these routes:

- `/dashboard`
- `/crime-map`
- `/ai-assistant`
- `/analytics`
- `/prediction`
- `/patrol-planning`
- `/incidents`
- `/reports`
- `/settings`

The interface was intentionally redesigned several times during the project and currently uses a distinctive civic-operations visual system: warm ivory workspace surfaces, a dark forest station rail, deep teal actions and intelligence markers, sage evidence panels, and restrained amber attention states. The current layout, typography, navigation, animation behavior, map treatment, and responsive behavior are preserved while backend functionality is added.

## Backend

A local FastAPI backend was added under `backend/` using Python, FastAPI, SQLAlchemy, SQLite, Pydantic, NumPy/Pandas-compatible data processing, scikit-learn DBSCAN clustering, and Isolation Forest anomaly detection.

The deterministic database seed creates 6,000 synthetic incidents covering:

- White Town
- M.G. Road
- Heritage Town
- Beach Road
- Lawspet
- Reddiarpalayam
- Villianur

It also creates the `areas`, `patrol_units`, and `alerts` tables and populates consistent synthetic patrol and alert records.

## API endpoints

- `GET /health`
- `GET /api/dashboard/stats`
- `GET /api/incidents`
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

Risk output is explicitly described as an explainable historical risk estimate, not a literal prediction that a crime will happen.

## Frontend integration

`src/lib/api.ts` provides the environment-based API client using `VITE_API_URL`, defaulting to `http://127.0.0.1:8000` for local development. The existing frontend remains resilient through fallback data if the backend is unavailable.

Connected workflows include:

- Dashboard KPI values from `/api/dashboard/stats`
- Dashboard recent incidents from `/api/incidents`
- AI Assistant queries from `/api/ai/query`
- Prediction form from `/api/prediction`
- Patrol optimization from `/api/patrol/optimize`
- What-if simulation from `/api/patrol/simulate`

## Live map intelligence layer

The Crime Map page now includes `LiveMapInsights`, a new analytical rail that makes the map interface more distinctive and competition-ready without changing the existing map design.

It includes:

- Backend-polled live signal feed refreshing every 15 seconds
- Unread notification badge
- Alert acknowledgement modal
- Alert severity markers and sync timestamp
- Ranked area pressure index with animated risk bars
- Dominant crime, incident count, and peak-time labels
- Isolation Forest anomaly watch
- Clear synthetic backend-source disclosure
- Graceful offline fallback state

The live map was verified with 3 backend alerts, 7 deterministic hotspots, and 8 anomaly signals.

## Verification

- Frontend production build passes with Vite and TypeScript.
- Frontend dashboard preview responds with HTTP 200.
- FastAPI documentation responds with HTTP 200.
- Backend health responds with HTTP 200.
- Backend database contains 6,000 incidents.
- Hotspot endpoint returns 7 deterministic hotspots.
- Analytics endpoint returns anomaly results.
- AI query endpoint returns database-backed area rankings.
- Patrol optimization and simulation return calculated coverage changes.
- Crime Map live insight rail loads alerts, hotspots, and anomaly data in the browser.

## Local commands

### Frontend

```powershell
npm install
npm run dev
```

Frontend preview: `http://127.0.0.1:3000/dashboard`

### Backend

```powershell
cd backend
python -m pip install -r requirements.txt
python seed_database.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The included `backend/start-backend.bat` uses the available bundled Python runtime automatically when present.

## Current limitations

The map still uses its existing synthetic visual geometry and frontend fallback data for some secondary presentation-only layers. The primary dashboard, map insight rail, AI, prediction, patrol, incident, analytics, and backend workflow are connected and verified. This remains a hackathon prototype and should not be used for real-world automated enforcement decisions.


## Revision — Real geographic map layer

Replaced the blank custom GIS background with live OpenStreetMap raster tiles through MapLibre. The map remains centered on Puducherry, supports the existing zoom and navigation controls, shows OpenStreetMap attribution, and preserves all CRIMEMAP hotspot, incident, filter, alert, and analytics overlays. Verified that the OpenStreetMap tile endpoint responds with HTTP 200 and the Crime Map preview responds with HTTP 200. No Google Maps API key is required.


## Revision — Playfair Display typography

Added the requested Playfair Display Google Font alongside Geist and Geist Mono. Playfair Display is applied to prominent `h1`, `h2`, and `h3` headings plus the reusable `.display-font` class, while body copy, navigation labels, controls, map text, and technical data remain in Geist/Geist Mono. Production build passed and the dashboard preview responded with HTTP 200.


## Revision — Source Serif 4 body typography

Added Source Serif 4 to the Google Font bundle and made it the general interface font through the root typography stack. Playfair Display remains reserved for prominent headings and the `.display-font` class, while Geist Mono remains reserved for technical data and map/system labels. Production build passed and the dashboard preview returned HTTP 200.
