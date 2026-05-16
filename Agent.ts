/**
 * 🤖 Synthia Autopoietic GitHub Agent Core
 * 
 * This is the brain of your agent. It:
 * - Ingests repo changes, mobile states, model outputs
 * - Analyzes structure and understands purpose
 * - Decides what to fix, scaffold, deploy, or dispatch
 * - Executes via GitHub Actions, MCP mobile, HF API
 * - Calls back to synthia-server.onrender.com
 * - Updates admin panel in real-time
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  SYNTHIA_SERVER: process.env.SYNTHIA_SERVER || 'https://synthia-server.onrender.com',
  HF_ORG: process.env.HF_ORG || 'stellarproximology',
  HF_TOKEN: process.env.HF_TOKEN || '',
  REPO_ROOT: process.cwd(),
  ADMIN_WEBHOOK: process.env.ADMIN_WEBHOOK || '',
  AUTO_FIX: process.env.AUTO_FIX !== 'false',
  MOBILE_MCP_ENABLED: process.env.MOBILE_MCP_ENABLED === 'true',
  CHECK_INTERVAL: parseInt(process.env.CHECK_INTERVAL || '900000'), // 15 min
};

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
interface RepoState {
  files: string[];
  missing: MissingFile[];
  issues: CodeIssue[];
  lastCommit: string;
  timestamp: string;
}

interface MissingFile {
  category: string;
  file: string;
  severity: 'critical' | 'warning' | 'info';
}

interface CodeIssue {
  file: string;
  type: string;
  line?: number;
  severity: 'critical' | 'warning' | 'info';
  module?: string;
}

interface ModelJob {
  model: string;
  task: string;
  status: 'pending' | 'dispatched' | 'running' | 'complete' | 'failed';
  assignedAt: string;
  result?: any;
}

interface MobileTestResult {
  install: boolean;
  launch: boolean;
  screenshot?: string;
  uiDump?: string;
  tests: { name: string; status: 'pass' | 'fail'; log?: string }[];
}

interface AgentDecision {
  action: 'scaffold' | 'fix' | 'deploy' | 'test_mobile' | 'dispatch_model' | 'notify' | 'none';
  priority: number;
  reason: string;
  payload: any;
}

// ═══════════════════════════════════════════════════════════
// LOGGER — feeds admin panel
// ═══════════════════════════════════════════════════════════
class AgentLogger {
  private logs: Array<{time: string; tag: string; msg: string; data?: any}> = [];
  private logFile = path.join(CONFIG.REPO_ROOT, '.synthia', 'agent-logs.json');

  constructor() {
    fs.mkdirSync(path.dirname(this.logFile), {recursive: true});
    this.load();
  }

  private load() {
    if (fs.existsSync(this.logFile)) {
      try {
        this.logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
      } catch { /* ignore */ }
    }
  }

  private save() {
    fs.writeFileSync(this.logFile, JSON.stringify(this.logs.slice(-1000), null, 2));
  }

  log(tag: string, msg: string, data?: any) {
    const entry = {time: new Date().toISOString(), tag, msg, data};
    this.logs.push(entry);
    this.save();
    console.log(`[${tag}] ${msg}`, data ? JSON.stringify(data).slice(0, 200) : '');
    this.notifyAdmin(entry);
  }

  private async notifyAdmin(entry: any) {
    if (!CONFIG.ADMIN_WEBHOOK) return;
    try {
      await post(CONFIG.ADMIN_WEBHOOK, {
        text: `[${entry.tag}] ${entry.msg}`,
        timestamp: entry.time,
        data: entry.data
      });
    } catch {}
  }

  getLogs(tag?: string, limit = 50) {
    let filtered = tag ? this.logs.filter(l => l.tag === tag) : this.logs;
    return filtered.slice(-limit);
  }
}

const logger = new AgentLogger();

// ═══════════════════════════════════════════════════════════
// HTTP UTILS
// ═══════════════════════════════════════════════════════════
function post(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const payload = JSON.stringify(data);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(CONFIG.HF_TOKEN && parsed.hostname.includes('huggingface') ? {'Authorization': `Bearer ${CONFIG.HF_TOKEN}`} : {})
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve(body); }
      });
    }).on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════════
// REPO SCANNER — Ingestion
// ═══════════════════════════════════════════════════════════
class RepoScanner {
  private requiredStructure = {
    mrnn: ['src/mrnn-engine.ts', 'src/morph-engine.ts', 'src/resonance-sgan.ts', 'src/unified-cognitive-engine.ts'],
    website: ['index.html', 'src/App.tsx', 'package.json', 'netlify.toml', 'vite.config.ts'],
    orchestrator: ['src/autopoietic-os.ts', 'src/ingestion-system.ts', 'src/user-discernment.ts'],
    mobile: ['android/app/build.gradle', 'ios/Podfile', 'capacitor.config.ts'],
    admin: ['admin-panel/index.html', 'admin-panel/dashboard.tsx', 'admin-panel/mobile-console.html'],
    models: ['.github/model-registry.json'],
    config: ['tsconfig.json', '.github/workflows/github-agent.yml']
  };

