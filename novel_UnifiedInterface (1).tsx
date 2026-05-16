"use client"

/**
 * UNIFIED INTERFACE — NOVEL ARCHITECTURE EDITION
 *
 * New features:
 * - Human Design registration panel
 * - Novel Architecture viewer (see what the system created for you)
 * - Synthia server connection status
 * - Self-modification confidence display
 * - User-specific resonance visualization (nodes colored by user)
 */

import React, { useEffect, useRef, useState, useCallback } from "react"
import { useMorphStore } from "./useMorphStore"
import { HumanDesign } from "./ResonanceOrchestrator"

interface ChatMessage {
  id: string
  role: "user" | "morph"
  content: string
  timestamp: string
  routeResult?: any
}

// ─── MESH CANVAS (user-aware coloring) ───

const MeshCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orchestrator = useMorphStore(s => s.orchestrator)
  const coherence = useMorphStore(s => s.orchestratorState.coherence)
  const nodeCount = useMorphStore(s => s.orchestratorState.nodeCount)
  const attitude = useMorphStore(s => s.orchestratorState.attitude)
  const currentUserId = useMorphStore(s => s.currentUserId)
  const userDesigns = useMorphStore(s => s.userDesigns)

  const meshColors = ["#ef4444", "#14b8a6", "#3b82f6", "#f97316", "#22c55e"]
  const stateColors: Record<string, string> = {
    STABLE: "#ffffff", CHANGING: "#fbbf24", RESOLVING: "#a78bfa",
    RESONANT: "#22d3ee", DORMANT: "#6b7280", LEARNING: "#f472b6",
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

      // Coherence ring
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
        const stateColor = stateColors[node.baseState] || "#ffffff"
        const alpha = 0.3 + node.coherence * 0.7

        // NEW: Color by user resonance if this node resonates for current user
        const userResWeight = node.userResonance.get(currentUserId) || 0
        let drawColor = stateColor
        if (userResWeight > 0.5) {
          // User's nodes glow with their design color
          const design = userDesigns instanceof Map ? userDesigns.get(currentUserId) : undefined
          const userMesh = design
            ? (design.type === 'Generator' ? 0 : design.type === 'Manifestor' ? 0 : design.type === 'Projector' ? 2 : 4)
            : 0
          drawColor = meshColors[userMesh]
        }

        if (node.baseState === "RESONANT") {
          ctx.beginPath()
          ctx.arc(x, y, size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `${drawColor}22`
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = drawColor
        ctx.globalAlpha = alpha
        ctx.fill()
        ctx.globalAlpha = 1

        // Draw connections
        node.connectingPoints.forEach(point => {
          if (point.connected && point.strength > 0.1) {
            const tAddr = point.connected
            const tAngle = (tAddr.node / 64) * Math.PI * 2 + (tAddr.layer / 13) * 0.5 + time * 0.1
            const tRadius = 120 + tAddr.layer * 25 + tAddr.center * 8
            const tx = centerX + Math.cos(tAngle) * tRadius
            const ty = centerY + Math.sin(tAngle) * tRadius
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(tx, ty)
            ctx.strokeStyle = `${drawColor}${Math.floor(point.strength * 40).toString(16).padStart(2, "0")}`
            ctx.lineWidth = point.strength * 1.5
            ctx.stroke()
          }
        })
      }

      // Center label
      ctx.fillStyle = "#22d3ee"
      ctx.font = "12px monospace"
      ctx.textAlign = "center"
      const design = userDesigns instanceof Map ? userDesigns.get(currentUserId) : undefined
      const designLabel = design ? `${design.type} | Profile ${design.profile.join('/')}` : 'No design registered'
      ctx.fillText(
        `${nodeCount} nodes | ${(coherence * 100).toFixed(0)}% coherence | ${attitude} | ${designLabel}`,
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
  }, [orchestrator, coherence, nodeCount, attitude, currentUserId, userDesigns])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        zIndex: 0, pointerEvents: "none",
      }}
    />
  )
}

// ─── HUMAN DESIGN PANEL ───

const DesignPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<HumanDesign>>({
    type: 'Generator',
    strategy: 'Wait to Respond',
    authority: 'Sacral',
    profile: [3, 5],
    definedCenters: [4, 6],
    undefinedCenters: [0, 1, 2, 3, 5, 7, 8],
    gates: [10, 20, 34, 57],
    channels: [[10, 20], [34, 57]],
    incarnationCross: 'Penetration',
  })

  const registerHumanDesign = useMorphStore(s => s.registerHumanDesign)
  const currentUserId = useMorphStore(s => s.currentUserId)
  const userDesigns = useMorphStore(s => s.userDesigns)
  const getUserSignature = useMorphStore(s => s.getUserSignature)

  const design = userDesigns instanceof Map ? userDesigns.get(currentUserId) : undefined
  const signature = getUserSignature(currentUserId)

  const handleRegister = async () => {
    const hd: HumanDesign = {
      type: formData.type || 'Generator',
      strategy: formData.strategy || 'Wait to Respond',
      authority: formData.authority || 'Sacral',
      profile: formData.profile || [3, 5],
      definedCenters: formData.definedCenters || [4, 6],
      undefinedCenters: formData.undefinedCenters || [0, 1, 2, 3, 5, 7, 8],
      gates: formData.gates || [10, 20, 34, 57],
      channels: formData.channels || [[10, 20], [34, 57]],
      incarnationCross: formData.incarnationCross || 'Penetration',
    }
    await registerHumanDesign(currentUserId, hd)
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", top: "56px", left: "16px", zIndex: 20,
          padding: "8px 16px", borderRadius: "8px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.8)",
          color: design ? "#22d3ee" : "#94a3b8",
          fontSize: "12px", cursor: "pointer", backdropFilter: "blur(8px)",
        }}
      >
        {design ? `🧬 ${design.type}` : "🧬 Register Design"}
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: "100px", left: "16px", zIndex: 20,
          padding: "20px", borderRadius: "12px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.95)",
          minWidth: "320px", maxHeight: "70vh", overflowY: "auto",
          backdropFilter: "blur(12px)", color: "#e2e8f0", fontSize: "13px",
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#22d3ee" }}>
            Human Design Registration
          </h3>

          {design && signature && (
            <div style={{ marginBottom: "16px", padding: "12px", borderRadius: "8px", background: "rgba(34, 211, 238, 0.05)", border: "1px solid rgba(34, 211, 238, 0.2)" }}>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#22d3ee" }}>
                {design.type} — Profile {design.profile.join('/')}
              </div>
              <div style={{ marginTop: "8px", color: "#94a3b8", fontSize: "12px" }}>
                Strategy: {design.strategy} | Authority: {design.authority}
              </div>
              <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "12px" }}>
                Defined: {design.definedCenters.length} centers | Gates: {design.gates.length} | Channels: {design.channels.length}
              </div>
              <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "12px" }}>
                Adaptation: {(signature.adaptationLevel * 100).toFixed(0)}% | Autonomy: {(signature.autonomyLevel * 100).toFixed(0)}%
              </div>
              <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "12px" }}>
                Novel Architectures: {signature.novelArchitectures.length}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gap: "10px" }}>
            <div>
              <label style={{ color: "#64748b", fontSize: "11px" }}>Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as HumanDesign['type'] })}
                style={{
                  width: "100%", padding: "8px", marginTop: "4px",
                  borderRadius: "6px", border: "1px solid rgba(51, 65, 85, 0.5)",
                  background: "rgba(15, 23, 42, 0.8)", color: "#e2e8f0",
                }}
              >
                <option>Generator</option>
                <option>Manifestor</option>
                <option>Projector</option>
                <option>Reflector</option>
              </select>
            </div>

            <div>
              <label style={{ color: "#64748b", fontSize: "11px" }}>Profile (e.g., 3/5)</label>
              <input
                type="text"
                value={formData.profile?.join('/')}
                onChange={e => {
                  const parts = e.target.value.split('/').map(Number).filter(n => !isNaN(n))
                  setFormData({ ...formData, profile: parts as [number, number] })
                }}
                style={{
                  width: "100%", padding: "8px", marginTop: "4px",
                  borderRadius: "6px", border: "1px solid rgba(51, 65, 85, 0.5)",
                  background: "rgba(15, 23, 42, 0.8)", color: "#e2e8f0",
                }}
              />
            </div>

            <div>
              <label style={{ color: "#64748b", fontSize: "11px" }}>Defined Gates (comma-separated)</label>
              <input
                type="text"
                value={formData.gates?.join(', ')}
                onChange={e => {
                  const gates = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                  setFormData({ ...formData, gates })
                }}
                style={{
                  width: "100%", padding: "8px", marginTop: "4px",
                  borderRadius: "6px", border: "1px solid rgba(51, 65, 85, 0.5)",
                  background: "rgba(15, 23, 42, 0.8)", color: "#e2e8f0",
                }}
              />
            </div>

            <div>
              <label style={{ color: "#64748b", fontSize: "11px" }}>Authority</label>
              <input
                type="text"
                value={formData.authority}
                onChange={e => setFormData({ ...formData, authority: e.target.value })}
                style={{
                  width: "100%", padding: "8px", marginTop: "4px",
                  borderRadius: "6px", border: "1px solid rgba(51, 65, 85, 0.5)",
                  background: "rgba(15, 23, 42, 0.8)", color: "#e2e8f0",
                }}
              />
            </div>
          </div>

          <button
            onClick={handleRegister}
            style={{
              width: "100%", marginTop: "16px", padding: "10px",
              borderRadius: "8px", border: "none",
              background: "rgba(34, 211, 238, 0.2)",
              color: "#22d3ee", fontSize: "14px", cursor: "pointer",
            }}
          >
            {design ? "Update Design" : "Register Design"}
          </button>
        </div>
      )}
    </>
  )
}

