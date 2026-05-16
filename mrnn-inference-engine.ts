// ============================================================================
// mrnn-inference-engine.ts - MRNN Inference Engine v1.0.0
// ============================================================================

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { WebSocketServer, WebSocket } from 'ws';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MRNNConfig {
  layers: LayerConfig[];
  graphTopology: GraphTopologyConfig;
  inference: InferenceConfig;
  mcp: MCPConfig;
  openai: OpenAICompatConfig;
  autopoietic: AutopoieticConfig;
  models: ModelRegistryConfig;
}

export interface LayerConfig {
  id: string;
  name: string;
  dimension: number; // 1-5
  color: string;
  tone: string;
  base: string;
  degree: number;
  minute: number;
  second: number;
  modelId: string;
  contextSize: number;
  temperature: number;
  topP: number;
  specialization: string[];
  astrologicalGate: number;
  channelMappings: ChannelMapping[];
  adapterType: 'dense' | 'sparse' | 'morph' | 'resonance';
}

export interface ChannelMapping {
  gate: number;
  line: number;
  color: string;
  tone: string;
  base: string;
  targetLayer: string;
  weight: number;
}

export interface GraphTopologyConfig {
  messagePassing: 'synchronous' | 'asynchronous' | 'wave';
  recursionDepth: number;
  convergenceThreshold: number;
  maxIterations: number;
  edgeWeights: 'static' | 'dynamic' | 'learned';
  topologyType: 'dag' | 'cyclic' | 'hypergraph' | 'resonance';
}

export interface InferenceConfig {
  backend: 'llama.cpp' | 'webgpu' | 'pyodide' | 'hybrid';
  llamaCppPath: string;
  gpuLayers: number;
  flashAttention: boolean;
  cacheTypeK: 'f16' | 'f32' | 'q4_0' | 'q8_0';
  cacheTypeV: 'f16' | 'f32' | 'q4_0' | 'q8_0';
  batchSize: number;
  threads: number;
  reasoningMode: boolean;
}

export interface MCPConfig {
  enabled: boolean;
  serverName: string;
  serverVersion: string;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  transport: 'stdio' | 'sse' | 'websocket';
  port: number;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: object;
  handler: string; // reference to handler function name
  layerAffinity?: string[];
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  handler: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments: { name: string; description: string; required: boolean }[];
  handler: string;
}

export interface OpenAICompatConfig {
  enabled: boolean;
  port: number;
  host: string;
  modelMapping: Record<string, string>;
}

export interface AutopoieticConfig {
  enabled: boolean;
  growthThreshold: number;
  capabilityExtraction: boolean;
  subsystemSpawning: boolean;
  ruleEvolution: boolean;
  domainAgentCreation: boolean;
  memoryPath: string;
}

export interface ModelRegistryConfig {
  models: ModelEntry[];
  defaultModel: string;
  modelPath: string;
}

export interface ModelEntry {
  id: string;
  name: string;
  ggufPath: string;
  sizeGB: number;
  parameters: string;
  quantization: string;
  contextSize: number;
  specialization: string[];
  layerAssignments: string[];
  reasoningCapable: boolean;
}

export interface MessagePacket {
  id: string;
  sourceLayer: string;
  targetLayer: string;
  content: string;
  tokens: number[];
  embedding: number[];
  metadata: {
    timestamp: number;
    iteration: number;
    gate: number;
    line: number;
    color: string;
    tone: string;
    base: string;
    confidence: number;
    astrologicalCoord: AstrologicalCoordinate;
  };
  trace: string[];
}

export interface AstrologicalCoordinate {
  longitude: number;
  latitude: number;
  siderealTime: number;
  house: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface LayerState {
  layer: LayerConfig;
  contextWindow: string[];
  contextTokens: number;
  embeddings: number[][];
  activationHistory: number[];
  messageQueue: MessagePacket[];
  lastOutput: string;
  convergenceScore: number;
  serverProcess?: ChildProcess;
  serverPort?: number;
  isReady: boolean;
}

export interface InferenceResult {
  output: string;
  tokens: number;
  generationTime: number;
  layerTrace: string[];
  convergenceScore: number;
  iterations: number;
  embeddings: number[][];
  astrologicalCoords: AstrologicalCoordinate[];
}

// ============================================================================
// ASTROLOGICAL COORDINATE SYSTEM
// ============================================================================

class AstrologicalEngine {
  private siderealOffset = 24.0; // Fagan/Bradley sidereal

  calculateCoordinates(date: Date, latitude: number, longitude: number): AstrologicalCoordinate {
    const jd = this.toJulianDay(date);
    const lst = this.localSiderealTime(jd, longitude);
    const sunLong = this.sunLongitude(jd);

    return {
      longitude,
      latitude,
      siderealTime: lst,
      house: this.calculateHouse(lst, sunLong),
      sign: this.zodiacSign(sunLong),
      degree: Math.floor(sunLong % 30),
      minute: Math.floor((sunLong % 1) * 60),
      second: Math.floor(((sunLong % 1) * 60) % 1 * 60)
    };
  }

  private toJulianDay(date: Date): number {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate() + date.getUTCHours() / 24;
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a;
    const mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }

  private localSiderealTime(jd: number, longitude: number): number {
    const T = (jd - 2451545.0) / 36525;
    const theta = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
    return ((theta + longitude) % 360 + 360) % 360;
  }

  private sunLongitude(jd: number): number {
    const T = (jd - 2451545.0) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180)
            + 0.000289 * Math.sin(3 * M * Math.PI / 180);
    const lambda = (L0 + C + this.siderealOffset) % 360;
    return lambda < 0 ? lambda + 360 : lambda;
  }

  private calculateHouse(lst: number, sunLong: number): number {
    const ascendant = (lst - sunLong + 360) % 360;
    return Math.floor(ascendant / 30) + 1;
  }

