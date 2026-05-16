"use client"

/**
 * MERGED MORPH STORE
 *
 * Combines original MorphInterface state management with ResonanceOrchestrator
 * live state subscription. The store is the single source of truth for:
 * - Artifacts (uploaded code)
 * - GNN Nodes (local memory)
 * - Operations (activity log)
 * - Orchestrator State (coherence, morphState, attitude, nodeCount)
 * - Conversation Memory
 * - Supabase Config
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ResonanceOrchestrator, RouteResult, RegenerationMode } from "./ResonanceOrchestrator"
import { MorphMemoryEngine, getMorphEngine, hydrateEngine, GNNNode, MorphOperation, Artifact } from "./MorphMemoryEngine"

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
  activeTab: "upload" | "artifacts" | "operations" | "gnn" | "mesh" | "chat"

  // ─── Orchestrator State ───
  orchestrator: ResonanceOrchestrator | null
  orchestratorState: OrchestratorState

  // ─── Actions ───
  initOrchestrator: (apiBase?: string) => void
  startOrchestrator: () => void
  stopOrchestrator: () => void

  addArtifact: (data: { name: string; type: "file" | "code" | "text"; content: string; language?: string }) => void
  removeArtifact: (id: string) => void
  analyzeAndRemember: (id: string) => Promise<void>
  regenerateArtifact: (id: string, context?: string, mode?: RegenerationMode, userId?: string) => Promise<void>
  recallFromMemory: (query: string) => Promise<{ relevantNodes: GNNNode[]; insights: string[]; suggestedComponents: string[]; resonantEntries: any[] }>
  syncToSupabase: (id: string) => Promise<void>
  improvise: (request: string, baseId?: string, userId?: string) => Promise<{ code: string; explanation: string; usedNodes: GNNNode[]; usedEntries: any[] }>

  // ─── Chat / Routing ───
  sendMessage: (message: string, userId?: string) => Promise<RouteResult>

  rememberConversation: (memory: Omit<ConversationMemory, "id" | "timestamp">) => void
  recallConversation: (query: string) => ConversationMemory[]
  getConversationContext: () => string

  setSupabaseConfig: (config: Partial<SupabaseConfig>) => void
  setActiveTab: (tab: MorphState["activeTab"]) => void
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
      orchestrator: null,
      orchestratorState: {
        coherence: 0.5,
        morphState: 0,
        attitude: 'curious',
        nodeCount: 0,
        tickCount: 0,
        isRunning: false,
        superBaseSize: 0,
      },

      // ─── Orchestrator Lifecycle ───
      initOrchestrator: (apiBase = 'http://localhost:10000') => {
        const orch = new ResonanceOrchestrator(apiBase, false);

        // Set up callbacks to sync orchestrator state into Zustand
        orch.setCallbacks({
          onCoherenceChange: (coherence) => {
            set(state => ({
              orchestratorState: { ...state.orchestratorState, coherence }
            }));
          },
          onMorphStateChange: (morphState) => {
            set(state => ({
              orchestratorState: { ...state.orchestratorState, morphState }
            }));
          },
          onAttitudeChange: (attitude) => {
            set(state => ({
              orchestratorState: { ...state.orchestratorState, attitude }
            }));
          },
          onNodeCountChange: (nodeCount) => {
            set(state => ({
              orchestratorState: {
                ...state.orchestratorState,
                nodeCount,
                superBaseSize: orch.getSuperBaseSize()
              }
            }));
          },
        });

        // Link engine to orchestrator
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
          set(state => ({
            orchestratorState: {
              ...state.orchestratorState,
              isRunning: true,
            }
          }));
        }
      },

      stopOrchestrator: () => {
        const { orchestrator } = get();
        if (orchestrator) {
          orchestrator.stopAutonomousLoop();
          set(state => ({
            orchestratorState: {
              ...state.orchestratorState,
              isRunning: false,
            }
          }));
        }
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
          understanding: {
            intent: "Pending analysis",
            functionality: [],
            dependencies: [],
            patterns: [],
            complexity: 0,
            keyInsights: [],
            reusableComponents: []
          },
          supabaseSync: {
            understandingSynced: false,
            originalSynced: false
          },
          metadata: {
            size: data.content.length,
            uploadedAt: new Date().toISOString(),
            source: "upload",
            status: "analyzing",
            morphGnnRelated: false
          }
        };

        set((state) => ({
          artifacts: [artifact, ...state.artifacts]
        }));

        get().analyzeAndRemember(id);
      },

      removeArtifact: (id) => {
        set((state) => ({
          artifacts: state.artifacts.filter((a) => a.id !== id)
        }));
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
            artifacts: state.artifacts.map((a) =>
              a.id === id ? analyzed : a
            ),
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
            artifacts: state.artifacts.map((a) =>
              a.id === id ? regenerated : a
            ),
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

      recallFromMemory: async (query) => {
        const engine = getMorphEngine(get().orchestrator || undefined);
        engine.hydrate(get().gnnNodes);
        const result = await engine.recall(query);

        set((state) => ({
          operations: engine.getOperations()
        }));

        return result;
      },

      syncToSupabase: async (id) => {
        // Placeholder - implement with your Supabase client
        console.log("Supabase sync not implemented in merged version");
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

      // ─── Chat / Routing ───
      sendMessage: async (message, userId = "default") => {
        const { orchestrator } = get();
        if (!orchestrator) {
          // Auto-init if not ready
          get().initOrchestrator();
          get().startOrchestrator();
        }

        const orch = get().orchestrator!;
        const result = await orch.routeData(message, userId);

        // Store in conversation memory
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

      // ─── Conversation Memory ───
      rememberConversation: (memory) => {
        const newMemory: ConversationMemory = {
          ...memory,
          id: generateId(),
          timestamp: new Date().toISOString()
        };

        set((state) => ({
          conversationMemory: [newMemory, ...state.conversationMemory]
        }));
      },

      recallConversation: (query) => {
        const memories = get().conversationMemory;
        const lower = query.toLowerCase();

        return memories.filter(m =>
          m.userMessage.toLowerCase().includes(lower) ||
          m.morphResponse.toLowerCase().includes(lower) ||
          m.situation?.toLowerCase().includes(lower) ||
          m.entities?.some(e => e.toLowerCase().includes(lower)) ||
          m.insights?.some(i => i.toLowerCase().includes(lower))
        );
      },

      getConversationContext: () => {
        const memories = get().conversationMemory;
        if (memories.length === 0) return "";

        const recent = memories.slice(0, 5);
        return recent.map(m =>
          `[${new Date(m.timestamp).toLocaleDateString()}] User: "${m.userMessage}" -> Situation: ${m.situation || "general"} | Insights: ${m.insights?.join(", ") || "none"}`
        ).join("\n");
      },

      setSupabaseConfig: (config) => {
        set((state) => ({
          supabaseConfig: { ...state.supabaseConfig, ...config }
        }));
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      clearAll: () => {
        const { orchestrator } = get();
        if (orchestrator) {
          orchestrator.stopAutonomousLoop();
        }
        set({
          artifacts: [],
          gnnNodes: [],
          operations: [],
          conversationMemory: [],
          orchestrator: null,
          orchestratorState: {
            coherence: 0.5,
            morphState: 0,
            attitude: 'curious',
            nodeCount: 0,
            tickCount: 0,
            isRunning: false,
            superBaseSize: 0,
          }
        });
      }
    }),
    {
      name: "morph-resonance-storage",
      partialize: (state) => ({
        artifacts: state.artifacts,
        supabaseConfig: state.supabaseConfig,
        gnnNodes: state.gnnNodes,
        operations: state.operations,
        conversationMemory: state.conversationMemory,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.gnnNodes && state.gnnNodes.length > 0) {
          hydrateEngine(state.gnnNodes);
        }
        // Note: orchestrator must be re-initialized after rehydration
        // The component using the store should call initOrchestrator() on mount
      }
    }
  )
)
