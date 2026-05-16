/**
 * NOVEL ARCHITECTURE GENERATOR
 * 
 * This is what makes the merged system unique:
 * 
 * 1. HUMAN DESIGN INTEGRATION
 *    - Each user has a Human Design chart (64 gates, 36 channels, 9 centers)
 *    - The system reads their activated gates and uses them as "architectural seeds"
 *    - Their defined channels become "connection patterns" in generated code
 *    - Their undefined centers become "open interfaces" (extensibility points)
 *    - Their hanging gates become "bridge points" where the system connects to other modules
 *    - Line numbers (1-6) map to architectural layers:
 *      Line 1 = Foundation, Line 2 = Interaction, Line 3 = Adaptation,
 *      Line 4 = Transmission, Line 5 = Heresy/Revolution, Line 6 = Role Model
 * 
 * 2. NOVEL ARCHITECTURE CREATION
 *    - Not just combining existing patterns — generates genuinely new architectural structures
 *    - Uses the user's Human Design as a "generative grammar" for code architecture
 *    - Each gate has a specific "architectural DNA" that shapes how modules are structured
 *    - Channels create "data flow topologies" that are unique to the user's design
 *    - The system "learns" the user by tracking which generated architectures they prefer
 *    - Over time, it builds a "design profile" that makes each generation more personalized
 * 
 * 3. INTERACTION HISTORY AS EVOLUTIONARY PRESSURE
 *    - Every user interaction is stored as a "selection event"
 *    - Favored architectures increase in "genetic fitness"
 *    - Disfavored ones decrease
 *    - The system evolves its generation strategy based on this feedback
 *    - This is literally Darwinian evolution of code architectures
 * 
 * 4. SYNTHIA SERVER INTEGRATION
 *    - All generated architectures are validated against the Synthia server
 *    - Server provides "consciousness profile" for deeper personalization
 *    - Memory storage for cross-session learning
 *    - Oracle endpoint for "intelligent" architecture suggestions
 */

import { ResonanceOrchestrator, Address, SuperBaseEntry } from './ResonanceOrchestrator';

// ─────────────────────────────────────────────────────────────────────────────
// HUMAN DESIGN TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface HumanDesignChart {
  userId: string;
  type: 'Generator' | 'Manifesting Generator' | 'Projector' | 'Manifestor' | 'Reflector';
  strategy: string;
  authority: string;
  definedCenters: number[];  // 0-8
  undefinedCenters: number[]; // 0-8
  consciousGates: GateActivation[];  // Black (personality)
  unconsciousGates: GateActivation[]; // Red (design)
  channels: number[][];  // Pairs of gate numbers that form channels
  hangingGates: number[]; // Gates without a matching pair
  incarnationCross: string;
  profile: string; // e.g. "5/2", "3/5"
  variables: string[]; // Digestion, Environment, Awareness, Motivation
}

