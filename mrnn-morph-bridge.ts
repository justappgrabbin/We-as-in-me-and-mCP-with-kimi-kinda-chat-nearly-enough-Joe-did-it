// ============================================================================
// mrnn-morph-bridge.ts - MRNN Morphing Visualizer Bridge
// ============================================================================
// Real-time bridge between MRNN inference engine and morphing visualizer.
// Transforms layer activations, graph topology, and astrological coordinates
// into visual parameters for the EmbodiedWorld / HumanAgent visualizer.
// ============================================================================

import { EventEmitter } from 'events';
import WebSocket from 'ws';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MorphBridgeConfig {
  engineUrl: string;
  visualizerUrl: string;
  updateInterval: number;
  smoothingFactor: number;
  enableAstrologicalMapping: boolean;
  enableResonanceVisualization: boolean;
  colorPalette: 'teal-purple' | 'original' | 'custom';
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export interface LayerMorphState {
  id: string;
  dimension: number;
  color: string;
  tone: string;
  base: string;
  activation: number; // 0-1
  convergence: number; // 0-1
  gate: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  scale: number;
  rotation: number;
  opacity: number;
  pulsePhase: number;
  messageCount: number;
  contextLoad: number; // 0-1
}

export interface GraphMorphState {
  edges: {
    from: string;
    to: string;
    weight: number;
    active: boolean;
    messageFlow: number; // 0-1
    resonance: number; // 0-1
  }[];
  topology: string;
  iteration: number;
  totalMessages: number;
  convergence: number;
}

export interface AstroMorphState {
  sign: string;
  degree: number;
  house: number;
  siderealTime: number;
  color: string;
  phase: number; // 0-1 cycle position
  influence: number; // 0-1 strength
}

export interface FullMorphState {
  layers: LayerMorphState[];
  graph: GraphMorphState;
  astro: AstroMorphState;
  timestamp: number;
  inferenceActive: boolean;
  growthEvents: any[];
}

export interface VisualParameter {
  name: string;
  value: number;
  min: number;
  max: number;
  target: number;
  velocity: number;
}

// ============================================================================
// MORPH PARAMETER ENGINE
// ============================================================================

class MorphParameterEngine {
  private parameters: Map<string, VisualParameter> = new Map();
  private smoothingFactor: number;

  constructor(smoothingFactor: number) {
    this.smoothingFactor = smoothingFactor;
  }

  register(name: string, initial: number, min: number, max: number): void {
    this.parameters.set(name, {
      name,
      value: initial,
      min,
      max,
      target: initial,
      velocity: 0
    });
  }

  setTarget(name: string, target: number): void {
    const param = this.parameters.get(name);
    if (param) {
      param.target = Math.max(param.min, Math.min(param.max, target));
    }
  }

  update(): void {
    for (const param of this.parameters.values()) {
      // Spring-damper smoothing
      const diff = param.target - param.value;
      param.velocity += diff * 0.1;
      param.velocity *= this.smoothingFactor;
      param.value += param.velocity;

      // Clamp
      param.value = Math.max(param.min, Math.min(param.max, param.value));
    }
  }

  get(name: string): number {
    return this.parameters.get(name)?.value || 0;
  }

  getAll(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [name, param] of this.parameters) {
      result[name] = param.value;
    }
    return result;
  }
}

// ============================================================================
# ASTROLOGICAL COLOR MAPPER
# ============================================================================

class AstroColorMapper {
  private signColors: Record<string, { r: number; g: number; b: number }> = {
    'Aries': { r: 255, g: 0, b: 0 },
    'Taurus': { r: 0, g: 255, b: 0 },
    'Gemini': { r: 255, g: 255, b: 0 },
    'Cancer': { r: 192, g: 192, b: 192 },
    'Leo': { r: 255, g: 165, b: 0 },
    'Virgo': { r: 128, g: 128, b: 0 },
    'Libra': { r: 255, g: 192, b: 203 },
    'Scorpio': { r: 128, g: 0, b: 128 },
    'Sagittarius': { r: 128, g: 0, b: 128 },
    'Capricorn': { r: 0, g: 128, b: 128 },
    'Aquarius': { r: 0, g: 255, b: 255 },
    'Pisces': { r: 0, g: 0, b: 255 }
  };

  private toneColors: Record<string, { r: number; g: number; b: number }> = {
    'active': { r: 255, g: 100, b: 100 },
    'passive': { r: 100, g: 100, b: 255 },
    'neutral': { r: 100, g: 255, b: 100 }
  };

