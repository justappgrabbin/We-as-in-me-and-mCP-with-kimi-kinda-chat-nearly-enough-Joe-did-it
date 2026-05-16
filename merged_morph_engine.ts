/**
 * MORPH MEMORY ENGINE — MERGED WITH RESONANCE ORCHESTRATOR
 *
 * Understands code, stores as GNN nodes, and bridges to the neural mesh.
 * Every analyzed artifact gets a resonance address in the super base.
 *
 * MERGED FEATURES:
 * - All original GNN analysis (intent, functionality, patterns, dependencies, insights)
 * - Source chunk storage for exact reconstruction
 * - File blueprint extraction
 * - Direct bridge to ResonanceOrchestrator for address-based storage
 * - Regeneration via orchestrator resonance matching
 */

import { ResonanceOrchestrator, CodeArtifact, ArtifactUnderstanding, RegenerationMode } from './ResonanceOrchestrator';

// ─── GNN Node Types ───

export interface GNNNode {
  id: string;
  nodeType: 'functionality' | 'pattern' | 'dependency' | 'constraint' | 'improvement' | 'insight' | 'reusable_component' | 'source_chunk' | 'file_blueprint';
  content: string;
  weight: number;
  connections: string[];
  sourceArtifact: string;
  createdAt: string;
  usageCount: number;
  lastUsedAt?: string;
}

export interface MorphOperation {
  id: string;
  type: 'analyze' | 'understand' | 'remember' | 'regenerate' | 'sync_to_supabase' | 'improvise' | 'recall';
  target: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  timestamp: string;
}

export interface Artifact {
  id: string;
  originalName: string;
  originalContent: string;
  type: 'file' | 'code' | 'text' | 'url';
  language?: string;

  understanding: {
    intent: string;
    functionality: string[];
    dependencies: string[];
    patterns: string[];
    complexity: number;
    keyInsights: string[];
    reusableComponents: string[];
  };

  regeneration?: {
    generatedCode: string;
    architecture: string;
    confidence: number;
    improvements: string[];
    gnnNodes: string[];
    generatedAt: string;
    mode: string;
  };

  supabaseSync: {
    understandingSynced: boolean;
    originalSynced: boolean;
    lastSyncAt?: string;
    syncError?: string;
  };

  metadata: {
    size: number;
    uploadedAt: string;
    source: 'upload' | 'paste';
    status: 'analyzing' | 'understood' | 'regenerated' | 'failed';
    morphGnnRelated: boolean;
  };
}

// ─── MAIN ENGINE ───

export class MorphMemoryEngine {
  private nodes: Map<string, GNNNode> = new Map();
  private operations: MorphOperation[] = [];
  private nodeCounter = 0;
  private orchestrator: ResonanceOrchestrator;

  constructor(orchestrator?: ResonanceOrchestrator) {
    this.orchestrator = orchestrator || new ResonanceOrchestrator();
  }

  public setOrchestrator(orch: ResonanceOrchestrator): void {
    this.orchestrator = orch;
  }

  // ─── Hydration ───

  hydrate(nodes: GNNNode[]): void {
    for (const node of nodes) {
      this.nodes.set(node.id, node);
      const num = parseInt(node.id.split('_')[1] || '0');
      this.nodeCounter = Math.max(this.nodeCounter, num);
    }
  }

  // ─── Core: Analyze ───

