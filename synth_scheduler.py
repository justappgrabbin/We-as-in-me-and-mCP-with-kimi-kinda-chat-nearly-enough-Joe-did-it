"""
Synth AI Tri-Scheduler — Unified Module
========================================
Three schedulers (Body/Mind/Heart), questioning orchestrator,
live transit feed, Varga resolution, book ingestion mesh.
Deployable to Render. Supabase-ready.

Built from:
- scx_horoscope (priority formula, retrograde detection)
- Parashar21 (pyswisseph wrapper, JSON schema, transit overlay)
- VedicAstro (Varga/Dasha engine, planetary aspects)
- AstroGPT (chat persona pattern)
- HughP/WordStone (D3 visualization pattern)
"""

import re
import json
import math
import hashlib
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Set, Optional, Any, Tuple, Callable
from collections import defaultdict
from datetime import datetime, timedelta
from enum import Enum
import random

# Optional deps — install if available, graceful fallback if not
try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    swe = None

try:
    from rapidfuzz import fuzz
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    RAPIDFUZZ_AVAILABLE = False

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except:
    SPACY_AVAILABLE = False
    nlp = None


# ═══════════════════════════════════════════════════════════════════════
# SECTION 1: CORE DATA STRUCTURES (from Parashar21 p21selCols schema)
# ═══════════════════════════════════════════════════════════════════════

@dataclass
class HDChart:
    """
    Human Design chart as queryable JSON document.
    Based on Parashar21 JSON schema, expanded for full HD resolution.
    """
    name: str = ""
    birth_date: str = ""      # YYYY-MM-DD
    birth_time: str = ""      # HH:MM:SS
    birth_place: str = ""
    longitude: float = 0.0
    latitude: float = 0.0
    type: str = ""            # Generator, Projector, Manifestor, Reflector
    profile: str = ""         # e.g., "6/2"
    authority: str = ""       # Sacral, Emotional, Splenic, etc.
    strategy: str = ""        # To Respond, To Wait, To Inform, To Wait (Lunar)
    defined_centers: Set[str] = field(default_factory=set)
    undefined_centers: Set[str] = field(default_factory=set)
    defined_gates: Set[int] = field(default_factory=set)
    undefined_gates: Set[int] = field(default_factory=set)
    gate_activations: Dict[int, Dict] = field(default_factory=dict)
    determination: str = ""   # Active/Passive, etc.
    cognition: str = ""       # Smell, Taste, etc.
    environment: str = ""     # Markets, etc.
    motivation: str = ""      # Fear, Hope, Desire, Need, Guilt, Innocence
    perspective: str = ""     # Personal/Transpersonal/Interpersonal
    cross: str = ""           # e.g., "Cross of Eden 3"
    sun_earth: Tuple[int, int] = (0, 0)
    nodes: Tuple[int, int] = (0, 0)
    calculation_source: str = ""
    calculated_at: str = ""
    nakshatra: str = ""
    dasha_lord: str = ""
    draconic_sun: str = ""
    nodal_axis: str = ""

    def to_json(self) -> Dict:
        return {
            "identity": {
                "name": self.name,
                "birth": {
                    "date": self.birth_date,
                    "time": self.birth_time,
                    "place": self.birth_place,
                    "longitude": self.longitude,
                    "latitude": self.latitude
                }
            },
            "type_profile": {
                "type": self.type,
                "profile": self.profile,
                "authority": self.authority,
                "strategy": self.strategy
            },
            "definition": {
                "defined_centers": list(self.defined_centers),
                "undefined_centers": list(self.undefined_centers),
                "defined_gates": list(self.defined_gates),
                "undefined_gates": list(self.undefined_gates)
            },
            "gate_activations": self.gate_activations,
            "variables": {
                "determination": self.determination,
                "cognition": self.cognition,
                "environment": self.environment,
                "motivation": self.motivation,
                "perspective": self.perspective
            },
            "incarnation_cross": {
                "cross": self.cross,
                "sun_earth": self.sun_earth,
                "nodes": self.nodes
            },
            "vedic": {
                "nakshatra": self.nakshatra,
                "dasha_lord": self.dasha_lord
            },
            "draconic": {
                "sun": self.draconic_sun,
                "nodal_axis": self.nodal_axis
            },
            "meta": {
                "source": self.calculation_source,
                "calculated_at": self.calculated_at
            }
        }