  private baseColors: Record<string, { r: number; g: number; b: number }> = {
    'physical': { r: 255, g: 0, b: 0 },
    'emotional': { r: 255, g: 165, b: 0 },
    'mental': { r: 255, g: 255, b: 0 },
    'spiritual': { r: 0, g: 255, b: 0 },
    'quantum': { r: 0, g: 0, b: 255 }
  };

  getSignColor(sign: string): string {
    const c = this.signColors[sign] || { r: 128, g: 128, b: 128 };
    return `rgb(${c.r},${c.g},${c.b})`;
  }

  getToneColor(tone: string): string {
    const c = this.toneColors[tone] || { r: 128, g: 128, b: 128 };
    return `rgb(${c.r},${c.g},${c.b})`;
  }

  getBaseColor(base: string): string {
    const c = this.baseColors[base] || { r: 128, g: 128, b: 128 };
    return `rgb(${c.r},${c.g},${c.b})`;
  }

  blendColors(colors: string[], weights: number[]): string {
    let r = 0, g = 0, b = 0, totalWeight = 0;

    for (let i = 0; i < colors.length; i++) {
      const match = colors[i].match(/rgb\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const weight = weights[i] || 1;
        r += parseInt(match[1]) * weight;
        g += parseInt(match[2]) * weight;
        b += parseInt(match[3]) * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight > 0) {
      r /= totalWeight;
      g /= totalWeight;
      b /= totalWeight;
    }

    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  }

  // Teal-Purple palette override
  getTealPurplePalette(): { primary: string; secondary: string; accent: string; background: string } {
    return {
      primary: '#2dd4bf',    // teal-400
      secondary: '#a78bfa', // violet-400
      accent: '#f472b6',    // pink-400
      background: '#0f172a' // slate-900
    };
  }
}

// ============================================================================
// MORPH BRIDGE
// ============================================================================

export class MorphBridge {
  private config: MorphBridgeConfig;
  private engineWs?: WebSocket;
  private visualizerWs?: WebSocket;
  private parameterEngine: MorphParameterEngine;
  private colorMapper: AstroColorMapper;
  private eventEmitter = new EventEmitter();
  private currentState: FullMorphState | null = null;
  private updateTimer?: NodeJS.Timer;
  private isRunning = false;

  constructor(config: MorphBridgeConfig) {
    this.config = config;
    this.parameterEngine = new MorphParameterEngine(config.smoothingFactor);
    this.colorMapper = new AstroColorMapper();

    // Register visual parameters
    this.registerParameters();
  }

  private registerParameters(): void {
    // Layer parameters
    for (let i = 1; i <= 5; i++) {
      this.parameterEngine.register(`layer-${i}-x`, 0, -500, 500);
      this.parameterEngine.register(`layer-${i}-y`, 0, -500, 500);
      this.parameterEngine.register(`layer-${i}-z`, 0, -200, 200);
      this.parameterEngine.register(`layer-${i}-scale`, 1, 0.1, 3);
      this.parameterEngine.register(`layer-${i}-rotation`, 0, 0, 360);
      this.parameterEngine.register(`layer-${i}-opacity`, 0.8, 0, 1);
      this.parameterEngine.register(`layer-${i}-pulse`, 0, 0, 1);
    }

    // Graph parameters
    this.parameterEngine.register('graph-convergence', 0, 0, 1);
    this.parameterEngine.register('graph-message-flow', 0, 0, 1);
    this.parameterEngine.register('graph-resonance', 0, 0, 1);

    // Astro parameters
    this.parameterEngine.register('astro-phase', 0, 0, 1);
    this.parameterEngine.register('astro-influence', 0.5, 0, 1);
  }

  async connect(): Promise<void> {
    // Connect to MRNN engine
    this.engineWs = new WebSocket(this.config.engineUrl);

    this.engineWs.on('open', () => {
      console.log('[MorphBridge] Connected to MRNN engine');
      this.isRunning = true;
      this.startUpdateLoop();
    });

    this.engineWs.on('message', (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleEngineMessage(msg);
      } catch (e) {
        console.error('[MorphBridge] Invalid message:', e);
      }
    });

    this.engineWs.on('error', (err) => {
      console.error('[MorphBridge] Engine connection error:', err);
    });

    this.engineWs.on('close', () => {
      console.log('[MorphBridge] Engine connection closed');
      this.isRunning = false;
    });

    // Connect to visualizer
    this.visualizerWs = new WebSocket(this.config.visualizerUrl);

    this.visualizerWs.on('open', () => {
      console.log('[MorphBridge] Connected to visualizer');
    });

    this.visualizerWs.on('error', (err) => {
      console.error('[MorphBridge] Visualizer connection error:', err);
    });
  }