  private zodiacSign(degree: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(degree / 30) % 12];
  }

  gateToCoordinate(gate: number): { sign: string; degree: number } {
    const gateSigns: Record<number, string> = {
      1: 'Libra', 2: 'Taurus', 3: 'Aries', 4: 'Taurus', 5: 'Sagittarius',
      6: 'Virgo', 7: 'Leo', 8: 'Scorpio', 9: 'Sagittarius', 10: 'Taurus',
      11: 'Pisces', 12: 'Gemini', 13: 'Cancer', 14: 'Leo', 15: 'Virgo',
      16: 'Libra', 17: 'Scorpio', 18: 'Sagittarius', 19: 'Capricorn', 20: 'Aquarius',
      21: 'Pisces', 22: 'Aries', 23: 'Taurus', 24: 'Gemini', 25: 'Cancer',
      26: 'Leo', 27: 'Virgo', 28: 'Libra', 29: 'Scorpio', 30: 'Sagittarius',
      31: 'Capricorn', 32: 'Aquarius', 33: 'Pisces', 34: 'Aries', 35: 'Taurus',
      36: 'Gemini', 37: 'Cancer', 38: 'Leo', 39: 'Virgo', 40: 'Libra',
      41: 'Scorpio', 42: 'Sagittarius', 43: 'Capricorn', 44: 'Aquarius', 45: 'Pisces',
      46: 'Aries', 47: 'Taurus', 48: 'Gemini', 49: 'Cancer', 50: 'Leo',
      51: 'Virgo', 52: 'Libra', 53: 'Scorpio', 54: 'Sagittarius', 55: 'Capricorn',
      56: 'Aquarius', 57: 'Pisces', 58: 'Aries', 59: 'Taurus', 60: 'Gemini',
      61: 'Cancer', 62: 'Leo', 63: 'Virgo', 64: 'Libra'
    };
    const sign = gateSigns[gate] || 'Aries';
    const degree = ((gate - 1) * 5.625) % 30;
    return { sign, degree };
  }
}

// ============================================================================
// TOKEN EMBEDDING ENGINE
// ============================================================================

class EmbeddingEngine {
  private vocabSize = 50000;
  private embeddingDim = 768;
  private embeddings: Map<string, number[]> = new Map();

  async embed(text: string): Promise<number[]> {
    const hash = this.djb2(text);
    const embedding: number[] = [];
    for (let i = 0; i < this.embeddingDim; i++) {
      const seed = hash + i * 31;
      embedding.push(Math.sin(seed) * Math.cos(seed * 1.618));
    }
    const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
    return embedding.map(v => v / (norm + 1e-8));
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embed(t)));
  }

  similarity(a: number[], b: number[]): number {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
  }

  private djb2(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return hash;
  }
}

// ============================================================================
// LLAMA.CPP SERVER MANAGER
// ============================================================================

class LlamaServerManager {
  private processes: Map<string, ChildProcess> = new Map();
  private ports: Map<string, number> = new Map();
  private basePort = 18100;
  private portCounter = 0;

  async startServer(layerId: string, modelPath: string, config: InferenceConfig, layerConfig: LayerConfig): Promise<number> {
    const port = this.basePort + this.portCounter++;

    const args = [
      '--model', modelPath,
      '--alias', layerId,
      '--host', '127.0.0.1',
      '--port', port.toString(),
      '--ctx-size', layerConfig.contextSize.toString(),
      '--n-gpu-layers', config.gpuLayers.toString(),
      '--flash-attn', config.flashAttention ? 'on' : 'off',
      '--cache-type-k', config.cacheTypeK,
      '--cache-type-v', config.cacheTypeV,
      '--batch-size', config.batchSize.toString(),
      '--threads', config.threads.toString(),
      '--no-mmap',
    ];

    if (config.reasoningMode && layerConfig.adapterType === 'resonance') {
      args.push('--reasoning', 'on');
    }

    const env = {
      ...process.env,
      ROCBLAS_USE_HIPBLASLT: '1',
      CUDA_VISIBLE_DEVICES: '0',
    };

    const proc = spawn(join(config.llamaCppPath, 'llama-server'), args, { env, detached: false });

    this.processes.set(layerId, proc);
    this.ports.set(layerId, port);

    await this.waitForServer(port, 30000);

    console.log(`[MRNN] Layer ${layerId} server ready on port ${port}`);
    return port;
  }

  async stopServer(layerId: string): Promise<void> {
    const proc = this.processes.get(layerId);
    if (proc) {
      proc.kill('SIGTERM');
      this.processes.delete(layerId);
      this.ports.delete(layerId);
    }
  }

  getPort(layerId: string): number | undefined {
    return this.ports.get(layerId);
  }

  private waitForServer(port: number, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const req = require('http').request({ hostname: '127.0.0.1', port, path: '/health', method: 'GET' }, (res: any) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            retry();
          }
        });
        req.on('error', retry);
        req.setTimeout(1000, () => { req.destroy(); retry(); });
        req.end();
      };

      const retry = () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Server on port ${port} failed to start`));
        } else {
          setTimeout(check, 500);
        }
      };

      setTimeout(check, 500);
    });
  }

  async inference(layerId: string, prompt: string, params: { temperature?: number; topP?: number; maxTokens?: number }): Promise<string> {
    const port = this.ports.get(layerId);
    if (!port) throw new Error(`No server for layer ${layerId}`);

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: layerId,
        messages: [{ role: 'user', content: prompt }],
        temperature: params.temperature ?? 0.7,
        top_p: params.topP ?? 0.9,
        max_tokens: params.maxTokens ?? 2048,
        stream: false
      });

      const req = require('http').request({
        hostname: '127.0.0.1',
        port,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, (res: any) => {
        let body = '';
        res.on('data', (chunk: any) => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json.choices?.[0]?.message?.content || '');
          } catch (e) {
            reject(new Error(`Invalid response: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

// ============================================================================
// MESSAGE PASSING GRAPH
// ============================================================================