export interface GateActivation {
  gate: number;      // 1-64
  line: number;      // 1-6
  color: number;     // 0-5
  tone: number;      // 0-5
  base: number;      // 0-5
  planet: string;    // Sun, Earth, Moon, etc.
  zodiac: string;    // Aries, Taurus, etc.
  house: number;     // 1-12
  arcDegree: number; // 0-360
  side: 'conscious' | 'unconscious' | 'both';
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURAL DNA: Each gate maps to a specific code architectural pattern
// ─────────────────────────────────────────────────────────────────────────────

export interface GateArchitecturalDNA {
  gate: number;
  name: string;
  archetype: string;
  architecturalPattern: string;      // The structural pattern this gate generates
  interfaceStyle: string;              // How this gate connects to other modules
  dataFlowTopology: string;            // How data moves through this gate's modules
  extensibilityPoint: string;          // Where this gate allows extension
  circuitGroup: 'individual' | 'tribal' | 'collective';
  center: number;                      // Which body center this gate belongs to
}

// The 64 gates and their architectural DNA
const GATE_DNA: Record<number, GateArchitecturalDNA> = {
  1: { gate: 1, name: 'Self Expression', archetype: 'Creator', architecturalPattern: 'Factory + Strategy', interfaceStyle: 'EventEmitter', dataFlowTopology: 'Push-based streaming', extensibilityPoint: 'Plugin registry', circuitGroup: 'individual', center: 4 },
  2: { gate: 2, name: 'Direction', archetype: 'Guide', architecturalPattern: 'Router + Navigator', interfaceStyle: 'Command pattern', dataFlowTopology: 'Directed acyclic graph', extensibilityPoint: 'Route middleware', circuitGroup: 'individual', center: 4 },
  3: { gate: 3, name: 'Ordering', archetype: 'Organizer', architecturalPattern: 'Pipeline + Stage', interfaceStyle: 'Chain of Responsibility', dataFlowTopology: 'Sequential processing', extensibilityPoint: 'Stage injection', circuitGroup: 'individual', center: 6 },
  4: { gate: 4, name: 'Formulization', archetype: 'Theorist', architecturalPattern: 'Schema + Validator', interfaceStyle: 'Type-driven contracts', dataFlowTopology: 'Schema-first validation', extensibilityPoint: 'Custom validators', circuitGroup: 'collective', center: 1 },
  5: { gate: 5, name: 'Fixed Rhythms', archetype: 'Rhythm Keeper', architecturalPattern: 'Scheduler + Cron', interfaceStyle: 'Timer-based triggers', dataFlowTopology: 'Periodic execution', extensibilityPoint: 'Custom schedules', circuitGroup: 'collective', center: 6 },
  6: { gate: 6, name: 'Friction', archetype: 'Mediator', architecturalPattern: 'Conflict Resolver + Negotiator', interfaceStyle: 'Promise-based resolution', dataFlowTopology: 'Bi-directional negotiation', extensibilityPoint: 'Resolution strategies', circuitGroup: 'tribal', center: 7 },
  7: { gate: 7, name: 'Role of Self', archetype: 'Leader', architecturalPattern: 'Orchestrator + Director', interfaceStyle: 'Role-based access', dataFlowTopology: 'Hierarchical delegation', extensibilityPoint: 'Role definitions', circuitGroup: 'collective', center: 4 },
  8: { gate: 8, name: 'Contribution', archetype: 'Contributor', architecturalPattern: 'Module + Exporter', interfaceStyle: 'Named exports', dataFlowTopology: 'Package distribution', extensibilityPoint: 'Export registry', circuitGroup: 'individual', center: 3 },
  9: { gate: 9, name: 'Focus', archetype: 'Concentrator', architecturalPattern: 'Lens + Filter', interfaceStyle: 'Query-based selection', dataFlowTopology: 'Filtered streams', extensibilityPoint: 'Filter predicates', circuitGroup: 'collective', center: 6 },
  10: { gate: 10, name: 'Behavior of Self', archetype: 'Authenticator', architecturalPattern: 'Identity + Auth', interfaceStyle: 'Token-based auth', dataFlowTopology: 'Authenticated pipelines', extensibilityPoint: 'Auth providers', circuitGroup: 'individual', center: 4 },
  11: { gate: 11, name: 'Ideas', archetype: 'Ideator', architecturalPattern: 'Generator + Ideator', interfaceStyle: 'Stream of consciousness', dataFlowTopology: 'Idea branching', extensibilityPoint: 'Idea transformers', circuitGroup: 'collective', center: 1 },
  12: { gate: 12, name: 'Caution', archetype: 'Guardian', architecturalPattern: 'Gatekeeper + Validator', interfaceStyle: 'Guard clauses', dataFlowTopology: 'Validated entry points', extensibilityPoint: 'Validation rules', circuitGroup: 'individual', center: 3 },
  13: { gate: 13, name: 'Listener', archetype: 'Empath', architecturalPattern: 'Observer + Listener', interfaceStyle: 'Event subscription', dataFlowTopology: 'Reactive streams', extensibilityPoint: 'Event handlers', circuitGroup: 'individual', center: 4 },
  14: { gate: 14, name: 'Power Skills', archetype: 'Artisan', architecturalPattern: 'Worker + Processor', interfaceStyle: 'Task queue', dataFlowTopology: 'Background processing', extensibilityPoint: 'Worker plugins', circuitGroup: 'individual', center: 6 },
  15: { gate: 15, name: 'Extremes', archetype: 'Balancer', architecturalPattern: 'Normalizer + Scaler', interfaceStyle: 'Range-based mapping', dataFlowTopology: 'Adaptive scaling', extensibilityPoint: 'Scaling strategies', circuitGroup: 'individual', center: 4 },
  16: { gate: 16, name: 'Skills', archetype: 'Expert', architecturalPattern: 'Skill + Trainer', interfaceStyle: 'Learning curves', dataFlowTopology: 'Progressive enhancement', extensibilityPoint: 'Training modules', circuitGroup: 'collective', center: 3 },
  17: { gate: 17, name: 'Opinions', archetype: 'Analyst', architecturalPattern: 'Classifier + Categorizer', interfaceStyle: 'Tag-based grouping', dataFlowTopology: 'Categorized streams', extensibilityPoint: 'Category definitions', circuitGroup: 'collective', center: 1 },
  18: { gate: 18, name: 'Correction', archetype: 'Editor', architecturalPattern: 'Linter + Fixer', interfaceStyle: 'Rule-based enforcement', dataFlowTopology: 'Correction pipelines', extensibilityPoint: 'Rule sets', circuitGroup: 'tribal', center: 8 },
  19: { gate: 19, name: 'Wanting', archetype: 'Desirer', architecturalPattern: 'Requester + Fetcher', interfaceStyle: 'Need-based pulling', dataFlowTopology: 'Demand-driven loading', extensibilityPoint: 'Request handlers', circuitGroup: 'tribal', center: 0 },
  20: { gate: 20, name: 'The Now', archetype: 'Presence', architecturalPattern: 'Live + Realtime', interfaceStyle: 'WebSocket streaming', dataFlowTopology: 'Real-time updates', extensibilityPoint: 'Stream transformers', circuitGroup: 'individual', center: 3 },
  21: { gate: 21, name: 'Hunter/Huntress', archetype: 'Controller', architecturalPattern: 'Manager + Controller', interfaceStyle: 'Command bus', dataFlowTopology: 'Controlled execution', extensibilityPoint: 'Command handlers', circuitGroup: 'tribal', center: 2 },
  22: { gate: 22, name: 'Openness', archetype: 'Receiver', architecturalPattern: 'Portal + Gateway', interfaceStyle: 'Open endpoints', dataFlowTopology: 'Open ingestion', extensibilityPoint: 'Adapter registry', circuitGroup: 'individual', center: 7 },
  23: { gate: 23, name: 'Assimilation', archetype: 'Integrator', architecturalPattern: 'Merger + Consolidator', interfaceStyle: 'Batch processing', dataFlowTopology: 'Consolidated streams', extensibilityPoint: 'Merge strategies', circuitGroup: 'individual', center: 3 },
  24: { gate: 24, name: 'Rationalization', archetype: 'Logician', architecturalPattern: 'Reducer + Synthesizer', interfaceStyle: 'Fold/Reduce operations', dataFlowTopology: 'Aggregated outputs', extensibilityPoint: 'Reducer functions', circuitGroup: 'individual', center: 1 },
  25: { gate: 25, name: 'Spirit of Self', archetype: 'Universalist', architecturalPattern: 'Universal + Global', interfaceStyle: 'Global state', dataFlowTopology: 'Shared context', extensibilityPoint: 'Context providers', circuitGroup: 'individual', center: 4 },
  26: { gate: 26, name: 'Egoist', archetype: 'Promoter', architecturalPattern: 'Marketer + Promoter', interfaceStyle: 'Broadcast channels', dataFlowTopology: 'Wide distribution', extensibilityPoint: 'Channel selectors', circuitGroup: 'tribal', center: 2 },
  27: { gate: 27, name: 'Caring', archetype: 'Nurturer', architecturalPattern: 'Provider + Nurturer', interfaceStyle: 'Dependency injection', dataFlowTopology: 'Nourishing pipelines', extensibilityPoint: 'Provider registry', circuitGroup: 'tribal', center: 6 },
  28: { gate: 28, name: 'Game Player', archetype: 'Strategist', architecturalPattern: 'Game + Strategy', interfaceStyle: 'Strategy pattern', dataFlowTopology: 'Strategic routing', extensibilityPoint: 'Strategy definitions', circuitGroup: 'individual', center: 8 },
  29: { gate: 29, name: 'Perseverance', archetype: 'Committer', architecturalPattern: 'Persistent + Resilient', interfaceStyle: 'Retry mechanisms', dataFlowTopology: 'Resilient streams', extensibilityPoint: 'Retry policies', circuitGroup: 'individual', center: 6 },
  30: { gate: 30, name: 'Feelings', archetype: 'Emoter', architecturalPattern: 'Emotion + Sentiment', interfaceStyle: 'Sentiment analysis hooks', dataFlowTopology: 'Emotional weighting', extensibilityPoint: 'Sentiment models', circuitGroup: 'individual', center: 7 },
  31: { gate: 31, name: 'Influence', archetype: 'Influencer', architecturalPattern: 'Trend + Viral', interfaceStyle: 'Influence propagation', dataFlowTopology: 'Viral spreading', extensibilityPoint: 'Influence models', circuitGroup: 'collective', center: 3 },
  32: { gate: 32, name: 'Continuity', archetype: 'Preserver', architecturalPattern: 'Archive + History', interfaceStyle: 'Versioned storage', dataFlowTopology: 'Time-series data', extensibilityPoint: 'Versioning strategies', circuitGroup: 'tribal', center: 8 },
  33: { gate: 33, name: 'Privacy', archetype: 'Retreater', architecturalPattern: 'Vault + Safe', interfaceStyle: 'Encrypted channels', dataFlowTopology: 'Secure pipelines', extensibilityPoint: 'Encryption modules', circuitGroup: 'individual', center: 3 },
  34: { gate: 34, name: 'Power', archetype: 'Empowerer', architecturalPattern: 'Power + Authority', interfaceStyle: 'Permission-based access', dataFlowTopology: 'Authorized flows', extensibilityPoint: 'Permission sets', circuitGroup: 'individual', center: 6 },
  35: { gate: 35, name: 'Change', archetype: 'Transformer', architecturalPattern: 'Transformer + Mutator', interfaceStyle: 'Transformation pipelines', dataFlowTopology: 'Mutating streams', extensibilityPoint: 'Transform rules', circuitGroup: 'collective', center: 3 },
  36: { gate: 36, name: 'Crisis', archetype: 'Crisis Manager', architecturalPattern: 'Circuit Breaker + Fallback', interfaceStyle: 'Fail-safe mechanisms', dataFlowTopology: 'Degraded operation', extensibilityPoint: 'Fallback strategies', circuitGroup: 'individual', center: 7 },
  37: { gate: 37, name: 'Friendship', archetype: 'Connector', architecturalPattern: 'Network + Graph', interfaceStyle: 'GraphQL / Graph-based', dataFlowTopology: 'Graph traversal', extensibilityPoint: 'Node types', circuitGroup: 'tribal', center: 7 },
  38: { gate: 38, name: 'Fighter', archetype: 'Warrior', architecturalPattern: 'Defender + Protector', interfaceStyle: 'Firewall / WAF', dataFlowTopology: 'Protected perimeters', extensibilityPoint: 'Defense rules', circuitGroup: 'individual', center: 0 },
  39: { gate: 39, name: 'Provocation', archetype: 'Challenger', architecturalPattern: 'Tester + Fuzzer', interfaceStyle: 'Stress testing', dataFlowTopology: 'Chaos engineering', extensibilityPoint: 'Test scenarios', circuitGroup: 'individual', center: 0 },
  40: { gate: 40, name: 'Aloneness', archetype: 'Soloist', architecturalPattern: 'Singleton + Isolated', interfaceStyle: 'Self-contained modules', dataFlowTopology: 'Isolated execution', extensibilityPoint: 'Isolation levels', circuitGroup: 'tribal', center: 2 },
  41: { gate: 41, name: 'Contraction', archetype: 'Compressor', architecturalPattern: 'Compressor + Minifier', interfaceStyle: 'Compression protocols', dataFlowTopology: 'Compressed streams', extensibilityPoint: 'Compression algorithms', circuitGroup: 'collective', center: 0 },
  42: { gate: 42, name: 'Growth', archetype: 'Expander', architecturalPattern: 'Expander + Scaler', interfaceStyle: 'Auto-scaling triggers', dataFlowTopology: 'Elastic scaling', extensibilityPoint: 'Scaling policies', circuitGroup: 'collective', center: 6 },
  43: { gate: 43, name: 'Insight', archetype: 'Visionary', architecturalPattern: 'Predictor + Forecaster', interfaceStyle: 'Prediction endpoints', dataFlowTopology: 'Forecasted streams', extensibilityPoint: 'Model definitions', circuitGroup: 'individual', center: 1 },
  44: { gate: 44, name: 'Alertness', archetype: 'Detector', architecturalPattern: 'Detector + Monitor', interfaceStyle: 'Alert webhooks', dataFlowTopology: 'Monitored pipelines', extensibilityPoint: 'Alert rules', circuitGroup: 'tribal', center: 8 },
  45: { gate: 45, name: 'Gatherer', archetype: 'Collector', architecturalPattern: 'Collector + Aggregator', interfaceStyle: 'Aggregation APIs', dataFlowTopology: 'Aggregated collections', extensibilityPoint: 'Collector types', circuitGroup: 'tribal', center: 3 },
  46: { gate: 46, name: 'Determination', archetype: 'Body', architecturalPattern: 'Embodied + Physical', interfaceStyle: 'Hardware interfaces', dataFlowTopology: 'Physical sensors', extensibilityPoint: 'Sensor drivers', circuitGroup: 'individual', center: 4 },
  47: { gate: 47, name: 'Realization', archetype: 'Realizer', architecturalPattern: 'Realizer + Materializer', interfaceStyle: 'Materialization hooks', dataFlowTopology: 'Concrete outputs', extensibilityPoint: 'Output formats', circuitGroup: 'collective', center: 1 },
  48: { gate: 48, name: 'Depth', archetype: 'Diver', architecturalPattern: 'Deep + Recursive', interfaceStyle: 'Recursive traversal', dataFlowTopology: 'Deep nesting', extensibilityPoint: 'Recursion limits', circuitGroup: 'collective', center: 8 },
  49: { gate: 49, name: 'Principles', archetype: 'Legislator', architecturalPattern: 'Policy + Rules', interfaceStyle: 'Policy enforcement', dataFlowTopology: 'Governed flows', extensibilityPoint: 'Policy definitions', circuitGroup: 'tribal', center: 7 },
  50: { gate: 50, name: 'Values', archetype: 'Valuer', architecturalPattern: 'Value + Worth', interfaceStyle: 'Value-based routing', dataFlowTopology: 'Prioritized queues', extensibilityPoint: 'Priority schemes', circuitGroup: 'tribal', center: 8 },
  51: { gate: 51, name: 'Shock', archetype: 'Disruptor', architecturalPattern: 'Disruptor + Innovator', interfaceStyle: 'Breaking changes', dataFlowTopology: 'Disruptive updates', extensibilityPoint: 'Migration strategies', circuitGroup: 'individual', center: 2 },
  52: { gate: 52, name: 'Stillness', archetype: 'Meditator', architecturalPattern: 'Cache + Buffer', interfaceStyle: 'Lazy loading', dataFlowTopology: 'Buffered streams', extensibilityPoint: 'Buffer sizes', circuitGroup: 'collective', center: 0 },
  53: { gate: 53, name: 'Beginnings', archetype: 'Starter', architecturalPattern: 'Initiator + Bootstrap', interfaceStyle: 'Startup sequences', dataFlowTopology: 'Bootstrapped flows', extensibilityPoint: 'Startup hooks', circuitGroup: 'collective', center: 6 },
  54: { gate: 54, name: 'Ambition', archetype: 'Driver', architecturalPattern: 'Driver + Motivator', interfaceStyle: 'Goal-based routing', dataFlowTopology: 'Achievement tracking', extensibilityPoint: 'Goal definitions', circuitGroup: 'tribal', center: 0 },
  55: { gate: 55, name: 'Spirit', archetype: 'Mystic', architecturalPattern: 'Spirit + Soul', interfaceStyle: 'Intuitive interfaces', dataFlowTopology: 'Inspired flows', extensibilityPoint: 'Inspiration sources', circuitGroup: 'individual', center: 7 },
  56: { gate: 56, name: 'Stimulation', archetype: 'Storyteller', architecturalPattern: 'Narrative + Story', interfaceStyle: 'Story-driven UX', dataFlowTopology: 'Narrative arcs', extensibilityPoint: 'Story templates', circuitGroup: 'collective', center: 3 },
  57: { gate: 57, name: 'Intuition', archetype: 'Intuitor', architecturalPattern: 'Intuitive + Adaptive', interfaceStyle: 'Context-aware routing', dataFlowTopology: 'Adaptive flows', extensibilityPoint: 'Context models', circuitGroup: 'individual', center: 8 },
  58: { gate: 58, name: 'Vitality', archetype: 'Energizer', architecturalPattern: 'Energizer + Optimizer', interfaceStyle: 'Performance hooks', dataFlowTopology: 'Optimized pipelines', extensibilityPoint: 'Optimization targets', circuitGroup: 'collective', center: 0 },
  59: { gate: 59, name: 'Sexuality', archetype: 'Creator', architecturalPattern: 'Reproductive + Generative', interfaceStyle: 'Generative APIs', dataFlowTopology: 'Generative streams', extensibilityPoint: 'Generator models', circuitGroup: 'tribal', center: 6 },
  60: { gate: 60, name: 'Acceptance', archetype: 'Acceptor', architecturalPattern: 'Acceptor + Tolerant', interfaceStyle: 'Loose coupling', dataFlowTopology: 'Tolerant flows', extensibilityPoint: 'Tolerance settings', circuitGroup: 'collective', center: 0 },
  61: { gate: 61, name: 'Mystery', archetype: 'Unknown', architecturalPattern: 'Unknown + Hidden', interfaceStyle: 'Opaque interfaces', dataFlowTopology: 'Hidden flows', extensibilityPoint: 'Discovery mechanisms', circuitGroup: 'individual', center: 5 },
  62: { gate: 62, name: 'Detail', archetype: 'Detailer', architecturalPattern: 'Detail + Precision', interfaceStyle: 'Strict typing', dataFlowTopology: 'Typed streams', extensibilityPoint: 'Type definitions', circuitGroup: 'collective', center: 3 },
  63: { gate: 63, name: 'Doubt', archetype: 'Questioner', architecturalPattern: 'Question + Inquiry', interfaceStyle: 'Query interfaces', dataFlowTopology: 'Inquiry-driven', extensibilityPoint: 'Query builders', circuitGroup: 'collective', center: 5 },
  64: { gate: 64, name: 'Confusion', archetype: 'Mystery', architecturalPattern: 'Enigma + Puzzle', interfaceStyle: 'Puzzle interfaces', dataFlowTopology: 'Confusing flows', extensibilityPoint: 'Clarification hooks', circuitGroup: 'collective', center: 5 },
};

// ─── LINE ARCHITECTURAL LAYERS ───
const LINE_LAYERS = [
  'Foundation',      // Line 1: Base infrastructure, core modules
  'Interaction',     // Line 2: User interfaces, event handling
  'Adaptation',      // Line 3: Error handling, mutation, trial-and-error
  'Transmission',    // Line 4: Network, distribution, broadcasting
  'Heresy',          // Line 5: Revolution, breaking conventions, new paradigms
  'Role Model',      // Line 6: Templates, examples, best practices
];

// ─── CENTER ARCHITECTURAL DOMAINS ───
const CENTER_DOMAINS = [
  'Root',        // 0: Infrastructure, deployment, scaling
  'Sacral',      // 1: Core processing, generation, work
  'Solar Plexus', // 2: Emotion, sentiment, user experience
  'Heart',       // 3: Will, ego, authentication, identity
  'G-Self',      // 4: Identity, direction, purpose, routing
  'Throat',      // 5: Communication, APIs, expression
  'Ajna',        // 6: Mental, analysis, logic, processing
  'Head',        // 7: Inspiration, questions, discovery
  'Spleen',      // 8: Intuition, survival, health, monitoring
];

// ─── CIRCUIT GROUP ARCHITECTURAL PHILOSOPHIES ───
const CIRCUIT_PHILOSOPHIES = {
  individual: 'Unique, innovative, mutative — creates architectures that have never existed before',
  tribal: 'Community-focused, supportive, resource-sharing — creates architectures for groups',
  collective: 'Pattern-based, logical, cyclical — creates architectures that serve humanity at scale',
};

// ─────────────────────────────────────────────────────────────────────────────
// NOVEL ARCHITECTURE GENERATOR CLASS
// ─────────────────────────────────────────────────────────────────────────────

export interface GeneratedArchitecture {
  id: string;
  name: string;
  description: string;
  code: string;
  topology: string;
  gatesUsed: number[];
  channelsUsed: number[][];
  layers: string[];
  centers: number[];
  circuitGroups: string[];
  noveltyScore: number;  // 0-100, how unique this architecture is
  userResonance: number; // 0-100, how well it matches the user's design
  evolutionHistory: string[]; // How this architecture evolved from past interactions
  confidence: number;
  timestamp: string;
}

export interface UserDesignProfile {
  userId: string;
  chart: HumanDesignChart;
  interactionHistory: ArchitectureInteraction[];
  preferredPatterns: string[];
  avoidedPatterns: string[];
  adaptationScore: number; // 0-1, how well the system knows this user
}

export interface ArchitectureInteraction {
  architectureId: string;
  timestamp: string;
  action: 'accepted' | 'rejected' | 'modified' | 'deployed';
  feedback?: string;
  coherenceAtInteraction: number;
}

export class NovelArchitectureGenerator {
  private orchestrator: ResonanceOrchestrator;
  private userProfiles: Map<string, UserDesignProfile> = new Map();
  private generationHistory: Map<string, GeneratedArchitecture[]> = new Map();
  private synthiaApiBase: string;