  private handleEngineMessage(msg: any): void {
    switch (msg.type) {
      case 'layer_update':
        this.updateLayerState(msg.data);
        break;
      case 'graph_update':
        this.updateGraphState(msg.data);
        break;
      case 'astro_update':
        this.updateAstroState(msg.data);
        break;
      case 'inference_complete':
        this.handleInferenceComplete(msg.data);
        break;
      case 'growth_event':
        this.handleGrowthEvent(msg.data);
        break;
    }
  }

  private updateLayerState(data: any): void {
    const layerId = data.id;
    const dim = data.dimension;

    // Calculate position based on dimension and astrological gate
    const angle = (dim - 1) * 72 + (data.gate / 64) * 360;
    const radius = 200 + data.activation * 100;

    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    const z = (dim - 3) * 50 + data.convergence * 30;

    this.parameterEngine.setTarget(`${layerId}-x`, x);
    this.parameterEngine.setTarget(`${layerId}-y`, y);
    this.parameterEngine.setTarget(`${layerId}-z`, z);
    this.parameterEngine.setTarget(`${layerId}-scale`, 0.5 + data.activation * 2);
    this.parameterEngine.setTarget(`${layerId}-rotation`, angle + data.activation * 90);
    this.parameterEngine.setTarget(`${layerId}-opacity`, 0.3 + data.activation * 0.7);
    this.parameterEngine.setTarget(`${layerId}-pulse`, data.activation);
  }

  private updateGraphState(data: any): void {
    this.parameterEngine.setTarget('graph-convergence', data.convergence || 0);
    this.parameterEngine.setTarget('graph-message-flow', data.totalMessages / 100);
    this.parameterEngine.setTarget('graph-resonance', 
      data.edges.reduce((s: number, e: any) => s + e.resonance, 0) / (data.edges.length || 1)
    );
  }

  private updateAstroState(data: any): void {
    const phase = (data.degree % 30) / 30;
    const influence = (13 - data.house) / 12;

    this.parameterEngine.setTarget('astro-phase', phase);
    this.parameterEngine.setTarget('astro-influence', influence);
  }

  private handleInferenceComplete(data: any): void {
    // Trigger visual pulse on inference completion
    const trace = data.layerTrace || [];

    for (const layerId of trace) {
      this.parameterEngine.setTarget(`${layerId}-pulse`, 1);

      // Decay pulse over time
      setTimeout(() => {
        this.parameterEngine.setTarget(`${layerId}-pulse`, 0);
      }, 500);
    }

    this.emit('inference_pulse', { trace, duration: data.generationTime });
  }

  private handleGrowthEvent(data: any): void {
    // Visualize growth events as expansion
    this.emit('growth_pulse', data);
  }

  private startUpdateLoop(): void {
    this.updateTimer = setInterval(() => {
      this.tick();
    }, this.config.updateInterval);
  }

  private tick(): void {
    // Update all parameters
    this.parameterEngine.update();

    // Build full morph state
    const state = this.buildMorphState();
    this.currentState = state;

    // Send to visualizer
    this.sendToVisualizer(state);

    // Emit update event
    this.emit('state_update', state);
  }

  private buildMorphState(): FullMorphState {
    const params = this.parameterEngine.getAll();
    const palette = this.config.colorPalette === 'teal-purple' 
      ? this.colorMapper.getTealPurplePalette()
      : null;

    const layers: LayerMorphState[] = [];
    for (let i = 1; i <= 5; i++) {
      const layerId = `layer-${i}`;
      layers.push({
        id: layerId,
        dimension: i,
        color: palette?.primary || this.colorMapper.getBaseColor(this.getBaseForDimension(i)),
        tone: i % 2 === 0 ? 'passive' : 'active',
        base: this.getBaseForDimension(i),
        activation: params[`${layerId}-pulse`],
        convergence: params['graph-convergence'],
        gate: i * 10,
        position: {
          x: params[`${layerId}-x`],
          y: params[`${layerId}-y`],
          z: params[`${layerId}-z`]
        },
        scale: params[`${layerId}-scale`],
        rotation: params[`${layerId}-rotation`],
        opacity: params[`${layerId}-opacity`],
        pulsePhase: params[`${layerId}-pulse`],
        messageCount: 0,
        contextLoad: 0
      });
    }

    return {
      layers,
      graph: {
        edges: [],
        topology: 'resonance',
        iteration: 0,
        totalMessages: 0,
        convergence: params['graph-convergence']
      },
      astro: {
        sign: 'Aries',
        degree: params['astro-phase'] * 30,
        house: Math.floor(params['astro-influence'] * 12) + 1,
        siderealTime: 0,
        color: palette?.secondary || '#a78bfa',
        phase: params['astro-phase'],
        influence: params['astro-influence']
      },
      timestamp: Date.now(),
      inferenceActive: params['graph-message-flow'] > 0.1,
      growthEvents: []
    };
  }

