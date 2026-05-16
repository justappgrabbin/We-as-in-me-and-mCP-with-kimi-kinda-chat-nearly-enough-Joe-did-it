"""
MRNN + METATRON Interpolation Engine
5-Layer Symbolic Neural Story Generation

Integrates:
- Human Design 5-layer topology (64 gates, 6 lines, 6 tones, 6 colors, 5 bases)
- METATRON narrative interpolation (AVM/BCO scaffolding + coherence filtering)
- Fibonacci scheduling for monopole routing
- 72 template categories for symbolic sentence generation

Usage:
    engine = FinalMRNNStoryEngine()
    story = engine.generate_story(
        situation="Pursuit",
        characters={"pursuer": "the hunter", "fugitive": "the dreamer"},
        setting="a city of mirrors",
        num_interpolations_bc=3,
        num_interpolations_co=3
    )
"""

import json
import math
import random
import re
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from enum import Enum

# ============================================================
# CORE DATA STRUCTURES
# ============================================================

class Dimension(Enum):
    GATE = 1
    LINE = 2
    TONE = 3
    COLOR = 4
    BASE = 5

@dataclass
class SymbolicCoordinate:
    gate: int
    line: int
    tone: int
    color: int
    base: int

    def to_vector(self) -> List[float]:
        return [self.gate/64, self.line/6, self.tone/6, self.color/6, self.base/5]

    def distance_to(self, other: 'SymbolicCoordinate') -> float:
        v1 = self.to_vector()
        v2 = other.to_vector()
        return math.sqrt(sum((a-b)**2 for a, b in zip(v1, v2)))

@dataclass
class AttributeValueMatrix:
    characters: Dict[str, str] = field(default_factory=dict)
    setting: str = ""
    action: str = ""
    emotion: str = ""
    causal_link: str = ""
    outcome: str = ""

    def to_dict(self) -> dict:
        return {
            'characters': self.characters,
            'setting': self.setting,
            'action': self.action,
            'emotion': self.emotion,
            'causal_link': self.causal_link,
            'outcome': self.outcome
        }

@dataclass
class BCOOutline:
    beginning: str = ""
    climax: str = ""
    outcome: str = ""
    avm: AttributeValueMatrix = field(default_factory=AttributeValueMatrix)

    def sentences(self) -> List[str]:
        return [self.beginning, self.climax, self.outcome]

@dataclass
class TransitCandidate:
    text: str
    symbolic_coords: List[SymbolicCoordinate]
    coherence_score: float = 0.0
    local_score: float = 0.0
    global_score: float = 0.0

    def total_score(self) -> float:
        return (self.coherence_score * 0.4 + 
                self.local_score * 0.3 + 
                self.global_score * 0.3)

# ============================================================
# SYMBOLIC CONSTANTS
# ============================================================

GATE_MEANINGS = {
    1: "The Creative", 2: "The Receptive", 3: "Difficulty", 4: "Youthful Folly",
    5: "Waiting", 6: "Conflict", 7: "The Army", 8: "Holding Together",
    9: "Taming Power of the Small", 10: "Treading", 11: "Peace", 12: "Standstill",
    13: "Fellowship", 14: "Possession", 15: "Modesty", 16: "Enthusiasm",
    17: "Following", 18: "Work on the Decayed", 19: "Approach", 20: "Contemplation",
    21: "Biting Through", 22: "Grace", 23: "Splitting Apart", 24: "Return",
    25: "Innocence", 26: "Taming Power of the Great", 27: "Nourishment",
    28: "Preponderance of the Great", 29: "The Abysmal", 30: "The Clinging",
    31: "Influence", 32: "Duration", 33: "Retreat", 34: "Power of the Great",
    35: "Progress", 36: "Darkening of the Light", 37: "The Family", 38: "Opposition",
    39: "Obstruction", 40: "Deliverance", 41: "Decrease", 42: "Increase",
    43: "Breakthrough", 44: "Coming to Meet", 45: "Gathering Together",
    46: "Pushing Upward", 47: "Oppression", 48: "The Well", 49: "Revolution",
    50: "The Cauldron", 51: "The Arousing", 52: "Keeping Still", 53: "Development",
    54: "Marrying Maiden", 55: "Abundance", 56: "The Wanderer", 57: "The Gentle",
    58: "The Joyous", 59: "Dispersion", 60: "Limitation", 61: "Inner Truth",
    62: "Preponderance of the Small", 63: "After Completion", 64: "Before Completion"
}