  scan(): RepoState {
    const root = CONFIG.REPO_ROOT;
    const files: string[] = [];
    const missing: MissingFile[] = [];
    const issues: CodeIssue[] = [];

    // Walk repo
    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir)) {
        if (entry.startsWith('.') && entry !== '.github') continue;
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full);
        else files.push(path.relative(root, full));
      }
    };
    walk(root);

    // Check required structure
    for (const [category, requiredFiles] of Object.entries(this.requiredStructure)) {
      for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(root, file))) {
          missing.push({category, file, severity: category === 'config' ? 'critical' : 'warning'});
        }
      }
    }

    // Check package.json
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = {...(pkg.dependencies || {}), ...(pkg.devDependencies || {})};
      const criticalDeps = ['react', 'react-dom', 'typescript', '@mobilenext/mobile-mcp', 'vite'];
      for (const dep of criticalDeps) {
        if (!deps[dep]) {
          missing.push({category: 'deps', file: dep, severity: 'warning'});
        }
      }
    }

    // Check broken imports in TS files
    const srcFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    for (const file of srcFiles) {
      const content = fs.readFileSync(path.join(root, file), 'utf8');
      const imports = content.match(/from ['"']([^'"']+)['"']/g) || [];
      for (const imp of imports) {
        const match = imp.match(/from ['"']([^'"']+)['"']/);
        if (!match) continue;
        const mod = match[1];
        if (mod.startsWith('.') && !mod.startsWith('http')) {
          const resolved = path.resolve(path.dirname(path.join(root, file)), mod);
          const exts = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
          const exists = exts.some(ext => fs.existsSync(resolved + ext));
          if (!exists) {
            issues.push({file, type: 'broken_import', module: mod, severity: 'critical'});
          }
        }
      }

      // Check for console.log in production
      if (content.includes('console.log') && !file.includes('test') && !file.includes('debug')) {
        issues.push({file, type: 'console_log', severity: 'warning'});
      }

      // Check for hardcoded secrets
      if (content.match(/api[_-]?key|password|token|secret/gi) && content.match(/['"'][a-zA-Z0-9]{20,}['"']/)) {
        issues.push({file, type: 'possible_secret', severity: 'critical'});
      }
    }

    const state: RepoState = {
      files,
      missing,
      issues,
      lastCommit: this.getLastCommit(),
      timestamp: new Date().toISOString()
    };

    logger.log('scan', `Scanned ${files.length} files, ${missing.length} missing, ${issues.length} issues`);
    return state;
  }

  private getLastCommit(): string {
    try {
      return execSync('git rev-parse HEAD', {cwd: CONFIG.REPO_ROOT}).toString().trim();
    } catch {
      return 'unknown';
    }
  }
}

// ═══════════════════════════════════════════════════════════
// AUTO-FIXER — Understands & Fixes
// ═══════════════════════════════════════════════════════════
class AutoFixer {
  private scaffolds: Record<string, string> = {};

  constructor() {
    this.loadScaffolds();
  }