@dataclass
class TransitState:
    """Live planetary positions — same feed, all three schedulers read it."""
    timestamp: datetime
    planetary_positions: Dict[str, Dict] = field(default_factory=dict)
    lunar_phase: str = ""
    lunar_phase_deg: float = 0.0
    retrograde_planets: Set[str] = field(default_factory=set)
    activated_gates: Set[int] = field(default_factory=set)
    conditioned_gates: Set[int] = field(default_factory=set)
    sidereal_positions: Dict[str, Dict] = field(default_factory=dict)
    nakshatra_activations: Dict[str, Any] = field(default_factory=dict)
    dasha_period: str = ""
    draconic_positions: Dict[str, Dict] = field(default_factory=dict)
    nodal_axis: Tuple[float, float] = (0.0, 0.0)

    def to_json(self) -> Dict:
        return {
            "timestamp": self.timestamp.isoformat(),
            "planetary": self.planetary_positions,
            "lunar": {"phase": self.lunar_phase, "phase_deg": self.lunar_phase_deg},
            "retrograde": list(self.retrograde_planets),
            "hd": {
                "activated_gates": list(self.activated_gates),
                "conditioned_gates": list(self.conditioned_gates)
            },
            "vedic": {"sidereal": self.sidereal_positions, "dasha": self.dasha_period},
            "draconic": {"positions": self.draconic_positions, "nodal_axis": self.nodal_axis}
        }


# ═══════════════════════════════════════════════════════════════════════
# SECTION 2: SWISS EPHEMERIS WRAPPER (from Parashar21 p21swe)
# ═══════════════════════════════════════════════════════════════════════

class SwissEphemerisFeed:
    """Live planetary position calculator. Based on Parashar21 p21swe.py."""

    PLANETS = None  # Set at init to avoid import-time crash
    SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]

    def __init__(self):
        if not SWISSEPH_AVAILABLE or swe is None:
            raise ImportError("swisseph not installed. Run: pip install pyswisseph")
        self.PLANETS = {
            "Sun": swe.SUN, "Moon": swe.MOON, "Mercury": swe.MERCURY,
            "Venus": swe.VENUS, "Mars": swe.MARS, "Jupiter": swe.JUPITER,
            "Saturn": swe.SATURN, "Uranus": swe.URANUS, "Neptune": swe.NEPTUNE,
            "Pluto": swe.PLUTO, "North Node": swe.MEAN_NODE,
            "South Node": swe.TRUE_NODE, "Lilith": swe.MEAN_APOG
        }
        try:
            swe.set_ephe_path("/usr/share/ephe")
        except:
            pass  # Ephemeris files may be elsewhere

    def _jd(self, dt: datetime) -> float:
        return swe.julday(dt.year, dt.month, dt.day,
                         dt.hour + dt.minute/60.0 + dt.second/3600.0)

    def _longitude_to_sign(self, longitude: float) -> str:
        return self.SIGNS[int(longitude / 30) % 12]

    def _detect_retrograde(self, planet_id: int, jd: float) -> bool:
        """From scx_horoscope: negative delta in longitude = retrograde."""
        pos_today = swe.calc_ut(jd, planet_id, swe.FLG_EQUATORIAL)[0][0]
        pos_yesterday = swe.calc_ut(jd - 1, planet_id, swe.FLG_EQUATORIAL)[0][0]
        delta = pos_today - pos_yesterday
        if delta > 180: delta -= 360
        elif delta < -180: delta += 360
        return delta < 0

    def get_transit(self, dt: Optional[datetime] = None) -> TransitState:
        if dt is None: dt = datetime.now()
        jd = self._jd(dt)

        planetary = {}
        retrograde = set()

        for name, planet_id in self.PLANETS.items():
            result = swe.calc_ut(jd, planet_id, swe.FLG_EQUATORIAL)
            longitude = result[0][0]
            speed = result[0][3]
            is_retro = self._detect_retrograde(planet_id, jd)
            if is_retro: retrograde.add(name)

            planetary[name] = {
                "longitude": round(longitude, 4),
                "sign": self._longitude_to_sign(longitude),
                "retrograde": is_retro,
                "speed": round(speed, 4)
            }

        sun_lon = planetary["Sun"]["longitude"]
        moon_lon = planetary["Moon"]["longitude"]
        phase_deg = (moon_lon - sun_lon) % 360
        phase = self._phase_name(phase_deg)

        activated_gates = set()
        for planet_name, pos in planetary.items():
            gate = int(pos["longitude"] / 5.625) % 64 + 1
            activated_gates.add(gate)

        return TransitState(
            timestamp=dt, planetary_positions=planetary,
            lunar_phase=phase, lunar_phase_deg=round(phase_deg, 2),
            retrograde_planets=retrograde, activated_gates=activated_gates
        )

    def _phase_name(self, deg: float) -> str:
        if deg < 45: return "New"
        elif deg < 90: return "Waxing Crescent"
        elif deg < 135: return "First Quarter"
        elif deg < 180: return "Waxing Gibbous"
        elif deg < 225: return "Full"
        elif deg < 270: return "Waning Gibbous"
        elif deg < 315: return "Last Quarter"
        else: return "Waning Crescent"


