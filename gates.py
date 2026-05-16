from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Any, Dict, List, Literal
from uuid import uuid4

GateType = Literal["Problem", "Solution", "Argument", "DataSource", "EmergentLink", "Action", "Question"]

@dataclass
class Gate:
    type: GateType
    title: str
    description: str = ""
    id: str = field(default_factory=lambda: f"G-{uuid4().hex[:10]}")
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    links: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class EmergentLink:
    from_gate: str
    to_gate: str
    link_type: str = "suggests"
    confidence: float = 0.5
    id: str = field(default_factory=lambda: f"L-{uuid4().hex[:10]}")
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    validated: bool = False

    def to_gate(self) -> Gate:
        return Gate(
            id=self.id,
            type="EmergentLink",
            title=f"{self.link_type}: {self.from_gate} → {self.to_gate}",
            description="Autonomously discovered relationship.",
            links=[self.from_gate, self.to_gate],
            metadata={
                "from_gate": self.from_gate,
                "to_gate": self.to_gate,
                "link_type": self.link_type,
                "confidence": self.confidence,
                "validated": self.validated,
            },
        )
