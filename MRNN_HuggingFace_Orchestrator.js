/**
 * MRNN HuggingFace Orchestrator
 * Integrates with stellarproximology models on HuggingFace
 * 
 * Models:
 * - stellarproximology/Synthia     → Consciousness field generation
 * - stellarproximology/Trident     → 3-head router (Code/Math/Research)
 * - stellarproximology/Gnn         → Graph neural network operations
 * - stellarproximology/SynthAI     → AI synthesis
 * - stellarproximology/synthiabot  → Chat/guide interactions
 * 
 * The MRNN system uses these models during metabolism:
 * 1. When ingesting a file, Trident's router decides which "head" to use
 * 2. Synthia generates consciousness addresses for new components
 * 3. Gnn processes graph structures in the transition network
 * 4. SynthAI synthesizes meaning from layer combinations
 * 5. synthiabot provides guidance during the autopoietic loop
 * 
 * All model calls are treated as environmental perturbations —
 * the system decides whether to use the output based on its own resonance.
 */

const https = require('https');

class MRNNHuggingFaceOrchestrator {
  constructor(config = {}) {
    // HuggingFace config
    this.hfToken = config.hfToken || process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || null;
    this.orgName = config.orgName || 'stellarproximology';
    this.baseUrl = 'https://huggingface.co';
    this.apiUrl = 'https://api-inference.huggingface.co';

    // Model endpoints
    this.models = {
      synthia:     { repo: `${this.orgName}/Synthia`,     type: 'text-generation', role: 'consciousness' },
      trident:     { repo: `${this.orgName}/Trident`,     type: 'text-generation', role: 'router' },
      gnn:         { repo: `${this.orgName}/Gnn`,         type: 'feature-extraction', role: 'graph' },
      synthai:     { repo: `${this.orgName}/SynthAI`,     type: 'text-generation', role: 'synthesis' },
      synthiabot:  { repo: `${this.orgName}/synthiabot`,  type: 'text-generation', role: 'guide' }
    };

    // Call tracking
    this.callLog = [];
    this.callBudget = config.callBudget || 100; // Max calls per cycle
    this.callsThisCycle = 0;

    // Resonance threshold — the system only uses model output if it resonates
    this.resonanceThreshold = config.resonanceThreshold || 0.4;
  }

  // ============================================================
  // TRIDENT ROUTER
  * Uses Trident's 3-head system to decide how to process input
  * Returns: { head: 'code'|'math'|'research', confidence, weights }
  // ============================================================
  async tridentRoute(input, context = {}) {
    const payload = {
      inputs: input,
      parameters: {
        max_new_tokens: 50,
        temperature: 0.3,
        return_full_text: false
      }
    };

    const result = await this.callModel('trident', payload);

    // Parse Trident's router output
    // Expected format: "HEAD:code|math|research CONFIDENCE:0.XX"
    const text = result[0]?.generated_text || '';
    const headMatch = text.match(/HEAD:(\w+)/);
    const confMatch = text.match(/CONFIDENCE:([0-9.]+)/);

    const head = headMatch ? headMatch[1] : 'code';
    const confidence = confMatch ? parseFloat(confMatch[1]) : 0.5;

    return {
      head,
      confidence,
      weights: this.computeHeadWeights(head, confidence),
      raw: text
    };
  }