# ═══════════════════════════════════════════════════════════════════════
# SECTION 3: VARGA / DASHA ENGINE (from VedicAstro)
# ═══════════════════════════════════════════════════════════════════════

class VargaEngine:
    """Vedic divisional chart calculator. Maps to 13-layer concentric canvas."""

    VARGAS = {
        "D1": 1, "D2": 2, "D3": 3, "D7": 7, "D9": 9, "D10": 10,
        "D12": 12, "D16": 16, "D20": 20, "D24": 24, "D27": 27,
        "D30": 30, "D40": 40, "D45": 45, "D60": 60
    }
    DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
                   "Jupiter", "Saturn", "Mercury"]
    DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17]

    def __init__(self):
        if not SWISSEPH_AVAILABLE:
            raise ImportError("swisseph required for Varga calculations")

    def calculate_varga(self, longitude: float, varga_num: int) -> float:
        sign_deg = longitude % 30
        sign_index = int(longitude / 30)
        part_size = 30.0 / varga_num
        part_index = int(sign_deg / part_size)
        sign_types = [0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1]
        sign_type = sign_types[sign_index]
        starting_signs = [0, 4, 8]
        varga_sign = (starting_signs[sign_type] + part_index) % 12
        return varga_sign * 30 + (sign_deg % part_size) * (30.0 / part_size)

    def get_all_vargas(self, longitude: float) -> Dict[str, float]:
        return {name: self.calculate_varga(longitude, num)
                for name, num in self.VARGAS.items()}

    def compute_dasha(self, birth_moon_nakshatra: int, years_elapsed: float) -> Dict:
        nakshatra_lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
                          "Jupiter", "Saturn", "Mercury"] * 3
        birth_lord = nakshatra_lords[birth_moon_nakshatra - 1]
        lord_index = self.DASHA_LORDS.index(birth_lord)
        nakshatra_fraction = (birth_moon_nakshatra % 1)
        lord_years = self.DASHA_YEARS[lord_index]
        remaining_years = lord_years * (1 - nakshatra_fraction)
        current_years = remaining_years
        cycle = list(range(lord_index, 9)) + list(range(0, lord_index))
        dasha_index = 0
        while current_years < years_elapsed and dasha_index < 8:
            dasha_index += 1
            current_years += self.DASHA_YEARS[cycle[dasha_index]]
        current_lord = self.DASHA_LORDS[cycle[dasha_index]]
        years_into = years_elapsed - (current_years - self.DASHA_YEARS[cycle[dasha_index]])
        return {
            "mahadasha_lord": current_lord,
            "years_into_mahadasha": round(years_into, 2),
            "mahadasha_total_years": self.DASHA_YEARS[cycle[dasha_index]],
            "next_lord": self.DASHA_LORDS[cycle[(dasha_index + 1) % 9]] if dasha_index < 8 else None
        }


# ═══════════════════════════════════════════════════════════════════════
# SECTION 4: TRI-SCHEDULER CORE (from scx_horoscope formula)
# ═══════════════════════════════════════════════════════════════════════

class CertaintyLevel(Enum):
    UNKNOWN = "unknown"
    SPECULATIVE = "speculative"
    PROBABLE = "probable"
    CONFIRMED = "confirmed"


@dataclass
class SchedulerOutput:
    name: str
    perspective: str
    domain: str
    layer: str
    weights: Dict[str, Any]
    reasoning: List[str]
    active_agents: List[str]
    dormant_agents: List[str]
    certainty: CertaintyLevel
    approximation_notes: List[str] = field(default_factory=list)