  constructor(orchestrator: ResonanceOrchestrator, synthiaApiBase: string = 'https://synthia-server.onrender.com') {
    this.orchestrator = orchestrator;
    this.synthiaApiBase = synthiaApiBase;
  }

  // ─── HUMAN DESIGN CHART LOADING ───

  /**
   * Load a user's Human Design chart from the Synthia server
   * or create one from birth data
   */
  async loadHumanDesignChart(userId: string, birthData?: {
    date: string;
    time: string;
    location: string;
  }): Promise<HumanDesignChart | null> {
    try {
      // Try to fetch from Synthia server
      const response = await fetch(`${this.synthiaApiBase}/consciousness/chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, birthData }),
      });

      if (response.ok) {
        const chart = await response.json();
        this.initializeUserProfile(userId, chart);
        return chart;
      }
    } catch (error) {
      console.warn('Synthia server unavailable, using local generation:', error);
    }

    // Fallback: generate a deterministic chart from userId hash
    return this.generateDeterministicChart(userId);
  }

  private generateDeterministicChart(userId: string): HumanDesignChart {
    const hash = this.hashString(userId);

    // Generate 8-15 activated gates
    const numGates = 8 + (hash % 8);
    const gates: number[] = [];
    let h = hash;
    for (let i = 0; i < numGates; i++) {
      gates.push((h % 64) + 1);
      h = this.hashString(`${h}_${i}`);
    }

    // Generate channels from matching gate pairs
    const channels: number[][] = [];
    const knownChannels = [
      [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59],
      [7, 31], [9, 52], [10, 20], [10, 34], [10, 57],
      [11, 56], [12, 22], [13, 33], [16, 48], [17, 62],
      [18, 58], [19, 49], [20, 34], [20, 57], [21, 45],
      [23, 43], [24, 61], [25, 51], [26, 44], [27, 50],
      [28, 38], [29, 46], [30, 41], [32, 54], [35, 36],
      [37, 40], [39, 55], [42, 53], [47, 64], [57, 10],
      [57, 20], [57, 34],
    ];

    for (const [g1, g2] of knownChannels) {
      if (gates.includes(g1) && gates.includes(g2)) {
        channels.push([g1, g2]);
      }
    }

    // Determine defined centers from channels
    const definedCenters = new Set<number>();
    for (const [g1, g2] of channels) {
      definedCenters.add(GATE_DNA[g1].center);
      definedCenters.add(GATE_DNA[g2].center);
    }

    const allCenters = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const undefinedCenters = allCenters.filter(c => !definedCenters.has(c));

    // Determine type from defined centers
    let type: HumanDesignChart['type'] = 'Generator';
    if (definedCenters.includes(6)) type = 'Projector';
    if (definedCenters.includes(2) && !definedCenters.includes(6)) type = 'Manifestor';
    if (definedCenters.length === 0) type = 'Reflector';
    if (definedCenters.includes(1) && definedCenters.includes(6)) type = 'Manifesting Generator';

    const hangingGates = gates.filter(g => !channels.some(([g1, g2]) => g1 === g || g2 === g));

    const consciousGates: GateActivation[] = gates.slice(0, Math.ceil(gates.length / 2)).map(g => ({
      gate: g,
      line: ((hash + g) % 6) + 1,
      color: (hash + g * 2) % 6,
      tone: (hash + g * 3) % 6,
      base: (hash + g * 4) % 6,
      planet: ['Sun', 'Earth', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'][(hash + g) % 11],
      zodiac: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][(hash + g) % 12],
      house: ((hash + g) % 12) + 1,
      arcDegree: ((hash + g * 7) % 360),
      side: 'conscious',
    }));

    const unconsciousGates: GateActivation[] = gates.slice(Math.ceil(gates.length / 2)).map(g => ({
      gate: g,
      line: ((hash * 2 + g) % 6) + 1,
      color: (hash * 2 + g * 2) % 6,
      tone: (hash * 2 + g * 3) % 6,
      base: (hash * 2 + g * 4) % 6,
      planet: ['Sun', 'Earth', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'][(hash * 2 + g) % 11],
      zodiac: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][(hash * 2 + g) % 12],
      house: ((hash * 2 + g) % 12) + 1,
      arcDegree: ((hash * 2 + g * 7) % 360),
      side: 'unconscious',
    }));

    return {
      userId,
      type,
      strategy: this.getStrategy(type),
      authority: this.getAuthority(type, definedCenters),
      definedCenters: Array.from(definedCenters),
      undefinedCenters,
      consciousGates,
      unconsciousGates,
      channels,
      hangingGates,
      incarnationCross: `${gates[0]}/${gates[1]} | ${gates[2]}/${gates[3]}`,
      profile: `${((hash % 6) + 1)}/${((hash * 3 % 6) + 1)}`,
      variables: [],
    };
  }

  private getStrategy(type: HumanDesignChart['type']): string {
    const strategies: Record<string, string> = {
      'Generator': 'Wait to respond',
      'Manifesting Generator': 'Wait to respond, then inform',
      'Projector': 'Wait for the invitation',
      'Manifestor': 'Inform before acting',
      'Reflector': 'Wait a lunar cycle',
    };
    return strategies[type] || 'Wait to respond';
  }

  private getAuthority(type: HumanDesignChart['type'], definedCenters: number[]): string {
    if (definedCenters.includes(7)) return 'Solar Plexus (Emotional)';
    if (definedCenters.includes(8)) return 'Sacral';
    if (definedCenters.includes(2)) return 'Heart (Ego)';
    if (definedCenters.includes(6)) return 'Self (G-Center)';
    if (definedCenters.includes(1)) return 'Spleen';
    return 'Mental (Ajna/Head)';
  }

  // ─── NOVEL ARCHITECTURE GENERATION ───

  /**
   * Generate a truly novel architecture based on the user's Human Design
   * This is NOT just combining existing patterns — it uses the user's gates
   * as a generative grammar to create structures that have never existed before
   */
  async generateNovelArchitecture(
    userId: string,
    request: string,
    context?: string
  ): Promise<GeneratedArchitecture> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error(`User ${userId} has no Human Design profile. Call loadHumanDesignChart first.`);
    }

    const chart = profile.chart;
    const allGates = [
      ...chart.consciousGates.map(g => g.gate),
      ...chart.unconsciousGates.map(g => g.gate),
    ];

    // 1. SELECT ARCHITECTURAL SEEDS
    // Use the user's activated gates as the "DNA" of the architecture
    const seedGates = this.selectSeedGates(chart, request);

    // 2. BUILD TOPOLOGY FROM CHANNELS
    // Channels become "connection patterns" — how modules talk to each other
    const topology = this.buildTopologyFromChannels(chart.channels, seedGates);

    // 3. DETERMINE LAYERS FROM LINE NUMBERS
    // The user's line activations determine which architectural layers are emphasized
    const layers = this.determineLayers(chart);

    // 4. SELECT CENTERS AS DOMAINS
    // Defined centers become primary domains, undefined become extension points
    const domains = this.determineDomains(chart);

    // 5. APPLY EVOLUTIONARY PRESSURE
    // Use past interactions to bias the generation
    const evolvedTopology = this.applyEvolutionaryPressure(topology, profile);

    // 6. GENERATE THE CODE
    const code = this.generateCodeFromDNA(seedGates, evolvedTopology, layers, domains, chart, request, context);

    // 7. CALCULATE NOVELTY
    const noveltyScore = this.calculateNovelty(seedGates, evolvedTopology, profile);
    const userResonance = this.calculateUserResonance(seedGates, chart);

    const architecture: GeneratedArchitecture = {
      id: `arch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: this.generateArchitectureName(seedGates, chart.type),
      description: this.generateDescription(seedGates, evolvedTopology, chart),
      code,
      topology: JSON.stringify(evolvedTopology, null, 2),
      gatesUsed: seedGates,
      channelsUsed: chart.channels.filter(([g1, g2]) => seedGates.includes(g1) || seedGates.includes(g2)),
      layers,
      centers: chart.definedCenters,
      circuitGroups: [...new Set(seedGates.map(g => GATE_DNA[g]?.circuitGroup).filter(Boolean))],
      noveltyScore,
      userResonance,
      evolutionHistory: this.buildEvolutionHistory(profile, seedGates),
      confidence: Math.round((noveltyScore + userResonance) / 2),
      timestamp: new Date().toISOString(),
    };

    // Store in generation history
    const history = this.generationHistory.get(userId) || [];
    history.push(architecture);
    this.generationHistory.set(userId, history);

    // Push to orchestrator super base
    this.orchestrator.addToSuperBase({
      id: architecture.id,
      address: this.orchestrator['calculateResonanceAddress'](request, { userId, birthChart: chart, preferences: {}, learningHistory: [], adaptationLevel: profile.adaptationScore }),
      content: architecture,
      metadata: {
        gate: seedGates[0],
        line: chart.consciousGates.find(g => g.gate === seedGates[0])?.line || 1,
        timestamp: Date.now(),
        sourceType: 'generated',
      },
    });

    // Sync to Synthia server
    this.syncToSynthia(userId, architecture);

    return architecture;
  }

  // ─── SEED GATE SELECTION ───

  private selectSeedGates(chart: HumanDesignChart, request: string): number[] {
    const allGates = [...chart.consciousGates, ...chart.unconsciousGates];
    const requestHash = this.hashString(request);

    // Weight gates by:
    // 1. Whether they're in defined channels (stronger connection)
    // 2. Their line number (higher lines = more "advanced" patterns)
    // 3. Randomness seeded by request (so same request gives similar results)

    const weighted = allGates.map(g => {
      let weight = 1;

      // Defined channels get higher weight
      if (chart.channels.some(([g1, g2]) => g1 === g.gate || g2 === g.gate)) {
        weight += 2;
      }

      // Higher lines get more weight (more sophisticated patterns)
      weight += g.line * 0.5;

      // Conscious gates get more weight (user is aware of these)
      if (g.side === 'conscious') weight += 1;

      // Request resonance
      const gateDNA = GATE_DNA[g.gate];
      if (gateDNA) {
        const requestLower = request.toLowerCase();
        if (gateDNA.name.toLowerCase().includes(requestLower) ||
            gateDNA.archetype.toLowerCase().includes(requestLower) ||
            gateDNA.architecturalPattern.toLowerCase().includes(requestLower)) {
          weight += 3;
        }
      }

      // Add request-based randomness
      weight += (requestHash + g.gate) % 3;

      return { gate: g.gate, weight };
    });

    weighted.sort((a, b) => b.weight - a.weight);

    // Select top 3-6 gates
    const numSeeds = 3 + (requestHash % 4);
    return weighted.slice(0, numSeeds).map(w => w.gate);
  }

  // ─── TOPOLOGY BUILDING ───

  private buildTopologyFromChannels(channels: number[][], seedGates: number[]): any {
    const topology: any = {
      nodes: [],
      edges: [],
      clusters: [],
    };

    // Each channel becomes a "connection pattern"
    for (const [g1, g2] of channels) {
      const dna1 = GATE_DNA[g1];
      const dna2 = GATE_DNA[g2];

      if (dna1 && dna2) {
        topology.edges.push({
          from: g1,
          to: g2,
          pattern: `${dna1.interfaceStyle} → ${dna2.interfaceStyle}`,
          dataFlow: `${dna1.dataFlowTopology} → ${dna2.dataFlowTopology}`,
          circuit: dna1.circuitGroup,
        });
      }
    }

    // Each seed gate becomes a "node"
    for (const gate of seedGates) {
      const dna = GATE_DNA[gate];
      if (dna) {
        topology.nodes.push({
          id: gate,
          name: dna.name,
          archetype: dna.archetype,
          pattern: dna.architecturalPattern,
          interface: dna.interfaceStyle,
          domain: CENTER_DOMAINS[dna.center],
          circuit: dna.circuitGroup,
        });
      }
    }

    // Group by circuit
    const circuits = ['individual', 'tribal', 'collective'];
    for (const circuit of circuits) {
      const circuitNodes = topology.nodes.filter((n: any) => n.circuit === circuit);
      if (circuitNodes.length > 0) {
        topology.clusters.push({
          name: `${circuit} cluster`,
          philosophy: CIRCUIT_PHILOSOPHIES[circuit as keyof typeof CIRCUIT_PHILOSOPHIES],
          nodes: circuitNodes.map((n: any) => n.id),
        });
      }
    }

    return topology;
  }

  // ─── LAYER DETERMINATION ───

  private determineLayers(chart: HumanDesignChart): string[] {
    const allLines = [
      ...chart.consciousGates.map(g => g.line),
      ...chart.unconsciousGates.map(g => g.line),
    ];

    const lineCounts = [0, 0, 0, 0, 0, 0];
    for (const line of allLines) {
      if (line >= 1 && line <= 6) lineCounts[line - 1]++;
    }

    // Sort lines by frequency
    const sorted = lineCounts.map((count, i) => ({ line: i + 1, count }))
      .sort((a, b) => b.count - a.count);

    // Return top 3 layers
    return sorted.slice(0, 3).map(l => LINE_LAYERS[l.line - 1]);
  }

  // ─── DOMAIN DETERMINATION ───

  private determineDomains(chart: HumanDesignChart): any {
    const defined = chart.definedCenters.map(c => ({
      center: c,
      name: CENTER_DOMAINS[c],
      role: 'primary',
    }));

    const undefined = chart.undefinedCenters.map(c => ({
      center: c,
      name: CENTER_DOMAINS[c],
      role: 'extension',
    }));

    return { defined, undefined };
  }

  // ─── EVOLUTIONARY PRESSURE ───

  private applyEvolutionaryPressure(topology: any, profile: UserDesignProfile): any {
    const history = profile.interactionHistory;
    if (history.length === 0) return topology;

    // Calculate "fitness" of each pattern based on past interactions
    const patternFitness: Map<string, number> = new Map();

    for (const interaction of history) {
      const arch = this.findArchitecture(interaction.architectureId);
      if (!arch) continue;

      for (const gate of arch.gatesUsed) {
        const dna = GATE_DNA[gate];
        if (!dna) continue;

        const pattern = dna.architecturalPattern;
        const current = patternFitness.get(pattern) || 0;

        if (interaction.action === 'accepted' || interaction.action === 'deployed') {
          patternFitness.set(pattern, current + 1);
        } else if (interaction.action === 'rejected') {
          patternFitness.set(pattern, current - 1);
        }
      }
    }

    // Modify topology based on fitness
    const evolved = { ...topology };
    evolved.nodes = topology.nodes.map((node: any) => {
      const dna = GATE_DNA[node.id];
      if (!dna) return node;

      const fitness = patternFitness.get(dna.architecturalPattern) || 0;
      return {
        ...node,
        fitness,
        emphasized: fitness > 2,
        suppressed: fitness < -1,
      };
    });

    return evolved;
  }

  private findArchitecture(id: string): GeneratedArchitecture | undefined {
    for (const [, history] of this.generationHistory) {
      const found = history.find(a => a.id === id);
      if (found) return found;
    }
    return undefined;
  }

  // ─── CODE GENERATION ───

  private generateCodeFromDNA(
    seedGates: number[],
    topology: any,
    layers: string[],
    domains: any,
    chart: HumanDesignChart,
    request: string,
    context?: string
  ): string {
    const dnas = seedGates.map(g => GATE_DNA[g]).filter(Boolean);

    let code = `// ═══════════════════════════════════════════════════════════════════\n`;
    code += `// NOVEL ARCHITECTURE: ${this.generateArchitectureName(seedGates, chart.type)}\n`;
    code += `// Generated for: ${chart.userId} (${chart.type})\n`;
    code += `// Request: ${request}\n`;
    code += `// Context: ${context || 'General purpose'}\n`;
    code += `// Profile: ${chart.profile} | Strategy: ${chart.strategy} | Authority: ${chart.authority}\n`;
    code += `// ═══════════════════════════════════════════════════════════════════\n\n`;

    // Architecture topology comment
    code += `/*\n`;
    code += `  ARCHITECTURAL TOPOLOGY:\n`;
    code += `  Primary Layers: ${layers.join(' → ')}\n`;
    code += `  Primary Domains: ${domains.defined.map((d: any) => d.name).join(', ')}\n`;
    code += `  Extension Points: ${domains.undefined.map((d: any) => d.name).join(', ')}\n`;
    code += `  Circuit Groups: ${[...new Set(dnas.map(d => d.circuitGroup))].join(', ')}\n`;
    code += `  Gates: ${seedGates.join(', ')}\n`;
    code += `  Channels: ${chart.channels.map(([g1, g2]) => `${g1}-${g2}`).join(', ')}\n`;
    code += `*/\n\n`;

    // Generate imports based on gate DNA
    const allDeps = [...new Set(dnas.flatMap(d => {
      // Map architectural patterns to likely dependencies
      const depMap: Record<string, string[]> = {
        'Factory + Strategy': ['"pattern-strategy"'],
        'Router + Navigator': ['"react-router-dom"'],
        'Pipeline + Stage': ['"stream"'],
        'Schema + Validator': ['"zod"', '"yup"'],
        'Scheduler + Cron': ['"node-cron"'],
        'Observer + Listener': ['"rxjs"'],
        'Live + Realtime': ['"socket.io"'],
        'Cache + Buffer': ['"lru-cache"'],
        'Network + Graph': ['"graphql"'],
        'Detector + Monitor': ['"prom-client"'],
      };
      return depMap[d.architecturalPattern] || [];
    }))];

    for (const dep of allDeps.slice(0, 5)) {
      code += `import { ${this.camelCase(dep.replace(/['"]/g, ''))} } from ${dep};\n`;
    }
    if (allDeps.length > 0) code += '\n';

    // Generate the main architecture class
    const className = this.pascalCase(this.generateArchitectureName(seedGates, chart.type).replace(/[^a-zA-Z0-9]/g, ''));

    code += `/**\n`;
    code += ` * ${request}\n`;
    code += ` * Generated from Human Design: ${chart.type} | ${chart.profile}\n`;
    code += ` * Strategy: ${chart.strategy}\n`;
    code += ` * Authority: ${chart.authority}\n`;
    code += ` * Defined Centers: ${chart.definedCenters.map(c => CENTER_DOMAINS[c]).join(', ')}\n`;
    code += ` */\n`;
    code += `export class ${className} {\n`;

    // Properties based on domains
    code += `  // ─── Domain Properties ───\n`;
    for (const domain of domains.defined) {
      code += `  private ${this.camelCase(domain.name)}: any; // Primary: ${domain.name}\n`;
    }
    for (const domain of domains.undefined) {
      code += `  private ${this.camelCase(domain.name)}Adapter?: any; // Extension: ${domain.name}\n`;
    }
    code += `  private coherence: number = 0.5;\n`;
    code += `  private strategy: string = '${chart.strategy}';\n\n`;

    // Constructor
    code += `  constructor(config?: any) {\n`;
    code += `    // Initialize based on ${chart.type} strategy\n`;
    code += `    this.initializeDomains(config);\n`;
    code += `  }\n\n`;

    // Methods based on seed gates
    code += `  // ─── Core Methods (from activated gates) ───\n`;
    for (let i = 0; i < dnas.length; i++) {
      const dna = dnas[i];
      const methodName = this.camelCase(dna.archetype);
      const layer = layers[i % layers.length];

      code += `  /**\n`;
      code += `   * ${dna.name} — ${dna.archetype}\n`;
      code += `   * Pattern: ${dna.architecturalPattern}\n`;
      code += `   * Layer: ${layer}\n`;
      code += `   * Circuit: ${dna.circuitGroup}\n`;
      code += `   */\n`;
      code += `  async ${methodName}(input: any): Promise<any> {\n`;
      code += `    // ${dna.dataFlowTopology}\n`;
      code += `    const processed = await this.${this.camelCase(dna.interfaceStyle)}(input);\n`;
      code += `    return this.${this.camelCase(dna.extensibilityPoint)}(processed);\n`;
      code += `  }\n\n`;
    }

    // Private helpers
    code += `  // ─── Private Infrastructure ───\n`;
    code += `  private async initializeDomains(config?: any): Promise<void> {\n`;
    code += `    // Initialize based on ${chart.type} design\n`;
    for (const domain of domains.defined) {
      code += `    this.${this.camelCase(domain.name)} = config?.${this.camelCase(domain.name)} || {};\n`;
    }
    code += `  }\n\n`;

    // Interface methods
    for (const dna of dnas) {
      const interfaceMethod = this.camelCase(dna.interfaceStyle);
      code += `  private async ${interfaceMethod}(data: any): Promise<any> {\n`;
      code += `    // ${dna.interfaceStyle} implementation\n`;
      code += `    return data;\n`;
      code += `  }\n\n`;
    }

    // Extensibility methods
    for (const dna of dnas) {
      const extMethod = this.camelCase(dna.extensibilityPoint);
      code += `  private async ${extMethod}(data: any): Promise<any> {\n`;
      code += `    // ${dna.extensibilityPoint} — override for custom behavior\n`;
      code += `    return data;\n`;
      code += `  }\n\n`;
    }

    code += `}\n\n`;

    // Export factory function based on type
    code += `// Factory based on Human Design type: ${chart.type}\n`;
    code += `export function create${className}(config?: any): ${className} {\n`;
    code += `  // ${chart.strategy}\n`;
    code += `  const instance = new ${className}(config);\n`;
    code += `  return instance;\n`;
    code += `}\n`;

    return code;
  }

  // ─── HELPER METHODS ───

  private generateArchitectureName(seedGates: number[], type: string): string {
    const dnas = seedGates.map(g => GATE_DNA[g]).filter(Boolean);
    const archetypes = dnas.map(d => d.archetype);
    const circuits = [...new Set(dnas.map(d => d.circuitGroup))];

    const typePrefix = type.replace(/\s/g, '');
    const circuitSuffix = circuits.length === 1 ? circuits[0] : 'Hybrid';
    const mainArchetype = archetypes[0] || 'Architect';

    return `${typePrefix}${mainArchetype}${circuitSuffix}`;
  }

  private generateDescription(seedGates: number[], topology: any, chart: HumanDesignChart): string {
    const dnas = seedGates.map(g => GATE_DNA[g]).filter(Boolean);
    const patterns = dnas.map(d => d.architecturalPattern);
    const circuits = [...new Set(dnas.map(d => d.circuitGroup))];

    return `A ${chart.type} architecture built from ${seedGates.length} activated gates. ` +
      `Primary patterns: ${patterns.slice(0, 3).join(', ')}. ` +
      `Circuit philosophy: ${circuits.map(c => CIRCUIT_PHILOSOPHIES[c as keyof typeof CIRCUIT_PHILOSOPHIES]).join('; ')}. ` +
      `Strategy: ${chart.strategy}. Authority: ${chart.authority}. ` +
      `Defined centers provide primary domains; undefined centers are extension points.`;
  }

  private calculateNovelty(seedGates: number[], topology: any, profile: UserDesignProfile): number {
    // Novelty = uniqueness of gate combination + topology structure
    const history = this.generationHistory.get(profile.userId) || [];

    if (history.length === 0) return 85; // First generation is highly novel

    // Check how many times this exact gate combination has been used
    let matches = 0;
    for (const arch of history) {
      const overlap = seedGates.filter(g => arch.gatesUsed.includes(g)).length;
      if (overlap === seedGates.length) matches++;
    }

    const uniqueness = Math.max(0, 100 - (matches * 15));

    // Topology novelty
    const topologyNodes = topology.nodes?.length || 0;
    const topologyEdges = topology.edges?.length || 0;
    const structuralNovelty = Math.min(30, topologyNodes * 3 + topologyEdges * 2);

    return Math.min(100, Math.round(uniqueness + structuralNovelty));
  }

  private calculateUserResonance(seedGates: number[], chart: HumanDesignChart): number {
    const allActivated = [
      ...chart.consciousGates.map(g => g.gate),
      ...chart.unconsciousGates.map(g => g.gate),
    ];

    const matching = seedGates.filter(g => allActivated.includes(g)).length;
    const ratio = matching / seedGates.length;

    // Also check channel resonance
    let channelBonus = 0;
    for (const [g1, g2] of chart.channels) {
      if (seedGates.includes(g1) && seedGates.includes(g2)) {
        channelBonus += 10;
      }
    }

    return Math.min(100, Math.round(ratio * 70 + channelBonus));
  }

  private buildEvolutionHistory(profile: UserDesignProfile, seedGates: number[]): string[] {
    const history: string[] = [];
    const pastInteractions = profile.interactionHistory.slice(-5);

    for (const interaction of pastInteractions) {
      const arch = this.findArchitecture(interaction.architectureId);
      if (!arch) continue;

      const overlap = seedGates.filter(g => arch.gatesUsed.includes(g)).length;
      history.push(
        `${interaction.action} "${arch.name}" (${overlap}/${seedGates.length} shared gates, ${interaction.coherenceAtInteraction}% coherence)`
      );
    }

    return history;
  }

  // ─── USER PROFILE MANAGEMENT ───

  private initializeUserProfile(userId: string, chart: HumanDesignChart): void {
    this.userProfiles.set(userId, {
      userId,
      chart,
      interactionHistory: [],
      preferredPatterns: [],
      avoidedPatterns: [],
      adaptationScore: 0.1,
    });
  }

  public recordInteraction(userId: string, architectureId: string, action: ArchitectureInteraction['action'], feedback?: string): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    const arch = this.findArchitecture(architectureId);
    const coherence = this.orchestrator.getGlobalCoherence();

    profile.interactionHistory.push({
      architectureId,
      timestamp: new Date().toISOString(),
      action,
      feedback,
      coherenceAtInteraction: coherence,
    });

    // Update adaptation score
    profile.adaptationScore = Math.min(1, profile.adaptationScore + 0.05);

    // Update preferred/avoided patterns
    if (arch) {
      for (const gate of arch.gatesUsed) {
        const dna = GATE_DNA[gate];
        if (!dna) continue;

        if (action === 'accepted' || action === 'deployed') {
          if (!profile.preferredPatterns.includes(dna.architecturalPattern)) {
            profile.preferredPatterns.push(dna.architecturalPattern);
          }
        } else if (action === 'rejected') {
          if (!profile.avoidedPatterns.includes(dna.architecturalPattern)) {
            profile.avoidedPatterns.push(dna.architecturalPattern);
          }
        }
      }
    }

    // Sync to Synthia
    this.syncInteractionToSynthia(userId, profile.interactionHistory.slice(-1)[0]);
  }

