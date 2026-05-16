from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class EventIn(BaseModel):
    source: str = "manual"
    event_type: str = "observation"
    content: str
    urgency: float = Field(0.5, ge=0.0, le=1.0)
    novelty: float = Field(0.5, ge=0.0, le=1.0)
    metadata: Dict[str, Any] = {}

class QueryIn(BaseModel):
    question: str
    max_results: int = Field(8, ge=1, le=50)

class AutonomyStepIn(BaseModel):
    cycles: int = Field(1, ge=1, le=10)
    allow_execution: bool = False

class GateOut(BaseModel):
    id: str
    type: str
    title: str
    description: str
    links: List[str]
    metadata: Dict[str, Any]