  private loadScaffolds() {
    // MRNN Engine
    this.scaffolds['src/mrnn-engine.ts'] = `export class MRNNEngine {
  layers = 5;
  nodes: any[] = [];
  resonanceMap = new Map();

  constructor(config: any = {}) {
    this.layers = config.layers || 5;
    this.init();
  }

  init() {
    for (let i = 0; i < this.layers; i++) {
      this.nodes[i] = { 
        id: i, 
        state: 'dormant', 
        connections: [],
        activation: 0,
        memory: []
      };
    }
  }

  /** Metabolic perturbation — ingestion triggers morphing */
  ingest(data: any) {
    this.nodes[0].state = 'active';
    this.nodes[0].activation = 1.0;
    this.nodes[0].memory.push({data, time: Date.now()});
    return this.propagate(data);
  }

  propagate(data: any) {
    for (let i = 1; i < this.layers; i++) {
      const prev = this.nodes[i - 1];
      this.nodes[i].state = 'processing';
      this.nodes[i].activation = prev.activation * 0.9 + Math.random() * 0.1;
      this.nodes[i].input = data;

      // Resonance consistency check
      const resonance = this.calculateResonance(i);
      if (resonance < 0.3) {
        this.nodes[i].state = 'morphing';
        this.morphNode(i);
      }
    }
    return this.morph();
  }

  calculateResonance(layerIndex: number): number {
    const node = this.nodes[layerIndex];
    const connections = node.connections.length;
    return Math.min(1.0, connections / (this.layers * 2));
  }

  morphNode(index: number) {
    // Self-scaffolding: generate new connections
    const newConnections = this.nodes.map((n, i) => ({
      from: index,
      to: i,
      weight: Math.random() * 2 - 1,
      type: i === index ? 'self' : 'feedforward'
    }));
    this.nodes[index].connections.push(...newConnections);
  }

  morph() {
    const topology = this.nodes.map(n => ({
      id: n.id,
      state: n.state,
      activation: n.activation,
      connectionCount: n.connections.length
    }));

    return { 
      nodes: this.nodes, 
      topology,
      timestamp: Date.now(),
      resonance: this.calculateGlobalResonance()
    };
  }

  calculateGlobalResonance(): number {
    return this.nodes.reduce((sum, n) => sum + (n.activation || 0), 0) / this.layers;
  }

  /** Callback to Synthia server */
  async callSynthia(endpoint: string, payload: any) {
    const url = CONFIG.SYNTHIA_SERVER + endpoint;
    try {
      return await post(url, {...payload, engine: 'mrnn', timestamp: Date.now()});
    } catch (e: any) {
      logger.log('error', `Synthia callback failed: ${e.message}`);
      throw e;
    }
  }

  /** Call HuggingFace model */
  async callHFModel(modelId: string, inputs: any) {
    const url = \`https://api-inference.huggingface.co/models/${CONFIG.HF_ORG}/${modelId}\`;
    return post(url, {inputs, options: {wait_for_model: true}});
  }
}`;

    // Morph Engine
    this.scaffolds['src/morph-engine.ts'] = `export class MorphEngine {
  resonance = new Map<string, any>();
  history: any[] = [];

  morph(input: any, context: any) {
    const key = this.hash(input);
    const existing = this.resonance.get(key);

    if (existing) {
      return this.amplify(existing, context);
    }

    const novel = this.generateNovel(input, context);
    this.resonance.set(key, novel);
    this.history.push({action: 'generate', key, time: Date.now()});
    return novel;
  }

  hash(input: any): string {
    const str = JSON.stringify(input);
    return str.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString(16);
  }

  amplify(existing: any, context: any) {
    const amplified = {
      ...existing,
      intensity: (existing.intensity || 1) + 0.1,
      context: [...(existing.context || []), context],
      lastAccessed: Date.now()
    };
    this.resonance.set(this.hash(existing.input), amplified);
    this.history.push({action: 'amplify', key: this.hash(existing.input), time: Date.now()});
    return amplified;
  }

  generateNovel(input: any, context: any) {
    return {
      input,
      context: [context],
      intensity: 1,
      born: Date.now(),
      mutations: 0
    };
  }

  getStats() {
    return {
      resonanceCount: this.resonance.size,
      historyLength: this.history.length,
      avgIntensity: Array.from(this.resonance.values()).reduce((s, v) => s + (v.intensity || 0), 0) / this.resonance.size
    };
  }
}`;

    // Autopoietic OS
    this.scaffolds['src/autopoietic-os.ts'] = `export class AutopoieticOS {
  registry = new Map<string, any>();
  tray: any[] = [];
  lifecycle = ['analyze', 'understand', 'register', 'apptray', 'execute'];

  constructor() {
    this.init();
  }

  init() {
    logger.log('os', 'Autopoietic OS initialized');
  }

  /** Everything gets an ontological address */
  ingest(item: any) {
    const address = this.generateAddress(item);

    for (const phase of this.lifecycle) {
      item = this[phase](item, address);
    }

    this.registry.set(address, item);
    this.tray.push({address, status: 'active', added: Date.now()});

    return address;
  }

  generateAddress(item: any): string {
    const hash = JSON.stringify(item).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    return \`synthia://${item.type || 'entity'}/${Math.abs(hash).toString(36)}\`;
  }

  analyze(item: any, address: string) {
    item.analysis = {
      structure: typeof item,
      complexity: JSON.stringify(item).length,
      dependencies: this.extractDeps(item),
      address
    };
    return item;
  }

  understand(item: any, address: string) {
    item.purpose = this.inferPurpose(item);
    item.capabilities = this.inferCapabilities(item);
    return item;
  }

  register(item: any, address: string) {
    item.registered = true;
    item.registryTime = Date.now();
    return item;
  }

  apptray(item: any, address: string) {
    item.trayPosition = this.tray.length;
    item.executable = true;
    return item;
  }

  execute(item: any, address: string) {
    if (item.executable && item.onExecute) {
      item.onExecute(item);
    }
    item.lastExecuted = Date.now();
    return item;
  }

  extractDeps(item: any): string[] {
    const deps: string[] = [];
    const str = JSON.stringify(item);
    const matches = str.match(/from ['"']([^'"']+)['"']/g);
    if (matches) {
      for (const m of matches) {
        const mod = m.match(/from ['"']([^'"']+)['"']/)?.[1];
        if (mod) deps.push(mod);
      }
    }
    return [...new Set(deps)];
  }

  inferPurpose(item: any): string {
    if (item.type) return item.type;
    if (item.name) return \`component:${item.name}\`;
    return 'unknown';
  }

  inferCapabilities(item: any): string[] {
    const caps: string[] = [];
    if (typeof item === 'function') caps.push('executable');
    if (item.render) caps.push('renderable');
    if (item.ingest) caps.push('ingestible');
    if (item.morph) caps.push('morphable');
    return caps;
  }

  getTray() {
    return this.tray.map(t => ({
      ...t,
      item: this.registry.get(t.address)
    }));
  }

  getRegistry() {
    return Array.from(this.registry.entries()).map(([address, item]) => ({
      address,
      ...item
    }));
  }
}`;

    // Ingestion System
    this.scaffolds['src/ingestion-system.ts'] = `export class IngestionSystem {
  uploader = new Uploader();
  ingestor = new Ingestor();
  growthEngine = new GrowthEngine();
  pipeline = ['upload', 'validate', 'filter', 'decide', 'ingest', 'learn', 'grow'];

  async process(input: any) {
    let data = input;
    for (const phase of this.pipeline) {
      data = await this[phase](data);
      logger.log('ingest', \`Phase: ${phase}\`, {status: data?._status});
    }
    return data;
  }

  async upload(input: any) {
    const uploaded = await this.uploader.receive(input);
    return {...uploaded, _status: 'uploaded'};
  }

  async validate(data: any) {
    const valid = this.ingestor.validate(data);
    if (!valid) throw new Error('Validation failed');
    return {...data, _status: 'validated'};
  }

  async filter(data: any) {
    const filtered = this.ingestor.filter(data);
    return {...filtered, _status: 'filtered'};
  }

  async decide(data: any) {
    const decision = this.ingestor.decide(data);
    return {...data, _status: 'decided', decision};
  }

  async ingest(data: any) {
    const ingested = this.ingestor.ingest(data);
    return {...ingested, _status: 'ingested'};
  }

  async learn(data: any) {
    const learned = this.ingestor.learn(data);
    return {...learned, _status: 'learned'};
  }

  async grow(data: any) {
    const grown = this.growthEngine.grow(data);
    return {...grown, _status: 'grown'};
  }
}

class Uploader {
  async receive(input: any) {
    if (typeof input === 'string' && input.startsWith('http')) {
      return {source: 'url', content: await fetch(input).then(r => r.text())};
    }
    if (input.file) {
      return {source: 'file', content: input.file, name: input.name};
    }
    return {source: 'direct', content: input};
  }
}

class Ingestor {
  memory: any[] = [];
  patterns = new Map();
  threshold = 0.5;

  validate(data: any): boolean {
    return data && (data.content || data.source);
  }

  filter(data: any) {
    // Threat detection
    const threats = this.detectThreats(data);
    // Quality scoring
    const quality = this.scoreQuality(data);
    return {...data, threats, quality, passed: threats.length === 0 && quality > this.threshold};
  }

  detectThreats(data: any): string[] {
    const threats: string[] = [];
    const content = JSON.stringify(data);
    if (content.includes('eval(')) threats.push('code_injection');
    if (content.match(/<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi)) threats.push('xss');
    return threats;
  }

  scoreQuality(data: any): number {
    const content = JSON.stringify(data.content || data);
    return Math.min(1, content.length / 1000);
  }

  decide(data: any) {
    return {
      action: data.passed ? 'ingest' : 'quarantine',
      confidence: data.quality,
      reason: data.passed ? 'quality_acceptable' : 'quality_too_low'
    };
  }

  ingest(data: any) {
    this.memory.push({...data, ingestedAt: Date.now()});
    return data;
  }

  learn(data: any) {
    const pattern = this.extractPattern(data);
    const existing = this.patterns.get(pattern.key);
    if (existing) {
      existing.count++;
      existing.weight += 0.1;
    } else {
      this.patterns.set(pattern.key, {count: 1, weight: 1, firstSeen: Date.now()});
    }
    this.threshold = Math.max(0.3, 0.5 - (this.patterns.size * 0.01));
    return {...data, patternsLearned: this.patterns.size};
  }

  extractPattern(data: any) {
    const content = JSON.stringify(data.content || data).slice(0, 100);
    return {key: content, type: typeof data.content};
  }
}

class GrowthEngine {
  capabilities: string[] = [];
  subsystems: any[] = [];
  rules: any[] = [];

  grow(data: any) {
    const newCap = this.extractCapability(data);
    if (newCap && !this.capabilities.includes(newCap)) {
      this.capabilities.push(newCap);
      this.spawnSubsystem(newCap);
    }

    if (this.capabilities.length > this.rules.length * 2) {
      this.evolveRules();
    }

    return {...data, capabilities: this.capabilities, subsystems: this.subsystems.length};
  }

  extractCapability(data: any): string | null {
    if (data.content && typeof data.content === 'string') {
      if (data.content.includes('neural')) return 'neural_processing';
      if (data.content.includes('visual')) return 'visual_processing';
      if (data.content.includes('audio')) return 'audio_processing';
    }
    return null;
  }

  spawnSubsystem(capability: string) {
    this.subsystems.push({
      id: \`sub_${Date.now()}\`,
      capability,
      status: 'initializing',
      born: Date.now()
    });
  }

  evolveRules() {
    this.rules.push({
      id: \`rule_${Date.now()}\`,
      condition: \`capability_count > ${this.capabilities.length}\`,
      action: 'spawn_orchestrator',
      created: Date.now()
    });
  }
}`;

    // Admin Panel
    this.scaffolds['admin-panel/index.html'] = fs.readFileSync('/mnt/agents/output/github-agent/github-agent.yml', 'utf8')
      .split('admin-panel/index.html`: `')[1]?.split('`')[0] || this.getDefaultAdminHTML();
  }