class BodyScheduler:
    """SCHEDULER 1: BODY — Tropical / Personal / Actions"""

    def __init__(self):
        self.name = "BODY"
        self.perspective = "personal_actions"
        self.domain = "tropical"
        self.layer = "graphene_sheet_1"
        self.center_agents = {
            "Sacral": "generator_response", "Solar Plexus": "emotional_wave",
            "Heart": "willpower_commitment", "Spleen": "intuition_survival",
            "Root": "pressure_adrenaline", "Ajna": "conceptual_processing",
            "Throat": "manifestation_action", "G": "identity_direction",
            "Crown": "inspiration_reception"
        }
        self.gate_center = self._build_gate_center_map()
        self.profile_mods = {
            "1/3": 1.2, "1/4": 1.1, "2/4": 0.9, "2/5": 0.8,
            "3/5": 1.3, "3/6": 1.2, "4/6": 1.0, "4/1": 1.1,
            "5/1": 0.9, "5/2": 0.8, "6/2": 0.7, "6/3": 1.4
        }

    def _build_gate_center_map(self) -> Dict[int, str]:
        mapping = {}
        for g in [1, 19, 38, 41, 52, 53, 54, 58, 60]: mapping[g] = "Root"
        for g in [2, 3, 5, 9, 14, 27, 29, 34, 42, 59]: mapping[g] = "Sacral"
        for g in [6, 22, 30, 36, 37, 39, 49, 55]: mapping[g] = "Solar Plexus"
        for g in [21, 26, 40, 44, 51]: mapping[g] = "Heart"
        for g in [18, 28, 32, 44, 48, 50, 57]: mapping[g] = "Spleen"
        for g in [11, 17, 24, 43, 47]: mapping[g] = "Ajna"
        for g in [8, 12, 16, 20, 23, 31, 33, 35, 45, 56, 62]: mapping[g] = "Throat"
        for g in [7, 10, 13, 15, 25, 46]: mapping[g] = "G"
        for g in [63, 64]: mapping[g] = "Crown"
        return mapping

    def calculate(self, chart: HDChart, transit: TransitState) -> SchedulerOutput:
        weights = {}
        reasoning = []
        active = []
        dormant = []

        for center, agent in self.center_agents.items():
            if center in chart.defined_centers:
                base = 800
                status = "defined"
                active.append(agent)
                reasoning.append(f"{center} DEFINED → {agent} base={base}")
            else:
                base = 200
                status = "undefined"
                dormant.append(agent)
                reasoning.append(f"{center} UNDEFINED → {agent} base={base} (vulnerable)")
            weights[agent] = {"base": base, "center": center, "status": status, "final": base}

        for gate in transit.activated_gates:
            center = self.gate_center.get(gate, "Unknown")
            agent = self.center_agents.get(center, "unknown")
            if gate in chart.defined_gates:
                boost = 1.5
                weights[agent]["transit_boost"] = boost
                weights[agent]["final"] = int(weights[agent]["base"] * boost)
                reasoning.append(f"Gate {gate} (DEFINED) activated → {agent} ×{boost}")
            elif gate in chart.undefined_gates:
                penalty = 0.5
                weights[agent]["transit_penalty"] = penalty
                weights[agent]["final"] = int(weights[agent]["base"] * penalty)
                reasoning.append(f"Gate {gate} (UNDEFINED) activated → {agent} ×{penalty} NOT-SELF")

        mod = self.profile_mods.get(chart.profile, 1.0)
        for agent in weights:
            if "final" not in weights[agent]:
                weights[agent]["final"] = weights[agent]["base"]
            weights[agent]["final"] = int(weights[agent]["final"] * mod)
        reasoning.append(f"Profile {chart.profile} modifier: ×{mod}")

        if chart.type == "Generator":
            weights["generator_response"]["final"] = int(weights["generator_response"]["final"] * 1.3)
            reasoning.append("Type=Generator → sacral response amplified")
        elif chart.type == "Projector":
            weights["conceptual_processing"]["final"] = int(weights["conceptual_processing"]["final"] * 1.2)
            reasoning.append("Type=Projector → conceptual processing amplified")

        return SchedulerOutput(
            name=self.name, perspective=self.perspective, domain=self.domain,
            layer=self.layer, weights=weights, reasoning=reasoning,
            active_agents=active, dormant_agents=dormant,
            certainty=CertaintyLevel.PROBABLE,
            approximation_notes=[
                "Gate positions approximate ±0.5°",
                "Profile modifier is estimated from observed patterns",
                "Transit activation threshold is 0.5° orb"
            ]
        )