class MessagePassingGraph {
  private adjacency: Map<string, Set<string>> = new Map();
  private edgeWeights: Map<string, Map<string, number>> = new Map();
  private messages: MessagePacket[] = [];
  private iteration = 0;
  private eventEmitter = new EventEmitter();

  constructor(private topology: GraphTopologyConfig, private layers: Map<string, LayerConfig>) {
    this.buildTopology();
  }

  private buildTopology() {
    const layerIds = Array.from(this.layers.keys());

    switch (this.topology.topologyType) {
      case 'dag':
        for (let i = 0; i < layerIds.length - 1; i++) {
          this.addEdge(layerIds[i], layerIds[i + 1]);
        }
        break;
      case 'cyclic':
        for (let i = 0; i < layerIds.length; i++) {
          this.addEdge(layerIds[i], layerIds[(i + 1) % layerIds.length]);
        }
        break;
      case 'hypergraph':
        for (const a of layerIds) {
          for (const b of layerIds) {
            if (a !== b) this.addEdge(a, b);
          }
        }
        break;
      case 'resonance':
        this.buildResonanceTopology(layerIds);
        break;
    }
  }

  private buildResonanceTopology(layerIds: string[]) {
    for (const a of layerIds) {
      for (const b of layerIds) {
        if (a === b) continue;
        const layerA = this.layers.get(a)!;
        const layerB = this.layers.get(b)!;

        const resonance = this.calculateResonance(layerA, layerB);
        if (resonance > 0.3) {
          this.addEdge(a, b, resonance);
        }
      }
    }
  }

  private calculateResonance(a: LayerConfig, b: LayerConfig): number {
    let score = 0;

    const gateDiff = Math.abs(a.astrologicalGate - b.astrologicalGate);
    score += Math.max(0, 1 - gateDiff / 64);

    if (a.color === b.color) score += 0.3;
    if (a.tone === b.tone) score += 0.2;
    if (a.base === b.base) score += 0.1;

    const dimDiff = Math.abs(a.dimension - b.dimension);
    score += Math.max(0, 0.4 - dimDiff * 0.1);

    return Math.min(1, score);
  }

  addEdge(from: string, to: string, weight = 1.0) {
    if (!this.adjacency.has(from)) this.adjacency.set(from, new Set());
    this.adjacency.get(from)!.add(to);

    if (!this.edgeWeights.has(from)) this.edgeWeights.set(from, new Map());
    this.edgeWeights.get(from)!.set(to, weight);
  }

  getNeighbors(layerId: string): string[] {
    return Array.from(this.adjacency.get(layerId) || []);
  }

  getEdgeWeight(from: string, to: string): number {
    return this.edgeWeights.get(from)?.get(to) || 0;
  }

  async passMessage(packet: MessagePacket): Promise<void> {
    this.messages.push(packet);
    this.eventEmitter.emit('message', packet);

    if (this.topology.messagePassing === 'synchronous') {
      const targets = this.getNeighbors(packet.sourceLayer);
      await Promise.all(targets.map(t => this.deliverToLayer(t, packet)));
    } else if (this.topology.messagePassing === 'asynchronous') {
      this.getNeighbors(packet.sourceLayer).forEach(t => {
        this.deliverToLayer(t, packet).catch(console.error);
      });
    } else if (this.topology.messagePassing === 'wave') {
      const targets = this.getNeighbors(packet.sourceLayer);
      for (const target of targets) {
        const weight = this.getEdgeWeight(packet.sourceLayer, target);
        const delay = (1 - weight) * 100;
        await new Promise(r => setTimeout(r, delay));
        await this.deliverToLayer(target, packet);
      }
    }
  }

  private async deliverToLayer(targetLayerId: string, packet: MessagePacket): Promise<void> {
    this.eventEmitter.emit('deliver', { targetLayerId, packet });
  }

  onMessage(handler: (packet: MessagePacket) => void) {
    this.eventEmitter.on('message', handler);
  }

  onDeliver(handler: (event: { targetLayerId: string; packet: MessagePacket }) => void) {
    this.eventEmitter.on('deliver', handler);
  }

  getMessages(): MessagePacket[] {
    return [...this.messages];
  }

  incrementIteration(): number {
    return ++this.iteration;
  }

  getIteration(): number {
    return this.iteration;
  }
}

// ============================================================================
// LAYER PROCESSOR
// ============================================================================

class LayerProcessor {
  private state: LayerState;
  private astroEngine = new AstrologicalEngine();
  private embeddingEngine = new EmbeddingEngine();

  constructor(
    public config: LayerConfig,
    private serverManager: LlamaServerManager,
    private graph: MessagePassingGraph
  ) {
    this.state = {
      layer: config,
      contextWindow: [],
      contextTokens: 0,
      embeddings: [],
      activationHistory: [],
      messageQueue: [],
      lastOutput: '',
      convergenceScore: 0,
      isReady: false
    };
  }

  async initialize(modelPath: string, inferenceConfig: InferenceConfig): Promise<void> {
    const port = await this.serverManager.startServer(
      this.config.id,
      modelPath,
      inferenceConfig,
      this.config
    );
    this.state.serverPort = port;
    this.state.isReady = true;
  }

