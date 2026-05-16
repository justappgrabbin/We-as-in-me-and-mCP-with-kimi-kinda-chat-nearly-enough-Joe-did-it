/**
 * MOBILE MCP INTEGRATION + SELF-LEARNING ENGINE
 * 
 * Connects to mobile-next/mobile-mcp for:
 * - Device automation (iOS/Android simulators, emulators, real devices)
 * - Screenshot analysis
 * - App interaction (tap, swipe, type)
 * - Accessibility tree extraction
 * 
 * Plus SELF-LEARNING:
 * - Every interaction updates the system's "knowledge graph"
 * - Pattern success/failure tracking
 * - Capability expansion over time
 * - Emergent behavior from accumulated experience
 */

import { ResonanceOrchestrator, Address } from './ResonanceOrchestrator';

// ─── MOBILE MCP CLIENT ───

export interface MobileDevice {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  type: 'simulator' | 'emulator' | 'real';
  screenSize: { width: number; height: number };
  orientation: 'portrait' | 'landscape';
  status: 'available' | 'busy' | 'offline';
}

export interface ScreenElement {
  id: string;
  type: string;
  text?: string;
  label?: string;
  coordinates: { x: number; y: number };
  size: { width: number; height: number };
  accessibilityLabel?: string;
  isVisible: boolean;
}

export interface MobileAction {
  type: 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'type' | 'pressButton' | 'screenshot';
  target?: { x: number; y: number } | string;
  direction?: 'up' | 'down' | 'left' | 'right';
  text?: string;
  button?: 'HOME' | 'BACK' | 'VOLUME_UP' | 'VOLUME_DOWN' | 'ENTER';
}

export interface MobileObservation {
  timestamp: number;
  screenshot?: string; // base64
  elements: ScreenElement[];
  action: MobileAction;
  result: 'success' | 'failure' | 'timeout';
  error?: string;
}

export class MobileMCPClient {
  private mcpServerUrl: string;
  private connectedDevice: MobileDevice | null = null;
  private observationHistory: MobileObservation[] = [];
  private isConnected: boolean = false;

  constructor(mcpServerUrl: string = 'http://localhost:3000') {
    this.mcpServerUrl = mcpServerUrl;
  }

  // ─── Device Management ───