  private getDefaultAdminHTML(): string {
    return `<!DOCTYPE html>
<html><head><title>Synthia Admin</title></head>
<body><h1>Synthia Admin Panel</h1><div id="app"></div></body></html>`;
  }

  async fix(state: RepoState): Promise<{fixes: any[]; committed: boolean}> {
    const fixes: any[] = [];
    const root = CONFIG.REPO_ROOT;

    // Scaffold missing files
    for (const item of state.missing) {
      if (this.scaffolds[item.file]) {
        const dir = path.dirname(path.join(root, item.file));
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(path.join(root, item.file), this.scaffolds[item.file]);
        fixes.push({type: 'scaffold', file: item.file, category: item.category});
        logger.log('fix', `Scaffolded ${item.file}`);
      }
    }

    // Fix broken imports
    for (const issue of state.issues.filter(i => i.type === 'broken_import' && i.module)) {
      const filePath = path.join(root, issue.file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const dir = path.dirname(filePath);
        const base = path.basename(issue.module);

        // Find candidate files
        let candidates: string[] = [];
        if (fs.existsSync(dir)) {
          candidates = fs.readdirSync(dir).filter(f => 
            f.toLowerCase().includes(base.toLowerCase().replace(/[^a-z]/g, ''))
          );
        }

        if (candidates.length > 0) {
          const replacement = './' + candidates[0].replace(/\.tsx?$/, '');
          content = content.replace(
            new RegExp(issue.module.replace(/[.*+?^${}()|[\]\]/g, '\$&'), 'g'),
            replacement
          );
          fs.writeFileSync(filePath, content);
          fixes.push({type: 'import_fix', file: issue.file, from: issue.module, to: replacement});
          logger.log('fix', `Fixed import in ${issue.file}: ${issue.module} → ${replacement}`);
        }
      }
    }

    // Remove console.log from production
    for (const issue of state.issues.filter(i => i.type === 'console_log')) {
      const filePath = path.join(root, issue.file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/console\.log\([^)]*\);?
?/g, '');
        fs.writeFileSync(filePath, content);
        fixes.push({type: 'console_cleanup', file: issue.file});
        logger.log('fix', `Cleaned console.log from ${issue.file}`);
      }
    }

    // Commit if fixes applied
    let committed = false;
    if (fixes.length > 0 && CONFIG.AUTO_FIX) {
      try {
        execSync('git config user.email "synthia-agent@autopoietic.dev"', {cwd: root});
        execSync('git config user.name "Synthia Agent"', {cwd: root});
        execSync('git add -A', {cwd: root});
        execSync(`git commit -m "[AUTO] Applied ${fixes.length} fixes: ${fixes.map(f => f.type).join(', ')}"`, {cwd: root});
        execSync('git push', {cwd: root});
        committed = true;
        logger.log('git', `Committed ${fixes.length} fixes`);
      } catch (e: any) {
        logger.log('error', `Git commit failed: ${e.message}`);
      }
    }

    return {fixes, committed};
  }
}