  async process(input: string, astrologicalCoord?: AstrologicalCoordinate): Promise<MessagePacket> {
    if (!this.state.isReady) {
      throw new Error(`Layer ${this.config.id} not initialized`);
    }

    this.state.contextWindow.push(input);
    this.state.contextTokens += input.split(/\s+/).length;

    while (this.state.contextTokens > this.config.contextSize * 0.8) {
      const removed = this.state.contextWindow.shift()!;
      this.state.contextTokens -= removed.split(/\s+/).length;
    }

    const embedding = await this.embeddingEngine.embed(input);
    this.state.embeddings.push(embedding);

    const prompt = this.buildPrompt(input, astrologicalCoord);

    const startTime = Date.now();
    const output = await this.serverManager.inference(this.config.id, prompt, {
      temperature: this.config.temperature,
      topP: this.config.topP,
      maxTokens: 4096
    });
    const generationTime = Date.now() - startTime;

    this.state.lastOutput = output;
    this.state.activationHistory.push(generationTime);

    if (this.state.activationHistory.length > 1) {
      const recent = this.state.activationHistory.slice(-5);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const variance = recent.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / recent.length;
      this.state.convergenceScore = 1 / (1 + Math.sqrt(variance) / 100);
    }

    const packet: MessagePacket = {
      id: `${this.config.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceLayer: this.config.id,
      targetLayer: '',
      content: output,
      tokens: output.split(/\s+/).length,
      embedding: await this.embeddingEngine.embed(output),
      metadata: {
        timestamp: Date.now(),
        iteration: this.graph.getIteration(),
        gate: this.config.astrologicalGate,
        line: Math.floor(Math.random() * 6) + 1,
        color: this.config.color,
        tone: this.config.tone,
        base: this.config.base,
        confidence: this.state.convergenceScore,
        astrologicalCoord: astrologicalCoord || this.astroEngine.calculateCoordinates(new Date(), 0, 0)
      },
      trace: [this.config.id]
    };

    return packet;
  }

  private buildPrompt(input: string, astroCoord?: AstrologicalCoordinate): string {
    const context = this.state.contextWindow.slice(-10).join('\n---\n');
    const layerMeta = `[Layer: ${this.config.name} | Dimension: ${this.config.dimension} | Gate: ${this.config.astrologicalGate} | Specialization: ${this.config.specialization.join(', ')}]`;

    let astroMeta = '';
    if (astroCoord) {
      astroMeta = `[Astrological: ${astroCoord.sign} ${astroCoord.degree}°${astroCoord.minute}'${astroCoord.second}" | House: ${astroCoord.house} | LST: ${astroCoord.siderealTime.toFixed(2)}]`;
    }

    return `${layerMeta}
${astroMeta}
Context:
${context}

Input:
${input}

Respond as ${this.config.name} (Dimension ${this.config.dimension}):
`;
  }

  async receiveMessage(packet: MessagePacket): Promise<void> {
    this.state.messageQueue.push(packet);
    const processed = await this.process(packet.content, packet.metadata.astrologicalCoord);
    await this.graph.passMessage(processed);
  }

  getState(): LayerState {
    return { ...this.state };
  }

  getConvergenceScore(): number {
    return this.state.convergenceScore;
  }
}

// ============================================================================
// MCP SERVER
// ============================================================================

class MCPMRNNServer {
  private server: Server;
  private wss?: WebSocketServer;
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private prompts: Map<string, MCPPrompt> = new Map();

  constructor(
    private config: MCPConfig,
    private engine: MRNNEngine
  ) {
    this.server = createServer(this.handleRequest.bind(this));

    if (config.transport === 'websocket') {
      this.wss = new WebSocketServer({ server: this.server });
      this.wss.on('connection', this.handleWebSocket.bind(this));
    }
  }

  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
  }

  registerResource(resource: MCPResource): void {
    this.resources.set(resource.uri, resource);
  }

  registerPrompt(prompt: MCPPrompt): void {
    this.prompts.set(prompt.name, prompt);
  }

  start(): void {
    this.server.listen(this.config.port, () => {
      console.log(`[MCP] MRNN MCP Server running on port ${this.config.port}`);
    });
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = req.url || '/';

    if (url === '/mcp/v1/tools') {
      this.handleToolsList(req, res);
    } else if (url === '/mcp/v1/tools/call') {
      this.handleToolCall(req, res);
    } else if (url === '/mcp/v1/resources') {
      this.handleResourcesList(req, res);
    } else if (url.startsWith('/mcp/v1/resources/')) {
      this.handleResourceRead(req, res);
    } else if (url === '/mcp/v1/prompts') {
      this.handlePromptsList(req, res);
    } else if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', server: this.config.serverName, version: this.config.serverVersion }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  private handleToolsList(req: IncomingMessage, res: ServerResponse): void {
    const toolsList = Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tools: toolsList }));
  }

  private async handleToolCall(req: IncomingMessage, res: ServerResponse): Promise<void> {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { name, arguments: args } = JSON.parse(body);
        const tool = this.tools.get(name);

        if (!tool) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: `Tool ${name} not found` }));
          return;
        }

        const result = await this.executeTool(tool, args);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: (e as Error).message }));
      }
    });
  }

  private async executeTool(tool: MCPTool, args: any): Promise<any> {
    switch (tool.handler) {
      case 'mrnn_infer':
        return this.engine.infer(args.prompt, args.layerId, args.options);
      case 'mrnn_layer_status':
        return this.engine.getLayerStatus(args.layerId);
      case 'mrnn_graph_status':
        return this.engine.getGraphStatus();
      case 'mrnn_astro_coord':
        return this.engine.getAstrologicalCoordinates();
      case 'mrnn_morph_state':
        return this.engine.getMorphState();
      case 'mrnn_grow':
        return this.engine.triggerGrowth(args.trigger);
      default:
        throw new Error(`Unknown tool handler: ${tool.handler}`);
    }
  }

  private handleResourcesList(req: IncomingMessage, res: ServerResponse): void {
    const resourcesList = Array.from(this.resources.values()).map(r => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ resources: resourcesList }));
  }

  private handleResourceRead(req: IncomingMessage, res: ServerResponse): void {
    const uri = req.url!.replace('/mcp/v1/resources/', '');
    const resource = this.resources.get(uri);

    if (!resource) {
      res.writeHead(404);
      res.end('Resource not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': resource.mimeType });
    res.end(JSON.stringify({ contents: [{ uri: resource.uri, text: 'Resource content placeholder' }] }));
  }

  private handlePromptsList(req: IncomingMessage, res: ServerResponse): void {
    const promptsList = Array.from(this.prompts.values()).map(p => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ prompts: promptsList }));
  }

  private handleWebSocket(ws: WebSocket): void {
    ws.on('message', async (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'tool_call') {
          const tool = this.tools.get(msg.name);
          if (tool) {
            const result = await this.executeTool(tool, msg.arguments);
            ws.send(JSON.stringify({ type: 'tool_result', id: msg.id, result }));
          }
        } else if (msg.type === 'infer') {
          const result = await this.engine.infer(msg.prompt, msg.layerId, msg.options);
          ws.send(JSON.stringify({ type: 'infer_result', id: msg.id, result }));
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', error: (e as Error).message }));
      }
    });
  }
}

