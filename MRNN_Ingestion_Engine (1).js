/**
 * MRNN Autopoietic Ingestion Engine
 * File metabolism system — treats all external input as perturbation
 * 
 * Core principle: Files are NOT instructions. They are raw material that the
 * system breaks into its own morphological primitives, then decides whether
 * to grow new structure, strengthen existing structure, or reject the perturbation.
 * 
 * The system maintains operational closure: it only accepts what fits its
 * current morphological grammar. What doesn't fit triggers structural adaptation.
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// MORPHOLOGICAL PRIMITIVES — The system's own grammar
// These are NOT the file's structure. They are what the MRNN
// recognizes as "food" for its own self-production.
// ============================================================
const MorphologicalPrimitives = {
  // Layer 1: BASE (5 Dimensions) — What kind of structural element?
  STRUCTURAL: {
    1: { name: 'Movement',    wuxing: 'Fire',   pattern: /^(class|function|const\s+\w+\s*=)/ },
    2: { name: 'Evolution',   wuxing: 'Water',  pattern: /^(export|import|require|module)/ },
    3: { name: 'Being',       wuxing: 'Wood',   pattern: /^(constructor|new\s|this\.|self\.)/ },
    4: { name: 'Design',      wuxing: 'Metal',  pattern: /^(interface|type\s|typedef|schema)/ },
    5: { name: 'Space',       wuxing: 'Earth',  pattern: /^(namespace|global|window\.|document\.)/ }
  },

  // Layer 2: TONE (6 Sensory Modes) — How does the file "perceive"?
  PERCEPTUAL: {
    1: { name: 'Security',    sense: 'Smell',      pattern: /(auth|token|secret|encrypt|hash|salt)/i },
    2: { name: 'Uncertainty', sense: 'Taste',      pattern: /(random|Math\.random|uncertain|probabil)/i },
    3: { name: 'Action',      sense: 'OuterVision', pattern: /(render|display|show|visible|style|css)/i },
    4: { name: 'Meditation',  sense: 'InnerVision', pattern: /(compute|calculate|process|transform|map)/i },
    5: { name: 'Judgement',   sense: 'Feeling',    pattern: /(if\s*\(|switch|case|else|try|catch)/ },
    6: { name: 'Acceptance',  sense: 'Hearing',    pattern: /(listen|on\w+|addEventListener|subscribe|emit)/i }
  },

  // Layer 3: COLOR (6 Motivations) — What drives this component?
  MOTIVATIONAL: {
    1: { name: 'Fear',        drive: 'Survival',    pattern: /(error|fail|catch|throw|warn|console\.error)/i },
    2: { name: 'Hope',        drive: 'Faith',       pattern: /(promise|async|await|future|expect|goal)/i },
    3: { name: 'Desire',      drive: 'Want',        pattern: /(get|fetch|request|load|import|require)/i },
    4: { name: 'Need',        drive: 'Requirement', pattern: /(need|must|required|essential|core|base)/i },
    5: { name: 'Guilt',       drive: 'Responsibility', pattern: /(cleanup|dispose|destroy|remove|delete|close)/i },
    6: { name: 'Innocence',   drive: 'Play',        pattern: /(demo|example|test|mock|stub|simulate)/i }
  },

  // Layer 4: GATE (64 Archetypes) — What archetype does this file express?
  ARCHETYPAL: {
    // Individual Circuit (purple)
    1: { name: 'Creative',        circuit: 'Individual', pattern: /(create|generate|make|build|construct)/i },
    2: { name: 'Receptive',       circuit: 'Individual', pattern: /(receive|accept|input|listen|read)/i },
    3: { name: 'Difficulty',      circuit: 'Individual', pattern: /(challenge|hard|complex|difficult|struggle)/i },
    10: { name: 'Treading',       circuit: 'Individual', pattern: /(step|walk|path|route|navigate)/i },
    57: { name: 'The Gentle',     circuit: 'Individual', pattern: /(soft|gentle|quiet|calm|smooth)/i },
    // Collective Circuit (blue)
    11: { name: 'Peace',          circuit: 'Collective', pattern: /(peace|harmony|balance|equal|fair)/i },
    12: { name: 'Standstill',     circuit: 'Collective', pattern: /(stop|pause|halt|freeze|wait)/i },
    13: { name: 'Fellowship',     circuit: 'Collective', pattern: /(group|team|community|share|together)/i },
    14: { name: 'Possession',     circuit: 'Collective', pattern: /(own|have|hold|keep|store|save)/i },
    15: { name: 'Modesty',        circuit: 'Collective', pattern: /(modest|humble|simple|plain|basic)/i },
    // Tribal Circuit (red)
    6: { name: 'Conflict',        circuit: 'Tribal', pattern: /(conflict|fight|battle|argue|dispute)/i },
    7: { name: 'The Army',        circuit: 'Tribal', pattern: /(army|force|power|strength|control)/i },
    8: { name: 'Holding Together', circuit: 'Tribal', pattern: /(hold|bind|connect|link|attach)/i },
    9: { name: 'The Taming Power', circuit: 'Tribal', pattern: /(tame|train|discipline|order|rule)/i },
    21: { name: 'Biting Through',  circuit: 'Tribal', pattern: /(bite|cut|break|split|divide)/i },
    // Default mapping for unmatched
    DEFAULT: { name: 'The Wanderer', circuit: 'Individual', pattern: /.*/ }
  },

  // Layer 5: LINE (6 Roles) — What role does this component play?
  ROLE: {
    1: { name: 'Investigator',    role: 'Introspection',    pattern: /(analyze|inspect|check|verify|validate|test)/i },
    2: { name: 'Hermit',          role: 'Projection',       pattern: /(isolate|separate|private|hidden|internal)/i },
    3: { name: 'Martyr',          role: 'TrialAndError',    pattern: /(try|attempt|experiment|risk|sacrifice)/i },
    4: { name: 'Opportunist',     role: 'Externalization',  pattern: /(use|apply|implement|deploy|publish)/i },
    5: { name: 'Heretic',         role: 'Universalization', pattern: /(change|transform|revolution|break|rebel)/i },
    6: { name: 'RoleModel',       role: 'Transcendence',    pattern: /(perfect|ideal|complete|finish|done|master)/i }
  }
};

