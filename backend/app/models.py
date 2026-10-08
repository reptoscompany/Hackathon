from datetime import datetime
from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class Incident(Base):
    __tablename__ = 'incidents'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    crime_type: Mapped[str] = mapped_column(String(40), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    area: Mapped[str] = mapped_column(String(80), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    severity: Mapped[str] = mapped_column(String(12), index=True)
    status: Mapped[str] = mapped_column(String(24), index=True)
    description: Mapped[str] = mapped_column(Text)

class Area(Base):
    __tablename__ = 'areas'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    district: Mapped[str] = mapped_column(String(80))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)

class PatrolUnit(Base):
    __tablename__ = 'patrol_units'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_code: Mapped[str] = mapped_column(String(24), unique=True)
    area: Mapped[str] = mapped_column(String(80))
    shift_start: Mapped[str] = mapped_column(String(8))
    shift_end: Mapped[str] = mapped_column(String(8))
    status: Mapped[str] = mapped_column(String(20))
    coverage: Mapped[int] = mapped_column(Integer)

class Alert(Base):
    __tablename__ = 'alerts'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    area: Mapped[str] = mapped_column(String(80))
    level: Mapped[str] = mapped_column(String(12))
    detail: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime)