LINE_QUALITIES = [
    "Initiating", "Responding", "Adapting", "Manifesting", "Guiding", "Completing"
]

TONE_FREQUENCIES = [1, 2, 3, 4, 5, 6]
COLOR_MOTIVATIONS = [
    "Survival", "Desire", "Fear", "Need", "Power", "Imagination"
]
BASE_ELEMENTS = ["Earth", "Water", "Fire", "Air", "Ether"]

# ============================================================
# FIBONACCI SCHEDULING & MONOPOLE ROUTING
# ============================================================

def fibonacci_sequence(n: int) -> List[int]:
    fib = [1, 1]
    while len(fib) < n:
        fib.append(fib[-1] + fib[-2])
    return fib[:n]

def monopole_route(gate1: int, gate2: int) -> List[int]:
    diff = (gate2 - gate1) % 64
    if diff == 0:
        return [gate1]

    fib_steps = fibonacci_sequence(10)
    path = [gate1]
    current = gate1
    remaining = diff

    while remaining > 0:
        step = next((f for f in reversed(fib_steps) if f <= remaining), 1)
        current = (current + step) % 64
        if current == 0:
            current = 64
        path.append(current)
        remaining -= step

    return path

# ============================================================
# COHERENCE FILTER
# ============================================================

class CoherenceFilter:
    def __init__(self):
        self.entity_memory = {}
        self.emotion_trajectory = []

    def score_triple(self, alpha: str, candidate: str, omega: str,
                     alpha_coords: SymbolicCoordinate,
                     omega_coords: SymbolicCoordinate) -> float:
        scores = []

        # 1. Symbolic path coherence
        symbolic_score = self._symbolic_path_score(alpha_coords, omega_coords)
        scores.append(symbolic_score * 0.35)

        # 2. Lexical overlap
        ref_score = self._referential_score(alpha, candidate, omega)
        scores.append(ref_score * 0.25)

        # 3. Emotional progression
        emotion_score = self._emotional_progression_score(alpha, candidate, omega)
        scores.append(emotion_score * 0.20)

        # 4. Syntactic flow
        flow_score = self._syntactic_flow_score(alpha, candidate, omega)
        scores.append(flow_score * 0.20)

        return min(1.0, sum(scores))

    def _symbolic_path_score(self, alpha: SymbolicCoordinate, 
                            omega: SymbolicCoordinate) -> float:
        distance = alpha.distance_to(omega)
        if distance < 0.1:
            return 0.3
        elif distance > 0.9:
            return 0.2
        else:
            return 1.0 - abs(distance - 0.5) * 0.5

    def _referential_score(self, alpha: str, candidate: str, omega: str) -> float:
        alpha_words = set(alpha.lower().split())
        cand_words = set(candidate.lower().split())
        omega_words = set(omega.lower().split())

        alpha_overlap = len(alpha_words & cand_words) / max(len(alpha_words), 1)
        omega_overlap = len(cand_words & omega_words) / max(len(omega_words), 1)

        if candidate.lower() == alpha.lower() or candidate.lower() == omega.lower():
            return 0.1

        return (alpha_overlap + omega_overlap) / 2

    def _emotional_progression_score(self, alpha: str, candidate: str, omega: str) -> float:
        positive = ['joy', 'love', 'peace', 'hope', 'light', 'warm', 'soft', 'gentle']
        negative = ['fear', 'anger', 'dark', 'cold', 'hard', 'pain', 'loss', 'death']

        def classify(text: str) -> float:
            text_l = text.lower()
            pos = sum(1 for w in positive if w in text_l)
            neg = sum(1 for w in negative if w in text_l)
            total = pos + neg + 1
            return (pos - neg) / total

        a_val = classify(alpha)
        c_val = classify(candidate)
        o_val = classify(omega)

        if (a_val <= c_val <= o_val) or (a_val >= c_val >= o_val):
            return 0.9
        if abs(c_val - o_val) < abs(a_val - o_val):
            return 0.6
        return 0.3

    def _syntactic_flow_score(self, alpha: str, candidate: str, omega: str) -> float:
        lens = [len(alpha.split()), len(candidate.split()), len(omega.split())]
        avg_len = sum(lens) / 3
        variance = sum((l - avg_len)**2 for l in lens) / 3

        if variance < 10:
            return 0.9
        elif variance < 25:
            return 0.6
        return 0.3