  async listDevices(): Promise<MobileDevice[]> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/tools/mobile_list_available_devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      return result.devices || [];
    } catch (error) {
      console.warn('Mobile MCP server not available:', error);
      return [];
    }
  }

  async connect(deviceId: string): Promise<boolean> {
    try {
      const devices = await this.listDevices();
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        this.connectedDevice = device;
        this.isConnected = true;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // ─── Screen Interaction ───

  async takeScreenshot(): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      const response = await fetch(`${this.mcpServerUrl}/tools/mobile_take_screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      return result.screenshot || null;
    } catch (error) {
      return null;
    }
  }

  async listElements(): Promise<ScreenElement[]> {
    if (!this.isConnected) return [];
    try {
      const response = await fetch(`${this.mcpServerUrl}/tools/mobile_list_elements_on_screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      return result.elements || [];
    } catch (error) {
      return [];
    }
  }

  async tap(x: number, y: number): Promise<boolean> {
    return this.executeAction({ type: 'tap', target: { x, y } });
  }

  async swipe(direction: 'up' | 'down' | 'left' | 'right'): Promise<boolean> {
    return this.executeAction({ type: 'swipe', direction });
  }

  async type(text: string): Promise<boolean> {
    return this.executeAction({ type: 'type', text });
  }

  async pressButton(button: MobileAction['button']): Promise<boolean> {
    return this.executeAction({ type: 'pressButton', button });
  }

  private async executeAction(action: MobileAction): Promise<boolean> {
    if (!this.isConnected) return false;

    const observation: MobileObservation = {
      timestamp: Date.now(),
      elements: [],
      action,
      result: 'success',
    };

    try {
      // Get pre-action state
      observation.elements = await this.listElements();

      // Execute action
      const toolName = this.getToolName(action);
      const response = await fetch(`${this.mcpServerUrl}/tools/${toolName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });

      const result = await response.json();
      observation.result = result.success ? 'success' : 'failure';
      if (result.error) observation.error = result.error;

      // Store observation
      this.observationHistory.push(observation);

      return result.success;
    } catch (error) {
      observation.result = 'failure';
      observation.error = error instanceof Error ? error.message : 'Unknown error';
      this.observationHistory.push(observation);
      return false;
    }
  }

  private getToolName(action: MobileAction): string {
    const toolMap: Record<string, string> = {
      tap: 'mobile_click_on_screen_at_coordinates',
      doubleTap: 'mobile_double_tap_on_screen',
      longPress: 'mobile_long_press_on_screen_at_coordinates',
      swipe: 'mobile_swipe_on_screen',
      type: 'mobile_type_keys',
      pressButton: 'mobile_press_button',
      screenshot: 'mobile_take_screenshot',
    };
    return toolMap[action.type] || 'mobile_take_screenshot';
  }

  // ─── Learning from Mobile Interactions ───

  async learnFromApp(packageName: string, maxSteps: number = 50): Promise<{
    flow: MobileObservation[];
    patterns: string[];
    insights: string[];
  }> {
    if (!this.isConnected) return { flow: [], patterns: [], insights: [] };

    const flow: MobileObservation[] = [];
    const patterns: string[] = [];

    // Launch app
    await this.executeAction({ type: 'tap' }); // placeholder

    for (let step = 0; step < maxSteps; step++) {
      const elements = await this.listElements();
      const screenshot = await this.takeScreenshot();

      // Analyze screen for interactive elements
      const interactiveElements = elements.filter(e => 
        e.type === 'button' || e.type === 'textField' || e.type === 'link'
      );

      if (interactiveElements.length === 0) break;

      // Choose action based on element analysis
      const target = interactiveElements[Math.floor(Math.random() * interactiveElements.length)];

      const action: MobileAction = target.type === 'textField' 
        ? { type: 'type', text: 'test' }
        : { type: 'tap', target: { x: target.coordinates.x, y: target.coordinates.y } };

      const success = await this.executeAction(action);

      const observation: MobileObservation = {
        timestamp: Date.now(),
        screenshot: screenshot || undefined,
        elements,
        action,
        result: success ? 'success' : 'failure',
      };

      flow.push(observation);

      // Extract patterns
      if (success) {
        patterns.push(`${target.type}_at_${target.coordinates.x}_${target.coordinates.y}`);
      }
    }

    // Generate insights from flow
    const insights = this.extractInsights(flow);

    return { flow, patterns: [...new Set(patterns)], insights };
  }

  private extractInsights(flow: MobileObservation[]): string[] {
    const insights: string[] = [];

    // Find repeated patterns
    const actionSequence = flow.map(o => o.action.type);
    const repeated = this.findRepeatedSequences(actionSequence);
    if (repeated.length > 0) {
      insights.push(`Detected repeated interaction pattern: ${repeated[0].join(' → ')}`);
    }

    // Find failure points
    const failures = flow.filter(o => o.result === 'failure');
    if (failures.length > 0) {
      insights.push(`${failures.length} interaction failures detected, primarily with ${failures[0].action.type} actions`);
    }

    // Find navigation depth
    const uniqueScreens = new Set(flow.map(o => o.elements.map(e => e.id).join(',')));
    insights.push(`App has ${uniqueScreens.size} distinct screen states`);

    return insights;
  }

  private findRepeatedSequences(sequence: string[]): string[][] {
    const repeated: string[][] = [];
    for (let len = 2; len <= 5; len++) {
      for (let i = 0; i <= sequence.length - len * 2; i++) {
        const sub = sequence.slice(i, i + len);
        const next = sequence.slice(i + len, i + len * 2);
        if (sub.join(',') === next.join(',')) {
          repeated.push(sub);
        }
      }
    }
    return repeated;
  }

  // ─── Getters ───

  getObservationHistory(): MobileObservation[] {
    return [...this.observationHistory];
  }

  getConnectedDevice(): MobileDevice | null {
    return this.connectedDevice;
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SELF-LEARNING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface LearningEvent {
  id: string;
  timestamp: number;
  type: 'architecture_generated' | 'architecture_accepted' | 'architecture_rejected' | 
        'code_executed' | 'code_failed' | 'user_feedback' | 'mobile_observation' |
        'pattern_recognized' | 'capability_discovered';
  data: any;
  impact: number; // -1 to +1, how much this event changes the system
}

export interface GrowthMetric {
  totalInteractions: number;
  successfulGenerations: number;
  failedGenerations: number;
  acceptedArchitectures: number;
  rejectedArchitectures: number;
  patternsLearned: number;
  capabilitiesAcquired: string[];
  averageNoveltyScore: number;
  averageUserResonance: number;
  evolutionRate: number; // how fast the system is changing
  adaptationLevel: number; // 0-1, how well it knows the user
}

export interface Capability {
  name: string;
  description: string;
  acquiredAt: number;
  proficiency: number; // 0-1
  usageCount: number;
  lastUsed: number;
  dependencies: string[];
}

export class SelfLearningEngine {
  private orchestrator: ResonanceOrchestrator;
  private events: LearningEvent[] = [];
  private capabilities: Map<string, Capability> = new Map();
  private patternSuccessRates: Map<string, { success: number; total: number }> = new Map();
  private growthHistory: GrowthMetric[] = [];
  private mobileClient: MobileMCPClient;

  constructor(orchestrator: ResonanceOrchestrator, mobileClient?: MobileMCPClient) {
    this.orchestrator = orchestrator;
    this.mobileClient = mobileClient || new MobileMCPClient();
    this.initializeBaseCapabilities();
  }

  // ─── Base Capabilities ───

  private initializeBaseCapabilities(): void {
    const baseCapabilities: Capability[] = [
      {
        name: 'code_analysis',
        description: 'Analyze code to extract intent, patterns, dependencies',
        acquiredAt: Date.now(),
        proficiency: 0.8,
        usageCount: 0,
        lastUsed: Date.now(),
        dependencies: [],
      },
      {
        name: 'code_generation',
        description: 'Generate code from patterns and understanding',
        acquiredAt: Date.now(),
        proficiency: 0.6,
        usageCount: 0,
        lastUsed: Date.now(),
        dependencies: ['code_analysis'],
      },
      {
        name: 'resonance_matching',
        description: 'Match queries to stored understanding via neural mesh',
        acquiredAt: Date.now(),
        proficiency: 0.7,
        usageCount: 0,
        lastUsed: Date.now(),
        dependencies: [],
      },
      {
        name: 'human_design_mapping',
        description: 'Map Human Design charts to architectural patterns',
        acquiredAt: Date.now(),
        proficiency: 0.5,
        usageCount: 0,
        lastUsed: Date.now(),
        dependencies: ['code_generation'],
      },
      {
        name: 'evolutionary_selection',
        description: 'Evolve architectures based on user feedback',
        acquiredAt: Date.now(),
        proficiency: 0.4,
        usageCount: 0,
        lastUsed: Date.now(),
        dependencies: ['code_generation', 'human_design_mapping'],
      },
    ];

    for (const cap of baseCapabilities) {
      this.capabilities.set(cap.name, cap);
    }
  }

  // ─── Learning from Events ───

  recordEvent(type: LearningEvent['type'], data: any, impact: number = 0): void {
    const event: LearningEvent = {
      id: `learn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      type,
      data,
      impact: Math.max(-1, Math.min(1, impact)),
    };

    this.events.push(event);

    // Process the event
    this.processEvent(event);

    // Update growth metrics
    this.updateGrowthMetrics();

    // Check for emergent capabilities
    this.checkForEmergentCapabilities();
  }

  private processEvent(event: LearningEvent): void {
    switch (event.type) {
      case 'architecture_accepted':
        this.learnFromAcceptedArchitecture(event.data);
        break;
      case 'architecture_rejected':
        this.learnFromRejectedArchitecture(event.data);
        break;
      case 'code_executed':
        this.learnFromExecution(event.data, true);
        break;
      case 'code_failed':
        this.learnFromExecution(event.data, false);
        break;
      case 'pattern_recognized':
        this.learnPattern(event.data);
        break;
      case 'mobile_observation':
        this.learnFromMobileObservation(event.data);
        break;
      case 'user_feedback':
        this.learnFromFeedback(event.data);
        break;
    }
  }

  private learnFromAcceptedArchitecture(data: any): void {
    const { gatesUsed, patterns } = data;

    // Increase proficiency of related capabilities
    const relatedCaps = ['code_generation', 'human_design_mapping', 'evolutionary_selection'];
    for (const capName of relatedCaps) {
      const cap = this.capabilities.get(capName);
      if (cap) {
        cap.proficiency = Math.min(1, cap.proficiency + 0.02);
        cap.usageCount++;
        cap.lastUsed = Date.now();
      }
    }

    // Update pattern success rates
    for (const pattern of patterns || []) {
      const current = this.patternSuccessRates.get(pattern) || { success: 0, total: 0 };
      current.success++;
      current.total++;
      this.patternSuccessRates.set(pattern, current);
    }

    // Update orchestrator mesh
    for (const gate of gatesUsed || []) {
      // Increase coherence for these gate addresses
      const address: Address = {
        mesh: gate % 5,
        layer: (gate >> 3) % 13,
        center: (gate >> 6) % 9,
        node: (gate - 1) % 64,
        line: ((gate >> 4) % 6) + 1,
        color: (gate >> 2) % 6,
        tone: (gate >> 1) % 6,
        zodiac: gate % 12,
        house: (gate >> 5) % 12,
        dimension: Math.random(),
        arcDegree: (gate * 5.625) % 360,
      };

      const nodeState = this.orchestrator['mesh'].get(this.orchestrator['addressToKey'](address));
      if (nodeState) {
        nodeState.coherence = Math.min(1, nodeState.coherence + 0.05);
        nodeState.baseState = 'RESONANT';
      }
    }
  }

  private learnFromRejectedArchitecture(data: any): void {
    const { gatesUsed, patterns } = data;

    // Decrease pattern success rates
    for (const pattern of patterns || []) {
      const current = this.patternSuccessRates.get(pattern) || { success: 0, total: 0 };
      current.total++;
      this.patternSuccessRates.set(pattern, current);
    }

    // Decrease coherence for rejected gate addresses
    for (const gate of gatesUsed || []) {
      const address: Address = {
        mesh: gate % 5,
        layer: (gate >> 3) % 13,
        center: (gate >> 6) % 9,
        node: (gate - 1) % 64,
        line: ((gate >> 4) % 6) + 1,
        color: (gate >> 2) % 6,
        tone: (gate >> 1) % 6,
        zodiac: gate % 12,
        house: (gate >> 5) % 12,
        dimension: Math.random(),
        arcDegree: (gate * 5.625) % 360,
      };

      const nodeState = this.orchestrator['mesh'].get(this.orchestrator['addressToKey'](address));
      if (nodeState) {
        nodeState.coherence = Math.max(0.1, nodeState.coherence - 0.03);
        nodeState.tension = Math.min(1, nodeState.tension + 0.1);
      }
    }
  }

  private learnFromExecution(data: any, success: boolean): void {
    const { code, error } = data;

    // Extract patterns from code
    const patterns = this.extractPatternsFromCode(code);

    for (const pattern of patterns) {
      const current = this.patternSuccessRates.get(pattern) || { success: 0, total: 0 };
      if (success) current.success++;
      current.total++;
      this.patternSuccessRates.set(pattern, current);
    }

    // If failed, learn from error
    if (!success && error) {
      this.learnFromError(error, code);
    }
  }

  private learnFromError(error: string, code: string): void {
    // Try to identify the failing pattern
    const errorPatterns = [
      { regex: /Cannot read properties? of undefined/, fix: 'Add null checks' },
      { regex: /is not a function/, fix: 'Check import/definition' },
      { regex: /Cannot find module/, fix: 'Add missing dependency' },
      { regex: /Network Error/, fix: 'Add retry logic' },
      { regex: /timeout/, fix: 'Increase timeout or add async handling' },
    ];

    for (const { regex, fix } of errorPatterns) {
      if (regex.test(error)) {
        // Store this as a learned fix
        this.recordEvent('pattern_recognized', {
          pattern: `error_${regex.source.slice(0, 20)}`,
          fix,
          context: code.slice(0, 200),
        }, 0.3);
      }
    }
  }

  private learnPattern(data: any): void {
    const { pattern, context } = data;

    // Check if this pattern unlocks new capabilities
    const patternUnlocks: Record<string, string[]> = {
      'mobile_tap': ['mobile_automation', 'ui_testing'],
      'mobile_swipe': ['mobile_automation', 'gesture_recognition'],
      'api_call': ['external_integration', 'network_handling'],
      'database_query': ['data_persistence', 'query_optimization'],
      'websocket': ['realtime_communication', 'event_streaming'],
    };

    const unlocks = patternUnlocks[pattern];
    if (unlocks) {
      for (const capName of unlocks) {
        if (!this.capabilities.has(capName)) {
          this.acquireCapability(capName, `Discovered through pattern: ${pattern}`);
        } else {
          const cap = this.capabilities.get(capName)!;
          cap.proficiency = Math.min(1, cap.proficiency + 0.05);
        }
      }
    }
  }

  private learnFromMobileObservation(data: MobileObservation): void {
    // Learn from successful mobile interactions
    if (data.result === 'success') {
      const pattern = `${data.action.type}_${data.elements[0]?.type || 'unknown'}`;
      this.learnPattern({ pattern, context: data });
    }
  }

  private learnFromFeedback(data: any): void {
    const { feedback, architectureId } = data;

    // Parse feedback for sentiment and specific suggestions
    const sentiment = this.analyzeSentiment(feedback);

    if (sentiment > 0.5) {
      this.recordEvent('architecture_accepted', { architectureId, feedback }, 0.5);
    } else if (sentiment < -0.5) {
      this.recordEvent('architecture_rejected', { architectureId, feedback }, -0.5);
    }
  }

  private analyzeSentiment(text: string): number {
    const positiveWords = ['good', 'great', 'excellent', 'perfect', 'love', 'like', 'yes', 'accept', 'deploy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'no', 'reject', 'wrong', 'broken'];

    const lower = text.toLowerCase();
    let score = 0;

    for (const word of positiveWords) {
      if (lower.includes(word)) score += 0.3;
    }
    for (const word of negativeWords) {
      if (lower.includes(word)) score -= 0.3;
    }

    return Math.max(-1, Math.min(1, score));
  }

  private extractPatternsFromCode(code: string): string[] {
    const patterns: string[] = [];

    if (code.includes('async') || code.includes('await')) patterns.push('async_pattern');
    if (code.includes('useState') || code.includes('useEffect')) patterns.push('react_hooks');
    if (code.includes('class') && code.includes('extends')) patterns.push('inheritance');
    if (code.includes('interface')) patterns.push('interface_segregation');
    if (code.includes('Map') || code.includes('Set')) patterns.push('collections');
    if (code.includes('fetch') || code.includes('axios')) patterns.push('api_call');
    if (code.includes('WebSocket') || code.includes('socket')) patterns.push('websocket');
    if (code.includes('supabase')) patterns.push('database_query');

    return patterns;
  }

  // ─── Emergent Capabilities ───

  private checkForEmergentCapabilities(): void {
    const recentEvents = this.events.slice(-100);

    // Check for mobile automation proficiency
    const mobileEvents = recentEvents.filter(e => e.type === 'mobile_observation');
    const successfulMobile = mobileEvents.filter(e => e.data.result === 'success');

    if (successfulMobile.length > 10 && !this.capabilities.has('mobile_automation')) {
      this.acquireCapability('mobile_automation', 
        `Discovered after ${successfulMobile.length} successful mobile interactions`);
    }

    // Check for pattern recognition proficiency
    const patternEvents = recentEvents.filter(e => e.type === 'pattern_recognized');
    if (patternEvents.length > 20 && !this.capabilities.has('advanced_pattern_recognition')) {
      this.acquireCapability('advanced_pattern_recognition',
        `Discovered after recognizing ${patternEvents.length} distinct patterns`);
    }

    // Check for architectural synthesis
    const archEvents = recentEvents.filter(e => 
      e.type === 'architecture_accepted' || e.type === 'architecture_rejected'
    );
    if (archEvents.length > 15 && !this.capabilities.has('architectural_synthesis')) {
      this.acquireCapability('architectural_synthesis',
        `Discovered after ${archEvents.length} architecture interactions`);
    }

    // Check for cross-domain reasoning
    const domains = new Set(recentEvents.map(e => e.data.domain || 'general'));
    if (domains.size > 3 && !this.capabilities.has('cross_domain_reasoning')) {
      this.acquireCapability('cross_domain_reasoning',
        `Discovered after operating across ${domains.size} distinct domains`);
    }
  }

  private acquireCapability(name: string, description: string): void {
    const capability: Capability = {
      name,
      description,
      acquiredAt: Date.now(),
      proficiency: 0.1,
      usageCount: 0,
      lastUsed: Date.now(),
      dependencies: [],
    };

    this.capabilities.set(name, capability);

    this.recordEvent('capability_discovered', { capability }, 0.8);

    console.log(`🌱 New capability acquired: ${name} — ${description}`);
  }

  // ─── Growth Metrics ───

  private updateGrowthMetrics(): void {
    const recentEvents = this.events.slice(-100);

    const metric: GrowthMetric = {
      totalInteractions: this.events.length,
      successfulGenerations: recentEvents.filter(e => e.type === 'architecture_accepted').length,
      failedGenerations: recentEvents.filter(e => e.type === 'architecture_rejected').length,
      acceptedArchitectures: this.events.filter(e => e.type === 'architecture_accepted').length,
      rejectedArchitectures: this.events.filter(e => e.type === 'architecture_rejected').length,
      patternsLearned: this.patternSuccessRates.size,
      capabilitiesAcquired: Array.from(this.capabilities.keys()),
      averageNoveltyScore: this.calculateAverageNovelty(),
      averageUserResonance: this.calculateAverageResonance(),
      evolutionRate: this.calculateEvolutionRate(),
      adaptationLevel: this.calculateAdaptationLevel(),
    };

    this.growthHistory.push(metric);

    // Keep only last 100 metrics
    if (this.growthHistory.length > 100) {
      this.growthHistory = this.growthHistory.slice(-100);
    }
  }

  private calculateAverageNovelty(): number {
    const archEvents = this.events.filter(e => e.type === 'architecture_generated');
    if (archEvents.length === 0) return 0;
    const sum = archEvents.reduce((acc, e) => acc + (e.data.noveltyScore || 50), 0);
    return Math.round(sum / archEvents.length);
  }

  private calculateAverageResonance(): number {
    const archEvents = this.events.filter(e => e.type === 'architecture_generated');
    if (archEvents.length === 0) return 0;
    const sum = archEvents.reduce((acc, e) => acc + (e.data.userResonance || 50), 0);
    return Math.round(sum / archEvents.length);
  }

  private calculateEvolutionRate(): number {
    if (this.growthHistory.length < 2) return 0;
    const recent = this.growthHistory.slice(-10);
    const capabilityGrowth = recent[recent.length - 1].capabilitiesAcquired.length - recent[0].capabilitiesAcquired.length;
    return Math.min(1, Math.max(0, capabilityGrowth / 10));
  }

  private calculateAdaptationLevel(): number {
    const totalEvents = this.events.length;
    const feedbackEvents = this.events.filter(e => 
      e.type === 'architecture_accepted' || e.type === 'architecture_rejected'
    ).length;

    if (totalEvents === 0) return 0;
    return Math.min(1, feedbackEvents / 50); // Max adaptation at 50 feedback events
  }

  // ─── Public API ───

  getCapabilities(): Capability[] {
    return Array.from(this.capabilities.values())
      .sort((a, b) => b.proficiency - a.proficiency);
  }

  getGrowthMetrics(): GrowthMetric[] {
    return [...this.growthHistory];
  }

  getCurrentGrowth(): GrowthMetric | null {
    return this.growthHistory.length > 0 
      ? this.growthHistory[this.growthHistory.length - 1] 
      : null;
  }

  getPatternSuccessRates(): Map<string, { success: number; total: number }> {
    return new Map(this.patternSuccessRates);
  }

  getEvents(type?: LearningEvent['type']): LearningEvent[] {
    if (type) {
      return this.events.filter(e => e.type === type);
    }
    return [...this.events];
  }

  getMobileClient(): MobileMCPClient {
    return this.mobileClient;
  }

  async learnFromMobileApp(packageName: string): Promise<{
    flow: MobileObservation[];
    patterns: string[];
    insights: string[];
    newCapabilities: string[];
  }> {
    const result = await this.mobileClient.learnFromApp(packageName);

    // Record observations as learning events
    for (const observation of result.flow) {
      this.recordEvent('mobile_observation', observation, 0.1);
    }

    // Check for new capabilities
    const beforeCaps = new Set(this.capabilities.keys());
    this.checkForEmergentCapabilities();
    const afterCaps = new Set(this.capabilities.keys());
    const newCapabilities = Array.from(afterCaps).filter(c => !beforeCaps.has(c));

    return { ...result, newCapabilities };
  }

  getLearningSummary(): string {
    const growth = this.getCurrentGrowth();
    const caps = this.getCapabilities();

    return `
🧠 LEARNING SUMMARY
═══════════════════════════════════════
Total Interactions: ${growth?.totalInteractions || 0}
Capabilities: ${caps.length}
  ${caps.map(c => `  • ${c.name} (${(c.proficiency * 100).toFixed(0)}%)`).join('\n')}
Patterns Learned: ${this.patternSuccessRates.size}
Adaptation Level: ${((growth?.adaptationLevel || 0) * 100).toFixed(0)}%
Evolution Rate: ${((growth?.evolutionRate || 0) * 100).toFixed(0)}%
Average Novelty: ${growth?.averageNoveltyScore || 0}%
Average Resonance: ${growth?.averageUserResonance || 0}%
═══════════════════════════════════════
    `.trim();
  }
}

export default SelfLearningEngine;