// ============================================================================
// OPENAI COMPATIBLE API SERVER
// ============================================================================

class OpenAICompatServer {
  private server: Server;

  constructor(
    private config: OpenAICompatConfig,
    private engine: MRNNEngine
  ) {
    this.server = createServer(this.handleRequest.bind(this));
  }

  start(): void {
    this.server.listen(this.config.port, this.config.host, () => {
      console.log(`[OpenAI] Compatible API on http://${this.config.host}:${this.config.port}`);
    });
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = req.url || '/';

    if (url === '/v1/models') {
      this.handleModels(req, res);
    } else if (url === '/v1/chat/completions') {
      this.handleChatCompletions(req, res);
    } else if (url === '/v1/embeddings') {
      this.handleEmbeddings(req, res);
    } else if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  private handleModels(req: IncomingMessage, res: ServerResponse): void {
    const models = this.engine.getAvailableModels().map(m => ({
      id: m.id,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'mrnn'
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ object: 'list', data: models }));
  }

  private async handleChatCompletions(req: IncomingMessage, res: ServerResponse): Promise<void> {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const request = JSON.parse(body);
        const modelId = request.model;
        const mappedModel = this.config.modelMapping[modelId] || modelId;

        const messages = request.messages || [];
        const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');

        const layerId = this.inferLayerFromModel(mappedModel);

        const result = await this.engine.infer(prompt, layerId, {
          temperature: request.temperature,
          topP: request.top_p,
          maxTokens: request.max_tokens
        });

        const response = {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: modelId,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: result.output
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: result.tokens,
            completion_tokens: result.output.split(/\s+/).length,
            total_tokens: result.tokens + result.output.split(/\s+/).length
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: (e as Error).message }));
      }
    });
  }

  private async handleEmbeddings(req: IncomingMessage, res: ServerResponse): Promise<void> {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const request = JSON.parse(body);
        const input = Array.isArray(request.input) ? request.input : [request.input];

        const embeddings = await this.engine.embedBatch(input);

        const response = {
          object: 'list',
          data: embeddings.map((emb, i) => ({
            object: 'embedding',
            index: i,
            embedding: emb
          }))
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: (e as Error).message }));
      }
    });
  }

  private inferLayerFromModel(modelId: string): string {
    const layerMap: Record<string, string> = {
      'mrnn-default': 'layer-3',
      'mrnn-syntax': 'layer-1',
      'mrnn-semantic': 'layer-2',
      'mrnn-topology': 'layer-3',
      'mrnn-cosmology': 'layer-4',
      'mrnn-emergence': 'layer-5'
    };

    return layerMap[modelId] || 'layer-3';
  }
}

// ============================================================================
// AUTOPOIETIC GROWTH ENGINE
// ============================================================================

interface Subsystem {
  id: string;
  name: string;
  parentLayer: string;
  trigger: string;
  created: number;
  active: boolean;
  rules: string[];
}

interface EvolutionRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
  created: number;
}

interface GrowthMemory {
  capabilities: string[];
  subsystems: Subsystem[];
  rules: EvolutionRule[];
  patterns: string[];
  threshold: number;
}

interface GrowthStatus {
  capabilities: number;
  subsystems: number;
  rules: number;
  patterns: number;
  threshold: number;
}

class AutopoieticGrowthEngine {
  private capabilities: string[] = [];
  private subsystems: Subsystem[] = [];
  private rules: EvolutionRule[] = [];
  private memory: GrowthMemory;

  constructor(private config: AutopoieticConfig) {
    this.memory = this.loadMemory();
  }

  private loadMemory(): GrowthMemory {
    try {
      if (existsSync(this.config.memoryPath)) {
        return JSON.parse(readFileSync(this.config.memoryPath, 'utf-8'));
      }
    } catch (e) {}

    return {
      capabilities: [],
      subsystems: [],
      rules: [],
      patterns: [],
      threshold: this.config.growthThreshold
    };
  }

  private saveMemory(): void {
    try {
      mkdirSync(dirname(this.config.memoryPath), { recursive: true });
      writeFileSync(this.config.memoryPath, JSON.stringify(this.memory, null, 2));
    } catch (e) {
      console.error('[Growth] Failed to save memory:', e);
    }
  }

  async extractCapability(input: string, layerOutput: string): Promise<string | null> {
    if (!this.config.capabilityExtraction) return null;

    const patterns = [
      /new\s+(?:pattern|structure|topology|mechanism)/gi,
      /(?:discovered|identified|recognized)\s+(?:a|the)\s+(\w+)/gi,
      /(?:emergent|novel|unprecedented)\s+(\w+)/gi
    ];

    for (const pattern of patterns) {
      const matches = layerOutput.match(pattern);
      if (matches) {
        const capability = matches[0];
        if (!this.memory.capabilities.includes(capability)) {
          this.memory.capabilities.push(capability);
          this.saveMemory();
          return capability;
        }
      }
    }

    return null;
  }

  async spawnSubsystem(trigger: string, parentLayer: string): Promise<Subsystem | null> {
    if (!this.config.subsystemSpawning) return null;

    const subsystem: Subsystem = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `Subsystem for ${trigger}`,
      parentLayer,
      trigger,
      created: Date.now(),
      active: true,
      rules: []
    };

    this.memory.subsystems.push(subsystem);
    this.saveMemory();