  async analyzeArtifact(artifact: Artifact): Promise<Artifact> {
    this.addOperation('analyze', artifact.id, `Analyzing ${artifact.originalName}...`);

    const content = artifact.originalContent;

    // Extract understanding
    const intent = this.extractIntent(content);
    const functionality = this.extractFunctionality(content);
    const dependencies = this.extractDependencies(content);
    const patterns = this.extractPatterns(content);
    const complexity = this.calculateComplexity(content);
    const keyInsights = this.extractKeyInsights(content, intent, functionality);
    const reusableComponents = this.extractReusableComponents(content, functionality);

    // Store source chunks for exact reconstruction
    this.createSourceChunks(content, artifact.id);

    // Store file blueprint
    const blueprint = this.extractBlueprint(content);
    this.createNode('file_blueprint', JSON.stringify(blueprint), artifact.id);

    // Store understanding nodes
    for (const func of functionality) {
      this.createNode('functionality', func, artifact.id);
    }
    for (const pattern of patterns) {
      this.createNode('pattern', pattern, artifact.id);
    }
    for (const dep of dependencies) {
      this.createNode('dependency', dep, artifact.id);
    }
    for (const insight of keyInsights) {
      this.createNode('insight', insight, artifact.id);
    }
    for (const comp of reusableComponents) {
      this.createNode('reusable_component', comp, artifact.id);
    }

    const analyzed: Artifact = {
      ...artifact,
      understanding: {
        intent, functionality, dependencies, patterns, complexity,
        keyInsights, reusableComponents
      },
      metadata: {
        ...artifact.metadata,
        status: 'understood'
      }
    };

    // BRIDGE: Push to orchestrator super base
    const codeArtifact: CodeArtifact = {
      id: artifact.id,
      originalName: artifact.originalName,
      originalContent: artifact.originalContent,
      type: artifact.type,
      language: artifact.language,
      understanding: analyzed.understanding
    };

    const address = this.orchestrator.storeArtifactUnderstanding(codeArtifact);

    // Store code chunks in orchestrator too
    const chunkSize = 2000;
    const overlap = 200;
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    this.orchestrator.storeCodeChunks(artifact.id, chunks);

    this.completeOperation('analyze', artifact.id,
      `Understood: ${intent}. Created ${functionality.length + patterns.length + dependencies.length} memory nodes + source chunks. Address: M${address.mesh}L${address.layer}C${address.center}N${address.node}`);

    return analyzed;
  }

  // ─── Core: Remember ───

  async rememberArtifact(artifact: Artifact): Promise<void> {
    if (!artifact.understanding) return;
    this.addOperation('remember', artifact.id,
      `Committing ${artifact.originalName} to memory...`);
    this.strengthenConnections(artifact.id);
    const artifactNodes = this.findArtifactNodes(artifact.id);
    for (const node of artifactNodes) {
      node.weight = Math.min(1.0, node.weight + 0.2);
    }
    this.completeOperation('remember', artifact.id,
      `Committed ${artifactNodes.length} nodes.`);
  }

  // ─── Core: Regenerate (via Orchestrator) ───

  async regenerateArtifact(
    artifact: Artifact,
    context?: string,
    mode: RegenerationMode = 'exact',
    userId: string = 'default'
  ): Promise<Artifact> {
    if (!artifact.understanding) return artifact;

    this.addOperation('regenerate', artifact.id,
      `Regenerating ${artifact.originalName} (mode: ${mode})...`);

    // BRIDGE: Use orchestrator for resonance-based regeneration
    const result = await this.orchestrator.regenerateFromMemory(
      artifact.understanding.intent,
      context,
      mode,
      userId
    );

    // Track usage on local GNN nodes
    const artifactNodes = this.findArtifactNodes(artifact.id);
    const relevantNodes = [
      ...artifactNodes,
      ...this.findRelevantNodes(artifact.understanding.intent, context)
    ];
    for (const node of relevantNodes) {
      node.usageCount++;
      node.lastUsedAt = new Date().toISOString();
    }

    // Calculate improvements
    const improvements = mode === 'improved'
      ? this.suggestImprovements(artifact.understanding, relevantNodes)
      : [];

    const regeneration = {
      generatedCode: result.code,
      architecture: result.usedEntries.length > 0
        ? `Resonance-based: ${result.usedEntries.map(e => e.content.originalName || e.id).join(', ')}`
        : 'Direct reconstruction',
      confidence: result.confidence,
      improvements,
      gnnNodes: relevantNodes.map(n => n.id),
      generatedAt: new Date().toISOString(),
      mode
    };

    this.completeOperation('regenerate', artifact.id,
      `${mode} regeneration complete (${regeneration.confidence}% confidence). Address: M${result.address.mesh}L${result.address.layer}`);

    return {
      ...artifact,
      regeneration,
      metadata: {
        ...artifact.metadata,
        status: 'regenerated'
      }
    };
  }

  // ─── Core: Recall ───

