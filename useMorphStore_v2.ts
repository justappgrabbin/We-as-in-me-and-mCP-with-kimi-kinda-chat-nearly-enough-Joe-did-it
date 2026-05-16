"use client"

/**
 * MERGED MORPH STORE — v2.0 with Novel Architecture Generator
 *
 * Now includes:
 * - Human Design chart loading and storage
 * - Novel architecture generation (truly unique, not just combinations)
 * - Synthia server integration for cross-session memory
 * - Evolutionary feedback loop (user interactions shape future generations)
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ResonanceOrchestrator, RouteResult, RegenerationMode } from "./ResonanceOrchestrator"
import { MorphMemoryEngine, getMorphEngine, hydrateEngine, GNNNode, MorphOperation, Artifact } from "./MorphMemoryEngine"
import { NovelArchitectureGenerator, HumanDesignChart, GeneratedArchitecture, ArchitectureInteraction } from "./NovelArchitectureGenerator"

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

export interface HumanDesignState {
  chart: HumanDesignChart | null
  isLoading: boolean
  error: string | null
}

interface MorphState {
  // ─── Original Morph State ───
  artifacts: Artifact[]
  gnnNodes: GNNNode[]
  operations: MorphOperation[]
  conversationMemory: ConversationMemory[]
  supabaseConfig: SupabaseConfig
  isProcessing: boolean
  activeTab: "upload" | "artifacts" | "operations" | "gnn" | "mesh" | "chat" | "design" | "architectures"

  // ─── Orchestrator State ───
  orchestrator: ResonanceOrchestrator | null
  orchestratorState: OrchestratorState

  // ─── Human Design State ───
  humanDesign: HumanDesignState

  // ─── Novel Architecture State ───
  generatedArchitectures: GeneratedArchitecture[]
  currentArchitecture: GeneratedArchitecture | null

  // ─── Synthia Config ───
  synthiaApiBase: string

  // ─── Actions ───
  initOrchestrator: (apiBase?: string) => void
  startOrchestrator: () => void
  stopOrchestrator: () => void

  setSynthiaApiBase: (url: string) => void

  // Human Design
  loadHumanDesign: (userId: string, birthData?: { date: string; time: string; location: string }) => Promise<void>

  // Novel Architecture
  generateNovelArchitecture: (request: string, context?: string) => Promise<GeneratedArchitecture | null>
  recordArchitectureInteraction: (architectureId: string, action: ArchitectureInteraction['action'], feedback?: string) => void

  // Original Morph
  addArtifact: (data: { name: string; type: "file" | "code" | "text"; content: string; language?: string }) => void
  removeArtifact: (id: string) => void
  analyzeAndRemember: (id: string) => Promise<void>
  regenerateArtifact: (id: string, context?: string, mode?: RegenerationMode, userId?: string) => Promise<void>
  recallFromMemory: (query: string) => Promise<{ relevantNodes: GNNNode[]; insights: string[]; suggestedComponents: string[]; resonantEntries: any[] }>
  syncToSupabase: (id: string) => Promise<void>
  improvise: (request: string, baseId?: string, userId?: string) => Promise<{ code: string; explanation: string; usedNodes: GNNNode[]; usedEntries: any[] }>

  // Chat / Routing
  sendMessage: (message: string, userId?: string) => Promise<RouteResult>
  askOracle: (query: string, userId?: string) => Promise<string>

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

// Singleton generator instance
let novelGenerator: NovelArchitectureGenerator | null = null

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
      humanDesign: {
        chart: null,
        isLoading: false,
        error: null,
      },
      generatedArchitectures: [],
      currentArchitecture: null,
      synthiaApiBase: "https://synthia-server.onrender.com",

      // ─── Orchestrator Lifecycle ───
      initOrchestrator: (apiBase = 'http://localhost:10000') => {
        const orch = new ResonanceOrchestrator(apiBase, false)

        orch.setCallbacks({
          onCoherenceChange: (coherence) => {
            set(state => ({
              orchestratorState: { ...state.orchestratorState, coherence }
            }))
          },
          onMorphStateChange: (morphState) => {
            set(state => ({
              orchestratorState: { ...state.orchestratorState, morphState }
            }))
          },
          onAttitudeChange: (attitude) => {
            set(state => ({
              orchestratorState: { ...state.orchestratorState, attitude }
            }))
          },
          onNodeCountChange: (nodeCount) => {
            set(state => ({
              orchestratorState: {
                ...state.orchestratorState,
                nodeCount,
                superBaseSize: orch.getSuperBaseSize()
              }
            }))
          },
        })

        const engine = getMorphEngine(orch)
        engine.setOrchestrator(orch)

        // Initialize novel generator
        novelGenerator = new NovelArchitectureGenerator(orch, get().synthiaApiBase)

        set({
          orchestrator: orch,
          orchestratorState: {
            ...get().orchestratorState,
            nodeCount: orch.getLoadedNodes().length,
            superBaseSize: orch.getSuperBaseSize(),
          }
        })
      },

      startOrchestrator: () => {
        const { orchestrator } = get()
        if (orchestrator) {
          orchestrator.startAutonomousLoop()
          set(state => ({
            orchestratorState: {
              ...state.orchestratorState,
              isRunning: true,
            }
          }))
        }
      },

      stopOrchestrator: () => {
        const { orchestrator } = get()
        if (orchestrator) {
          orchestrator.stopAutonomousLoop()
          set(state => ({
            orchestratorState: {
              ...state.orchestratorState,
              isRunning: false,
            }
          }))
        }
      },

      setSynthiaApiBase: (url) => {
        set({ synthiaApiBase: url })
        // Re-init generator with new URL
        const { orchestrator } = get()
        if (orchestrator) {
          novelGenerator = new NovelArchitectureGenerator(orchestrator, url)
        }
      },

      // ─── Human Design ───
      loadHumanDesign: async (userId, birthData) => {
        set(state => ({ humanDesign: { ...state.humanDesign, isLoading: true, error: null } }))

        try {
          const { orchestrator, synthiaApiBase } = get()
          if (!orchestrator) {
            get().initOrchestrator()
          }

          if (!novelGenerator) {
            novelGenerator = new NovelArchitectureGenerator(get().orchestrator!, synthiaApiBase)
          }

          const chart = await novelGenerator.loadHumanDesignChart(userId, birthData)

          if (chart) {
            set(state => ({
              humanDesign: { chart, isLoading: false, error: null }
            }))
          } else {
            set(state => ({
              humanDesign: { ...state.humanDesign, isLoading: false, error: 'Failed to load chart' }
            }))
          }
        } catch (err) {
          set(state => ({
            humanDesign: { ...state.humanDesign, isLoading: false, error: err instanceof Error ? err.message : 'Unknown error' }
          }))
        }
      },

      // ─── Novel Architecture ───
      generateNovelArchitecture: async (request, context) => {
        const { humanDesign, synthiaApiBase } = get()

        if (!humanDesign.chart) {
          console.warn('No Human Design chart loaded. Generating deterministic chart...')
          await get().loadHumanDesign('default_user')
        }

        if (!novelGenerator) {
          const { orchestrator } = get()
          if (!orchestrator) {
            get().initOrchestrator()
          }
          novelGenerator = new NovelArchitectureGenerator(get().orchestrator!, synthiaApiBase)
        }

        set({ isProcessing: true })

        try {
          const userId = humanDesign.chart?.userId || 'default_user'
          const architecture = await novelGenerator.generateNovelArchitecture(userId, request, context)

          set(state => ({
            generatedArchitectures: [architecture, ...state.generatedArchitectures],
            currentArchitecture: architecture,
            isProcessing: false,
          }))

          return architecture
        } catch (err) {
          console.error('Architecture generation failed:', err)
          set({ isProcessing: false })
          return null
        }
      },

      recordArchitectureInteraction: (architectureId, action, feedback) => {
        const { humanDesign } = get()
        if (!humanDesign.chart || !novelGenerator) return

        novelGenerator.recordInteraction(humanDesign.chart.userId, architectureId, action, feedback)

        // Update local state
        set(state => ({
          generatedArchitectures: state.generatedArchitectures.map(arch =>
            arch.id === architectureId
              ? { ...arch, userResonance: action === 'accepted' ? Math.min(100, arch.userResonance + 5) : Math.max(0, arch.userResonance - 5) }
              : arch
          )
        }))
      },

      // ─── Artifact Management ───
      addArtifact: (data) => {
        const id = generateId()
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
        }

        set((state) => ({
          artifacts: [artifact, ...state.artifacts]
        }))

        get().analyzeAndRemember(id)
      },

      removeArtifact: (id) => {
        set((state) => ({
          artifacts: state.artifacts.filter((a) => a.id !== id)
        }))
      },

      analyzeAndRemember: async (id) => {
        set({ isProcessing: true })

        try {
          const artifact = get().artifacts.find((a) => a.id === id)
          if (!artifact) return

          const engine = getMorphEngine(get().orchestrator || undefined)
          engine.setOrchestrator(get().orchestrator || new ResonanceOrchestrator())

          const analyzed = await engine.analyzeArtifact(artifact)
          await engine.rememberArtifact(analyzed)

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
          }))
        } finally {
          set({ isProcessing: false })
        }
      },

      regenerateArtifact: async (id, context, mode = "exact", userId = "default") => {
        set({ isProcessing: true })

        try {
          const artifact = get().artifacts.find((a) => a.id === id)
          if (!artifact || !artifact.understanding) return

          const engine = getMorphEngine(get().orchestrator || undefined)
          engine.hydrate(get().gnnNodes)

          const regenerated = await engine.regenerateArtifact(artifact, context, mode, userId)

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
          }))
        } finally {
          set({ isProcessing: false })
        }
      },

      recallFromMemory: async (query) => {
        const engine = getMorphEngine(get().orchestrator || undefined)
        engine.hydrate(get().gnnNodes)
        const result = await engine.recall(query)

        set((state) => ({
          operations: engine.getOperations()
        }))

        return result
      },

      syncToSupabase: async (id) => {
        console.log("Supabase sync not implemented in merged version")
      },

      improvise: async (request, baseId, userId = "default") => {
        const engine = getMorphEngine(get().orchestrator || undefined)
        engine.hydrate(get().gnnNodes)
        const baseArtifact = baseId ? get().artifacts.find(a => a.id === baseId) : undefined

        const result = await engine.improvise(request, baseArtifact, userId)

        set((state) => ({
          operations: engine.getOperations(),
          orchestratorState: {
            ...state.orchestratorState,
            coherence: engine.getOrchestrator().getGlobalCoherence(),
            morphState: engine.getOrchestrator().getMorphState(),
            attitude: engine.getOrchestrator().getPersonality().attitude,
          }
        }))

        return result
      },

      // ─── Chat / Routing ───
      sendMessage: async (message, userId = "default") => {
        const { orchestrator } = get()
        if (!orchestrator) {
          get().initOrchestrator()
          get().startOrchestrator()
        }

        const orch = get().orchestrator!
        const result = await orch.routeData(message, userId)

        get().rememberConversation({
          userMessage: message,
          morphResponse: result.response,
          routeResult: result,
          situation: 'chat',
        })

        set(state => ({
          orchestratorState: {
            ...state.orchestratorState,
            coherence: result.coherence,
            morphState: result.morphState,
            attitude: result.attitude,
            nodeCount: result.usedNodes,
          }
        }))

        return result
      },

      askOracle: async (query, userId = "default") => {
        if (!novelGenerator) {
          const { orchestrator, synthiaApiBase } = get()
          if (!orchestrator) get().initOrchestrator()
          novelGenerator = new NovelArchitectureGenerator(get().orchestrator!, synthiaApiBase)
        }
        return novelGenerator.askSynthiaOracle(query, userId)
      },

      // ─── Conversation Memory ───
      rememberConversation: (memory) => {
        const newMemory: ConversationMemory = {
          ...memory,
          id: generateId(),
          timestamp: new Date().toISOString()
        }

        set((state) => ({
          conversationMemory: [newMemory, ...state.conversationMemory]
        }))
      },

      recallConversation: (query) => {
        const memories = get().conversationMemory
        const lower = query.toLowerCase()

        return memories.filter(m =>
          m.userMessage.toLowerCase().includes(lower) ||
          m.morphResponse.toLowerCase().includes(lower) ||
          m.situation?.toLowerCase().includes(lower) ||
          m.entities?.some(e => e.toLowerCase().includes(lower)) ||
          m.insights?.some(i => i.toLowerCase().includes(lower))
        )
      },

      getConversationContext: () => {
        const memories = get().conversationMemory
        if (memories.length === 0) return ""

        const recent = memories.slice(0, 5)
        return recent.map(m =>
          `[${new Date(m.timestamp).toLocaleDateString()}] User: "${m.userMessage}" -> Situation: ${m.situation || "general"} | Insights: ${m.insights?.join(", ") || "none"}`
        ).join("\n")
      },

      setSupabaseConfig: (config) => {
        set((state) => ({
          supabaseConfig: { ...state.supabaseConfig, ...config }
        }))
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab })
      },

      clearAll: () => {
        const { orchestrator } = get()
        if (orchestrator) {
          orchestrator.stopAutonomousLoop()
        }
        novelGenerator = null
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
          },
          humanDesign: { chart: null, isLoading: false, error: null },
          generatedArchitectures: [],
          currentArchitecture: null,
        })
      }
    }),
    {
      name: "morph-resonance-v2",
      partialize: (state) => ({
        artifacts: state.artifacts,
        supabaseConfig: state.supabaseConfig,
        gnnNodes: state.gnnNodes,
        operations: state.operations,
        conversationMemory: state.conversationMemory,
        humanDesign: state.humanDesign,
        generatedArchitectures: state.generatedArchitectures,
        synthiaApiBase: state.synthiaApiBase,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.gnnNodes && state.gnnNodes.length > 0) {
          hydrateEngine(state.gnnNodes)
        }
      }
    }
  )
)
