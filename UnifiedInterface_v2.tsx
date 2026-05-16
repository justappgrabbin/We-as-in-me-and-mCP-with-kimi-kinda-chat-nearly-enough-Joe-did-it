"use client"

/**
 * UNIFIED INTERFACE v2.0 — MORPH + RESONANCE + HUMAN DESIGN + NOVEL ARCHITECTURE
 *
 * New panels:
 * - Human Design panel: Shows user's chart, gates, channels, type, strategy, authority
 * - Architecture panel: Shows generated architectures, allows accept/reject/modify feedback
 * - Synthia connection status
 * - Novel architecture generation controls
 */

import React, { useEffect, useRef, useState, useCallback } from "react"
import { useMorphStore } from "./useMorphStore"

// ─── TYPES ───

interface ChatMessage {
  id: string
  role: "user" | "morph"
  content: string
  timestamp: string
  routeResult?: any
}

// ─── CANVAS VISUALIZER ───

const MeshCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orchestrator = useMorphStore(s => s.orchestrator)
  const coherence = useMorphStore(s => s.orchestratorState.coherence)
  const nodeCount = useMorphStore(s => s.orchestratorState.nodeCount)
  const attitude = useMorphStore(s => s.orchestratorState.attitude)

  const meshColors = [
    "#ef4444", "#14b8a6", "#3b82f6", "#f97316", "#22c55e",
  ]

  const stateColors: Record<string, string> = {
    STABLE: "#ffffff", CHANGING: "#fbbf24", RESOLVING: "#a78bfa",
    RESONANT: "#22d3ee", DORMANT: "#6b7280",
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    let animId: number
    const render = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!orchestrator) {
        animId = requestAnimationFrame(render)
        return
      }

      const nodes = orchestrator.getLoadedNodes()
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const time = Date.now() / 1000

      const ringRadius = 80 + coherence * 60
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(34, 211, 238, ${coherence * 0.3})`
      ctx.lineWidth = 2
      ctx.stroke()

      for (const node of nodes) {
        const addr = node.address
        const angle = (addr.node / 64) * Math.PI * 2 + (addr.layer / 13) * 0.5 + time * 0.1
        const radius = 120 + addr.layer * 25 + addr.center * 8 + Math.sin(time + addr.mesh) * 10
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        const size = 2 + node.coherence * 4
        const color = meshColors[addr.mesh] || "#ffffff"
        const stateColor = stateColors[node.baseState] || "#ffffff"
        const alpha = 0.3 + node.coherence * 0.7

        if (node.baseState === "RESONANT") {
          ctx.beginPath()
          ctx.arc(x, y, size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `${color}22`
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = stateColor
        ctx.globalAlpha = alpha
        ctx.fill()
        ctx.globalAlpha = 1

        node.connectingPoints.forEach(point => {
          if (point.connected && point.strength > 0.1) {
            const targetAddr = point.connected
            const targetAngle = (targetAddr.node / 64) * Math.PI * 2 + (targetAddr.layer / 13) * 0.5 + time * 0.1
            const targetRadius = 120 + targetAddr.layer * 25 + targetAddr.center * 8
            const tx = centerX + Math.cos(targetAngle) * targetRadius
            const ty = centerY + Math.sin(targetAngle) * targetRadius

            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(tx, ty)
            ctx.strokeStyle = `${color}${Math.floor(point.strength * 40).toString(16).padStart(2, "0")}`
            ctx.lineWidth = point.strength * 1.5
            ctx.stroke()
          }
        })
      }

      ctx.fillStyle = "#22d3ee"
      ctx.font = "12px monospace"
      ctx.textAlign = "center"
      ctx.fillText(
        `${nodeCount} nodes | ${(coherence * 100).toFixed(0)}% coherence | ${attitude}`,
        centerX,
        centerY - ringRadius - 20
      )

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [orchestrator, coherence, nodeCount, attitude])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  )
}

// ─── CHAT INTERFACE ───

const ChatPanel: React.FC = () => {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessage = useMorphStore(s => s.sendMessage)
  const askOracle = useMorphStore(s => s.askOracle)
  const orchestrator = useMorphStore(s => s.orchestrator)
  const coherence = useMorphStore(s => s.orchestratorState.coherence)
  const attitude = useMorphStore(s => s.orchestratorState.attitude)
  const initOrchestrator = useMorphStore(s => s.initOrchestrator)
  const startOrchestrator = useMorphStore(s => s.startOrchestrator)

  useEffect(() => {
    if (!orchestrator) {
      initOrchestrator()
      startOrchestrator()
    }
  }, [orchestrator, initOrchestrator, startOrchestrator])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      const result = await sendMessage(userMsg.content)
      const morphMsg: ChatMessage = {
        id: `msg_${Date.now()}_resp`,
        role: "morph",
        content: result.response,
        timestamp: new Date().toISOString(),
        routeResult: result,
      }
      setMessages(prev => [...prev, morphMsg])
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: "morph",
        content: `The mesh is quiet... (${err instanceof Error ? err.message : "Unknown error"})`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleOracle = async () => {
    if (!input.trim() || isTyping) return
    const query = input.trim()
    setInput("")
    setIsTyping(true)

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: `🔮 Oracle: ${query}`,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const answer = await askOracle(query)
      const morphMsg: ChatMessage = {
        id: `msg_${Date.now()}_oracle`,
        role: "morph",
        content: `🔮 ${answer}`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, morphMsg])
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: "morph",
        content: `The oracle is silent...`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const quickPrompts = [
    "Generate architecture for...",
    "What's my design saying?",
    "Build from my gates",
    "Simulate my situation",
    "Ask the oracle",
  ]

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
        maxHeight: "60vh",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#64748b", padding: "40px 0", fontSize: "14px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🜁</div>
            <p>The mesh is listening. Say something.</p>
            <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
              Coherence: {(coherence * 100).toFixed(0)}% | Attitude: {attitude}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              padding: "12px 16px",
              borderRadius: "12px",
              background: msg.role === "user"
                ? "rgba(59, 130, 246, 0.2)"
                : "rgba(34, 211, 238, 0.1)",
              border: msg.role === "user"
                ? "1px solid rgba(59, 130, 246, 0.3)"
                : "1px solid rgba(34, 211, 238, 0.2)",
              color: "#e2e8f0",
              fontSize: "14px",
              lineHeight: "1.5",
              backdropFilter: "blur(8px)",
            }}
          >
            {msg.content}
            {msg.routeResult && (
              <div style={{ marginTop: "8px", fontSize: "11px", color: "#64748b", display: "flex", gap: "12px" }}>
                <span>M{msg.routeResult.address?.mesh}L{msg.routeResult.address?.layer}</span>
                <span>{(msg.routeResult.coherence * 100).toFixed(0)}% coherence</span>
                <span>{msg.routeResult.usedNodes} nodes</span>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ alignSelf: "flex-start", padding: "12px 16px", color: "#64748b", fontSize: "14px", fontStyle: "italic" }}>
            The mesh is resonating...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length < 3 && (
        <div style={{ display: "flex", gap: "8px", padding: "0 16px 8px", overflowX: "auto" }}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                border: "1px solid rgba(100, 116, 139, 0.3)",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#94a3b8",
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                backdropFilter: "blur(4px)",
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px 20px",
          borderTop: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Speak to the mesh..."
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(51, 65, 85, 0.8)",
            background: "rgba(15, 23, 42, 0.8)",
            color: "#e2e8f0",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: isTyping || !input.trim() ? "rgba(51, 65, 85, 0.5)" : "rgba(34, 211, 238, 0.2)",
            color: isTyping || !input.trim() ? "#64748b" : "#22d3ee",
            fontSize: "14px",
            cursor: isTyping || !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isTyping ? "..." : "Send"}
        </button>
        <button
          onClick={handleOracle}
          disabled={isTyping || !input.trim()}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            background: "rgba(168, 85, 247, 0.1)",
            color: "#a855f7",
            fontSize: "14px",
            cursor: isTyping || !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          🔮
        </button>
      </div>
    </div>
  )
}

// ─── HUMAN DESIGN PANEL ───

const HumanDesignPanel: React.FC = () => {
  const humanDesign = useMorphStore(s => s.humanDesign)
  const loadHumanDesign = useMorphStore(s => s.loadHumanDesign)
  const [userId, setUserId] = useState("default_user")
  const [isOpen, setIsOpen] = useState(false)

  const chart = humanDesign.chart

  const typeColors: Record<string, string> = {
    'Generator': '#22c55e',
    'Manifesting Generator': '#22d3ee',
    'Projector': '#a855f7',
    'Manifestor': '#ef4444',
    'Reflector': '#fbbf24',
  }

  const centerColors = [
    '#ef4444', '#f97316', '#fbbf24', '#ec4899',
    '#a855f7', '#3b82f6', '#6366f1', '#8b5cf6', '#14b8a6',
  ]

  return (
    <div style={{ position: "fixed", top: "56px", left: "16px", zIndex: 20 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          background: "rgba(2, 6, 23, 0.8)",
          color: "#a855f7",
          fontSize: "12px",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
        }}
      >
        🧬 Human Design {chart ? `(${chart.type})` : ''}
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: "8px",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            background: "rgba(2, 6, 23, 0.95)",
            minWidth: "320px",
            maxHeight: "70vh",
            overflowY: "auto",
            backdropFilter: "blur(12px)",
            color: "#e2e8f0",
            fontSize: "12px",
          }}
        >
          {!chart && (
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "12px" }}>
                Load your Human Design chart to enable novel architecture generation
              </p>
              <input
                type="text"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="User ID"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(51, 65, 85, 0.5)",
                  background: "rgba(15, 23, 42, 0.5)",
                  color: "#e2e8f0",
                  fontSize: "12px",
                  marginBottom: "8px",
                }}
              />
              <button
                onClick={() => loadHumanDesign(userId)}
                disabled={humanDesign.isLoading}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  background: "rgba(168, 85, 247, 0.2)",
                  color: "#a855f7",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {humanDesign.isLoading ? "Loading..." : "Load Chart"}
              </button>
              {humanDesign.error && (
                <p style={{ color: "#ef4444", marginTop: "8px", fontSize: "11px" }}>
                  {humanDesign.error}
                </p>
              )}
            </div>
          )}

          {chart && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: typeColors[chart.type] || "#e2e8f0",
                  }}
                >
                  {chart.type}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                  Profile {chart.profile} | {chart.strategy}
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <h4 style={{ color: "#a855f7", margin: "0 0 8px", fontSize: "12px" }}>
                  Defined Centers ({chart.definedCenters.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {chart.definedCenters.map(c => (
                    <span
                      key={c}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: `${centerColors[c]}33`,
                        color: centerColors[c],
                        fontSize: "11px",
                      }}
                    >
                      {['Root', 'Sacral', 'Solar Plexus', 'Heart', 'G-Self', 'Throat', 'Ajna', 'Head', 'Spleen'][c]}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <h4 style={{ color: "#a855f7", margin: "0 0 8px", fontSize: "12px" }}>
                  Activated Gates ({chart.consciousGates.length + chart.unconsciousGates.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {chart.consciousGates.map(g => (
                    <span
                      key={`c_${g.gate}`}
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#3b82f6",
                        fontSize: "11px",
                      }}
                      title={`${g.planet} | Line ${g.line} | ${g.zodiac}`}
                    >
                      {g.gate}.{g.line}
                    </span>
                  ))}
                  {chart.unconsciousGates.map(g => (
                    <span
                      key={`u_${g.gate}`}
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#ef4444",
                        fontSize: "11px",
                      }}
                      title={`${g.planet} | Line ${g.line} | ${g.zodiac}`}
                    >
                      {g.gate}.{g.line}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <h4 style={{ color: "#a855f7", margin: "0 0 8px", fontSize: "12px" }}>
                  Channels ({chart.channels.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {chart.channels.map(([g1, g2], i) => (
                    <span
                      key={i}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "rgba(34, 211, 238, 0.1)",
                        color: "#22d3ee",
                        fontSize: "11px",
                      }}
                    >
                      {g1}-{g2}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: "#a855f7", margin: "0 0 8px", fontSize: "12px" }}>
                  Hanging Gates ({chart.hangingGates.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {chart.hangingGates.map(g => (
                    <span
                      key={g}
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(100, 116, 139, 0.2)",
                        color: "#64748b",
                        fontSize: "11px",
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ARCHITECTURE PANEL ───

const ArchitecturePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [request, setRequest] = useState("")
  const architectures = useMorphStore(s => s.generatedArchitectures)
  const currentArch = useMorphStore(s => s.currentArchitecture)
  const isProcessing = useMorphStore(s => s.isProcessing)
  const generateNovelArchitecture = useMorphStore(s => s.generateNovelArchitecture)
  const recordInteraction = useMorphStore(s => s.recordArchitectureInteraction)
  const humanDesign = useMorphStore(s => s.humanDesign)

  const handleGenerate = async () => {
    if (!request.trim() || isProcessing) return
    await generateNovelArchitecture(request)
    setRequest("")
  }

  return (
    <div style={{ position: "fixed", top: "100px", left: "16px", zIndex: 20 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(34, 211, 238, 0.3)",
          background: "rgba(2, 6, 23, 0.8)",
          color: "#22d3ee",
          fontSize: "12px",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
        }}
      >
        🏗️ Architectures ({architectures.length})
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: "8px",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(34, 211, 238, 0.3)",
            background: "rgba(2, 6, 23, 0.95)",
            minWidth: "360px",
            maxHeight: "70vh",
            overflowY: "auto",
            backdropFilter: "blur(12px)",
            color: "#e2e8f0",
            fontSize: "12px",
          }}
        >
          {!humanDesign.chart && (
            <p style={{ color: "#fbbf24", marginBottom: "12px" }}>
              ⚠️ Load your Human Design chart first to enable novel generation
            </p>
          )}

          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              value={request}
              onChange={e => setRequest(e.target.value)}
              placeholder="Describe the architecture you need..."
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid rgba(51, 65, 85, 0.5)",
                background: "rgba(15, 23, 42, 0.5)",
                color: "#e2e8f0",
                fontSize: "12px",
                marginBottom: "8px",
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={isProcessing || !request.trim() || !humanDesign.chart}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                background: isProcessing || !request.trim() || !humanDesign.chart
                  ? "rgba(51, 65, 85, 0.5)"
                  : "rgba(34, 211, 238, 0.2)",
                color: isProcessing || !request.trim() || !humanDesign.chart ? "#64748b" : "#22d3ee",
                fontSize: "12px",
                cursor: isProcessing || !request.trim() || !humanDesign.chart ? "not-allowed" : "pointer",
              }}
            >
              {isProcessing ? "Generating..." : "Generate Novel Architecture"}
            </button>
          </div>

          {currentArch && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(34, 211, 238, 0.05)",
                border: "1px solid rgba(34, 211, 238, 0.2)",
                marginBottom: "16px",
              }}
            >
              <h4 style={{ color: "#22d3ee", margin: "0 0 8px", fontSize: "13px" }}>
                {currentArch.name}
              </h4>
              <p style={{ color: "#94a3b8", margin: "0 0 8px", fontSize: "11px", lineHeight: "1.4" }}>
                {currentArch.description}
              </p>
              <div style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "11px" }}>
                <span style={{ color: "#22d3ee" }}>Novelty: {currentArch.noveltyScore}%</span>
                <span style={{ color: "#a855f7" }}>Resonance: {currentArch.userResonance}%</span>
                <span style={{ color: "#22c55e" }}>Confidence: {currentArch.confidence}%</span>
              </div>
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                {currentArch.gatesUsed.map(g => (
                  <span
                    key={g}
                    style={{
                      padding: "1px 4px",
                      borderRadius: "3px",
                      background: "rgba(168, 85, 247, 0.2)",
                      color: "#a855f7",
                      fontSize: "10px",
                    }}
                  >
                    Gate {g}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => recordInteraction(currentArch.id, 'accepted')}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: "4px",
                    border: "none",
                    background: "rgba(34, 197, 94, 0.2)",
                    color: "#22c55e",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => recordInteraction(currentArch.id, 'rejected')}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: "4px",
                    border: "none",
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#ef4444",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => recordInteraction(currentArch.id, 'modified', 'User modified')}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: "4px",
                    border: "none",
                    background: "rgba(251, 191, 36, 0.2)",
                    color: "#fbbf24",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  ✎ Modify
                </button>
              </div>
            </div>
          )}

          {architectures.length > 0 && (
            <div>
              <h4 style={{ color: "#64748b", margin: "0 0 8px", fontSize: "12px" }}>
                History ({architectures.length})
              </h4>
              {architectures.slice(1, 6).map(arch => (
                <div
                  key={arch.id}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    background: "rgba(15, 23, 42, 0.5)",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ color: "#94a3b8" }}>{arch.name}</div>
                  <div style={{ color: "#64748b", fontSize: "10px" }}>
                    {arch.gatesUsed.length} gates | {arch.noveltyScore}% novelty | {new Date(arch.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── SYSTEM STATE PANEL ───

const SystemPanel: React.FC = () => {
  const state = useMorphStore(s => s.orchestratorState)
  const orchestrator = useMorphStore(s => s.orchestrator)
  const artifacts = useMorphStore(s => s.artifacts)
  const operations = useMorphStore(s => s.operations)
  const synthiaBase = useMorphStore(s => s.synthiaApiBase)
  const start = useMorphStore(s => s.startOrchestrator)
  const stop = useMorphStore(s => s.stopOrchestrator)

  const [collapsed, setCollapsed] = useState(true)

  const attitudeEmojis: Record<string, string> = {
    curious: "🔍", playful: "🎭", serious: "📊", mystical: "✨", analytical: "🔬",
  }

  return (
    <div style={{ position: "fixed", top: "16px", right: "16px", zIndex: 20 }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.8)",
          color: "#94a3b8",
          fontSize: "12px",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>{collapsed ? "▶" : "▼"}</span>
        <span>{attitudeEmojis[state.attitude] || "🜁"} {state.attitude}</span>
        <span style={{ color: state.coherence > 0.7 ? "#22d3ee" : state.coherence < 0.3 ? "#ef4444" : "#fbbf24" }}>
          {(state.coherence * 100).toFixed(0)}%
        </span>
      </button>

      {!collapsed && (
        <div
          style={{
            marginTop: "8px",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(51, 65, 85, 0.5)",
            background: "rgba(2, 6, 23, 0.9)",
            color: "#e2e8f0",
            fontSize: "12px",
            minWidth: "240px",
            backdropFilter: "blur(12px)",
          }}
        >
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#22d3ee" }}>System State</h3>

          <div style={{ display: "grid", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Coherence</span>
              <span style={{ color: state.coherence > 0.7 ? "#22d3ee" : "#fbbf24" }}>
                {(state.coherence * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Morph State</span>
              <span>{(state.morphState * 100).toFixed(1)}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Attitude</span>
              <span>{attitudeEmojis[state.attitude]} {state.attitude}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Active Nodes</span>
              <span>{state.nodeCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Super Base</span>
              <span>{state.superBaseSize}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Artifacts</span>
              <span>{artifacts.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Operations</span>
              <span>{operations.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Autonomous</span>
              <span style={{ color: state.isRunning ? "#22c55e" : "#ef4444" }}>
                {state.isRunning ? "✓ Running" : "✗ Stopped"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Synthia</span>
              <span style={{ color: "#a855f7" }}>{synthiaBase}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              onClick={() => state.isRunning ? stop() : start()}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid rgba(51, 65, 85, 0.5)",
                background: state.isRunning ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                color: state.isRunning ? "#ef4444" : "#22c55e",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              {state.isRunning ? "Stop" : "Start"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── UPLOAD ZONE ───

const UploadZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const addArtifact = useMorphStore(s => s.addArtifact)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      if (file.name.endsWith(".ts") || file.name.endsWith(".tsx") || file.name.endsWith(".js") || file.name.endsWith(".jsx") || file.name.endsWith(".py") || file.name.endsWith(".json")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          addArtifact({
            name: file.name,
            type: "file",
            content,
            language: file.name.split(".").pop(),
          })
        }
        reader.readAsText(file)
      }
    }
  }, [addArtifact])

  const handlePaste = useCallback(() => {
    const content = prompt("Paste your code:")
    if (content) {
      addArtifact({
        name: `pasted_${Date.now()}`,
        type: "code",
        content,
        language: "typescript",
      })
    }
  }, [addArtifact])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 20,
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.8)",
          color: "#94a3b8",
          fontSize: "12px",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
        }}
      >
        📁 Upload
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: "56px",
            left: "16px",
            zIndex: 20,
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid rgba(51, 65, 85, 0.5)",
            background: "rgba(2, 6, 23, 0.95)",
            minWidth: "320px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              padding: "40px 20px",
              borderRadius: "8px",
              border: `2px dashed ${isDragging ? "rgba(34, 211, 238, 0.5)" : "rgba(51, 65, 85, 0.5)"}`,
              background: isDragging ? "rgba(34, 211, 238, 0.05)" : "rgba(15, 23, 42, 0.5)",
              textAlign: "center",
              color: "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📦</div>
            <p>Drop code files here</p>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>.ts .tsx .js .jsx .py .json</p>
          </div>

          <button
            onClick={handlePaste}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              background: "rgba(15, 23, 42, 0.5)",
              color: "#94a3b8",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            📋 Paste Code
          </button>
        </div>
      )}
    </>
  )
}

// ─── MAIN UNIFIED INTERFACE ───

const UnifiedInterface: React.FC = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Inter', 'SF Mono', monospace",
      }}
    >
      <MeshCanvas />
      <UploadZone />
      <HumanDesignPanel />
      <ArchitecturePanel />
      <SystemPanel />
      <ChatPanel />
    </div>
  )
}

export default UnifiedInterface