  async recall(query: string): Promise<{
    relevantNodes: GNNNode[];
    insights: string[];
    suggestedComponents: string[];
    resonantEntries: any[];
  }> {
    this.addOperation('recall', 'system', `Recalling memory for: ${query}`);
    const relevantNodes = this.findRelevantNodes(query);
    const insights = relevantNodes.filter(n => n.nodeType === 'insight').map(n => n.content);
    const suggestedComponents = relevantNodes.filter(n => n.nodeType === 'reusable_component').map(n => n.content);

    // BRIDGE: Also query orchestrator super base
    const allEntries = this.orchestrator.getSuperBaseEntries();
    const resonantEntries = allEntries.filter(e =>
      e.metadata.sourceType === 'code_understanding' &&
      JSON.stringify(e.content).toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    this.completeOperation('recall', 'system',
      `Found ${relevantNodes.length} GNN nodes + ${resonantEntries.length} super base entries`);

    return { relevantNodes, insights, suggestedComponents, resonantEntries };
  }

  // ─── Core: Improvise (via Orchestrator) ───

  async improvise(request: string, baseArtifact?: Artifact, userId: string = 'default'): Promise<{
    code: string;
    explanation: string;
    usedNodes: GNNNode[];
    usedEntries: any[];
  }> {
    this.addOperation('improvise', 'system', `Improvising: ${request}`);

    // BRIDGE: Use orchestrator for creative combination
    const result = await this.orchestrator.improviseCode(
      request,
      baseArtifact?.id,
      userId
    );

    // Track local nodes
    const allNodes = Array.from(this.nodes.values());
    const relevantNodes = allNodes.filter(n =>
      n.content.toLowerCase().includes(request.toLowerCase()) ||
      n.nodeType === 'improvement' ||
      n.nodeType === 'reusable_component' ||
      n.usageCount > 0
    );
    for (const node of relevantNodes) {
      node.usageCount++;
      node.lastUsedAt = new Date().toISOString();
    }

    this.completeOperation('improvise', 'system',
      `Improvisation complete using ${relevantNodes.length} local nodes + ${result.usedEntries.length} super base entries`);

    return {
      code: result.code,
      explanation: result.explanation,
      usedNodes: relevantNodes,
      usedEntries: result.usedEntries
    };
  }

  // ─── Source Chunk Storage ───

  private createSourceChunks(content: string, artifactId: string): void {
    const chunkSize = 2000;
    const overlap = 200;
    const chunks: string[] = [];

    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      chunks.push(content.slice(i, i + chunkSize));
    }

    for (let i = 0; i < chunks.length; i++) {
      this.createNode('source_chunk', chunks[i], artifactId);
    }
  }

  // ─── File Blueprint ───

