from datetime import datetime
from pydantic import BaseModel, Field

class IncidentOut(BaseModel):
    id: int
    crime_type: str
    latitude: float
    longitude: float
    area: str
    timestamp: datetime
    severity: str
    status: str
    description: str

class PredictionRequest(BaseModel):
    crime_type: str = 'Vehicle Theft'
    date: str | None = None
    start_time: str = '18:00'
    end_time: str = '23:00'
    area: str | None = None

class PatrolOptimizeRequest(BaseModel):
    available_units: int = Field(default=3, ge=1, le=20)
    shift_start: str = '18:00'
    shift_end: str = '23:00'
    priority_crime_types: list[str] = Field(default_factory=lambda: ['Vehicle Theft', 'Theft'])

class PatrolSimulateRequest(BaseModel):
    unavailable_unit: str = 'UNIT 02'
    available_units: int = Field(default=3, ge=1, le=20)

class AIQueryRequest(BaseModel):
    question: str

class HealthOut(BaseModel):
    status: str
    incidents: int
    database: str