# ============================================================
# NARRATIVE INTERPOLATOR
# ============================================================

class FinalNarrativeInterpolator:
    def __init__(self, coherence_filter: CoherenceFilter):
        self.filter = coherence_filter
        self.gate_meanings = GATE_MEANINGS
        self.line_qualities = LINE_QUALITIES

        self.gate_categories = {
            'creative': [1, 14, 25, 34, 43, 50, 57],
            'receptive': [2, 11, 15, 24, 33, 42, 52],
            'difficult': [3, 12, 21, 29, 39, 47, 56],
            'transformative': [18, 23, 28, 36, 40, 49, 55],
            'relational': [13, 31, 37, 44, 53, 58, 61],
            'climactic': [5, 10, 16, 30, 35, 51, 63]
        }

        # 72 templates total
        self.templates_by_category = {
            'creative': [
                "From the {line} spark, {gate} begins to shape what was only imagined.",
                "The {line} current of {gate} carries the first breath of form into being.",
                "Where {gate} stirs, {line} creation follows without asking permission.",
                "The {line} seed of {gate} opens in the dark, knowing the light before it arrives.",
                "{gate} does not announce itself — it arrives through {line} insistence, quiet and absolute.",
                "The {line} architecture of {gate} assembles itself from fragments of what was forgotten.",
                "What {gate} builds with {line} patience, no wind can unmake.",
                "Through {line} emergence, {gate} finds the shape that was waiting inside the unshaped.",
                "The {line} hand of {gate} draws the first line where there was only blank space.",
                "Where {gate} breathes, {line} invention becomes indistinguishable from memory.",
                "The {line} origin of {gate} holds the code that everything else will read.",
                "What {gate} conceives through {line} vision, the world will later call inevitable."
            ],
            'receptive': [
                "The {line} field of {gate} holds what comes, without grasping or refusing.",
                "Through {line} openness, {gate} receives the pattern whole and undivided.",
                "What {gate} asks: {line} presence, neither pushing nor pulling the moment.",
                "In the {line} stillness of {gate}, the next thing finds its way home.",
                "{gate} does not reach — it {line} welcomes what arrives at the threshold.",
                "The {line} vessel of {gate} fills without overflowing, empties without losing.",
                "Where {gate} listens with {line} attention, the silence begins to speak.",
                "Through {line} yielding, {gate} becomes the shape that everything else moves around.",
                "The {line} ground of {gate} receives the footfall before the step is decided.",
                "What {gate} accepts with {line} grace, resistance would only fracture.",
                "The {line} womb of {gate} holds what is not yet ready to be born.",
                "Through {line} surrender, {gate} discovers it was never at war."
            ],
            'difficult': [
                "The {line} weight of {gate} presses where the structure is weakest.",
                "Through {line} resistance, {gate} reveals what the pattern cannot yet carry.",
                "Where {gate} tightens, {line} patience becomes the only bridge.",
                "The {line} friction of {gate} burns away what was never truly held.",
                "{gate} does not soften — it {line} grinds until what is false falls away.",
                "The {line} pressure of {gate} finds the crack that was already there, waiting to be named.",
                "What {gate} breaks with {line} precision, it also prepares for the next becoming.",
                "Through {line} endurance, {gate} teaches what cannot be learned in ease.",
                "The {line} trial of {gate} offers no reward except the truth of what remains.",
                "Where {gate} confronts, {line} courage becomes the only currency.",
                "The {line} ordeal of {gate} strips away every costume until only the actor remains.",
                "What {gate} demands through {line} struggle, comfort could never provide."
            ],
            'transformative': [
                "The {line} alchemy of {gate} dissolves the old boundary without announcing itself.",
                "Through {line} passage, {gate} remakes the form while the name remains.",
                "What {gate} destroys with {line} precision, it also prepares for the next becoming.",
                "In the {line} crucible of {gate}, the story learns to let go of itself.",
                "{gate} does not change — it {line} reveals that change was always already happening.",
                "The {line} metamorphosis of {gate} leaves no trace of what was, only what is becoming.",
                "Where {gate} turns, {line} awareness follows the spiral rather than the straight line.",
                "Through {line} dissolution, {gate} makes room for what the old form could not contain.",
                "The {line} threshold of {gate} is crossed only by what is willing to die to itself.",
                "What {gate} transmutes through {line} fire, the eye mistakes for destruction.",
                "The {line} rebirth of {gate} wears the mask of ending until the mask falls away.",
                "Through {line} revolution, {gate} proves that the circle was always a spiral."
            ],
            'relational': [
                "The {line} thread of {gate} weaves between what was separate and what will be whole.",
                "Through {line} encounter, {gate} finds the other it was always speaking to.",
                "Where {gate} meets its reflection, {line} recognition becomes the next step.",
                "The {line} dance of {gate} holds both partners without choosing between them.",
                "{gate} does not join — it {line} discovers it was never apart.",
                "The {line} resonance of {gate} calls forth what answers from the other side.",
                "What {gate} mirrors with {line} clarity, the eye cannot look away from.",
                "Through {line} communion, {gate} becomes the bridge it was searching for.",
                "The {line} embrace of {gate} holds without clutching, releases without abandoning.",
                "Where {gate} touches, {line} connection becomes indistinguishable from self-knowledge.",
                "The {line} conversation of {gate} speaks in questions that need no answers.",
                "What {gate} bonds through {line} affinity, time cannot erode and distance cannot diminish."
            ],
            'climactic': [
                "The {line} peak of {gate} gathers every thread into a single breath.",
                "Through {line} intensity, {gate} becomes unavoidable, undeniable, complete.",
                "Where {gate} breaks open, {line} revelation floods what was carefully hidden.",
                "The {line} summit of {gate} shows the whole path in a single glance backward.",
                "{gate} does not rise — it {line} erupts, and everything before it becomes preparation.",
                "The {line} crescendo of {gate} holds the note that shatters the glass of waiting.",
                "What {gate} reveals with {line} finality, no later sentence can undo.",
                "Through {line} culmination, {gate} becomes the door that only opens from this side.",
                "The {line} apex of {gate} is the point where falling and flying become the same motion.",
                "Where {gate} explodes, {line} clarity rains down on what the fog concealed.",
                "The {line} zenith of {gate} burns so bright that shadows forget they ever existed.",
                "What {gate} delivers through {line} thunder, the quiet before it was only rehearsal."
            ]
        }

        self.universal_templates = [
            "The {line} signature of {gate} writes itself across this moment of transit.",
            "Between what was and what becomes, {gate} moves with {line} awareness.",
            "Through {line} engagement, the pattern of {gate} reveals its next face.",
            "The field breathes with {gate}, each instant a {line} articulation of the whole.",
            "What {gate} teaches: {line} response to the unfolding, neither rushing nor holding back.",
            "From {line} impulse to {gate} form — the bridge builds itself in the silence.",
            "The space shifts — {gate} emerging from {line} current, carrying the thread forward.",
            "Where {gate} meets {line} intention, the narrative finds its next breath.",
            "The {line} current of {gate} carries what cannot be carried by will alone.",
            "Through {line} passage, {gate} leaves its mark without leaving its name.",
            "What {gate} holds with {line} gentleness, force could only break.",
            "The {line} rhythm of {gate} measures time not by the clock but by the change."
        ]

    def _get_category(self, gate_num: int) -> str:
        for cat, gates in self.gate_categories.items():
            if gate_num in gates:
                return cat
        return 'universal'

    def interpolate(self, alpha: str, omega: str,
                   alpha_coords: SymbolicCoordinate,
                   omega_coords: SymbolicCoordinate,
                   num_sentences: int = 3,
                   num_candidates: int = 10,
                   use_beam_search: bool = True) -> List[TransitCandidate]:
        if use_beam_search:
            return self._beam_search_interpolate(alpha, omega, alpha_coords, omega_coords,
                                                num_sentences, num_candidates)
        else:
            return self._greedy_interpolate(alpha, omega, alpha_coords, omega_coords,
                                           num_sentences, num_candidates)

    def _generate_candidates(self, context: str, target: str,
                            context_coords: SymbolicCoordinate,
                            target_coords: SymbolicCoordinate,
                            n: int) -> List[TransitCandidate]:
        candidates = []

        mid_gate = ((context_coords.gate + target_coords.gate) // 2) % 64
        if mid_gate == 0:
            mid_gate = 64

        gate_name = self.gate_meanings.get(mid_gate, "the unknown")
        line_qual = self.line_qualities[random.randint(0, 5)]
        category = self._get_category(mid_gate)

        if category in self.templates_by_category:
            pool = self.templates_by_category[category] + self.universal_templates
        else:
            pool = self.universal_templates

        def extract_keywords(text: str) -> List[str]:
            words = re.findall(r'[a-zA-Z]{4,}', text.lower())
            stop_words = {'the', 'and', 'that', 'with', 'from', 'this', 'what', 'where', 'when',
                         'through', 'were', 'been', 'have', 'has', 'had', 'does', 'did', 'will',
                         'would', 'could', 'should', 'than', 'them', 'they', 'their', 'there',
                         'then', 'each', 'every', 'some', 'many', 'much', 'more', 'most', 'other',
                         'another', 'such', 'only', 'even', 'also', 'just', 'still', 'already',
                         'yet', 'once', 'twice', 'again', 'back', 'down', 'into', 'over', 'under',
                         'upon', 'after', 'before', 'above', 'below', 'between', 'among', 'within',
                         'without', 'against', 'toward', 'towards', 'across', 'around', 'about',
                         'along', 'beside', 'behind', 'beyond', 'during', 'except', 'inside',
                         'outside', 'until', 'since', 'while', 'because', 'although', 'though',
                         'unless', 'whether', 'either', 'neither', 'both', 'all', 'any', 'few',
                         'little', 'own', 'same', 'so', 'as', 'too', 'very', 'can', 'may', 'might',
                         'must', 'shall', 'will', 'should', 'could', 'would', 'stands', 'heart',
                         'full', 'force', 'finds', 'find', 'first', 'nothing', 'remains', 'completes',
                         'completing', 'itself', 'through', 'where', 'what', 'when', 'breaks', 'break',
                         'hidden', 'pattern', 'threshold', 'silence', 'stirs', 'awareness', 'becomes',
                         'become', 'becoming', 'begins', 'begin', 'follows', 'follow', 'carries', 'carry',
                         'reveals', 'reveal', 'teaches', 'teach', 'holds', 'hold', 'moves', 'move',
                         'builds', 'build', 'writes', 'write', 'breathes', 'breathe', 'meets', 'meet',
                         'finds', 'find', 'knows', 'know', 'opens', 'open', 'closes', 'close',
                         'gathers', 'gather', 'breaks', 'break', 'shatters', 'shatter', 'floods', 'flood',
                         'presses', 'press', 'grinds', 'grind', 'burns', 'burn', 'strips', 'strip',
                         'draws', 'draw', 'reads', 'read', 'speaks', 'speak', 'listens', 'listen',
                         'touches', 'touch', 'weaves', 'weave', 'dances', 'dance', 'mirrors', 'mirror',
                         'city', 'pursuit', 'hunter', 'dreamer', 'relentless', 'relentlessly'}
            return [w for w in words if w not in stop_words]

        context_keywords = extract_keywords(context)
        target_keywords = extract_keywords(target)

        for i in range(n):
            template = random.choice(pool)

            sentence = template.format(
                gate=gate_name.lower(),
                line=line_qual.lower()
            )

            weave_chance = 0.4

            if context_keywords and random.random() < weave_chance:
                word = random.choice(context_keywords[-3:])
                sentence = sentence.replace("the pattern", f"the {word}")
                sentence = sentence.replace("the form", f"the {word}")
                sentence = sentence.replace("the field", f"the {word}")

            if target_keywords and random.random() < weave_chance:
                word = random.choice(target_keywords[:3])
                sentence = sentence.replace("the whole", f"the {word}")
                sentence = sentence.replace("the next", f"the {word}")
                sentence = sentence.replace("what waits", f"the {word}")

            sentence = sentence[0].upper() + sentence[1:]
            if not sentence.endswith(('.', '!', '?')):
                sentence += '.'

            sentence = self._clean_sentence(sentence)

            t = (i + 1) / (n + 1)
            noise = random.uniform(-0.5, 0.5)

            interp_coords = SymbolicCoordinate(
                gate=int(context_coords.gate + (target_coords.gate - context_coords.gate) * t + noise) % 64 or 64,
                line=max(1, min(6, int(context_coords.line + (target_coords.line - context_coords.line) * t + noise))),
                tone=max(1, min(6, int(context_coords.tone + (target_coords.tone - context_coords.tone) * t + noise))),
                color=max(1, min(6, int(context_coords.color + (target_coords.color - context_coords.color) * t + noise))),
                base=max(1, min(5, int(context_coords.base + (target_coords.base - context_coords.base) * t + noise)))
            )

            candidates.append(TransitCandidate(
                text=sentence,
                symbolic_coords=[interp_coords]
            ))

        return candidates

    def _clean_sentence(self, sentence: str) -> str:
        sentence = re.sub(r'\\s+', ' ', sentence)
        sentence = re.sub(r'\\s+([.,;:!?])', r'', sentence)
        sentence = re.sub(r'([.,;:])([a-zA-Z])', r' ', sentence)
        sentence = re.sub(r'a\\s+([aeiouAEIOU])', r'an ', sentence)
        sentence = re.sub(r'an\\s+([^aeiouAEIOU\s])', r'a ', sentence)
        sentence = re.sub(r'(the|a|an)\\s+\\s+', r' ', sentence)
        return sentence.strip()

    def _greedy_interpolate(self, alpha: str, omega: str,
                          alpha_coords: SymbolicCoordinate,
                          omega_coords: SymbolicCoordinate,
                          num_sentences: int,
                          num_candidates: int) -> List[TransitCandidate]:
        story = []
        current_alpha = alpha
        current_alpha_coords = alpha_coords

        for i in range(num_sentences):
            candidates = self._generate_candidates(
                current_alpha, omega,
                current_alpha_coords, omega_coords,
                num_candidates
            )

            for cand in candidates:
                cand.coherence_score = self.filter.score_triple(
                    current_alpha, cand.text, omega,
                    current_alpha_coords, omega_coords
                )
                cand.local_score = self._local_coherence(current_alpha, cand.text)
                cand.global_score = self._global_arc_score(
                    alpha, cand.text, omega, i, num_sentences
                )

            best = max(candidates, key=lambda c: c.total_score())
            story.append(best)

            current_alpha = best.text
            current_alpha_coords = best.symbolic_coords[0]

        return story

    def _beam_search_interpolate(self, alpha: str, omega: str,
                                alpha_coords: SymbolicCoordinate,
                                omega_coords: SymbolicCoordinate,
                                num_sentences: int,
                                num_candidates: int,
                                beam_width: int = 3) -> List[TransitCandidate]:
        beams = [[] for _ in range(beam_width)]
        beam_scores = [0.0] * beam_width

        for step in range(num_sentences):
            all_candidates = []

            for beam_idx, beam in enumerate(beams):
                if step == 0:
                    current_alpha = alpha
                    current_coords = alpha_coords
                else:
                    current_alpha = beam[-1].text
                    current_coords = beam[-1].symbolic_coords[0]

                candidates = self._generate_candidates(
                    current_alpha, omega,
                    current_coords, omega_coords,
                    num_candidates
                )

                for cand in candidates:
                    cand.coherence_score = self.filter.score_triple(
                        current_alpha, cand.text, omega,
                        current_coords, omega_coords
                    )
                    cand.local_score = self._local_coherence(current_alpha, cand.text)
                    cand.global_score = self._global_arc_score(
                        alpha, cand.text, omega, step, num_sentences
                    )

                    total = cand.total_score() + beam_scores[beam_idx] * 0.3
                    all_candidates.append((total, beam_idx, cand))

            all_candidates.sort(key=lambda x: x[0], reverse=True)

            new_beams = []
            new_scores = []
            for i in range(min(beam_width, len(all_candidates))):
                score, parent_idx, cand = all_candidates[i]
                new_beam = beams[parent_idx] + [cand]
                new_beams.append(new_beam)
                new_scores.append(score)

            beams = new_beams
            beam_scores = new_scores

        best_beam_idx = beam_scores.index(max(beam_scores))
        return beams[best_beam_idx]

    def _local_coherence(self, prev: str, curr: str) -> float:
        prev_words = set(prev.lower().split())
        curr_words = set(curr.lower().split())
        overlap = len(prev_words & curr_words)
        return min(1.0, overlap / max(len(prev_words), len(curr_words), 1) * 2)

    def _global_arc_score(self, alpha: str, candidate: str, omega: str,
                         position: int, total: int) -> float:
        if total <= 1:
            return 1.0

        expected_progress = position / (total - 1)

        cand_words = set(candidate.lower().split())
        omega_words = set(omega.lower().split())
        omega_overlap = len(cand_words & omega_words) / max(len(omega_words), 1)

        if expected_progress < 0.3:
            return 1.0 - omega_overlap
        elif expected_progress > 0.7:
            return omega_overlap
        else:
            return 0.5 + omega_overlap * 0.5

# ============================================================
# STORY ENGINE
# ============================================================

class FinalMRNNStoryEngine:
    def __init__(self):
        self.coherence_filter = CoherenceFilter()
        self.interpolator = FinalNarrativeInterpolator(self.coherence_filter)

    def generate_story(self, situation: str, characters: Dict[str, str],
                      setting: str, num_interpolations_bc: int = 3,
                      num_interpolations_co: int = 3) -> Dict:
        avm = AttributeValueMatrix(
            characters=characters,
            setting=setting,
            action=f"The situation of {situation} unfolds",
            emotion="tension",
            causal_link="cause and effect",
            outcome="resolution"
        )

        bco = self._generate_bco(avm, situation)

        b_coords = self._situation_to_coords(situation, phase="beginning")
        c_coords = self._situation_to_coords(situation, phase="climax")
        o_coords = self._situation_to_coords(situation, phase="outcome")

        bc_bridge = self.interpolator.interpolate(
            bco.beginning, bco.climax,
            b_coords, c_coords,
            num_sentences=num_interpolations_bc,
            num_candidates=10,
            use_beam_search=True
        )

        co_bridge = self.interpolator.interpolate(
            bco.climax, bco.outcome,
            c_coords, o_coords,
            num_sentences=num_interpolations_co,
            num_candidates=10,
            use_beam_search=True
        )

        full_story = [bco.beginning]
        full_story.extend([c.text for c in bc_bridge])
        full_story.append(bco.climax)
        full_story.extend([c.text for c in co_bridge])
        full_story.append(bco.outcome)

        b_to_c_path = monopole_route(b_coords.gate, c_coords.gate)
        c_to_o_path = monopole_route(c_coords.gate, o_coords.gate)

        return {
            'avm': avm.to_dict(),
            'bco': {
                'beginning': bco.beginning,
                'climax': bco.climax,
                'outcome': bco.outcome
            },
            'symbolic_coordinates': {
                'beginning': b_coords.__dict__,
                'climax': c_coords.__dict__,
                'outcome': o_coords.__dict__
            },
            'monopole_routing': {
                'beginning_to_climax': b_to_c_path,
                'climax_to_outcome': c_to_o_path
            },
            'interpolations': {
                'beginning_to_climax': [
                    {'text': c.text, 'score': c.total_score(), 'coords': c.symbolic_coords[0].__dict__}
                    for c in bc_bridge
                ],
                'climax_to_outcome': [
                    {'text': c.text, 'score': c.total_score(), 'coords': c.symbolic_coords[0].__dict__}
                    for c in co_bridge
                ]
            },
            'full_story': full_story,
            'full_text': ' '.join(full_story)
        }

    def _generate_bco(self, avm: AttributeValueMatrix, situation: str) -> BCOOutline:
        chars = avm.characters
        setting = avm.setting

        char_names = list(chars.values())
        main_char = char_names[0] if char_names else "the protagonist"

        beginning = f"{main_char.capitalize()} stands at the threshold of {setting}, where {situation.lower()} first stirs in the silence."
        climax = f"In the heart of {setting}, the full force of {situation.lower()} breaks through, and nothing remains as it was."
        outcome = f"Through {situation.lower()}, {main_char} finds what was hidden, and the pattern completes itself."

        return BCOOutline(
            beginning=beginning,
            climax=climax,
            outcome=outcome,
            avm=avm
        )

    def _situation_to_coords(self, situation: str, phase: str) -> SymbolicCoordinate:
        hash_val = hash(f"{situation}:{phase}") % 10000

        return SymbolicCoordinate(
            gate=(hash_val % 64) + 1,
            line=(hash_val % 6) + 1,
            tone=(hash_val % 6) + 1,
            color=(hash_val % 6) + 1,
            base=(hash_val % 5) + 1
        )