// ─── NOVEL ARCHITECTURE PANEL ───

const NovelArchPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const novelArchitectures = useMorphStore(s => s.novelArchitectures)
  const selectedNovelArch = useMorphStore(s => s.selectedNovelArch)
  const selectNovelArchitecture = useMorphStore(s => s.selectNovelArchitecture)
  const generateNovelArchitecture = useMorphStore(s => s.generateNovelArchitecture)
  const artifacts = useMorphStore(s => s.artifacts)
  const currentUserId = useMorphStore(s => s.currentUserId)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", top: "96px", left: "16px", zIndex: 20,
          padding: "8px 16px", borderRadius: "8px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.8)",
          color: novelArchitectures.length > 0 ? "#a78bfa" : "#94a3b8",
          fontSize: "12px", cursor: "pointer", backdropFilter: "blur(8px)",
        }}
      >
        ✨ Novel Archs ({novelArchitectures.length})
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: "140px", left: "16px", zIndex: 20,
          padding: "20px", borderRadius: "12px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.95)",
          minWidth: "360px", maxHeight: "60vh", overflowY: "auto",
          backdropFilter: "blur(12px)", color: "#e2e8f0", fontSize: "13px",
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#a78bfa" }}>
            Novel Architectures
          </h3>

          {novelArchitectures.length === 0 && (
            <p style={{ color: "#64748b", fontSize: "13px" }}>
              No novel architectures yet. Upload code and generate one.
            </p>
          )}

          {novelArchitectures.map((arch) => (
            <div
              key={arch.id}
              onClick={() => selectNovelArchitecture(arch.id)}
              style={{
                padding: "12px", marginBottom: "8px", borderRadius: "8px",
                border: selectedNovelArch?.id === arch.id
                  ? "1px solid rgba(167, 139, 250, 0.5)"
                  : "1px solid rgba(51, 65, 85, 0.3)",
                background: selectedNovelArch?.id === arch.id
                  ? "rgba(167, 139, 250, 0.1)"
                  : "rgba(15, 23, 42, 0.5)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#a78bfa", fontSize: "13px" }}>
                {arch.codeStructure.pattern}
              </div>
              <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "11px" }}>
                {arch.codeStructure.components.length} components | {arch.meshTopology.connectionPattern} topology
              </div>
              <div style={{ marginTop: "4px", color: "#64748b", fontSize: "11px" }}>
                Confidence: {(arch.confidence * 100).toFixed(0)}% | {arch.meshTopology.grownNodes} nodes grown
              </div>
              <div style={{ marginTop: "4px", color: "#64748b", fontSize: "10px", fontStyle: "italic" }}>
                {arch.explanation.slice(0, 120)}...
              </div>
            </div>
          ))}

          {selectedNovelArch && (
            <div style={{
              marginTop: "16px", padding: "16px", borderRadius: "8px",
              background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(167, 139, 250, 0.3)",
            }}>
              <h4 style={{ margin: "0 0 8px", color: "#a78bfa", fontSize: "14px" }}>
                {selectedNovelArch.codeStructure.pattern}
              </h4>
              <div style={{ color: "#94a3b8", fontSize: "12px", lineHeight: "1.6" }}>
                <p><strong>Novel Feature:</strong> {selectedNovelArch.codeStructure.novelFeature}</p>
                <p style={{ marginTop: "8px" }}><strong>Data Flow:</strong> {selectedNovelArch.codeStructure.dataFlow}</p>
                <p style={{ marginTop: "8px" }}><strong>Components:</strong></p>
                <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                  {selectedNovelArch.codeStructure.components.map((c, i) => (
                    <li key={i} style={{ color: "#64748b" }}>{c}</li>
                  ))}
                </ul>
              </div>
              <pre style={{
                marginTop: "12px", padding: "12px", borderRadius: "6px",
                background: "rgba(2, 6, 23, 0.8)", color: "#22d3ee",
                fontSize: "11px", overflowX: "auto", maxHeight: "200px", overflowY: "auto",
              }}>
                {selectedNovelArch.codeStructure.generatedCode.slice(0, 2000)}
                {selectedNovelArch.codeStructure.generatedCode.length > 2000 ? '...' : ''}
              </pre>
            </div>
          )}

          {artifacts.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "8px" }}>
                Generate from artifact:
              </p>
              {artifacts.slice(0, 3).map(a => (
                <button
                  key={a.id}
                  onClick={() => generateNovelArchitecture(a.id, currentUserId, `Novel architecture from ${a.originalName}`)}
                  style={{
                    display: "block", width: "100%", marginBottom: "4px",
                    padding: "8px", borderRadius: "6px",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    background: "rgba(15, 23, 42, 0.5)",
                    color: "#a78bfa", fontSize: "12px", cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  ✨ Generate from {a.originalName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ─── CHAT PANEL (enhanced with design-aware responses) ───

const ChatPanel: React.FC = () => {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessage = useMorphStore(s => s.sendMessage)
  const orchestrator = useMorphStore(s => s.orchestrator)
  const coherence = useMorphStore(s => s.orchestratorState.coherence)
  const attitude = useMorphStore(s => s.orchestratorState.attitude)
  const currentUserId = useMorphStore(s => s.currentUserId)
  const userDesigns = useMorphStore(s => s.userDesigns)
  const initOrchestrator = useMorphStore(s => s.initOrchestrator)
  const startOrchestrator = useMorphStore(s => s.startOrchestrator)
  const generateNovelArchitecture = useMorphStore(s => s.generateNovelArchitecture)
  const selfModify = useMorphStore(s => s.selfModify)
  const artifacts = useMorphStore(s => s.artifacts)

  const design = userDesigns instanceof Map ? userDesigns.get(currentUserId) : undefined

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
      id: `msg_${Date.now()}`, role: "user", content: input.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      // Check for special commands
      if (input.trim().toLowerCase().startsWith('/novel')) {
        const artifactId = artifacts[0]?.id
        if (artifactId) {
          await generateNovelArchitecture(artifactId, currentUserId, input.trim().slice(6).trim())
          const morphMsg: ChatMessage = {
            id: `msg_${Date.now()}_resp`, role: "morph",
            content: "Novel architecture generated! Check the ✨ panel to see what your design created.",
            timestamp: new Date().toISOString(),
          }
          setMessages(prev => [...prev, morphMsg])
        }
      } else if (input.trim().toLowerCase() === '/selfmodify') {
        const result = await selfModify(currentUserId)
        const morphMsg: ChatMessage = {
          id: `msg_${Date.now()}_resp`, role: "morph",
          content: result.modified
            ? `Self-modification applied (${(result.confidence * 100).toFixed(0)}% confidence): ${result.changes.join(', ')}`
            : `Cannot self-modify yet. Confidence ${(result.confidence * 100).toFixed(0)}% < 45%. Keep interacting to build trust.`,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, morphMsg])
      } else {
        const result = await sendMessage(input.trim(), currentUserId)
        const morphMsg: ChatMessage = {
          id: `msg_${Date.now()}_resp`, role: "morph",
          content: result.response,
          timestamp: new Date().toISOString(), routeResult: result,
        }
        setMessages(prev => [...prev, morphMsg])
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`, role: "morph",
        content: `The mesh is quiet... (${err instanceof Error ? err.message : "Unknown error"})`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const quickPrompts = [
    "Remember when...",
    "What does my design say?",
    "/novel Create architecture",
    "/selfmodify",
    "Build from memory",
  ]

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      display: "flex", flexDirection: "column", zIndex: 10, maxHeight: "60vh",
    }}>
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        display: "flex", flexDirection: "column", gap: "12px",
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#64748b", padding: "40px 0", fontSize: "14px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🜁</div>
            <p>The mesh is listening. Say something.</p>
            {design && (
              <p style={{ fontSize: "12px", marginTop: "8px", color: "#22d3ee" }}>
                {design.type} | Profile {design.profile.join('/')} | {design.definedCenters.length} defined centers
              </p>
            )}
            <p style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7 }}>
              Coherence: {(coherence * 100).toFixed(0)}% | Attitude: {attitude}
            </p>
            <p style={{ fontSize: "11px", marginTop: "4px", opacity: 0.5 }}>
              Commands: /novel, /selfmodify
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%", padding: "12px 16px", borderRadius: "12px",
              background: msg.role === "user" ? "rgba(59, 130, 246, 0.2)" : "rgba(34, 211, 238, 0.1)",
              border: msg.role === "user" ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(34, 211, 238, 0.2)",
              color: "#e2e8f0", fontSize: "14px", lineHeight: "1.5", backdropFilter: "blur(8px)",
            }}
          >
            {msg.content}
            {msg.routeResult && (
              <div style={{ marginTop: "8px", fontSize: "11px", color: "#64748b", display: "flex", gap: "12px" }}>
                <span>M{msg.routeResult.address?.mesh}L{msg.routeResult.address?.layer}</span>
                <span>{(msg.routeResult.coherence * 100).toFixed(0)}% coherence</span>
                <span>{msg.routeResult.usedNodes} nodes</span>
                {msg.routeResult.novelArchitecture && (
                  <span style={{ color: "#a78bfa" }}>✨ Novel</span>
                )}
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
                padding: "6px 12px", borderRadius: "20px",
                border: "1px solid rgba(100, 116, 139, 0.3)",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#94a3b8", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap",
                backdropFilter: "blur(4px)",
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: "flex", gap: "8px", padding: "12px 16px 20px",
        borderTop: "1px solid rgba(51, 65, 85, 0.5)",
        background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(12px)",
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder={design ? `Speak as ${design.type}...` : "Speak to the mesh..."}
          style={{
            flex: 1, padding: "10px 16px", borderRadius: "8px",
            border: "1px solid rgba(51, 65, 85, 0.8)",
            background: "rgba(15, 23, 42, 0.8)",
            color: "#e2e8f0", fontSize: "14px", outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          style={{
            padding: "10px 20px", borderRadius: "8px", border: "none",
            background: isTyping || !input.trim() ? "rgba(51, 65, 85, 0.5)" : "rgba(34, 211, 238, 0.2)",
            color: isTyping || !input.trim() ? "#64748b" : "#22d3ee",
            fontSize: "14px", cursor: isTyping || !input.trim() ? "not-allowed" : "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          {isTyping ? "..." : "Send"}
        </button>
      </div>
    </div>
  )
}

// ─── SYSTEM PANEL (with Synthia status) ───

const SystemPanel: React.FC = () => {
  const state = useMorphStore(s => s.orchestratorState)
  const orchestrator = useMorphStore(s => s.orchestrator)
  const artifacts = useMorphStore(s => s.artifacts)
  const operations = useMorphStore(s => s.operations)
  const novelArchitectures = useMorphStore(s => s.novelArchitectures)
  const start = useMorphStore(s => s.startOrchestrator)
  const stop = useMorphStore(s => s.stopOrchestrator)
  const currentUserId = useMorphStore(s => s.currentUserId)
  const getUserSignature = useMorphStore(s => s.getUserSignature)

  const [collapsed, setCollapsed] = useState(true)
  const [synthiaStatus, setSynthiaStatus] = useState<'unknown' | 'connected' | 'offline'>('unknown')

  const signature = getUserSignature(currentUserId)

  // Check Synthia connection
  useEffect(() => {
    const check = async () => {
      try {
        const resp = await fetch('https://synthia-server.onrender.com/health', { method: 'GET', mode: 'no-cors' })
        setSynthiaStatus('connected')
      } catch {
        setSynthiaStatus('offline')
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  const attitudeEmojis: Record<string, string> = {
    curious: "🔍", playful: "🎭", serious: "📊", mystical: "✨", analytical: "🔬",
  }

  return (
    <div style={{ position: "fixed", top: "16px", right: "16px", zIndex: 20 }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: "8px 16px", borderRadius: "8px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.8)",
          color: "#94a3b8", fontSize: "12px", cursor: "pointer",
          backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "8px",
        }}
      >
        <span>{collapsed ? "▶" : "▼"}</span>
        <span>{attitudeEmojis[state.attitude] || "🜁"} {state.attitude}</span>
        <span style={{ color: state.coherence > 0.7 ? "#22d3ee" : state.coherence < 0.3 ? "#ef4444" : "#fbbf24" }}>
          {(state.coherence * 100).toFixed(0)}%
        </span>
        <span style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: synthiaStatus === 'connected' ? "#22c55e" : synthiaStatus === 'offline' ? "#ef4444" : "#fbbf24",
        }} />
      </button>

      {!collapsed && (
        <div style={{
          marginTop: "8px", padding: "16px", borderRadius: "12px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.9)",
          color: "#e2e8f0", fontSize: "12px", minWidth: "260px",
          backdropFilter: "blur(12px)",
        }}>
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
              <span style={{ color: "#64748b" }}>Novel Archs</span>
              <span style={{ color: "#a78bfa" }}>{novelArchitectures.length}</span>
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
              <span style={{ color: "#64748b" }}>Synthia Server</span>
              <span style={{ color: synthiaStatus === 'connected' ? "#22c55e" : "#ef4444" }}>
                {synthiaStatus === 'connected' ? "● Online" : synthiaStatus === 'offline' ? "○ Offline" : "◐ Checking"}
              </span>
            </div>
            {signature && (
              <>
                <div style={{ borderTop: "1px solid rgba(51, 65, 85, 0.3)", marginTop: "4px", paddingTop: "8px" }}>
                  <span style={{ color: "#a78bfa" }}>User: {signature.humanDesign.type}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Adaptation</span>
                  <span>{(signature.adaptationLevel * 100).toFixed(0)}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Autonomy</span>
                  <span>{(signature.autonomyLevel * 100).toFixed(0)}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Baseline Coherence</span>
                  <span>{(signature.coherenceBaseline * 100).toFixed(0)}%</span>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              onClick={() => state.isRunning ? stop() : start()}
              style={{
                flex: 1, padding: "6px", borderRadius: "6px",
                border: "1px solid rgba(51, 65, 85, 0.5)",
                background: state.isRunning ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                color: state.isRunning ? "#ef4444" : "#22c55e",
                fontSize: "11px", cursor: "pointer",
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
  const currentUserId = useMorphStore(s => s.currentUserId)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      if (file.name.match(/\.(ts|tsx|js|jsx|py|json)$/)) {
        const reader = new FileReader()
        reader.onload = (event) => {
          addArtifact({
            name: file.name, type: "file",
            content: event.target?.result as string,
            language: file.name.split(".").pop(),
            userId: currentUserId,
          })
        }
        reader.readAsText(file)
      }
    }
  }, [addArtifact, currentUserId])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", top: "16px", left: "16px", zIndex: 20,
          padding: "8px 16px", borderRadius: "8px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.8)",
          color: "#94a3b8", fontSize: "12px", cursor: "pointer",
          backdropFilter: "blur(8px)",
        }}
      >
        📁 Upload
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: "56px", left: "16px", zIndex: 20,
          padding: "20px", borderRadius: "12px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          background: "rgba(2, 6, 23, 0.95)",
          minWidth: "320px", backdropFilter: "blur(12px)",
        }}>
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              padding: "40px 20px", borderRadius: "8px",
              border: `2px dashed ${isDragging ? "rgba(34, 211, 238, 0.5)" : "rgba(51, 65, 85, 0.5)"}`,
              background: isDragging ? "rgba(34, 211, 238, 0.05)" : "rgba(15, 23, 42, 0.5)",
              textAlign: "center", color: "#64748b", fontSize: "14px", cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📦</div>
            <p>Drop code files here</p>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>.ts .tsx .js .jsx .py .json</p>
          </div>
        </div>
      )}
    </>
  )
}

// ─── MAIN INTERFACE ───

const UnifiedInterface: React.FC = () => {
  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#020617", color: "#e2e8f0",
      overflow: "hidden", position: "relative",
      fontFamily: "'Inter', 'SF Mono', monospace",
    }}>
      <MeshCanvas />
      <UploadZone />
      <DesignPanel />
      <NovelArchPanel />
      <SystemPanel />
      <ChatPanel />
    </div>
  )
}

export default UnifiedInterface
