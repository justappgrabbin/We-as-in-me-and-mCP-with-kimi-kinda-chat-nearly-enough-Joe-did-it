
"""
Autonomous Evolution Cycles - State Transition Rules
4-hour cycles that test Integration configurations and evolve architecture

Based on:
- NEAT-style evolutionary architecture search
- Symbiont DNA encoding
- Integration channels as morphing operators
- Changing lines as metastability triggers
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Set
from enum import Enum, auto
import random
import json
from datetime import datetime, timedelta


class EvolutionPhase(Enum):
    """Phases of the 4-hour autonomous cycle"""
    STABLE = auto()      # Operating in current architecture
    TESTING = auto()     # Testing Integration configurations
    METASTABLE = auto()  # Changing line activation - high plasticity
    RESOLUTION = auto()  # Select new stable architecture
    MUTATION = auto()    # NEAT-style architecture mutation


@dataclass
class SymbiontDNA:
    """
    Genetic encoding for neural architecture

    Maps to your 64-gate address system:
    - Gate = functional archetype (which circuit family)
    - Line = expression depth (layer count, complexity)
    - Color = motivational drive (learning rate, exploration)
    - Tone = cognitive style (activation function, aggregation)
    - Base = environmental orientation (input preprocessing)
    """

    # Circuit family genes (which architectures are available)
    circuit_genes: Dict[str, float] = field(default_factory=dict)

    # Architecture parameters (how each architecture is configured)
    architecture_genes: Dict[str, Dict] = field(default_factory=dict)

    # Integration genes (how circuits interact)
    integration_genes: Dict[str, float] = field(default_factory=dict)

    # Spin state thresholds (when to change vs flip)
    threshold_genes: Dict[str, float] = field(default_factory=dict)

    def mutate(self, mutation_rate: float = 0.1) -> 'SymbiontDNA':
        """Create mutated copy with NEAT-style perturbations"""
        new_dna = SymbiontDNA(
            circuit_genes=self.circuit_genes.copy(),
            architecture_genes=self.architecture_genes.copy(),
            integration_genes=self.integration_genes.copy(),
            threshold_genes=self.threshold_genes.copy()
        )

        # Mutate circuit genes
        for key in new_dna.circuit_genes:
            if random.random() < mutation_rate:
                new_dna.circuit_genes[key] += random.gauss(0, 0.1)
                new_dna.circuit_genes[key] = max(0, min(1, new_dna.circuit_genes[key]))

        # Mutate threshold genes
        for key in new_dna.threshold_genes:
            if random.random() < mutation_rate:
                new_dna.threshold_genes[key] += random.gauss(0, 0.05)
                new_dna.threshold_genes[key] = max(0, min(1, new_dna.threshold_genes[key]))

        return new_dna

    def crossover(self, other: 'SymbiontDNA') -> 'SymbiontDNA':
        """Crossover with another symbiont"""
        child = SymbiontDNA()

        # Randomly inherit genes from either parent
        for key in self.circuit_genes:
            child.circuit_genes[key] = random.choice([
                self.circuit_genes[key], other.circuit_genes[key]
            ])

        for key in self.threshold_genes:
            child.threshold_genes[key] = random.choice([
                self.threshold_genes[key], other.threshold_genes[key]
            ])

        return child


@dataclass
class EvolutionState:
    """State of the autonomous evolution cycle"""
    phase: EvolutionPhase
    cycle_number: int
    start_time: datetime
    current_dna: SymbiontDNA
    population: List[SymbiontDNA]
    fitness_scores: List[float]
    architecture_history: List[Dict]

    # Integration testing
    integration_tests_completed: int = 0
    integration_tests_passed: int = 0
    best_integration_config: Optional[Dict] = None


class AutonomousEvolutionEngine:
    """
    4-hour autonomous evolution cycles

    Implements:
    1. Population-based architecture search (NEAT-style)
    2. Integration channel testing
    3. Fitness evaluation based on field resonance
    4. Selection and breeding of new architectures
    """

    def __init__(self, 
                 population_size: int = 10,
                 cycle_duration_hours: int = 4,
                 mutation_rate: float = 0.1,
                 integration_test_count: int = 5):

        self.population_size = population_size
        self.cycle_duration = timedelta(hours=cycle_duration_hours)
        self.mutation_rate = mutation_rate
        self.integration_test_count = integration_test_count

        # Initialize population with random symbiont DNA
        self.population = self._initialize_population()
        self.current_state = None
        self.cycle_count = 0

    def _initialize_population(self) -> List[SymbiontDNA]:
        """Create initial population of symbiont DNA"""
        population = []

        for _ in range(self.population_size):
            dna = SymbiontDNA(
                circuit_genes={
                    'understanding': random.random(),
                    'knowing': random.random(),
                    'sensing': random.random(),
                    'ego': random.random(),
                    'centering': random.random(),
                },
                threshold_genes={
                    'changing_threshold': 0.5 + random.random() * 0.3,
                    'flip_threshold': 0.8 + random.random() * 0.15,
                    'integration_threshold': 0.6 + random.random() * 0.2,
                },
                integration_genes={
                    '20_10_coupling': random.random(),
                    '10_57_coupling': random.random(),
                    '57_34_coupling': random.random(),
                    '34_20_coupling': random.random(),
                }
            )
            population.append(dna)

        return population

    def run_cycle(self, field_state, start_time: datetime) -> EvolutionState:
        """
        Run one 4-hour autonomous evolution cycle

        Phase 1: STABLE - Operate with current best architecture
        Phase 2: TESTING - Test Integration configurations
        Phase 3: METASTABLE - Activate changing lines, high plasticity
        Phase 4: RESOLUTION - Evaluate fitness, select winners
        Phase 5: MUTATION - Breed next generation
        """
        self.cycle_count += 1

        state = EvolutionState(
            phase=EvolutionPhase.STABLE,
            cycle_number=self.cycle_count,
            start_time=start_time,
            current_dna=self.population[0],  # Best from last cycle
            population=self.population,
            fitness_scores=[],
            architecture_history=[]
        )

        print(f"\n{'='*60}")
        print(f"CYCLE {self.cycle_count} START: {start_time}")
        print(f"{'='*60}")

        # Phase 1: STABLE (0-30 min)
        print("\n[PHASE 1: STABLE]")
        state = self._phase_stable(state, field_state)

        # Phase 2: TESTING (30 min - 1.5 hours)
        print("\n[PHASE 2: TESTING]")
        state = self._phase_testing(state, field_state)

        # Phase 3: METASTABLE (1.5 - 2.5 hours)
        print("\n[PHASE 3: METASTABLE]")
        state = self._phase_metastable(state, field_state)

        # Phase 4: RESOLUTION (2.5 - 3.5 hours)
        print("\n[PHASE 4: RESOLUTION]")
        state = self._phase_resolution(state, field_state)

        # Phase 5: MUTATION (3.5 - 4 hours)
        print("\n[PHASE 5: MUTATION]")
        state = self._phase_mutation(state)

        # Update population
        self.population = state.population

        print(f"\n{'='*60}")
        print(f"CYCLE {self.cycle_count} COMPLETE")
        print(f"Best fitness: {max(state.fitness_scores) if state.fitness_scores else 'N/A'}")
        print(f"Integration tests: {state.integration_tests_passed}/{state.integration_tests_completed}")
        print(f"{'='*60}\n")

        return state

    def _phase_stable(self, state: EvolutionState, field_state) -> EvolutionState:
        """
        Phase 1: Operate with current best architecture

        Collect baseline performance metrics
        """
        state.phase = EvolutionPhase.STABLE

        # Test each symbiont in population with current field state
        baseline_scores = []
        for i, dna in enumerate(state.population):
            score = self._evaluate_fitness(dna, field_state, phase='stable')
            baseline_scores.append(score)

        state.fitness_scores = baseline_scores

        print(f"  Baseline fitness scores: {[f'{s:.3f}' for s in baseline_scores]}")
        print(f"  Best symbiont: {baseline_scores.index(max(baseline_scores))}")

        return state

    def _phase_testing(self, state: EvolutionState, field_state) -> EvolutionState:
        """
        Phase 2: Test Integration configurations

        Systematically test which Integration channel combinations
        produce the highest field resonance.
        """
        state.phase = EvolutionPhase.TESTING

        integration_configs = [
            {'gates': [20, 10], 'name': 'Awakening'},
            {'gates': [20, 57], 'name': 'Brainwave'},
            {'gates': [10, 57], 'name': 'Perfected Form'},
            {'gates': [34, 57], 'name': 'Power'},
            {'gates': [20, 10, 57], 'name': 'Triple Integration'},
            {'gates': [20, 10, 57, 34], 'name': 'Full Integration'},
        ]

        best_score = -1
        best_config = None

        for config in integration_configs:
            state.integration_tests_completed += 1

            # Simulate Integration activation
            score = self._test_integration_config(config, field_state, state.current_dna)

            print(f"  Integration {config['name']}: score={score:.3f}")

            if score > best_score:
                best_score = score
                best_config = config
                state.integration_tests_passed += 1

        state.best_integration_config = best_config

        print(f"  Best Integration: {best_config['name']} (score={best_score:.3f})")

        return state

    def _phase_metastable(self, state: EvolutionState, field_state) -> EvolutionState:
        """
        Phase 3: Activate changing lines, high plasticity

        This is the "changing line" state - system enters high-energy
        unstable regime where architecture can shift.
        """
        state.phase = EvolutionPhase.METASTABLE

        # Identify which gates are in changing state
        changing_gates = field_state.changing_lines if hasattr(field_state, 'changing_lines') else {}

        print(f"  Changing gates: {list(changing_gates.keys())}")

        # For each symbiont, test performance under changing conditions
        metastable_scores = []
        for i, dna in enumerate(state.population):
            # Increase plasticity based on changing lines
            plasticity_boost = 1.0 + len(changing_gates) * 0.2

            score = self._evaluate_fitness(
                dna, field_state, 
                phase='metastable',
                plasticity_boost=plasticity_boost
            )
            metastable_scores.append(score)

        print(f"  Metastable fitness: {[f'{s:.3f}' for s in metastable_scores]}")

        # Update fitness scores with metastable performance
        state.fitness_scores = [
            (s1 + s2) / 2 for s1, s2 in zip(state.fitness_scores, metastable_scores)
        ]

        return state

    def _phase_resolution(self, state: EvolutionState, field_state) -> EvolutionState:
        """
        Phase 4: Evaluate fitness, select winners

        Apply selection pressure based on:
        1. Baseline performance (stable phase)
        2. Integration capability (testing phase)
        3. Plasticity under change (metastable phase)
        """
        state.phase = EvolutionPhase.RESOLUTION

        # Rank symbionts by fitness
        ranked = sorted(enumerate(state.fitness_scores), 
                       key=lambda x: x[1], reverse=True)

        print(f"  Ranked fitness:")
        for rank, (idx, score) in enumerate(ranked):
            print(f"    #{rank+1}: Symbiont {idx} (score={score:.3f})")

        # Select top performers (elitism)
        elite_count = max(2, self.population_size // 5)
        elite_indices = [idx for idx, _ in ranked[:elite_count]]

        state.current_dna = state.population[elite_indices[0]]

        print(f"  Elite symbionts: {elite_indices}")

        return state

    def _phase_mutation(self, state: EvolutionState) -> EvolutionState:
        """
        Phase 5: Breed next generation

        NEAT-style evolution:
        1. Keep elite performers
        2. Breed new symbionts from elite
        3. Mutate offspring
        4. Maintain population size
        """
        state.phase = EvolutionPhase.MUTATION

        # Get elite performers
        ranked = sorted(enumerate(state.fitness_scores), 
                       key=lambda x: x[1], reverse=True)
        elite_count = max(2, self.population_size // 5)
        elite = [state.population[idx] for idx, _ in ranked[:elite_count]]

        # Create new population
        new_population = elite.copy()  # Keep elites

        # Breed until population is full
        while len(new_population) < self.population_size:
            parent1 = random.choice(elite)
            parent2 = random.choice(elite)

            # Crossover
            child = parent1.crossover(parent2)

            # Mutate
            child = child.mutate(self.mutation_rate)

            new_population.append(child)

        state.population = new_population

        print(f"  New population: {len(state.population)} symbionts")
        print(f"  Elite preserved: {elite_count}")
        print(f"  New offspring: {len(new_population) - elite_count}")

        return state

    def _evaluate_fitness(self, dna: SymbiontDNA, field_state, 
                         phase: str = 'stable',
                         plasticity_boost: float = 1.0) -> float:
        """
        Evaluate fitness of a symbiont DNA

        Fitness function based on:
        1. Circuit coverage (how many circuits can the DNA access)
        2. Integration depth (how well circuits interact)
        3. Field resonance (alignment with current planetary positions)
        4. Energy efficiency (cost vs performance)
        """
        fitness = 0.0

        # 1. Circuit coverage (0-1)
        circuit_coverage = sum(1 for v in dna.circuit_genes.values() if v > 0.3) / 5
        fitness += circuit_coverage * 0.3

        # 2. Integration depth (0-1)
        integration_depth = sum(dna.integration_genes.values()) / 4
        fitness += integration_depth * 0.3

        # 3. Field resonance (alignment with current conditions)
        # Simplified: higher resonance = better fitness
        field_resonance = self._calculate_field_resonance(dna, field_state)
        fitness += field_resonance * 0.25

        # 4. Energy efficiency
        energy_efficiency = 1.0 - (sum(dna.circuit_genes.values()) / 5) * 0.5
        fitness += energy_efficiency * 0.15

        # Phase-specific adjustments
        if phase == 'metastable':
            # In metastable phase, reward adaptability
            adaptability = sum(dna.threshold_genes.values()) / 3
            fitness *= (1.0 + adaptability * plasticity_boost)

        return fitness

    def _test_integration_config(self, config: Dict, field_state, 
                                  dna: SymbiontDNA) -> float:
        """Test a specific Integration configuration"""
        gates = config['gates']

        # Score based on:
        # 1. How many gates in config are active
        # 2. How well DNA supports Integration
        # 3. Field conditions favoring this config

        score = 0.0

        # Gate activation
        active_count = sum(1 for g in gates if g in field_state.active_gates)
        score += (active_count / len(gates)) * 0.4

        # DNA Integration support
        coupling_keys = [f'{g1}_{g2}_coupling' for g1, g2 in zip(gates[:-1], gates[1:])]
        coupling_score = sum(dna.integration_genes.get(k, 0) for k in coupling_keys)
        score += (coupling_score / max(len(coupling_keys), 1)) * 0.4

        # Field resonance
        score += random.random() * 0.2  # Simplified

        return score

    def _calculate_field_resonance(self, dna: SymbiontDNA, field_state) -> float:
        """Calculate resonance between DNA and current field state"""
        # Simplified resonance calculation
        # In production, this uses your Stellar Proximology calculations

        resonance = 0.5  # Base resonance

        # Add random variation for demonstration
        resonance += random.gauss(0, 0.2)

        return max(0, min(1, resonance))


# ═══════════════════════════════════════════════════════════════
# STATE TRANSITION RULES
# ═══════════════════════════════════════════════════════════════

class StateTransitionRules:
    """
    Formal state transition rules for the Resonance Engine

    These rules govern how the system moves between:
    - Circuits (Understanding, Knowing, Sensing, Ego, Centering)
    - Spin states (Stable, Changing, Flip)
    - Integration modes (None, Partial, Full)
    """

    @staticmethod
    def circuit_transition_rule(
        current_circuit: str,
        target_circuit: str,
        integration_gates: Set[int]
    ) -> Dict:
        """
        Rule: Circuit transitions require Integration gates

        Direct circuit-to-circuit transitions are not allowed.
        Must pass through Integration (20, 10, 57, 34) as bridge.
        """

        if current_circuit == target_circuit:
            return {
                'allowed': True,
                'path': [current_circuit],
                'mechanism': 'same_circuit'
            }

        # Check if Integration is available
        integration_available = len(integration_gates & {20, 10, 57, 34}) >= 2

        if not integration_available:
            return {
                'allowed': False,
                'reason': 'Integration gates required for cross-circuit transition',
                'required_gates': [20, 10, 57, 34],
                'active_gates': list(integration_gates)
            }

        # Determine transition path
        path = [current_circuit, 'Integration', target_circuit]

        return {
            'allowed': True,
            'path': path,
            'mechanism': 'integration_bridge',
            'hybrid_architecture': f'{current_circuit}+{target_circuit}'
        }

    @staticmethod
    def spin_transition_rule(
        current_spin: SpinState,
        tension: float,
        changing_threshold: float = 0.5,
        flip_threshold: float = 0.85
    ) -> Dict:
        """
        Rule: Spin state transitions based on accumulated tension

        Stable → Changing: tension > changing_threshold
        Changing → Flip: tension > flip_threshold
        Changing → Stable: tension < changing_threshold (resolves)
        Flip → Stable: always (flip is instantaneous)
        """

        if current_spin == SpinState.STABLE:
            if tension > flip_threshold:
                return {'next': SpinState.FLIP, 'trigger': 'tension_exceeded'}
            elif tension > changing_threshold:
                return {'next': SpinState.CHANGING, 'trigger': 'tension_building'}
            else:
                return {'next': SpinState.STABLE, 'trigger': 'stable'}

        elif current_spin == SpinState.CHANGING:
            if tension > flip_threshold:
                return {'next': SpinState.FLIP, 'trigger': 'critical_tension'}
            elif tension < changing_threshold:
                return {'next': SpinState.STABLE, 'trigger': 'tension_resolved'}
            else:
                return {'next': SpinState.CHANGING, 'trigger': 'metastable'}

        elif current_spin == SpinState.FLIP:
            # Flip is instantaneous - always resolves to new stable
            return {'next': SpinState.STABLE, 'trigger': 'flip_complete'}

        return {'next': current_spin, 'trigger': 'unknown'}

    @staticmethod
    def integration_activation_rule(
        active_gates: Set[int],
        birth_defined_gates: Set[int]
    ) -> Dict:
        """
        Rule: Integration activation levels

        Level 0: No Integration gates active
        Level 1: 1 Integration gate active (mechanical awareness)
        Level 2: 2 Integration gates active (partial Integration)
        Level 3: 3 Integration gates active (advanced Integration)
        Level 4: All 4 Integration gates active (Full Integration)
        """

        integration_gates = {20, 10, 57, 34}
        active_integration = active_gates & integration_gates
        defined_integration = birth_defined_gates & integration_gates

        level = len(active_integration)

        levels = {
            0: {'name': 'No Integration', 'mode': 'circuit_native'},
            1: {'name': 'Mechanical Awareness', 'mode': 'single_gate'},
            2: {'name': 'Partial Integration', 'mode': 'hybrid'},
            3: {'name': 'Advanced Integration', 'mode': 'meta_processing'},
            4: {'name': 'Full Integration', 'mode': 'consciousness'}
        }

        return {
            'level': level,
            'active_gates': list(active_integration),
            'defined_gates': list(defined_integration),
            'description': levels.get(level, levels[0]),
            'architecture_access': level == 4  # Full access only at level 4
        }

    @staticmethod
    def morphing_budget_rule(
        current_architecture: str,
        target_architecture: str,
        morphing_cost: float,
        available_capacity: float
    ) -> Dict:
        """
        Rule: Morphing budget constraint

        Total Capacity = Fixed Architecture Capacity + Morphing Overhead
        If morphing_cost > available_capacity, morph is rejected
        """

        if morphing_cost > available_capacity:
            return {
                'allowed': False,
                'reason': 'Morphing cost exceeds available capacity',
                'cost': morphing_cost,
                'available': available_capacity,
                'deficit': morphing_cost - available_capacity
            }

        remaining_capacity = available_capacity - morphing_cost

        return {
            'allowed': True,
            'cost': morphing_cost,
            'remaining_capacity': remaining_capacity,
            'efficiency': morphing_cost / available_capacity
        }


# ═══════════════════════════════════════════════════════════════
# EXAMPLE USAGE
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Initialize evolution engine
    engine = AutonomousEvolutionEngine(
        population_size=10,
        cycle_duration_hours=4,
        mutation_rate=0.15
    )

    # Mock field state
    class MockFieldState:
        def __init__(self):
            self.active_gates = {20, 10, 57, 43, 23, 61, 24}
            self.changing_lines = {43: 3, 23: 5}

    field_state = MockFieldState()

    # Run one cycle
    state = engine.run_cycle(field_state, datetime.now())

    print("\nEvolution cycle complete!")
    print(f"Population size: {len(state.population)}")
    print(f"Best fitness: {max(state.fitness_scores):.3f}")