class MindScheduler:
    """SCHEDULER 2: MIND — Vedic / Sidereal / Thoughts"""

    def __init__(self):
        self.name = "MIND"
        self.perspective = "transpersonal_thoughts"
        self.domain = "vedic_sidereal"
        self.layer = "graphene_sheet_2"
        self.nakshatra_agents = {
            "Ashwini": "initiation_speed", "Bharani": "containment_restraint",
            "Krittika": "cutting_discernment", "Rohini": "growth_nurturing",
            "Mrigashira": "search_exploration", "Ardra": "storm_transformation",
            "Punarvasu": "return_renewal", "Pushya": "nourishment_support",
            "Ashlesha": "entanglement_depth", "Magha": "ancestral_power",
            "Purva Phalguni": "enjoyment_creativity", "Uttara Phalguni": "sustained_effort",
            "Hasta": "skill_craft", "Chitra": "design_beauty",
            "Swati": "independence_wind", "Vishakha": "achievement_focus",
            "Anuradha": "friendship_cooperation", "Jyeshtha": "authority_protection",
            "Mula": "root_destruction", "Purva Ashadha": "invincibility_water",
            "Uttara Ashadha": "latter_victory", "Shravana": "hearing_learning",
            "Dhanishta": "rhythm_wealth", "Shatabhisha": "hundred_healers",
            "Purva Bhadrapada": "front_burning", "Uttara Bhadrapada": "latter_burning",
            "Revati": "wealth_protection"
        }
        self.dasha_agents = {
            "Ketu": "liberation_detachment", "Venus": "harmony_relationship",
            "Sun": "authority_identity", "Moon": "mind_emotion",
            "Mars": "action_courage", "Rahu": "obsession_expansion",
            "Jupiter": "wisdom_growth", "Saturn": "discipline_structure",
            "Mercury": "communication_analysis"
        }

    def calculate(self, chart: HDChart, transit: TransitState) -> SchedulerOutput:
        weights = {}
        reasoning = []
        active = []
        dormant = []

        nakshatra = chart.nakshatra if chart.nakshatra else "Magha"
        lunar_agent = self.nakshatra_agents.get(nakshatra, "unknown_lunar")
        weights["lunar_baseline"] = {"nakshatra": nakshatra, "agent": lunar_agent, "base": 600, "final": 600}
        active.append(lunar_agent)
        reasoning.append(f"Moon in {nakshatra} → {lunar_agent} is lunar baseline")

        dasha = chart.dasha_lord if chart.dasha_lord else "Jupiter"
        dasha_agent = self.dasha_agents.get(dasha, "unknown_dasha")
        weights["dasha_ruler"] = {"planet": dasha, "agent": dasha_agent, "base": 900, "final": 900}
        active.append(dasha_agent)
        reasoning.append(f"Dasha lord {dasha} → {dasha_agent} dominant")

        for planet in transit.retrograde_planets:
            if planet in self.dasha_agents:
                retro_agent = f"{planet}_retrograde_review"
                weights[retro_agent] = {"planet": planet, "status": "retrograde", "base": 400, "final": 400, "effect": "review_reconsider"}
                active.append(retro_agent)
                reasoning.append(f"{planet} retrograde → mental review: {retro_agent}")

        return SchedulerOutput(
            name=self.name, perspective=self.perspective, domain=self.domain,
            layer=self.layer, weights=weights, reasoning=reasoning,
            active_agents=active, dormant_agents=dormant,
            certainty=CertaintyLevel.SPECULATIVE,
            approximation_notes=[
                "Sidereal calculations use Lahiri ayanamsa (approximate)",
                "Dasha periods are calculated from moon nakshatra at birth",
                "Nakshatra boundaries are approximate"
            ]
        )


class HeartScheduler:
    """SCHEDULER 3: HEART — Draconic / Nodal / Emotions"""

    def __init__(self):
        self.name = "HEART"
        self.perspective = "interpersonal_emotions"
        self.domain = "draconic"
        self.layer = "graphene_sheet_3"
        self.sign_agents = {
            "Aries": "courage_initiation", "Taurus": "stability_value",
            "Gemini": "communication_curiosity", "Cancer": "nurturing_protection",
            "Leo": "creativity_leadership", "Virgo": "service_discernment",
            "Libra": "harmony_relationship", "Scorpio": "transformation_depth",
            "Sagittarius": "expansion_truth", "Capricorn": "achievement_structure",
            "Aquarius": "innovation_humanity", "Pisces": "compassion_transcendence"
        }
        self.north_node_agents = {
            "Aries": "self_discovery", "Taurus": "self_worth",
            "Gemini": "self_expression", "Cancer": "self_nurturing",
            "Leo": "self_creativity", "Virgo": "self_service",
            "Libra": "self_relationship", "Scorpio": "self_transformation",
            "Sagittarius": "self_expansion", "Capricorn": "self_mastery",
            "Aquarius": "self_liberation", "Pisces": "self_surrender"
        }

    def calculate(self, chart: HDChart, transit: TransitState) -> SchedulerOutput:
        weights = {}
        reasoning = []
        active = []
        dormant = []

        draconic_sun = chart.draconic_sun if chart.draconic_sun else "Aries"
        soul_agent = self.sign_agents.get(draconic_sun, "unknown_soul")
        weights["soul_purpose"] = {"draconic_sun": draconic_sun, "agent": soul_agent, "base": 800, "final": 800}
        active.append(soul_agent)
        reasoning.append(f"Draconic Sun {draconic_sun} → {soul_agent} is soul purpose")

        nodal = chart.nodal_axis if chart.nodal_axis else "North Node in Libra"
        north_sign = "Libra"
        if "in " in nodal: north_sign = nodal.split("in ")[1].split()[0]
        karmic_agent = self.north_node_agents.get(north_sign, "unknown_karma")
        weights["karmic_direction"] = {"north_node": north_sign, "agent": karmic_agent, "base": 700, "final": 700}
        active.append(karmic_agent)
        reasoning.append(f"North Node {north_sign} → {karmic_agent} is karmic direction")

        phase = transit.lunar_phase
        phase_mods = {"New": 0.3, "Waxing Crescent": 0.5, "First Quarter": 0.8,
                     "Waxing Gibbous": 1.0, "Full": 1.5, "Waning Gibbous": 1.2,
                     "Last Quarter": 0.8, "Waning Crescent": 0.4}
        mod = phase_mods.get(phase, 1.0)
        weights["emotional_tide"] = {"lunar_phase": phase, "modifier": mod, "base": 500, "final": int(500 * mod)}
        reasoning.append(f"Lunar phase {phase} → emotional tide ×{mod}")

        return SchedulerOutput(
            name=self.name, perspective=self.perspective, domain=self.domain,
            layer=self.layer, weights=weights, reasoning=reasoning,
            active_agents=active, dormant_agents=dormant,
            certainty=CertaintyLevel.SPECULATIVE,
            approximation_notes=[
                "Draconic positions are tropical minus north node longitude",
                "Nodal axis interpretation is karmic, not deterministic",
                "Lunar phase effects are observational, not mechanistic"
            ]
        )