    return subsystem;
  }

  async evolveRules(context: string): Promise<EvolutionRule[]> {
    if (!this.config.ruleEvolution) return [];

    const newRules: EvolutionRule[] = [];

    if (context.includes('error') || context.includes('fail')) {
      newRules.push({
        id: `rule-${Date.now()}`,
        condition: 'error_detected',
        action: 'escalate_to_higher_dimension',
        priority: 1,
        created: Date.now()
      });
    }

    if (context.includes('success') || context.includes('optimal')) {
      newRules.push({
        id: `rule-${Date.now()}`,
        condition: 'success_pattern',
        action: 'reinforce_current_path',
        priority: 2,
        created: Date.now()
      });
    }

    this.memory.rules.push(...newRules);
    this.saveMemory();

    return newRules;
  }

  getGrowthStatus(): GrowthStatus {
    return {
      capabilities: this.memory.capabilities.length,
      subsystems: this.memory.subsystems.length,
      rules: this.memory.rules.length,
      patterns: this.memory.patterns.length,
      threshold: this.memory.threshold
    };
  }
}

// ============================================================================
// MAIN MRNN ENGINE
// ============================================================================

export class MRNNEngine {
  private config: MRNNConfig;
  private layers: Map<string, LayerProcessor> = new Map();
  private graph: MessagePassingGraph;
  private serverManager: LlamaServerManager;
  private astroEngine: AstrologicalEngine;
  private embeddingEngine: EmbeddingEngine;
  private growthEngine: AutopoieticGrowthEngine;
  private mcpServer?: MCPMRNNServer;
  private openaiServer?: OpenAICompatServer;
  private eventEmitter = new EventEmitter();
  private isRunning = false;

  constructor(config: MRNNConfig) {
    this.config = config;
    this.serverManager = new LlamaServerManager();
    this.astroEngine = new AstrologicalEngine();
    this.embeddingEngine = new EmbeddingEngine();
    this.growthEngine = new AutopoieticGrowthEngine(config.autopoietic);

    const layerMap = new Map<string, LayerConfig>();
    config.layers.forEach(l => layerMap.set(l.id, l));
    this.graph = new MessagePassingGraph(config.graphTopology, layerMap);

    this.graph.onDeliver(async ({ targetLayerId, packet }) => {
      const layer = this.layers.get(targetLayerId);
      if (layer) {
        await layer.receiveMessage(packet);
      }
    });
  }

  async initialize(): Promise<void> {
    console.log('[MRNN] Initializing engine...');

    for (const layerConfig of this.config.layers) {
      const model = this.config.models.models.find(m => m.id === layerConfig.modelId);
      if (!model) {
        throw new Error(`Model ${layerConfig.modelId} not found for layer ${layerConfig.id}`);
      }

      const processor = new LayerProcessor(
        layerConfig,
        this.serverManager,
        this.graph
      );

      await processor.initialize(model.ggufPath, this.config.inference);
      this.layers.set(layerConfig.id, processor);

      console.log(`[MRNN] Layer ${layerConfig.id} (${layerConfig.name}) initialized`);
    }

    if (this.config.mcp.enabled) {
      this.mcpServer = new MCPMRNNServer(this.config.mcp, this);
      this.registerDefaultMCPTools();
      this.mcpServer.start();
    }

    if (this.config.openai.enabled) {
      this.openaiServer = new OpenAICompatServer(this.config.openai, this);
      this.openaiServer.start();
    }

    this.isRunning = true;
    console.log('[MRNN] Engine fully initialized and running');
  }