  private getBaseForDimension(dim: number): string {
    const bases = ['physical', 'emotional', 'mental', 'spiritual', 'quantum'];
    return bases[dim - 1] || 'physical';
  }

  private sendToVisualizer(state: FullMorphState): void {
    if (this.visualizerWs?.readyState === WebSocket.OPEN) {
      this.visualizerWs.send(JSON.stringify({
        type: 'morph_update',
        data: state
      }));
    }
  }

  getCurrentState(): FullMorphState | null {
    return this.currentState;
  }

  getParameters(): Record<string, number> {
    return this.parameterEngine.getAll();
  }

  on(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.on(event, handler);
  }

  private emit(event: string, data: any): void {
    this.eventEmitter.emit(event, data);
  }

  async disconnect(): Promise<void> {
    this.isRunning = false;

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.engineWs?.close();
    this.visualizerWs?.close();

    console.log('[MorphBridge] Disconnected');
  }
}

// ============================================================================
// REACT HOOK FOR MORPH STATE
// ============================================================================

export function useMRNNMorphState(bridge: MorphBridge) {
  const [state, setState] = React.useState<FullMorphState | null>(null);
  const [parameters, setParameters] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const handleUpdate = (newState: FullMorphState) => {
      setState(newState);
      setParameters(bridge.getParameters());
    };

    bridge.on('state_update', handleUpdate);

    return () => {
      // Cleanup handled by bridge disconnect
    };
  }, [bridge]);

  return { state, parameters };
}

// ============================================================================
// VISUALIZER MESSAGE FORMATTER
// ============================================================================

export class VisualizerMessageFormatter {
  static formatForEmbodiedWorld(state: FullMorphState): any {
    return {
      type: 'mrnn_state',
      layers: state.layers.map(l => ({
        id: l.id,
        position: [l.position.x, l.position.y, l.position.z],
        scale: l.scale,
        rotation: l.rotation,
        color: l.color,
        opacity: l.opacity,
        pulse: l.pulsePhase,
        dimension: l.dimension,
        gate: l.gate
      })),
      connections: state.graph.edges.map(e => ({
        from: e.from,
        to: e.to,
        weight: e.weight,
        active: e.active,
        flow: e.messageFlow
      })),
      astro: {
        sign: state.astro.sign,
        phase: state.astro.phase,
        influence: state.astro.influence,
        color: state.astro.color
      },
      meta: {
        inferenceActive: state.inferenceActive,
        timestamp: state.timestamp
      }
    };
  }

  static formatForHumanAgent(state: FullMorphState): any {
    // Format for HumanAgent.tsx body representation
    const dominantLayer = state.layers.reduce((a, b) => a.activation > b.activation ? a : b);

    return {
      bodyState: {
        center: dominantLayer.base,
        gate: dominantLayer.gate,
        dimension: dominantLayer.dimension,
        activation: dominantLayer.activation,
        color: dominantLayer.color
      },
      aura: {
        layers: state.layers.map(l => ({
          dimension: l.dimension,
          intensity: l.activation,
          color: l.color,
          convergence: l.convergence
        })),
        resonance: state.graph.convergence
      },
      astrological: {
        sign: state.astro.sign,
        house: state.astro.house,
        phase: state.astro.phase,
        influence: state.astro.influence
      }
    };
  }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

export async function main(): Promise<void> {
  const config: MorphBridgeConfig = {
    engineUrl: 'ws://127.0.0.1:18081',
    visualizerUrl: 'ws://127.0.0.1:3001',
    updateInterval: 50, // 20fps
    smoothingFactor: 0.85,
    enableAstrologicalMapping: true,
    enableResonanceVisualization: true,
    colorPalette: 'teal-purple'
  };

  const bridge = new MorphBridge(config);

  bridge.on('state_update', (state: FullMorphState) => {
    const params = bridge.getParameters();
    console.log(`[Morph] Layer-3 scale: ${params['layer-3-scale'].toFixed(2)}, Convergence: ${params['graph-convergence'].toFixed(2)}`);
  });

  bridge.on('inference_pulse', (data: any) => {
    console.log(`[Morph] Inference pulse: trace=[${data.trace.join('->')}], duration=${data.duration}ms`);
  });

  try {
    await bridge.connect();

    // Keep running
    process.on('SIGINT', async () => {
      console.log('\n[MorphBridge] Shutting down...');
      await bridge.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('[MorphBridge] Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