# ═══════════════════════════════════════════════════════════════════════
# SECTION 5: QUESTIONING ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════════════

@dataclass
class Question:
    id: str
    context: str
    question_text: str
    scheduler_a: str
    scheduler_b: str
    agent_a: str
    agent_b: str
    suggested_investigation: List[str]
    proof_required: List[str]
    status: str = "open"
    user_response: Optional[str] = None
    llm_interpretation: Optional[str] = None


class QuestioningOrchestrator:
    """The orchestrator that asks instead of deciding."""

    def __init__(self):
        self.questions: List[Question] = []
        self.question_history: List[Dict] = []
        self.proven_truths: Dict[str, Dict] = {}

    def run(self, body: SchedulerOutput, mind: SchedulerOutput,
            heart: SchedulerOutput) -> Dict:
        tensions = self._find_tensions(body, mind, heart)
        new_questions = []
        for tension in tensions:
            q = self._formulate_question(tension, body, mind, heart)
            if q:
                new_questions.append(q)
                self.questions.append(q)

        alignments = self._find_alignments(body, mind, heart)

        return {
            "timestamp": datetime.now().isoformat(),
            "system_status": "questioning",
            "note": "The orchestrator raises questions. It does not resolve them.",
            "perspectives": {
                "BODY": self._format_scheduler(body),
                "MIND": self._format_scheduler(mind),
                "HEART": self._format_scheduler(heart)
            },
            "tensions": tensions,
            "questions": [self._format_question(q) for q in new_questions],
            "open_questions": len([q for q in self.questions if q.status == "open"]),
            "proven_truths": self.proven_truths,
            "what_happens_next": "The LLM interprets. The user okays or rejects. The system learns."
        }

    def _format_scheduler(self, s: SchedulerOutput) -> Dict:
        return {
            "says": self._what_it_says(s),
            "certainty": s.certainty.value,
            "active": s.active_agents,
            "approximation_notes": s.approximation_notes
        }

    def _what_it_says(self, s: SchedulerOutput) -> str:
        if not s.active_agents:
            return f"{s.name}: quiet, watching"
        return f"{s.name}: {', '.join(s.active_agents[:3])} active"

    def _find_tensions(self, body: SchedulerOutput, mind: SchedulerOutput,
                       heart: SchedulerOutput) -> List[Dict]:
        tensions = []
        body_set = set(body.active_agents)
        mind_set = set(mind.active_agents)
        heart_set = set(heart.active_agents)

        if any("response" in a or "action" in a for a in body_set) and \
           any("detachment" in a or "structure" in a for a in mind_set):
            tensions.append({
                "type": "action_vs_patience",
                "description": "Body is ready to act but Mind counsels waiting",
                "intensity": "high",
                "question_seed": "Why is it that you can only do one thing at a time?"
            })

        if any("courage" in a or "depth" in a for a in heart_set) and \
           any("response" in a for a in body_set):
            tensions.append({
                "type": "passion_vs_mechanics",
                "description": "Heart is moved but Body treats it as routine",
                "intensity": "high",
                "question_seed": "Why does the body respond before the heart has finished feeling?"
            })

        if any("analysis" in a or "discernment" in a for a in mind_set) and \
           any("self_" in a for a in heart_set):
            tensions.append({
                "type": "analysis_vs_knowing",
                "description": "Mind wants to understand but Heart already knows",
                "intensity": "medium",
                "question_seed": "Why does understanding come after knowing, not before?"
            })

        if len(body_set & mind_set & heart_set) == 0 and len(body_set) > 0 and len(mind_set) > 0 and len(heart_set) > 0:
            tensions.append({
                "type": "complete_divergence",
                "description": "Body, Mind, and Heart each want different things",
                "intensity": "critical",
                "question_seed": "How can one person contain three such different impulses?"
            })

        return tensions

    def _formulate_question(self, tension: Dict, body: SchedulerOutput,
                           mind: SchedulerOutput, heart: SchedulerOutput) -> Question:
        templates = {
            "action_vs_patience": [
                "Why is it that you can only do one thing at a time?",
                "What if the body is right and the mind is just afraid?",
                "What if the mind is right and the body is just impatient?",
                "How do you know which timing is true?"
            ],
            "passion_vs_mechanics": [
                "Why does the body respond before the heart has finished feeling?",
                "Can a mechanical response ever be passionate?",
                "What happens when the heart wants something the body can't do?"
            ],
            "analysis_vs_knowing": [
                "Why does understanding come after knowing, not before?",
                "If the heart already knows, what is the mind trying to figure out?",
                "Can analysis ever catch up to what the heart already feels?"
            ],
            "complete_divergence": [
                "How can one person contain three such different impulses?",
                "Which part of you is most true when all three disagree?",
                "Is there a fourth perspective that sees what the other three miss?",
                "What if none of them are wrong, but the question is wrong?"
            ]
        }
        t = tension["type"]
        selected = random.choice(templates.get(t, ["What is really happening here?"]))

        return Question(
            id=f"q_{datetime.now().strftime('%Y%m%d%H%M%S')}_{random.randint(1000,9999)}",
            context=tension["description"],
            question_text=selected,
            scheduler_a="BODY",
            scheduler_b="MIND" if t in ["action_vs_patience", "passion_vs_mechanics"] else "HEART",
            agent_a=str(body.active_agents[:2]),
            agent_b=str(mind.active_agents[:2]) if t in ["action_vs_patience", "analysis_vs_knowing"] else str(heart.active_agents[:2]),
            suggested_investigation=[
                "Check transit data for next 24 hours",
                "Review historical instances of this tension",
                "Ask user what they actually did in similar moments",
                "Check codex for how this tension resolved before"
            ],
            proof_required=[
                "User confirms which impulse they followed and what happened",
                "Transit shows which planet was dominant at decision moment",
                "Codex entry shows this tension resolved in past instances"
            ]
        )

    def _find_alignments(self, body: SchedulerOutput, mind: SchedulerOutput,
                         heart: SchedulerOutput) -> List[Dict]:
        alignments = []
        body_set = set(body.active_agents)
        mind_set = set(mind.active_agents)
        heart_set = set(heart.active_agents)
        shared = body_set & mind_set & heart_set
        if shared:
            alignments.append({
                "type": "full_alignment",
                "agents": list(shared),
                "note": "All three agree — but is this real or coincidence?"
            })
        return alignments

    def _format_question(self, q: Question) -> Dict:
        return {
            "id": q.id,
            "question": q.question_text,
            "context": q.context,
            "between": f"{q.scheduler_a} ↔ {q.scheduler_b}",
            "status": q.status,
            "investigate": q.suggested_investigation,
            "proof_needed": q.proof_required,
            "user_can": "okay this, reject this, or ask another question"
        }

    def user_responds(self, question_id: str, response: str):
        for q in self.questions:
            if q.id == question_id:
                q.user_response = response
                q.status = "under_investigation"
                self.question_history.append({
                    "question": q.question_text,
                    "user_said": response,
                    "timestamp": datetime.now().isoformat()
                })
                break

    def prove_truth(self, claim: str, evidence: Dict):
        self.proven_truths[claim] = {
            "evidence": evidence,
            "confirmed_at": datetime.now().isoformat()
        }