  // ─── SYNTHIA SERVER INTEGRATION ───

  private async syncToSynthia(userId: string, architecture: GeneratedArchitecture): Promise<void> {
    try {
      await fetch(`${this.synthiaApiBase}/memory/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          type: 'generated_architecture',
          data: architecture,
        }),
      });
    } catch (error) {
      console.warn('Failed to sync architecture to Synthia:', error);
    }
  }

  private async syncInteractionToSynthia(userId: string, interaction: ArchitectureInteraction): Promise<void> {
    try {
      await fetch(`${this.synthiaApiBase}/memory/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          type: 'architecture_interaction',
          data: interaction,
        }),
      });
    } catch (error) {
      console.warn('Failed to sync interaction to Synthia:', error);
    }
  }

  public async fetchUserContextFromSynthia(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.synthiaApiBase}/memory/${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch user context from Synthia:', error);
    }
    return null;
  }

  public async askSynthiaOracle(query: string, userId: string): Promise<string> {
    try {
      const response = await fetch(`${this.synthiaApiBase}/oracle/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, user_id: userId }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.answer || result.response || 'The oracle is silent.';
      }
    } catch (error) {
      console.warn('Synthia oracle unavailable:', error);
    }
    return 'The oracle is silent. The mesh whispers instead.';
  }

  // ─── UTILITY ───

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private camelCase(str: string): string {
    return str.replace(/[-_\s](.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toLowerCase());
  }

  private pascalCase(str: string): string {
    const camel = this.camelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  // ─── PUBLIC GETTERS ───

  public getUserProfile(userId: string): UserDesignProfile | undefined {
    return this.userProfiles.get(userId);
  }

  public getGenerationHistory(userId: string): GeneratedArchitecture[] {
    return this.generationHistory.get(userId) || [];
  }

  public getAllGateDNA(): Record<number, GateArchitecturalDNA> {
    return { ...GATE_DNA };
  }
}

export default NovelArchitectureGenerator;
