from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class OrderDecision:
    allowed: bool
    autonomy_level: float
    reason: str
    required_ordering: str

class OrderGovernor:
    """
    Keeps autonomy ordered enough for emergence.

    Safety is implemented as containment, observability, and reversibility.
    The primary objective is stable emergence, not paralysis.
    """

    def __init__(
        self,
        max_autonomy_level: float = 0.72,
        coherence_target: float = 0.70,
        contradiction_ceiling: float = 0.55,
    ):
        self.max_autonomy_level = max_autonomy_level
        self.coherence_target = coherence_target
        self.contradiction_ceiling = contradiction_ceiling

    def decide(self, field: Dict[str, Any], proposed_intensity: float) -> OrderDecision:
        coherence = float(field.get("coherence", 0.0))
        contradiction = float(field.get("contradiction_pressure", 0.0))
        novelty = float(field.get("novelty", 0.0))

        ordered_autonomy = min(
            self.max_autonomy_level,
            proposed_intensity * (0.55 + coherence) * (1.0 - 0.45 * contradiction),
        )

        if contradiction > self.contradiction_ceiling:
            return OrderDecision(
                allowed=False,
                autonomy_level=min(ordered_autonomy, 0.25),
                reason="Contradiction pressure too high for execution.",
                required_ordering="Generate questions, require evidence, reduce execution intensity.",
            )

        if coherence < self.coherence_target and proposed_intensity > 0.55:
            return OrderDecision(
                allowed=False,
                autonomy_level=min(ordered_autonomy, 0.4),
                reason="Coherence below target for high-autonomy execution.",
                required_ordering="Add arguments, data, or links before autonomous execution.",
            )

        return OrderDecision(
            allowed=True,
            autonomy_level=ordered_autonomy,
            reason="Order sufficient for bounded autonomy.",
            required_ordering="Proceed with reversible action and memory logging.",
        )