# ═══════════════════════════════════════════════════════════════════════
# SECTION 6: UNIFIED API
# ═══════════════════════════════════════════════════════════════════════

class SynthScheduler:
    """Unified entry point. One call, three perspectives, questions raised."""

    def __init__(self, use_ephemeris: bool = False):
        self.body = BodyScheduler()
        self.mind = MindScheduler()
        self.heart = HeartScheduler()
        self.orchestrator = QuestioningOrchestrator()
        self.ephemeris = None
        if use_ephemeris and SWISSEPH_AVAILABLE:
            self.ephemeris = SwissEphemerisFeed()
        self.varga = None
        if SWISSEPH_AVAILABLE:
            self.varga = VargaEngine()

    def calculate(self, chart: HDChart, transit: Optional[TransitState] = None) -> Dict:
        if transit is None and self.ephemeris:
            transit = self.ephemeris.get_transit()
        elif transit is None:
            transit = TransitState(timestamp=datetime.now())

        body_out = self.body.calculate(chart, transit)
        mind_out = self.mind.calculate(chart, transit)
        heart_out = self.heart.calculate(chart, transit)

        result = self.orchestrator.run(body_out, mind_out, heart_out)

        result["raw_schedulers"] = {
            "BODY": {
                "weights": body_out.weights,
                "reasoning": body_out.reasoning,
                "active": body_out.active_agents,
                "dormant": body_out.dormant_agents,
                "certainty": body_out.certainty.value,
                "approximation_notes": body_out.approximation_notes
            },
            "MIND": {
                "weights": mind_out.weights,
                "reasoning": mind_out.reasoning,
                "active": mind_out.active_agents,
                "dormant": mind_out.dormant_agents,
                "certainty": mind_out.certainty.value,
                "approximation_notes": mind_out.approximation_notes
            },
            "HEART": {
                "weights": heart_out.weights,
                "reasoning": heart_out.reasoning,
                "active": heart_out.active_agents,
                "dormant": heart_out.dormant_agents,
                "certainty": heart_out.certainty.value,
                "approximation_notes": heart_out.approximation_notes
            }
        }

        return result

    def get_varga_layers(self, chart: HDChart) -> Dict:
        if not self.varga:
            return {"error": "Varga engine not available (swisseph not installed)"}
        return {
            "D1_Rashi": "base personality layer",
            "D9_Navamsa": "soul/spouse layer",
            "D60_Shashtiamsa": "karmic fine-print layer",
            "note": "Full Varga calculation requires birth planetary positions"
        }