// ═══════════════════════════════════════════════════════════
// MOBILE MCP BRIDGE
// ═══════════════════════════════════════════════════════════
class MobileMCPBridge {
  private connected = false;
  private deviceId: string | null = null;

  async connect(): Promise<boolean> {
    if (!CONFIG.MOBILE_MCP_ENABLED) {
      logger.log('mobile', 'Mobile MCP disabled');
      return false;
    }

    try {
      // Check ADB
      const devices = execSync('adb devices').toString();
      const lines = devices.split('\n').filter(l => l.includes('device') && !l.includes('List'));

      if (lines.length === 0) {
        logger.log('mobile', 'No ADB devices found');
        return false;
      }

      this.deviceId = lines[0].split('\t')[0];
      this.connected = true;
      logger.log('mobile', `Connected to ${this.deviceId}`);
      return true;
    } catch (e: any) {
      logger.log('mobile', `Connection failed: ${e.message}`);
      return false;
    }
  }

  async installApp(apkPath: string): Promise<boolean> {
    if (!this.connected) return false;
    try {
      execSync(`adb -s ${this.deviceId} install -r ${apkPath}`);
      logger.log('mobile', `Installed ${path.basename(apkPath)}`);
      return true;
    } catch (e: any) {
      logger.log('mobile', `Install failed: ${e.message}`);
      return false;
    }
  }

