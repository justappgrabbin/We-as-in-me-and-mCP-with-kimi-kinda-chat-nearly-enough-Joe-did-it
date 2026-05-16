"use client"

/**
 * MERGED MORPH STORE — NOVEL ARCHITECTURE EDITION
 *
 * Now includes:
 * - Human Design registration per user
 * - Novel architecture generation tracking
 * - Synthia server sync
 * - Self-modification confidence thresholds
 * - User-specific resonance signatures
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  ResonanceOrchestrator,
  HumanDesign,
  NovelArchitecture,
  RouteResult,
  UserResonanceSignature,
} from "./ResonanceOrchestrator"
import {
  MorphMemoryEngine,
  getMorphEngine,
  hydrateEngine,
  GNNNode,
  MorphOperation,
  Artifact,
} from "./MorphMemoryEngine"

export type RegenerationMode = 'exact' | 'cleaned' | 'improved'

export interface ConversationMemory {
  id: string
  timestamp: string
  userMessage: string
  morphResponse: string
  situation?: string
  entities?: string[]
  insights?: string[]
  simulationId?: string
  emotionalState?: string
  routeResult?: RouteResult
  novelArchitecture?: NovelArchitecture
}

export interface SupabaseConfig {
  url: string
  anonKey: string
  connected: boolean
  tables?: string[]
}

export interface OrchestratorState {
  coherence: number
  morphState: number
  attitude: string
  nodeCount: number
  tickCount: number
  isRunning: boolean
  superBaseSize: number
}

interface MorphState {
  // ─── Original Morph State ───
  artifacts: Artifact[]
  gnnNodes: GNNNode[]
  operations: MorphOperation[]
  conversationMemory: ConversationMemory[]
  supabaseConfig: SupabaseConfig
  isProcessing: boolean
  activeTab: "upload" | "artifacts" | "operations" | "gnn" | "mesh" | "chat" | "design"

  // ─── Human Design State ───
  userDesigns: Map<string, HumanDesign>
  currentUserId: string

  // ─── Orchestrator State ───
  orchestrator: ResonanceOrchestrator | null
  orchestratorState: OrchestratorState

  // ─── Novel Architecture State ───
  novelArchitectures: NovelArchitecture[]
  selectedNovelArch: NovelArchitecture | null

  // ─── Actions ───
  initOrchestrator: (apiBase?: string) => void
  startOrchestrator: () => void
  stopOrchestrator: () => void

  // Human Design
  registerHumanDesign: (userId: string, design: HumanDesign) => Promise<void>
  getUserSignature: (userId: string) => UserResonanceSignature | undefined

  // Artifacts
  addArtifact: (data: { name: string; type: "file" | "code" | "text"; content: string; language?: string; userId?: string }) => void
  removeArtifact: (id: string) => void
  analyzeAndRemember: (id: string) => Promise<void>
  regenerateArtifact: (id: string, context?: string, mode?: RegenerationMode, userId?: string) => Promise<void>

  // Novel
  generateNovelArchitecture: (artifactId: string, userId: string, request?: string) => Promise<void>
  selectNovelArchitecture: (id: string) => void

  // Self-modify
  selfModify: (userId: string) => Promise<{ modified: boolean; changes: string[]; confidence: number }>

  // Memory
  recallFromMemory: (query: string, userId?: string) => Promise<any>
  syncToSynthia: (artifactId: string, userId: string) => Promise<boolean>
  improvise: (request: string, baseId?: string, userId?: string) => Promise<any>

  // Chat
  sendMessage: (message: string, userId?: string) => Promise<RouteResult>

  // Conversation
  rememberConversation: (memory: Omit<ConversationMemory, "id" | "timestamp">) => void
  recallConversation: (query: string) => ConversationMemory[]
  getConversationContext: () => string

  // Config
  setSupabaseConfig: (config: Partial<SupabaseConfig>) => void
  setActiveTab: (tab: MorphState["activeTab"]) => void
  setCurrentUser: (userId: string) => void
  clearAll: () => void
}

function generateId(): string {
  return `morph_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export const useMorphStore = create<MorphState>()(
  persist(
    (set, get) => ({
      // ─── Initial State ───
      artifacts: [],
      gnnNodes: [],
      operations: [],
      conversationMemory: [],
      supabaseConfig: { url: "", anonKey: "", connected: false },
      isProcessing: false,
      activeTab: "chat",
      userDesigns: new Map(),
      currentUserId: "default",
      orchestrator: null,
      orchestratorState: {
        coherence: 0.5, morphState: 0, attitude: 'curious',
        nodeCount: 0, tickCount: 0, isRunning: false, superBaseSize: 0,
      },
      novelArchitectures: [],
      selectedNovelArch: null,

      // ─── Orchestrator Lifecycle ───
      initOrchestrator: (apiBase = 'https://synthia-server.onrender.com') => {
        const orch = new ResonanceOrchestrator(apiBase, false);
        orch.setCallbacks({
          onCoherenceChange: (coherence) => {
            set(state => ({ orchestratorState: { ...state.orchestratorState, coherence } }));
          },
          onMorphStateChange: (morphState) => {
            set(state => ({ orchestratorState: { ...state.orchestratorState, morphState } }));
          },
          onAttitudeChange: (attitude) => {
            set(state => ({ orchestratorState: { ...state.orchestratorState, attitude } }));
          },
          onNodeCountChange: (nodeCount) => {
            set(state => ({
              orchestratorState: {
                ...state.orchestratorState,
                nodeCount,
                superBaseSize: orch.getSuperBaseSize(),
              }
            }));
          },
          onNovelArchitecture: (arch) => {
            set(state => ({
              novelArchitectures: [arch, ...state.novelArchitectures],
            }));
          },
        });

        const engine = getMorphEngine(orch);
        engine.setOrchestrator(orch);

        set({
          orchestrator: orch,
          orchestratorState: {
            ...get().orchestratorState,
            nodeCount: orch.getLoadedNodes().length,
            superBaseSize: orch.getSuperBaseSize(),
          }
        });
      },

      startOrchestrator: () => {
        const { orchestrator } = get();
        if (orchestrator) {
          orchestrator.startAutonomousLoop();
          set(state => ({ orchestratorState: { ...state.orchestratorState, isRunning: true } }));
        }
      },

      stopOrchestrator: () => {
        const { orchestrator } = get();
        if (orchestrator) {
          orchestrator.stopAutonomousLoop();
          set(state => ({ orchestratorState: { ...state.orchestratorState, isRunning: false } }));
        }
      },

      // ─── Human Design ───
      registerHumanDesign: async (userId, design) => {
        const { orchestrator } = get();
        if (!orchestrator) {
          get().initOrchestrator();
        }
        const orch = get().orchestrator!;
        await orch.registerHumanDesign(userId, design);
        set(state => {
          const newMap = new Map(state.userDesigns);
          newMap.set(userId, design);
          return { userDesigns: newMap, currentUserId: userId };
        });
      },

      getUserSignature: (userId) => {
        const { orchestrator } = get();
        return orchestrator?.getUserSignature(userId);
      },

      // ─── Artifact Management ───
      addArtifact: (data) => {
        const id = generateId();
        const artifact: Artifact = {
          id,
          originalName: data.name,
          originalContent: data.content,
          type: data.type,
          language: data.language,
          userId: data.userId || get().currentUserId,
          understanding: {
            intent: "Pending analysis",
            functionality: [],
            dependencies: [],
            patterns: [],
            complexity: 0,
            keyInsights: [],
            reusableComponents: []
          },
          supabaseSync: { understandingSynced: false, originalSynced: false },
          metadata: {
            size: data.content.length,
            uploadedAt: new Date().toISOString(),
            source: "upload",
            status: "analyzing",
            morphGnnRelated: false
          }
        };
        set((state) => ({ artifacts: [artifact, ...state.artifacts] }));
        get().analyzeAndRemember(id);
      },

      removeArtifact: (id) => {
        set((state) => ({ artifacts: state.artifacts.filter((a) => a.id !== id) }));
      },

      analyzeAndRemember: async (id) => {
        set({ isProcessing: true });
        try {
          const artifact = get().artifacts.find((a) => a.id === id);
          if (!artifact) return;
          const engine = getMorphEngine(get().orchestrator || undefined);
          engine.setOrchestrator(get().orchestrator || new ResonanceOrchestrator());
          const analyzed = await engine.analyzeArtifact(artifact);
          await engine.rememberArtifact(analyzed);
          set((state) => ({
            artifacts: state.artifacts.map((a) => a.id === id ? analyzed : a),
            gnnNodes: engine.getNodes(),
            operations: engine.getOperations(),
            orchestratorState: {
              ...state.orchestratorState,
              superBaseSize: engine.getOrchestrator().getSuperBaseSize(),
              nodeCount: engine.getOrchestrator().getLoadedNodes().length,
            }
          }));
        } finally {
          set({ isProcessing: false });
        }
      },

      regenerateArtifact: async (id, context, mode = "exact", userId = "default") => {
        set({ isProcessing: true });
        try {
          const artifact = get().artifacts.find((a) => a.id === id);
          if (!artifact || !artifact.understanding) return;
          const engine = getMorphEngine(get().orchestrator || undefined);
          engine.hydrate(get().gnnNodes);
          const regenerated = await engine.regenerateArtifact(artifact, context, mode, userId);
          set((state) => ({
            artifacts: state.artifacts.map((a) => a.id === id ? regenerated : a),
            gnnNodes: engine.getNodes(),
            operations: engine.getOperations(),
            orchestratorState: {
              ...state.orchestratorState,
              coherence: engine.getOrchestrator().getGlobalCoherence(),
              morphState: engine.getOrchestrator().getMorphState(),
              attitude: engine.getOrchestrator().getPersonality().attitude,
            }
          }));
        } finally {
          set({ isProcessing: false });
        }
      },

      // ─── Novel Architecture ───
      generateNovelArchitecture: async (artifactId, userId, request) => {
        set({ isProcessing: true });
        try {
          const artifact = get().artifacts.find((a) => a.id === artifactId);
          if (!artifact) return;
          const engine = getMorphEngine(get().orchestrator || undefined);
          const result = await engine.generateNovelArchitecture(artifact, userId, request);
          set((state) => ({
            artifacts: state.artifacts.map((a) => a.id === artifactId ? result : a),
            gnnNodes: engine.getNodes(),
            operations: engine.getOperations(),
            novelArchitectures: result.novelArchitecture
              ? [result.novelArchitecture, ...state.novelArchitectures]
              : state.novelArchitectures,
          }));
        } finally {
          set({ isProcessing: false });
        }
      },

      selectNovelArchitecture: (id) => {
        const arch = get().novelArchitectures.find(a => a.id === id);
        set({ selectedNovelArch: arch || null });
      },

      // ─── Self-Modification ───
      selfModify: async (userId) => {
        const engine = getMorphEngine(get().orchestrator || undefined);
        const result = await engine.selfModify(userId);
        set((state) => ({
          operations: engine.getOperations(),
        }));
        return result;
      },

      // ─── Memory ───
      recallFromMemory: async (query, userId) => {
        const engine = getMorphEngine(get().orchestrator || undefined);
        engine.hydrate(get().gnnNodes);
        const result = await engine.recall(query, userId);
        set((state) => ({ operations: engine.getOperations() }));
        return result;
      },

      syncToSynthia: async (artifactId, userId) => {
        const engine = getMorphEngine(get().orchestrator || undefined);
        const success = await engine.syncToSynthia(artifactId, userId);
        set((state) => ({ operations: engine.getOperations() }));
        return success;
      },

      improvise: async (request, baseId, userId = "default") => {
        const engine = getMorphEngine(get().orchestrator || undefined);
        engine.hydrate(get().gnnNodes);
        const baseArtifact = baseId ? get().artifacts.find(a => a.id === baseId) : undefined;
        const result = await engine.improvise(request, baseArtifact, userId);
        set((state) => ({
          operations: engine.getOperations(),
          orchestratorState: {
            ...state.orchestratorState,
            coherence: engine.getOrchestrator().getGlobalCoherence(),
            morphState: engine.getOrchestrator().getMorphState(),
            attitude: engine.getOrchestrator().getPersonality().attitude,
          }
        }));
        return result;
      },

      // ─── Chat ───
      sendMessage: async (message, userId = "default") => {
        const { orchestrator } = get();
        if (!orchestrator) {
          get().initOrchestrator();
          get().startOrchestrator();
        }
        const orch = get().orchestrator!;
        const result = await orch.routeData(message, userId);
        get().rememberConversation({
          userMessage: message,
          morphResponse: result.response,
          routeResult: result,
          situation: 'chat',
        });
        set(state => ({
          orchestratorState: {
            ...state.orchestratorState,
            coherence: result.coherence,
            morphState: result.morphState,
            attitude: result.attitude,
            nodeCount: result.usedNodes,
          }
        }));
        return result;
      },

      // ─── Conversation ───
      rememberConversation: (memory) => {
        const newMemory: ConversationMemory = {
          ...memory,
          id: generateId(),
          timestamp: new Date().toISOString()
        };
        set((state) => ({ conversationMemory: [newMemory, ...state.conversationMemory] }));
      },

      recallConversation: (query) => {
        const memories = get().conversationMemory;
        const lower = query.toLowerCase();
        return memories.filter(m =>
          m.userMessage.toLowerCase().includes(lower) ||
          m.morphResponse.toLowerCase().includes(lower) ||
          m.situation?.toLowerCase().includes(lower)
        );
      },

      getConversationContext: () => {
        const memories = get().conversationMemory;
        if (memories.length === 0) return "";
        return memories.slice(0, 5).map(m =>
          `[${new Date(m.timestamp).toLocaleDateString()}] User: "${m.userMessage}" -> Situation: ${m.situation || "general"}`
        ).join("\n");
      },

      setSupabaseConfig: (config) => {
        set((state) => ({ supabaseConfig: { ...state.supabaseConfig, ...config } }));
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      setCurrentUser: (userId) => {
        set({ currentUserId: userId });
      },

      clearAll: () => {
        const { orchestrator } = get();
        if (orchestrator) orchestrator.stopAutonomousLoop();
        set({
          artifacts: [],
          gnnNodes: [],
          operations: [],
          conversationMemory: [],
          novelArchitectures: [],
          selectedNovelArch: null,
          orchestrator: null,
          orchestratorState: {
            coherence: 0.5, morphState: 0, attitude: 'curious',
            nodeCount: 0, tickCount: 0, isRunning: false, superBaseSize: 0,
          }
        });
      }
    }),
    {
      name: "morph-resonance-novel-storage",
      partialize: (state) => ({
        artifacts: state.artifacts,
        supabaseConfig: state.supabaseConfig,
        gnnNodes: state.gnnNodes,
        operations: state.operations,
        conversationMemory: state.conversationMemory,
        userDesigns: Array.from(state.userDesigns.entries()),
        currentUserId: state.currentUserId,
        novelArchitectures: state.novelArchitectures,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.gnnNodes && state.gnnNodes.length > 0) {
          hydrateEngine(state.gnnNodes);
        }
        // Restore Map from array
        if (state?.userDesigns && Array.isArray(state.userDesigns)) {
          state.userDesigns = new Map(state.userDesigns);
        }
      }
    }
  )
)
