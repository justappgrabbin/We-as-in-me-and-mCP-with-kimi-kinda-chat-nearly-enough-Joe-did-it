from __future__ import annotations

import math
from collections import Counter
from typing import Any, Dict, List, Tuple

from app.models.gates import Gate, EmergentLink

DIMENSIONS = {
    "Problem": "Being/Perspective",
    "Solution": "Movement/Evolution",
    "Argument": "Design/Reasoning",
    "DataSource": "Space/Field",
    "EmergentLink": "Emergence",
    "Action": "Execution",
    "Question": "Reflection",
}

class SubstrateState:
    def __init__(self):
        self.gates: Dict[str, Gate] = {}
        self.links: Dict[str, EmergentLink] = {}
        self.memory: List[Dict[str, Any]] = []
        self.tick: int = 0

    def add_gate(self, gate: Gate) -> Gate:
        self.gates[gate.id] = gate
        self.memory.append({"event": "gate_added", "gate": gate.to_dict(), "tick": self.tick})
        return gate

    def add_link(self, link: EmergentLink) -> Gate:
        self.links[link.id] = link
        gate = link.to_gate()
        self.gates[gate.id] = gate
        return gate

    def query(self, text: str, max_results: int = 8) -> List[Dict[str, Any]]:
        terms = [t.strip().lower() for t in text.split() if len(t.strip()) > 2]
        scored: List[Tuple[float, Gate]] = []
        for gate in self.gates.values():
            blob = f"{gate.title} {gate.description} {gate.type}".lower()
            score = sum(blob.count(t) for t in terms)
            if score:
                scored.append((score, gate))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [g.to_dict() | {"score": s} for s, g in scored[:max_results]]

    def dimensional_counts(self) -> Dict[str, int]:
        return dict(Counter(g.type for g in self.gates.values()))

    def coherence(self) -> float:
        if not self.gates:
            return 0.5
        counts = self.dimensional_counts()
        ideal = ["Problem", "Solution", "Argument", "DataSource", "EmergentLink"]
        coverage = sum(1 for k in ideal if counts.get(k, 0) > 0) / len(ideal)
        link_density = min(1.0, len(self.links) / max(1, len(self.gates)))
        contradiction_pressure = self.contradiction_pressure()
        return max(0.0, min(1.0, 0.55 * coverage + 0.35 * link_density + 0.10 * (1 - contradiction_pressure)))

    def contradiction_pressure(self) -> float:
        if not self.gates:
            return 0.0
        contradiction_words = ["conflict", "contradict", "fail", "broken", "risk", "unstable", "collapse"]
        hits = 0
        for g in self.gates.values():
            blob = f"{g.title} {g.description}".lower()
            hits += sum(1 for w in contradiction_words if w in blob)
        return min(1.0, hits / max(3, len(self.gates)))

    def novelty(self) -> float:
        if not self.memory:
            return 0.5
        recent = self.memory[-20:]
        unique = len({m.get("gate", {}).get("type", m.get("event")) for m in recent})
        return min(1.0, unique / 7)

    def snapshot(self) -> Dict[str, Any]:
        return {
            "tick": self.tick,
            "gate_count": len(self.gates),
            "link_count": len(self.links),
            "dimensions": self.dimensional_counts(),
            "coherence": round(self.coherence(), 4),
            "contradiction_pressure": round(self.contradiction_pressure(), 4),
            "novelty": round(self.novelty(), 4),
            "recent_memory": self.memory[-10:],
        }