  private extractBlueprint(content: string): object {
    return {
      imports: [...content.matchAll(/import\s+.+\s+from\s+['"](.+)['"]/g)].map(m => m[0]),
      exports: [...content.matchAll(/export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+\w+/g)].map(m => m[0]),
      functions: [...content.matchAll(/(?:function|const)\s+(\w+)/g)].map(m => m[1]).filter((v, i, a) => a.indexOf(v) === i),
      classes: [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1]),
      interfaces: [...content.matchAll(/interface\s+(\w+)/g)].map(m => m[1]),
      hasJSX: content.includes('return (') || content.includes('<>'),
      lineCount: content.split('\n').length,
    };
  }

  // ─── Extraction Methods ───

  private extractIntent(content: string): string {
    const commentPatterns = [
      /\/\*\*\s*\n\s*\*\s*(.+?)\n/s,
      /\/\/\s*(.+?)(?:\n|$)/,
      /#\s*(.+?)(?:\n|$)/,
    ];
    for (const pattern of commentPatterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    const classMatch = content.match(/class\s+(\w+)/);
    const funcMatch = content.match(/function\s+(\w+)/);
    if (classMatch) return `Implements ${classMatch[1]} functionality`;
    if (funcMatch) return `Provides ${funcMatch[1]} capability`;
    return 'Unknown functionality - requires analysis';
  }

  private extractFunctionality(content: string): string[] {
    const functions: string[] = [];
    const exportMatches = content.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+(\w+)/g);
    for (const match of exportMatches) {
      functions.push(`Export: ${match[1]}`);
    }
    const methodMatches = content.matchAll(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g);
    for (const match of methodMatches) {
      if (!['if', 'while', 'for', 'switch', 'catch'].includes(match[1])) {
        functions.push(`Method: ${match[1]}`);
      }
    }
    const apiMatches = content.matchAll(/(?:fetch|axios|http)\s*\(/g);
    let apiCount = 0;
    for (const _ of apiMatches) apiCount++;
    if (apiCount > 0) functions.push(`API integration (${apiCount} endpoints)`);
    if (content.includes('useState') || content.includes('useReducer')) {
      functions.push('State management');
    }
    if (content.includes('onClick') || content.includes('onChange') || content.includes('addEventListener')) {
      functions.push('Event handling');
    }
    return functions.length > 0 ? functions : ['Basic functionality'];
  }

  private extractDependencies(content: string): string[] {
    const deps: string[] = [];
    const importMatches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      deps.push(match[1]);
    }
    const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
    for (const match of requireMatches) {
      deps.push(match[1]);
    }
    if (content.includes('supabase')) deps.push('Supabase client');
    if (content.includes('tensorflow') || content.includes('tf.')) deps.push('TensorFlow.js');
    if (content.includes('three')) deps.push('Three.js');
    if (content.includes('react')) deps.push('React');
    return [...new Set(deps)];
  }

  private extractPatterns(content: string): string[] {
    const patterns: string[] = [];
    if (content.includes('class') && content.includes('extends')) patterns.push('Inheritance');
    if (content.includes('interface')) patterns.push('Interface segregation');
    if (content.includes('useEffect') || content.includes('useMemo')) patterns.push('React hooks');
    if (content.includes('create') || content.includes('factory')) patterns.push('Factory pattern');
    if (content.includes('observer') || content.includes('subscribe')) patterns.push('Observer pattern');
    if (content.includes('Map') || content.includes('Set')) patterns.push('Collection management');
    if (content.includes('async') || content.includes('await')) patterns.push('Async/await');
    if (content.includes('try') && content.includes('catch')) patterns.push('Error handling');
    if (content.includes('reduce') || content.includes('map')) patterns.push('Functional programming');
    return patterns.length > 0 ? patterns : ['Procedural'];
  }

  private extractKeyInsights(content: string, intent: string, functionality: string[]): string[] {
    const insights: string[] = [];
    if (content.includes('graph') || content.includes('node') || content.includes('edge')) {
      insights.push('Graph-based architecture suitable for network problems');
    }
    if (content.includes('neural') || content.includes('tensor') || content.includes('layer')) {
      insights.push('Neural network components - can be extended with ML capabilities');
    }
    if (content.includes('stream') || content.includes('pipe')) {
      insights.push('Streaming architecture - good for real-time data processing');
    }
    if (content.includes('cache') || content.includes('memo')) {
      insights.push('Caching strategy detected - performance optimization available');
    }
    if (content.includes('queue') || content.includes('worker')) {
      insights.push('Queue-based processing - scalable for background tasks');
    }
    if (functionality.some(f => f.includes('API'))) {
      insights.push('API integration pattern - reusable for other service connections');
    }
    if (functionality.some(f => f.includes('State'))) {
      insights.push('State management pattern - applicable to other UI components');
    }
    return insights.length > 0 ? insights : ['General utility functionality'];
  }

  private extractReusableComponents(content: string, functionality: string[]): string[] {
    const components: string[] = [];
    const utilMatches = content.matchAll(/(?:export\s+)?(?:function|const)\s+(\w+(?:Util|Helper|Tool))/g);
    for (const match of utilMatches) {
      components.push(`Utility: ${match[1]}`);
    }
    if (content.includes('config') || content.includes('options') || content.includes('settings')) {
      components.push('Configuration pattern');
    }
    if (content.includes('validate') || content.includes('schema') || content.includes('check')) {
      components.push('Validation logic');
    }
    if (content.includes('transform') || content.includes('parse') || content.includes('format')) {
      components.push('Data transformation utilities');
    }
    return components.length > 0 ? components : ['Core functionality'];
  }

  private calculateComplexity(content: string): number {
    let score = 50;
    const lines = content.split('\n').length;
    score += Math.min(lines / 10, 20);
    const maxDepth = this.getMaxNestingDepth(content);
    score += maxDepth * 5;
    const funcCount = (content.match(/function/g) || []).length;
    score += funcCount * 2;
    if (content.includes('async')) score += 10;
    if (content.includes('Promise')) score += 5;
    return Math.min(100, Math.round(score));
  }

  private getMaxNestingDepth(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    for (const char of content) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }
    return maxDepth;
  }

  // ─── Node Management ───

  private findRelevantNodes(query: string, context?: string): GNNNode[] {
    const allNodes = Array.from(this.nodes.values());
    const queryLower = query.toLowerCase();
    return allNodes.filter(n => {
      const contentLower = n.content.toLowerCase();
      const matchesQuery = contentLower.includes(queryLower);
      const matchesContext = context ? contentLower.includes(context.toLowerCase()) : false;
      const isReusable = n.nodeType === 'reusable_component';
      const isInsight = n.nodeType === 'insight';
      const hasBeenUsed = n.usageCount > 0;
      return matchesQuery || matchesContext || isReusable || (isInsight && hasBeenUsed);
    }).sort((a, b) => {
      const scoreA = a.weight + (a.usageCount * 0.1);
      const scoreB = b.weight + (b.usageCount * 0.1);
      return scoreB - scoreA;
    });
  }

  private findArtifactNodes(artifactId: string): GNNNode[] {
    return Array.from(this.nodes.values()).filter(n => n.sourceArtifact === artifactId);
  }

  private strengthenConnections(artifactId: string): void {
    const artifactNodes = this.findArtifactNodes(artifactId);
    for (let i = 0; i < artifactNodes.length; i++) {
      for (let j = i + 1; j < artifactNodes.length; j++) {
        if (!artifactNodes[i].connections.includes(artifactNodes[j].id)) {
          artifactNodes[i].connections.push(artifactNodes[j].id);
        }
        if (!artifactNodes[j].connections.includes(artifactNodes[i].id)) {
          artifactNodes[j].connections.push(artifactNodes[i].id);
        }
      }
    }
  }

  private suggestImprovements(understanding: Artifact['understanding'], nodes: GNNNode[]): string[] {
    const improvements: string[] = [];
    if (understanding.complexity > 80) {
      improvements.push('Consider breaking into smaller modules');
    }
    if (!understanding.patterns.includes('Error handling')) {
      improvements.push('Add comprehensive error handling');
    }
    if (!understanding.patterns.includes('Async/await') && understanding.dependencies.some(d => d.includes('api'))) {
      improvements.push('Use async/await for API calls');
    }
    const improvementNodes = nodes.filter(n => n.nodeType === 'improvement');
    for (const node of improvementNodes) {
      improvements.push(node.content);
    }
    return improvements;
  }

  private createNode(type: GNNNode['nodeType'], content: string, sourceId: string): GNNNode {
    const id = `node_${++this.nodeCounter}_${Date.now()}`;
    const node: GNNNode = {
      id,
      nodeType: type,
      content,
      weight: 0.8,
      connections: [],
      sourceArtifact: sourceId,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };
    this.nodes.set(id, node);
    return node;
  }

  private addOperation(type: MorphOperation['type'], target: string, description: string) {
    this.operations.push({
      id: `op_${Date.now()}`,
      type,
      target,
      description,
      status: 'running',
      timestamp: new Date().toISOString()
    });
  }

  private completeOperation(type: MorphOperation['type'], target: string, result: string) {
    const op = this.operations.find(o => o.type === type && o.target === target && o.status === 'running');
    if (op) {
      op.status = 'completed';
      op.result = result;
    }
  }

  // ─── Public Getters ───

  getNodes(): GNNNode[] {
    return Array.from(this.nodes.values());
  }

  getOperations(): MorphOperation[] {
    return [...this.operations];
  }

  getOrchestrator(): ResonanceOrchestrator {
    return this.orchestrator;
  }
}

// ─── Singleton ───

let engineInstance: MorphMemoryEngine | null = null;

export function getMorphEngine(orch?: ResonanceOrchestrator): MorphMemoryEngine {
  if (!engineInstance) {
    engineInstance = new MorphMemoryEngine(orch);
  }
  return engineInstance;
}

export function resetMorphEngine(): void {
  engineInstance = null;
}

export function hydrateEngine(nodes: GNNNode[]): void {
  const engine = getMorphEngine();
  engine.hydrate(nodes);
}