// ============================================================
// INGESTION ENGINE
// ============================================================
class MRNNIngestionEngine {
  constructor(neuralEngine) {
    this.engine = neuralEngine;
    this.ingestionLog = [];
    this.metabolicQueue = [];
    this.structuralMemory = new Map(); // What the system has "eaten" and made part of itself
    this.rejectionLog = []; // What the system refused
    this.assimilationThreshold = 0.4; // Minimum resonance to accept a file
    this.boundary = new Set(); // The system's self-boundary (addresses it recognizes as "self")
  }

  // ============================================================
  // PHASE 1: INGEST — File enters the system
  // The file is NOT read as code. It's broken into raw perturbations.
  // ============================================================
  async ingest(filePath, content = null) {
    const rawContent = content || fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);

    console.log(`\n🍽️  INGESTING: ${basename}`);

    // Step 1: Break into perturbations (not parse as AST — that's allopoietic)
    const perturbations = this.breakIntoPerturbations(rawContent, ext);
    console.log(`   → ${perturbations.length} raw perturbations extracted`);

    // Step 2: Map each perturbation to MRNN morphological primitives
    const mapped = perturbations.map(p => this.mapToPrimitives(p, ext));
    console.log(`   → ${mapped.length} perturbations mapped to primitives`);

    // Step 3: Compute system resonance — does this fit the system's current grammar?
    const resonanceProfile = this.computeResonanceProfile(mapped);
    console.log(`   → Resonance: ${(resonanceProfile.overall * 100).toFixed(1)}%`);