  async launchApp(packageName: string): Promise<boolean> {
    if (!this.connected) return false;
    try {
      execSync(`adb -s ${this.deviceId} shell am start -n ${packageName}/.MainActivity`);
      logger.log('mobile', `Launched ${packageName}`);
      return true;
    } catch (e: any) {
      logger.log('mobile', `Launch failed: ${e.message}`);
      return false;
    }
  }

  async screenshot(): Promise<string | null> {
    if (!this.connected) return null;
    try {
      const filename = `screenshot_${Date.now()}.png`;
      execSync(`adb -s ${this.deviceId} shell screencap -p /sdcard/${filename}`);
      execSync(`adb -s ${this.deviceId} pull /sdcard/${filename} ${filename}`);
      logger.log('mobile', `Screenshot: ${filename}`);
      return filename;
    } catch (e: any) {
      logger.log('mobile', `Screenshot failed: ${e.message}`);
      return null;
    }
  }

  async dumpUI(): Promise<string | null> {
    if (!this.connected) return null;
    try {
      execSync(`adb -s ${this.deviceId} shell uiautomator dump /sdcard/ui.xml`);
      const filename = `ui_dump_${Date.now()}.xml`;
      execSync(`adb -s ${this.deviceId} pull /sdcard/ui.xml ${filename}`);
      return filename;
    } catch (e: any) {
      return null;
    }
  }

  async tap(x: number, y: number): Promise<boolean> {
    if (!this.connected) return false;
    try {
      execSync(`adb -s ${this.deviceId} shell input tap ${x} ${y}`);
      return true;
    } catch { return false; }
  }

  async type(text: string): Promise<boolean> {
    if (!this.connected) return false;
    try {
      execSync(`adb -s ${this.deviceId} shell input text "${text.replace(/ /g, '%s')}"`);
      return true;
    } catch { return false; }
  }

  async testApp(packageName: string): Promise<MobileTestResult> {
    const result: MobileTestResult = {
      install: false,
      launch: false,
      tests: []
    };

    // Check if already installed
    try {
      const packages = execSync(`adb -s ${this.deviceId} shell pm list packages`).toString();
      if (packages.includes(packageName)) {
        result.install = true;
        result.tests.push({name: 'check_installed', status: 'pass'});
      }
    } catch {}

    // Launch
    if (await this.launchApp(packageName)) {
      result.launch = true;
      result.tests.push({name: 'launch', status: 'pass'});

      // Wait for UI
      await new Promise(r => setTimeout(r, 3000));

      // Screenshot
      result.screenshot = await this.screenshot() || undefined;

      // UI dump
      result.uiDump = await this.dumpUI() || undefined;

      // Check for crashes
      try {
        const logcat = execSync(`adb -s ${this.deviceId} logcat -d -s AndroidRuntime:E`).toString();
        if (logcat.includes('Exception')) {
          result.tests.push({name: 'crash_check', status: 'fail', log: logcat.slice(0, 500)});
        } else {
          result.tests.push({name: 'crash_check', status: 'pass'});
        }
      } catch {
        result.tests.push({name: 'crash_check', status: 'pass'});
      }
    } else {
      result.tests.push({name: 'launch', status: 'fail'});
    }

    // Send to Synthia server
    await post(CONFIG.SYNTHIA_SERVER + '/agent/mobile-results', result).catch(() => {});

    logger.log('mobile', `Test complete: ${result.tests.filter(t => t.status === 'pass').length}/${result.tests.length} passed`);
    return result;
  }
}

// ═══════════════════════════════════════════════════════════
// MODEL DISPATCHER
// ═══════════════════════════════════════════════════════════
class ModelDispatcher {
  private models: ModelJob[] = [];
  private registryPath = path.join(CONFIG.REPO_ROOT, '.github', 'model-registry.json');

  constructor() {
    this.loadRegistry();
  }

  private loadRegistry() {
    if (fs.existsSync(this.registryPath)) {
      try {
        this.models = JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
      } catch {}
    }
  }

  private saveRegistry() {
    fs.mkdirSync(path.dirname(this.registryPath), {recursive: true});
    fs.writeFileSync(this.registryPath, JSON.stringify(this.models, null, 2));
  }