  private registerDefaultMCPTools(): void {
    if (!this.mcpServer) return;

    this.mcpServer.registerTool({
      name: 'mrnn_infer',
      description: 'Run inference through the MRNN engine',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Input prompt' },
          layerId: { type: 'string', description: 'Target layer ID (optional)' },
          options: { type: 'object', description: 'Inference options' }
        },
        required: ['prompt']
      },
      handler: 'mrnn_infer'
    });

    this.mcpServer.registerTool({
      name: 'mrnn_layer_status',
      description: 'Get status of a specific layer',
      inputSchema: {
        type: 'object',
        properties: {
          layerId: { type: 'string', description: 'Layer ID' }
        },
        required: ['layerId']
      },
      handler: 'mrnn_layer_status'
    });

    this.mcpServer.registerTool({
      name: 'mrnn_graph_status',
      description: 'Get full graph topology and message status',
      inputSchema: { type: 'object', properties: {} },
      handler: 'mrnn_graph_status'
    });

    this.mcpServer.registerTool({
      name: 'mrnn_astro_coord',
      description: 'Get current astrological coordinates',
      inputSchema: { type: 'object', properties: {} },
      handler: 'mrnn_astro_coord'
    });

    this.mcpServer.registerTool({
      name: 'mrnn_morph_state',
      description: 'Get current morphing visualizer state',
      inputSchema: { type: 'object', properties: {} },
      handler: 'mrnn_morph_state'
    });

    this.mcpServer.registerTool({
      name: 'mrnn_grow',
      description: 'Trigger autopoietic growth',
      inputSchema: {
        type: 'object',
        properties: {
          trigger: { type: 'string', description: 'Growth trigger' }
        },
        required: ['trigger']
      },
      handler: 'mrnn_grow'
    });
  }

  async infer(prompt: string, targetLayerId?: string, options?: Partial<{ temperature: number; topP: number; maxTokens: number }>): Promise<InferenceResult> {
    if (!this.isRunning) {
      throw new Error('Engine not initialized');
    }

    const layerId = targetLayerId || this.config.layers[0].id;
    const layer = this.layers.get(layerId);

    if (!layer) {
      throw new Error(`Layer ${layerId} not found`);
    }

    const astroCoord = this.astroEngine.calculateCoordinates(new Date(), 0, 0);

    const startTime = Date.now();
    const packet = await layer.process(prompt, astroCoord);

    const trace: string[] = [layerId];
    let currentPacket = packet;
    let iterations = 0;

    if (this.config.graphTopology.recursionDepth > 0) {
      for (let i = 0; i < this.config.graphTopology.maxIterations; i++) {
        const neighbors = this.graph.getNeighbors(currentPacket.sourceLayer);
        if (neighbors.length === 0) break;

        const nextLayerId = this.selectNextLayer(neighbors, currentPacket);
        const nextLayer = this.layers.get(nextLayerId);

        if (!nextLayer) break;

        currentPacket.targetLayer = nextLayerId;
        await this.graph.passMessage(currentPacket);

        const nextPacket = await nextLayer.process(currentPacket.content, astroCoord);
        currentPacket = nextPacket;
        trace.push(nextLayerId);
        iterations++;

        const convergence = nextLayer.getConvergenceScore();
        if (convergence > this.config.graphTopology.convergenceThreshold) {
          break;
        }
      }
    }

    const generationTime = Date.now() - startTime;

    const newCapability = await this.growthEngine.extractCapability(prompt, currentPacket.content);
    if (newCapability) {
      this.eventEmitter.emit('growth', { type: 'capability', value: newCapability });
    }

    const embeddings: number[][] = [];
    for (const lid of trace) {
      const l = this.layers.get(lid);
      if (l) {
        const state = l.getState();
        if (state.embeddings.length > 0) {
          embeddings.push(state.embeddings[state.embeddings.length - 1]);
        }
      }
    }

    return {
      output: currentPacket.content,
      tokens: currentPacket.tokens,
      generationTime,
      layerTrace: trace,
      convergenceScore: currentPacket.metadata.confidence,
      iterations,
      embeddings,
      astrologicalCoords: [astroCoord]
    };
  }

  private selectNextLayer(neighbors: string[], packet: MessagePacket): string {
    const weights = neighbors.map(n => {
      const edgeWeight = this.graph.getEdgeWeight(packet.sourceLayer, n);
      const targetLayer = this.layers.get(n);
      let affinity = 0;

      if (targetLayer) {
        const specMatch = targetLayer.config.specialization.some(s => 
          packet.content.toLowerCase().includes(s.toLowerCase())
        );
        if (specMatch) affinity += 0.5;

        if (targetLayer.config.astrologicalGate === packet.metadata.gate) {
          affinity += 0.3;
        }
      }

      return { layerId: n, weight: edgeWeight + affinity };
    });

    const total = weights.reduce((s, w) => s + Math.exp(w.weight), 0);
    const probs = weights.map(w => Math.exp(w.weight) / total);

    let cumsum = 0;
    const rand = Math.random();
    for (let i = 0; i < probs.length; i++) {
      cumsum += probs[i];
      if (rand <= cumsum) {
        return weights[i].layerId;
      }
    }

    return weights[weights.length - 1].layerId;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return this.embeddingEngine.embedBatch(texts);
  }

  getLayerStatus(layerId: string): any {
    const layer = this.layers.get(layerId);
    if (!layer) return null;

    const state = layer.getState();
    return {
      id: layerId,
      name: state.layer.name,
      dimension: state.layer.dimension,
      isReady: state.isReady,
      contextTokens: state.contextTokens,
      convergenceScore: state.convergenceScore,
      messageQueueLength: state.messageQueue.length,
      activationCount: state.activationHistory.length,
      serverPort: state.serverPort
    };
  }

  getGraphStatus(): any {
    const layerIds = Array.from(this.layers.keys());
    const edges: { from: string; to: string; weight: number }[] = [];

    for (const from of layerIds) {
      for (const to of this.graph.getNeighbors(from)) {
        edges.push({ from, to, weight: this.graph.getEdgeWeight(from, to) });
      }
    }

    return {
      topology: this.config.graphTopology.topologyType,
      messagePassing: this.config.graphTopology.messagePassing,
      layers: layerIds,
      edges,
      iteration: this.graph.getIteration(),
      messages: this.graph.getMessages().length
    };
  }

  getAstrologicalCoordinates(): AstrologicalCoordinate {
    return this.astroEngine.calculateCoordinates(new Date(), 0, 0);
  }

  getMorphState(): any {
    const layerStates = Array.from(this.layers.entries()).map(([id, layer]) => {
      const state = layer.getState();
      return {
        id,
        dimension: state.layer.dimension,
        color: state.layer.color,
        tone: state.layer.tone,
        base: state.layer.base,
        activation: state.activationHistory.length > 0 
          ? state.activationHistory[state.activationHistory.length - 1] 
          : 0,
        convergence: state.convergenceScore,
        gate: state.layer.astrologicalGate
      };
    });

    return {
      layers: layerStates,
      graph: this.getGraphStatus(),
      astro: this.getAstrologicalCoordinates()
    };
  }

  async triggerGrowth(trigger: string): Promise<any> {
    const subsystem = await this.growthEngine.spawnSubsystem(trigger, 'layer-3');
    const rules = await this.growthEngine.evolveRules(trigger);

    return {
      subsystem,
      rules,
      growthStatus: this.growthEngine.getGrowthStatus()
    };
  }

  getAvailableModels(): ModelEntry[] {
    return this.config.models.models;
  }

  on(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.on(event, handler);
  }

  async shutdown(): Promise<void> {
    this.isRunning = false;

    for (const [layerId, layer] of this.layers) {
      await this.serverManager.stopServer(layerId);
    }

    console.log('[MRNN] Engine shutdown complete');
  }
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_MRNN_CONFIG: MRNNConfig = {
  layers: [
    {
      id: 'layer-1',
      name: 'Syntax Layer',
      dimension: 1,
      color: 'red',
      tone: 'active',
      base: 'physical',
      degree: 0,
      minute: 0,
      second: 0,
      modelId: 'qwen3-6-27b-q4',
      contextSize: 32768,
      temperature: 0.3,
      topP: 0.9,
      specialization: ['syntax', 'parsing', 'tokenization', 'structure'],
      astrologicalGate: 1,
      channelMappings: [],
      adapterType: 'dense'
    },
    {
      id: 'layer-2',
      name: 'Semantic Layer',
      dimension: 2,
      color: 'orange',
      tone: 'passive',
      base: 'emotional',
      degree: 0,
      minute: 0,
      second: 0,
      modelId: 'qwen3-6-27b-q4',
      contextSize: 65536,
      temperature: 0.5,
      topP: 0.92,
      specialization: ['semantics', 'meaning', 'context', 'reference'],
      astrologicalGate: 2,
      channelMappings: [],
      adapterType: 'sparse'
    },
    {
      id: 'layer-3',
      name: 'Topology Layer',
      dimension: 3,
      color: 'yellow',
      tone: 'neutral',
      base: 'mental',
      degree: 0,
      minute: 0,
      second: 0,
      modelId: 'qwen3-6-27b-q6',
      contextSize: 131072,
      temperature: 0.6,
      topP: 0.95,
      specialization: ['topology', 'graphs', 'relationships', 'structure'],
      astrologicalGate: 3,
      channelMappings: [],
      adapterType: 'morph'
    },
    {
      id: 'layer-4',
      name: 'Cosmology Layer',
      dimension: 4,
      color: 'green',
      tone: 'active',
      base: 'spiritual',
      degree: 0,
      minute: 0,
      second: 0,
      modelId: 'gemma-4-31b-q4',
      contextSize: 131072,
      temperature: 0.7,
      topP: 0.95,
      specialization: ['cosmology', 'patterns', 'cycles', 'harmony'],
      astrologicalGate: 4,
      channelMappings: [],
      adapterType: 'resonance'
    },
    {
      id: 'layer-5',
      name: 'Emergence Layer',
      dimension: 5,
      color: 'blue',
      tone: 'passive',
      base: 'quantum',
      degree: 0,
      minute: 0,
      second: 0,
      modelId: 'gemma-4-31b-q4',
      contextSize: 262144,
      temperature: 0.8,
      topP: 0.98,
      specialization: ['emergence', 'synthesis', 'creation', 'evolution'],
      astrologicalGate: 5,
      channelMappings: [],
      adapterType: 'resonance'
    }
  ],

  graphTopology: {
    messagePassing: 'wave',
    recursionDepth: 5,
    convergenceThreshold: 0.85,
    maxIterations: 10,
    edgeWeights: 'dynamic',
    topologyType: 'resonance'
  },

  inference: {
    backend: 'llama.cpp',
    llamaCppPath: '/usr/local/bin',
    gpuLayers: 999,
    flashAttention: true,
    cacheTypeK: 'f16',
    cacheTypeV: 'f16',
    batchSize: 4096,
    threads: 16,
    reasoningMode: true
  },

  mcp: {
    enabled: true,
    serverName: 'mrnn-engine',
    serverVersion: '1.0.0',
    tools: [],
    resources: [],
    prompts: [],
    transport: 'websocket',
    port: 18081
  },

  openai: {
    enabled: true,
    port: 18082,
    host: '127.0.0.1',
    modelMapping: {
      'mrnn-default': 'layer-3',
      'mrnn-syntax': 'layer-1',
      'mrnn-semantic': 'layer-2',
      'mrnn-topology': 'layer-3',
      'mrnn-cosmology': 'layer-4',
      'mrnn-emergence': 'layer-5'
    }
  },

  autopoietic: {
    enabled: true,
    growthThreshold: 0.75,
    capabilityExtraction: true,
    subsystemSpawning: true,
    ruleEvolution: true,
    domainAgentCreation: true,
    memoryPath: './.mrnn/growth-memory.json'
  },

  models: {
    models: [
      {
        id: 'qwen3-6-27b-q4',
        name: 'Qwen3.6 27B Q4_K_M',
        ggufPath: '/models/Qwen3.6-27B-Q4_K_M.gguf',
        sizeGB: 15.4,
        parameters: '27B',
        quantization: 'Q4_K_M',
        contextSize: 262144,
        specialization: ['coding', 'reasoning', 'general'],
        layerAssignments: ['layer-1', 'layer-2', 'layer-3'],
        reasoningCapable: true
      },
      {
        id: 'qwen3-6-27b-q6',
        name: 'Qwen3.6 27B Q6_K',
        ggufPath: '/models/Qwen3.6-27B-Q6_K.gguf',
        sizeGB: 20.56,
        parameters: '27B',
        quantization: 'Q6_K',
        contextSize: 262144,
        specialization: ['coding', 'reasoning', 'analysis'],
        layerAssignments: ['layer-3'],
        reasoningCapable: true
      },
      {
        id: 'gemma-4-31b-q4',
        name: 'Gemma 4 31B Q4_K_M',
        ggufPath: '/models/Gemma-4-31B-IT-Q4_K_M.gguf',
        sizeGB: 17.39,
        parameters: '31B',
        quantization: 'Q4_K_M',
        contextSize: 131072,
        specialization: ['instruction', 'chat', 'creative'],
        layerAssignments: ['layer-4', 'layer-5'],
        reasoningCapable: true
      }
    ],
    defaultModel: 'qwen3-6-27b-q4',
    modelPath: '/models'
  }
};

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

export async function main(): Promise<void> {
  const config = DEFAULT_MRNN_CONFIG;

  const configPath = process.argv[2] || './mrnn-config.json';
  if (existsSync(configPath)) {
    const override = JSON.parse(readFileSync(configPath, 'utf-8'));
    Object.assign(config, override);
  }

  const engine = new MRNNEngine(config);

  engine.on('growth', (event) => {
    console.log('[MRNN] Growth event:', event);
  });

  try {
    await engine.initialize();

    const result = await engine.infer('Explain the topology of a recursive neural network with 5 layers');
    console.log('[MRNN] Inference result:', {
      output: result.output.substring(0, 200) + '...',
      tokens: result.tokens,
      time: result.generationTime + 'ms',
      trace: result.layerTrace,
      convergence: result.convergenceScore
    });

    process.on('SIGINT', async () => {
      console.log('\n[MRNN] Shutting down...');
      await engine.shutdown();
      process.exit(0);
    });

  } catch (error) {
    console.error('[MRNN] Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