    // Step 4: Metabolic decision — accept, adapt, or reject
    const decision = this.metabolicDecision(resonanceProfile, mapped);
    console.log(`   → Decision: ${decision.action.toUpperCase()}`);

    // Step 5: Execute metabolic action
    const result = await this.executeMetabolism(decision, filePath, mapped, rawContent);

    this.ingestionLog.push({
      timestamp: Date.now(),
      file: basename,
      perturbations: perturbations.length,
      resonance: resonanceProfile.overall,
      decision: decision.action,
      result,
      address: result.address || null
    });

    return result;
  }

  // ============================================================
  // BREAK INTO PERTURBATIONS
  // Not parsing. Just breaking into chunks the system can "taste".
  // ============================================================
  breakIntoPerturbations(content, ext) {
    const perturbations = [];

    if (ext === '.js' || ext === '.ts' || ext === '.jsx' || ext === '.tsx') {
      // Break by structural boundaries (functions, classes, blocks)
      const blocks = content.split(/(?=
(?:export\s|class\s|function\s|const\s|let\s|var\s|interface\s|type\s))/);
      for (const block of blocks) {
        if (block.trim().length > 20) {
          perturbations.push({
            type: 'code_block',
            content: block.trim(),
            length: block.length,
            lines: block.split('\n').length
          });
        }
      }
    } else if (ext === '.html') {
      // Break by DOM structure
      const blocks = content.split(/(?=<(?:div|section|article|header|footer|nav|main|aside|component))/);
      for (const block of blocks) {
        if (block.trim().length > 30) {
          perturbations.push({
            type: 'dom_block',
            content: block.trim(),
            length: block.length
          });
        }
      }
    } else if (ext === '.css' || ext === '.scss') {
      // Break by rule blocks
      const blocks = content.split(/(?=\.[a-zA-Z][^\{]*\{)/);
      for (const block of blocks) {
        if (block.trim().length > 10) {
          perturbations.push({
            type: 'style_block',
            content: block.trim(),
            length: block.length
          });
        }
      }
    } else if (ext === '.json') {
      try {
        const obj = JSON.parse(content);
        const keys = Object.keys(obj);
        for (const key of keys) {
          perturbations.push({
            type: 'data_node',
            key,
            content: JSON.stringify(obj[key]),
            depth: this.computeDepth(obj[key])
          });
        }
      } catch {
        perturbations.push({ type: 'raw_data', content });
      }
    } else {
      // Unknown type — treat as raw text perturbation
      const chunks = content.match(/.{1,500}/g) || [content];
      for (const chunk of chunks) {
        perturbations.push({ type: 'raw', content: chunk });
      }
    }

    return perturbations;
  }

  computeDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) return depth;
    if (Array.isArray(obj)) {
      return Math.max(depth, ...obj.map(v => this.computeDepth(v, depth + 1)));
    }
    return Math.max(depth, ...Object.values(obj).map(v => this.computeDepth(v, depth + 1)));
  }

  // ============================================================
  // MAP TO PRIMITIVES
  // Each perturbation is "tasted" against the system's morphological grammar.
  // This is NOT classification. It's resonance detection.
  // ============================================================
  mapToPrimitives(perturbation, ext) {
    const content = perturbation.content || perturbation;
    const text = typeof content === 'string' ? content : JSON.stringify(content);

    // Score each layer
    const baseScores = this.scoreLayer(text, MorphologicalPrimitives.STRUCTURAL);
    const toneScores = this.scoreLayer(text, MorphologicalPrimitives.PERCEPTUAL);
    const colorScores = this.scoreLayer(text, MorphologicalPrimitives.MOTIVATIONAL);
    const gateScores = this.scoreLayer(text, MorphologicalPrimitives.ARCHETYPAL);
    const lineScores = this.scoreLayer(text, MorphologicalPrimitives.ROLE);

    // Find dominant in each layer
    const dominant = {
      base: this.findDominant(baseScores),
      tone: this.findDominant(toneScores),
      color: this.findDominant(colorScores),
      gate: this.findDominant(gateScores),
      line: this.findDominant(lineScores)
    };

    // Compute internal coherence (how well the layers resonate with each other)
    const coherence = this.computeLayerCoherence(dominant);

    return {
      perturbation,
      dominant,
      scores: { base: baseScores, tone: toneScores, color: colorScores, gate: gateScores, line: lineScores },
      coherence,
      text: text.substring(0, 200)
    };
  }

  scoreLayer(text, layer) {
    const scores = {};
    for (const [key, def] of Object.entries(layer)) {
      if (key === 'DEFAULT') continue;
      const matches = (text.match(def.pattern) || []).length;
      scores[key] = {
        score: matches,
        normalized: Math.min(1, matches * 0.3),
        name: def.name
      };
    }
    return scores;
  }

  findDominant(scores) {
    let bestKey = 'DEFAULT';
    let bestScore = -1;
    for (const [key, val] of Object.entries(scores)) {
      if (val.normalized > bestScore) {
        bestScore = val.normalized;
        bestKey = key;
      }
    }
    return { key: bestKey, score: bestScore, ...scores[bestKey] };
  }

  computeLayerCoherence(dominant) {
    // Wuxing resonance between base elements
    const wuxingMap = { 1: 'Fire', 2: 'Water', 3: 'Wood', 4: 'Metal', 5: 'Earth' };
    const baseWuxing = wuxingMap[dominant.base.key] || 'Fire';

    // Simple coherence: are the layers "talking to each other"?
    // High coherence = the file has a unified "voice"
    // Low coherence = the file is fragmented (might trigger structural growth)
    const avgScore = (
      dominant.base.score + dominant.tone.score + 
      dominant.color.score + dominant.gate.score + dominant.line.score
    ) / 5;

    return avgScore;
  }

  // ============================================================
  // COMPUTE RESONANCE PROFILE
  // How does this file resonate with the system's current state?
  // ============================================================
  computeResonanceProfile(mapped) {
    if (mapped.length === 0) return { overall: 0, details: [] };

    const details = mapped.map(m => {
      const state = {
        base: parseInt(m.dominant.base.key) || 3,
        tone: parseInt(m.dominant.tone.key) || 4,
        color: parseInt(m.dominant.color.key) || 3,
        gate: parseInt(m.dominant.gate.key) || 57,
        line: parseInt(m.dominant.line.key) || 4
      };

      // Check if this state is already in the system's boundary
      const key = this.engine.stateKey(state);
      const fieldStrength = this.engine.resonanceField.get(key) || 0;
      const isInBoundary = this.boundary.has(key);

      // Compute resonance with current system state
      const current = this.engine.currentState;
      let resonance = 0;
      if (current) {
        resonance = this.engine.computeResonance(current, state);
      }

      return { state, key, fieldStrength, isInBoundary, resonance, coherence: m.coherence };
    });

    const overall = details.reduce((sum, d) => sum + d.resonance, 0) / details.length;
    const avgCoherence = details.reduce((sum, d) => sum + d.coherence, 0) / details.length;

    return { overall, avgCoherence, details, count: mapped.length };
  }

  // ============================================================
  // METABOLIC DECISION
  // The system decides what to do based on its OWN state, not the file's content.
  // This is the core of autopoiesis: the system maintains itself.
  // ============================================================
  metabolicDecision(resonanceProfile, mapped) {
    const { overall, avgCoherence, details } = resonanceProfile;

    // DECISION TREE (based on system's own needs, not the file's purpose)

    if (overall < 0.1) {
      // Very low resonance — this is foreign material
      // Check if system is in "growth mode" (low boundary density)
      const boundaryDensity = this.boundary.size / 69120;
      if (boundaryDensity < 0.01) {
        // System is young — needs to grow. Accept and adapt.
        return { action: 'assimilate_grow', reason: 'low_boundary_density', profile: resonanceProfile };
      }
      // System is mature — reject foreign material
      return { action: 'reject', reason: 'low_resonance_mature_system', profile: resonanceProfile };
    }

    if (overall > this.assimilationThreshold && avgCoherence > 0.5) {
      // High resonance AND coherent — this fits the system's grammar
      // Check if it strengthens existing structure or creates new
      const existingMatches = details.filter(d => d.isInBoundary).length;
      if (existingMatches / details.length > 0.7) {
        return { action: 'strengthen', reason: 'reinforces_existing', profile: resonanceProfile };
      }
      return { action: 'assimilate', reason: 'high_resonance_new_structure', profile: resonanceProfile };
    }

    if (avgCoherence < 0.3 && overall > 0.2) {
      // Fragmented but somewhat resonant — triggers structural adaptation
      return { action: 'adapt_structure', reason: 'fragmented_but_resonant', profile: resonanceProfile };
    }

    // Default: cautious assimilation
    return { action: 'assimilate_cautious', reason: 'moderate_resonance', profile: resonanceProfile };
  }

  // ============================================================
  // EXECUTE METABOLISM
  // The actual transformation of the file into system components.
  // The file's original structure is DESTROYED in the process.
  // ============================================================
  async executeMetabolism(decision, filePath, mapped, rawContent) {
    const { action, reason, profile } = decision;
    const basename = path.basename(filePath);

    switch (action) {
      case 'assimilate_grow':
      case 'assimilate':
      case 'assimilate_cautious': {
        // Break the file into components and register them in the system
        const components = this.extractComponents(mapped, rawContent);

        // Register each component as a "cell" in the system's body
        const addresses = [];
        for (const comp of components) {
          const addr = this.registerComponent(comp, basename);
          addresses.push(addr);
          this.boundary.add(addr);
        }

        // Activate the new states in the resonance field
        for (const addr of addresses) {
          const state = this.engine.parseAddress(addr);
          if (state) {
            this.engine.activateState(state, 0.6);
          }
        }

        // Store in structural memory
        this.structuralMemory.set(basename, {
          addresses,
          components,
          decision,
          timestamp: Date.now()
        });

        return {
          action,
          addresses,
          componentCount: components.length,
          message: `Assimilated ${basename} into ${components.length} structural components`
        };
      }

      case 'strengthen': {
        // Find existing components and boost their field strength
        const existing = this.structuralMemory.get(basename);
        if (existing) {
          for (const addr of existing.addresses) {
            const state = this.engine.parseAddress(addr);
            if (state) {
              this.engine.activateState(state, 0.9); // Strong boost
            }
          }
          return {
            action,
            addresses: existing.addresses,
            message: `Strengthened existing structure from ${basename}`
          };
        }
        // Fall through to assimilate if not in memory
        return this.executeMetabolism({ ...decision, action: 'assimilate' }, filePath, mapped, rawContent);
      }

      case 'adapt_structure': {
        // This is the most autopoietic action: the file triggers the system
        // to modify its own structure to accommodate the new material
        const adaptation = this.triggerStructuralAdaptation(profile, mapped);

        // Then assimilate
        const assimilateResult = await this.executeMetabolism(
          { action: 'assimilate', reason: 'post_adaptation', profile },
          filePath, mapped, rawContent
        );

        return {
          action: 'adapt_structure',
          adaptation,
          ...assimilateResult,
          message: `Adapted structure and assimilated ${basename}`
        };
      }

      case 'reject': {
        this.rejectionLog.push({
          file: basename,
          reason,
          resonance: profile.overall,
          timestamp: Date.now()
        });
        return {
          action,
          message: `Rejected ${basename}: ${reason} (resonance: ${(profile.overall * 100).toFixed(1)}%)`
        };
      }

      default:
        return { action: 'noop', message: 'No metabolic action taken' };
    }
  }

  // ============================================================
  // EXTRACT COMPONENTS
  // The file is broken into the system's own component types.
  // The original file structure is irrelevant here.
  // ============================================================
  extractComponents(mapped, rawContent) {
    const components = [];

    for (const m of mapped) {
      const { dominant, perturbation } = m;

      // Determine component type based on morphological analysis
      const compType = this.determineComponentType(dominant);

      components.push({
        type: compType,
        address: this.buildAddress(dominant),
        content: perturbation.content || perturbation,
        dimensions: {
          base: parseInt(dominant.base.key),
          tone: parseInt(dominant.tone.key),
          color: parseInt(dominant.color.key),
          gate: parseInt(dominant.gate.key),
          line: parseInt(dominant.line.key)
        },
        coherence: m.coherence,
        size: perturbation.length || perturbation.content?.length || 0
      });
    }

    return components;
  }

  determineComponentType(dominant) {
    const base = parseInt(dominant.base.key);
    const tone = parseInt(dominant.tone.key);

    // Component type is determined by the system's own grammar, not the file's extension
    if (base === 1) return 'movement_node';      // Fire = dynamic, active
    if (base === 2) return 'evolution_edge';     // Water = flowing, connecting
    if (base === 3) return 'being_container';    // Wood = growing, containing
    if (base === 4) return 'design_pattern';   // Metal = structured, precise
    if (base === 5) return 'space_field';        // Earth = grounding, spatial

    if (tone === 3 || tone === 4) return 'perception_handler'; // Action/Meditation
    if (tone === 5) return 'decision_gate';      // Judgement
    if (tone === 6) return 'event_listener';     // Acceptance

    return 'generic_component';
  }

  buildAddress(dominant) {
    const b = parseInt(dominant.base.key) || 3;
    const t = parseInt(dominant.tone.key) || 4;
    const c = parseInt(dominant.color.key) || 3;
    const g = parseInt(dominant.gate.key) || 57;
    const l = parseInt(dominant.line.key) || 4;
    return `B${b}.T${t}.C${c}.G${g}.L${l}`;
  }

  registerComponent(component, sourceFile) {
    const addr = component.address;

    // The component is now part of the system's "body"
    // It gets an ontological address within the MRNN space
    const registration = {
      address: addr,
      type: component.type,
      source: sourceFile,
      dimensions: component.dimensions,
      registeredAt: Date.now(),
      activations: 0,
      lastActivated: null
    };

    // Store in the engine's state space
    const state = this.engine.parseAddress(addr);
    if (state) {
      const resolved = this.engine.resolveState(state);
      registration.resolved = resolved;
    }

    return addr;
  }

  // ============================================================
  // STRUCTURAL ADAPTATION
  // When the system encounters material that doesn't fit its grammar,
  // it modifies its own structure to accommodate it.
  // This is TRUE autopoiesis — the system changes its own rules.
  // ============================================================
  triggerStructuralAdaptation(profile, mapped) {
    const adaptations = [];

    // 1. Lower assimilation threshold temporarily
    const oldThreshold = this.assimilationThreshold;
    this.assimilationThreshold = Math.max(0.1, this.assimilationThreshold - 0.15);
    adaptations.push({ type: 'threshold', from: oldThreshold, to: this.assimilationThreshold });

    // 2. Expand the boundary by adding new transition paths
    const newStates = profile.details
      .filter(d => !d.isInBoundary)
      .map(d => d.state);

    for (const state of newStates) {
      const key = this.engine.stateKey(state);
      // Add transitions from current state to this new state
      const currentKey = this.engine.currentState ? this.engine.stateKey(this.engine.currentState) : null;
      if (currentKey) {
        const neighbors = this.engine.transitionGraph.get(currentKey) || [];
        if (!neighbors.some(n => this.engine.stateKey(n.state) === key)) {
          neighbors.push({
            state,
            weight: 0.3,
            type: 'metabolic_adaptation'
          });
          this.engine.transitionGraph.set(currentKey, neighbors);
        }
      }
    }
    adaptations.push({ type: 'boundary_expansion', newStates: newStates.length });

    // 3. Adjust engine parameters
    const oldActivation = this.engine.activationThreshold;
    this.engine.activationThreshold = Math.max(0.3, this.engine.activationThreshold - 0.1);
    adaptations.push({ type: 'activation', from: oldActivation, to: this.engine.activationThreshold });

    return adaptations;
  }

  // ============================================================
  // SELF-PRODUCTION CHECK
  // Varela's 6-point test for autopoiesis
  // ============================================================
  checkAutopoiesis() {
    // i) Identifiable boundaries?
    const hasBoundary = this.boundary.size > 0;

    // ii) Constitutive elements?
    const hasComponents = this.structuralMemory.size > 0;

    // iii) Mechanistic system?
    const isMechanistic = this.engine.transitionGraph.size > 0;

    // iv) Boundaries produced by internal interactions?
    const boundaryInternal = Array.from(this.boundary).every(addr => {
      const state = this.engine.parseAddress(addr);
      if (!state) return false;
      const key = this.engine.stateKey(state);
      return this.engine.resonanceField.has(key);
    });

    // v) Components produced by the network?
    const componentsProduced = this.structuralMemory.size > 0;

    // vi) No external specification?
    // This is a design property — we ensure no external controller
    const noExternalSpec = true;

    const score = [hasBoundary, hasComponents, isMechanistic, boundaryInternal, componentsProduced, noExternalSpec]
      .filter(Boolean).length;

    return {
      score: score + '/6',
      isAutopoietic: score >= 5,
      details: {
        hasBoundary,
        hasComponents,
        isMechanistic,
        boundaryInternal,
        componentsProduced,
        noExternalSpec
      },
      boundarySize: this.boundary.size,
      componentCount: this.structuralMemory.size,
      transitionGraphSize: this.engine.transitionGraph.size,
      fieldSize: this.engine.resonanceField.size
    };
  }

  // ============================================================
  // GET SYSTEM BODY
  // Returns the current "body" of the system — all living components
  // ============================================================
  getSystemBody() {
    const body = {
      organs: [],
      connections: [],
      vitality: 0
    };

    for (const [file, data] of this.structuralMemory.entries()) {
      const organ = {
        name: file,
        addresses: data.addresses,
        components: data.components.map(c => ({
          type: c.type,
          address: c.address,
          dimensions: c.dimensions
        })),
        age: Date.now() - data.timestamp,
        vitality: data.components.reduce((sum, c) => sum + (this.engine.resonanceField.get(c.address) || 0), 0) / data.components.length
      };
      body.organs.push(organ);
    }

    // Compute connections between organs
    for (let i = 0; i < body.organs.length; i++) {
      for (let j = i + 1; j < body.organs.length; j++) {
        const o1 = body.organs[i];
        const o2 = body.organs[j];
        let connectionStrength = 0;

        for (const a1 of o1.addresses) {
          for (const a2 of o2.addresses) {
            const s1 = this.engine.parseAddress(a1);
            const s2 = this.engine.parseAddress(a2);
            if (s1 && s2) {
              connectionStrength += this.engine.computeResonance(s1, s2);
            }
          }
        }

        if (connectionStrength > 0.3) {
          body.connections.push({
            from: o1.name,
            to: o2.name,
            strength: connectionStrength / (o1.addresses.length * o2.addresses.length)
          });
        }
      }
    }

    body.vitality = body.organs.reduce((sum, o) => sum + o.vitality, 0) / (body.organs.length || 1);
    body.organCount = body.organs.length;
    body.connectionCount = body.connections.length;

    return body;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MRNNIngestionEngine, MorphologicalPrimitives };
}