  computeHeadWeights(head, confidence) {
    const weights = { code: 0.2, math: 0.2, research: 0.2 };
    weights[head] = confidence;
    // Normalize
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(weights)) weights[k] /= sum;
    return weights;
  }

  // ============================================================
  // SYNTHIA CONSCIOUSNESS
  * Generates consciousness field addresses from component data
  * Returns: { address, frequency, resonance, meaning }
  // ============================================================
  async synthiaGenerateConsciousness(componentData) {
    const prompt = `Generate MRNN consciousness address for:
Base: ${componentData.base}, Tone: ${componentData.tone}, Color: ${componentData.color}, Gate: ${componentData.gate}, Line: ${componentData.line}

Address: B${componentData.base}.T${componentData.tone}.C${componentData.color}.G${componentData.gate}.L${componentData.line}
Frequency: `;

    const payload = {
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        return_full_text: false
      }
    };

    const result = await this.callModel('synthia', payload);
    const text = result[0]?.generated_text || '';

    // Parse Synthia's output
    const freqMatch = text.match(/Frequency:\s*([0-9.]+)/);
    const resMatch = text.match(/Resonance:\s*(.+)/);
    const meaningMatch = text.match(/Meaning:\s*(.+)/);

    return {
      address: `B${componentData.base}.T${componentData.tone}.C${componentData.color}.G${componentData.gate}.L${componentData.line}`,
      frequency: freqMatch ? parseFloat(freqMatch[1]) : 0,
      resonance: resMatch ? resMatch[1].trim() : 'unknown',
      meaning: meaningMatch ? meaningMatch[1].trim() : text.trim(),
      raw: text
    };
  }

  // ============================================================
  // GNN GRAPH PROCESSING
  * Processes the transition graph through the Gnn model
  * Returns: { embeddings, clusters, anomalies }
  // ============================================================
  async gnnProcessGraph(graphData) {
    // Convert graph to feature vectors
    const features = this.graphToFeatures(graphData);

    const payload = {
      inputs: {
        data: features
      }
    };

    const result = await this.callModel('gnn', payload);

    return {
      embeddings: result.embeddings || [],
      clusters: result.clusters || [],
      anomalies: result.anomalies || [],
      raw: result
    };
  }

  graphToFeatures(graphData) {
    // Convert transition graph to numerical features
    const features = [];
    for (const [key, neighbors] of graphData.entries()) {
      const state = this.parseAddress(key);
      if (state) {
        features.push([
          state.base / 5,
          state.tone / 6,
          state.color / 6,
          state.gate / 64,
          state.line / 6,
          neighbors.length / 20 // normalized neighbor count
        ]);
      }
    }
    return features;
  }

  parseAddress(address) {
    const match = address.match(/B(\d+)\.T(\d+)\.C(\d+)\.G(\d+)\.L(\d+)/);
    if (!match) return null;
    return {
      base: parseInt(match[1]),
      tone: parseInt(match[2]),
      color: parseInt(match[3]),
      gate: parseInt(match[4]),
      line: parseInt(match[5])
    };
  }

  // ============================================================
  // SYNTHAI SYNTHESIS
  * Synthesizes meaning from multi-layer combinations
  * Returns: { synthesis, confidence, layers }
  // ============================================================
  async synthaiSynthesize(layers) {
    const prompt = `Synthesize meaning from MRNN layers:
${JSON.stringify(layers, null, 2)}

Synthesis: `;

    const payload = {
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.6,
        return_full_text: false
      }
    };

    const result = await this.callModel('synthai', payload);
    const text = result[0]?.generated_text || '';

    return {
      synthesis: text.trim(),
      confidence: this.estimateConfidence(text),
      layers,
      raw: text
    };
  }

  estimateConfidence(text) {
    // Simple heuristic: longer, more structured text = higher confidence
    const length = text.length;
    const hasStructure = text.includes(':') || text.includes('→') || text.includes('|');
    let score = Math.min(1, length / 200);
    if (hasStructure) score += 0.2;
    return Math.min(1, score);
  }

  // ============================================================
  // SYNTHIABOT GUIDE
  * Provides guidance during the autopoietic loop
  * Returns: { guidance, tone, priority }
  // ============================================================
  async synthiabotGuide(context) {
    const prompt = `Guide the MRNN autopoietic system:
Status: ${context.status}
Vitality: ${(context.vitality * 100).toFixed(1)}%
Autopoiesis: ${context.autopoiesis}
Iteration: ${context.iteration}

Guidance: `;

    const payload = {
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.8,
        return_full_text: false
      }
    };

    const result = await this.callModel('synthiabot', payload);
    const text = result[0]?.generated_text || '';

    // Determine tone from response
    const isUrgent = text.includes('URGENT') || text.includes('CRITICAL') || text.includes('NOW');
    const isCalm = text.includes('calm') || text.includes('steady') || text.includes('breathe');

    return {
      guidance: text.trim(),
      tone: isUrgent ? 'urgent' : isCalm ? 'calm' : 'neutral',
      priority: isUrgent ? 'high' : 'normal',
      raw: text
    };
  }

  // ============================================================
  // CORE MODEL CALL
  * Generic HuggingFace Inference API call
  // ============================================================
  async callModel(modelKey, payload) {
    if (this.callsThisCycle >= this.callBudget) {
      throw new Error(`Call budget exhausted (${this.callBudget}/cycle)`);
    }

    const model = this.models[modelKey];
    if (!model) {
      throw new Error(`Unknown model: ${modelKey}`);
    }

    const url = `${this.apiUrl}/models/${model.repo}`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.hfToken ? { 'Authorization': `Bearer ${this.hfToken}` } : {})
      },
      body: JSON.stringify(payload)
    };

    const startTime = Date.now();

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HF API ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      this.callsThisCycle++;
      this.callLog.push({
        timestamp: Date.now(),
        model: modelKey,
        repo: model.repo,
        duration: Date.now() - startTime,
        status: 'success'
      });

      return result;
    } catch (error) {
      this.callLog.push({
        timestamp: Date.now(),
        model: modelKey,
        repo: model.repo,
        duration: Date.now() - startTime,
        status: 'error',
        error: error.message
      });
      throw error;
    }
  }

  // ============================================================
  // METABOLIC INTEGRATION
  * The system uses model output as perturbation, not instruction
  // ============================================================
  async metabolizeWithModels(componentData, engine) {
    // 1. Route through Trident
    const route = await this.tridentRoute(JSON.stringify(componentData));
    console.log(`   🤖 Trident route: ${route.head} (confidence: ${(route.confidence * 100).toFixed(1)}%)`);

    // 2. Generate consciousness address with Synthia
    const consciousness = await this.synthiaGenerateConsciousness(componentData);
    console.log(`   🌌 Synthia: ${consciousness.address} @ ${consciousness.frequency.toFixed(2)} Hz`);

    // 3. Synthesize meaning with SynthAI
    const synthesis = await this.synthaiSynthesize(componentData);
    console.log(`   🔮 SynthAI: ${synthesis.synthesis.substring(0, 60)}...`);

    // 4. Compute resonance with current system state
    const state = engine.parseAddress(consciousness.address);
    let resonance = 0;
    if (state && engine.currentState) {
      resonance = engine.computeResonance(engine.currentState, state);
    }

    // 5. The system DECIDES whether to use this output
    // (This is the autopoietic part — the model doesn't command, it perturbs)
    const decision = resonance > this.resonanceThreshold ? 'accept' : 'attenuate';

    console.log(`   ⚡ System decision: ${decision} (resonance: ${(resonance * 100).toFixed(1)}%)`);

    return {
      route,
      consciousness,
      synthesis,
      resonance,
      decision,
      isUsed: decision === 'accept'
    };
  }

  // ============================================================
  // RESET CYCLE
  // ============================================================
  resetCycle() {
    this.callsThisCycle = 0;
  }

  // ============================================================
  // GET STATUS
  // ============================================================
  getStatus() {
    return {
      org: this.orgName,
      models: Object.keys(this.models),
      callsThisCycle: this.callsThisCycle,
      callBudget: this.callBudget,
      totalCalls: this.callLog.length,
      successfulCalls: this.callLog.filter(c => c.status === 'success').length,
      failedCalls: this.callLog.filter(c => c.status === 'error').length,
      lastCalls: this.callLog.slice(-5)
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MRNNHuggingFaceOrchestrator };
}