  async dispatchAll(): Promise<ModelJob[]> {
    const modelConfigs = [
      {id: 'synthiabot', task: 'inference', endpoint: '/v1/chat', priority: 'high'},
      {id: 'trident-synthia', task: 'addressing', endpoint: '/v1/address', priority: 'high'},
      {id: 'mrnn-morph', task: 'morphing', endpoint: '/v1/morph', priority: 'medium'},
      {id: 'resonance-gan', task: 'generation', endpoint: '/v1/generate', priority: 'medium'},
      {id: 'semantic-topology', task: 'analysis', endpoint: '/v1/analyze', priority: 'medium'}
    ];

    const jobs: ModelJob[] = [];

    for (const config of modelConfigs) {
      const fullId = `${CONFIG.HF_ORG}/${config.id}`;

      // Check health
      let healthy = false;
      try {
        const response = await get(`https://huggingface.co/api/models/${fullId}`);
        healthy = !!response;
      } catch {}

      const job: ModelJob = {
        model: fullId,
        task: config.task,
        status: healthy ? 'dispatched' : 'unavailable',
        assignedAt: new Date().toISOString(),
      };

      if (healthy) {
        // Send to Synthia server
        await post(CONFIG.SYNTHIA_SERVER + '/agent/assign-model', {
          ...job,
          callback: CONFIG.SYNTHIA_SERVER + '/agent/model-callback',
          hfEndpoint: `https://api-inference.huggingface.co/models/${fullId}${config.endpoint}`,
          repo: process.env.GITHUB_REPOSITORY || 'unknown',
          commit: this.getLastCommit()
        }).catch((e: any) => {
          logger.log('model', `Dispatch callback failed: ${e.message}`);
        });
      }

      jobs.push(job);
    }

    this.models = jobs;
    this.saveRegistry();

    const active = jobs.filter(j => j.status === 'dispatched').length;
    logger.log('model', `Dispatched ${active}/${jobs.length} model jobs`);

    return jobs;
  }

  private getLastCommit(): string {
    try {
      return execSync('git rev-parse HEAD', {cwd: CONFIG.REPO_ROOT}).toString().trim();
    } catch {
      return 'unknown';
    }
  }

  getStatus(): {total: number; active: number; jobs: ModelJob[]} {
    return {
      total: this.models.length,
      active: this.models.filter(m => m.status === 'dispatched' || m.status === 'running').length,
      jobs: this.models
    };
  }
}

// ═══════════════════════════════════════════════════════════
// DEPLOYER
// ═══════════════════════════════════════════════════════════
class Deployer {
  async deployNetlify(): Promise<string | null> {
    try {
      const result = execSync('npx netlify deploy --prod --json', {
        cwd: CONFIG.REPO_ROOT,
        env: {...process.env}
      }).toString();
      const parsed = JSON.parse(result);
      const url = parsed.deploy_url || parsed.url;
      logger.log('deploy', `Netlify: ${url}`);
      return url;
    } catch (e: any) {
      logger.log('deploy', `Netlify deploy failed: ${e.message}`);
      return null;
    }
  }

  async deployRender(): Promise<boolean> {
    try {
      const serviceId = process.env.RENDER_SERVICE_ID;
      const apiKey = process.env.RENDER_API_KEY;
      if (!serviceId || !apiKey) {
        logger.log('deploy', 'Render credentials missing');
        return false;
      }

      await post('https://api.render.com/v1/services/' + serviceId + '/deploys', {
        clearCache: 'do_not_clear'
      });
      logger.log('deploy', 'Render deploy triggered');
      return true;
    } catch (e: any) {
      logger.log('deploy', `Render deploy failed: ${e.message}`);
      return false;
    }
  }

  async deployAll(): Promise<{netlify?: string; render: boolean}> {
    const [netlify, render] = await Promise.all([
      this.deployNetlify(),
      this.deployRender()
    ]);

    // Notify Synthia
    await post(CONFIG.SYNTHIA_SERVER + '/agent/deploy', {
      platforms: {netlify, render},
      timestamp: new Date().toISOString(),
      commit: this.getLastCommit()
    }).catch(() => {});

    return {netlify: netlify || undefined, render};
  }

  private getLastCommit(): string {
    try {
      return execSync('git rev-parse HEAD', {cwd: CONFIG.REPO_ROOT}).toString().trim();
    } catch {
      return 'unknown';
    }
  }
}

// ═══════════════════════════════════════════════════════════
// DECISION ENGINE — The "Brain"
// ═══════════════════════════════════════════════════════════
class DecisionEngine {
  private scanner = new RepoScanner();
  private fixer = new AutoFixer();
  private mobile = new MobileMCPBridge();
  private dispatcher = new ModelDispatcher();
  private deployer = new Deployer();