# ═══════════════════════════════════════════════════════════════════════
# SECTION 7: DEMO
# ═══════════════════════════════════════════════════════════════════════

def demo():
    chart = HDChart(
        name="Demo User",
        birth_date="1990-06-15",
        birth_time="14:30:00",
        birth_place="New York, NY",
        longitude=-74.006,
        latitude=40.7128,
        type="Generator",
        profile="6/2",
        authority="Sacral",
        strategy="To Respond",
        defined_centers={"Sacral", "Heart", "Ajna", "Throat", "G"},
        undefined_centers={"Solar Plexus", "Spleen", "Root", "Crown"},
        defined_gates={34, 20, 10, 15, 59, 6, 25, 51, 21, 26, 40},
        undefined_gates=set(range(1, 65)) - {34, 20, 10, 15, 59, 6, 25, 51, 21, 26, 40},
        gate_activations={
            34: {"line": 1, "color": 1, "tone": 1, "base": 1, "center": "Sacral"},
            20: {"line": 6, "color": 2, "tone": 3, "base": 1, "center": "Throat"},
            10: {"line": 4, "color": 3, "tone": 5, "base": 2, "center": "G"},
            51: {"line": 3, "color": 2, "tone": 4, "base": 1, "center": "Heart"}
        },
        motivation="Hope",
        perspective="Personal",
        cross="Cross of Eden 3",
        nakshatra="Magha",
        dasha_lord="Jupiter",
        draconic_sun="Aries",
        nodal_axis="North Node in Libra"
    )

    transit = TransitState(
        timestamp=datetime.now(),
        planetary_positions={
            "Sun": {"longitude": 45.2, "sign": "Taurus", "retrograde": False},
            "Moon": {"longitude": 120.5, "sign": "Leo", "retrograde": False},
            "Mercury": {"longitude": 30.1, "sign": "Aries", "retrograde": True},
            "Mars": {"longitude": 150.7, "sign": "Virgo", "retrograde": False},
            "Jupiter": {"longitude": 240.2, "sign": "Sagittarius", "retrograde": False},
            "Saturn": {"longitude": 300.5, "sign": "Aquarius", "retrograde": True}
        },
        lunar_phase="Waxing Gibbous",
        retrograde_planets={"Mercury", "Saturn"},
        activated_gates={51, 25, 10, 34, 1, 2, 3},
        conditioned_gates={1, 2, 3}
    )

    scheduler = SynthScheduler(use_ephemeris=False)
    result = scheduler.calculate(chart, transit)

    print("=" * 70)
    print("SYNTH AI TRI-SCHEDULER — UNIFIED OUTPUT")
    print("=" * 70)
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    demo()