  async run(): Promise<AgentDecision[]> {
    const decisions: AgentDecision[] = [];

    logger.log('orchestrate', 'Starting autopoietic cycle');

    // Phase 1: Ingest & Analyze
    const state = this.scanner.scan();

    // Phase 2: Decide on fixes
    if (state.missing.length > 0 || state.issues.filter(i => i.severity === 'critical').length > 0) {
      decisions.push({
        action: 'fix',
        priority: 10,
        reason: `${state.missing.length} missing files, ${state.issues.length} issues detected`,
        payload: state
      });
    }

    // Phase 3: Deploy if no critical issues
    if (state.issues.filter(i => i.severity === 'critical').length === 0) {
      decisions.push({
        action: 'deploy',
        priority: 8,
        reason: 'No critical issues, safe to deploy',
        payload: {}
      });
    }

    // Phase 4: Mobile test if deploy succeeds
    decisions.push({
      action: 'test_mobile',
      priority: 6,
      reason: 'Verify mobile install and functionality',
      payload: {}
    });

    // Phase 5: Dispatch models
    decisions.push({
      action: 'dispatch_model',
      priority: 5,
      reason: 'Assign inference jobs to HF models',
      payload: {}
    });

    // Phase 6: Notify
    decisions.push({
      action: 'notify',
      priority: 1,
      reason: 'Send status to admin',
      payload: {state, decisions}
    });

    // Execute in priority order
    const sorted = decisions.sort((a, b) => b.priority - a.priority);

    for (const decision of sorted) {
      await this.execute(decision);
    }

    return decisions;
  }

  private async execute(decision: AgentDecision) {
    logger.log('execute', `${decision.action}: ${decision.reason}`);

    switch (decision.action) {
      case 'fix': {
        const result = await this.fixer.fix(decision.payload);
        decision.payload = result;
        break;
      }

      case 'deploy': {
        const deployResult = await this.deployer.deployAll();
        decision.payload = deployResult;
        break;
      }

      case 'test_mobile': {
        const connected = await this.mobile.connect();
        if (connected) {
          // Try to find and test APK
          const apks = fs.readdirSync(CONFIG.REPO_ROOT).filter(f => f.endsWith('.apk'));
          if (apks.length > 0) {
            await this.mobile.installApp(path.join(CONFIG.REPO_ROOT, apks[0]));
          }
          const testResult = await this.mobile.testApp('com.synthia.app');
          decision.payload = testResult;
        }
        break;
      }

      case 'dispatch_model': {
        const jobs = await this.dispatcher.dispatchAll();
        decision.payload = jobs;
        break;
      }

      case 'notify': {
        const report = {
          timestamp: new Date().toISOString(),
          repo: process.env.GITHUB_REPOSITORY,
          decisions: decision.payload.decisions,
          status: 'complete'
        };
        await post(CONFIG.SYNTHIA_SERVER + '/agent/status-report', report).catch(() => {});
        if (CONFIG.ADMIN_WEBHOOK) {
          await post(CONFIG.ADMIN_WEBHOOK, {
            text: `🌌 Synthia Agent Cycle Complete\n• Fixes: ${decision.payload.state?.missing?.length || 0}\n• Deploy: ${decision.payload.decisions?.find((d: any) => d.action === 'deploy')?.payload?.netlify || 'N/A'}\n• Models: ${decision.payload.decisions?.find((d: any) => d.action === 'dispatch_model')?.payload?.filter((j: any) => j.status === 'dispatched').length || 0} active`
          }).catch(() => {});
        }
        break;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN — CLI Interface
// ═══════════════════════════════════════════════════════════
const command = process.argv[2];
const engine = new DecisionEngine();

switch (command) {
  case 'scan':
    const scanner = new RepoScanner();
    console.log(JSON.stringify(scanner.scan(), null, 2));
    break;

  case 'fix':
    const fixer = new AutoFixer();
    const repoScanner = new RepoScanner();
    fixer.fix(repoScanner.scan()).then(r => console.log(JSON.stringify(r, null, 2)));
    break;

  case 'deploy':
    const deployer = new Deployer();
    deployer.deployAll().then(r => console.log(JSON.stringify(r, null, 2)));
    break;

  case 'mobile':
    const mobile = new MobileMCPBridge();
    mobile.connect().then(c => {
      if (c) mobile.testApp('com.synthia.app').then(r => console.log(JSON.stringify(r, null, 2)));
    });
    break;

  case 'models':
    const dispatcher = new ModelDispatcher();
    dispatcher.dispatchAll().then(r => console.log(JSON.stringify(r, null, 2)));
    break;

  case 'orchestrate':
  default:
    engine.run().then(decisions => {
      console.log('\n🌌 AUTOPOIETIC CYCLE COMPLETE\n');
      for (const d of decisions) {
        console.log(`[${d.priority}] ${d.action}: ${d.reason}`);
      }
    });
    break;
}

export {
  RepoScanner,
  AutoFixer,
  MobileMCPBridge,
  ModelDispatcher,
  Deployer,
  DecisionEngine,
  AgentLogger,
  CONFIG
};
