
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Panel,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as d3 from 'd3';

// ============================================================
// CIRCUIT COLOR PALETTE
// ============================================================

const CircuitColors = {
  UNDERSTANDING: '#3b82f6',
  SENSING: '#10b981',
  KNOWING: '#f59e0b',
  CENTERING: '#8b5cf6',
  EGO: '#ef4444'
};

const CircuitGlow = {
  UNDERSTANDING: 'rgba(59, 130, 246, 0.4)',
  SENSING: 'rgba(16, 185, 129, 0.4)',
  KNOWING: 'rgba(245, 158, 11, 0.4)',
  CENTERING: 'rgba(139, 92, 246, 0.4)',
  EGO: 'rgba(239, 68, 68, 0.4)'
};

// ============================================================
// MORPHING NODE - Phase-space visualization
// ============================================================

const MorphingNode = ({ data, selected }) => {
  const {
    being, design, movement, evolution, space,
    tension, memory_gravity, attractor_weight,
    line, regime, binary_state, channel, circuit,
    graph_type, fuxi_state, hexagram,
    onActivate, onMutate, activation_level
  } = data;

  // Dynamic sizing based on state space
  const baseSize = 50;
  const size = baseSize + (tension * 80) + (memory_gravity * 30);
  const pulseScale = 1 + (activation_level || 0) * 0.3;

  // Color derivation
  const dims = [being, design, movement, evolution, space];
  const dominantDim = dims.indexOf(Math.max(...dims));
  const dimColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const baseColor = CircuitColors[circuit] || '#6b7280';
  const accentColor = dimColors[dominantDim];

  const isChanging = regime === 'CHANGING';
  const isYang = binary_state === 'yang';

  // Radar chart points for 5D state space
  const radarPoints = dims.map((d, i) => {
    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
    const r = d * 35;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div
      style={{
        width: size * pulseScale,
        height: size * pulseScale,
        borderRadius: graph_type === 'ATTRACTOR' ? '50%' : 
                     graph_type === 'BIPARTITE' ? '4px' : 
                     graph_type === 'RESERVOIR' ? '30% 70% 70% 30% / 30% 30% 70% 70%' :
                     graph_type === 'HIERARCHICAL' ? '8px' :
                     graph_type === 'RADIAL' ? '50% 0 50% 50%' :
                     '12px',
        background: `radial-gradient(circle at 35% 35%, ${accentColor}66, ${baseColor}dd)`,
        border: `${2 + line * 0.3}px solid ${isYang ? '#fbbf24' : '#60a5fa'}`,
        boxShadow: `0 0 ${15 + tension * 40}px ${CircuitGlow[circuit] || 'rgba(100,100,100,0.3)'},
                    inset 0 0 ${8 + memory_gravity * 25}px ${baseColor}55`,
        opacity: 0.5 + (attractor_weight * 0.5),
        transition: `all ${isChanging ? '0.3s' : '0.8s'} cubic-bezier(0.4, 0, 0.2, 1)`,
        animation: isChanging ? 'node-morph 0.6s ease-in-out infinite alternate' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        transform: selected ? `scale(${1.15})` : `scale(${pulseScale})`,
      }}
      onClick={() => onActivate?.(data.id)}
      onDoubleClick={() => onMutate?.(data.id)}
    >
      {/* 5D State Space Radar */}
      <svg 
        width={size * 0.65} 
        height={size * 0.65} 
        viewBox="0 0 100 100"
        style={{ pointerEvents: 'none' }}
      >
        <polygon
          points={radarPoints}
          fill={accentColor + '33'}
          stroke={accentColor}
          strokeWidth="1.5"
        />
        {/* Center dot indicating line position */}
        <circle 
          cx={50 + (line - 3.5) * 8} 
          cy={50} 
          r={2 + tension * 4} 
          fill={isYang ? '#fbbf24' : '#60a5fa'}
          style={{ transition: 'all 0.3s' }}
        />
        {/* Attractor weight indicator */}
        <circle cx={50} cy={50} r={attractor_weight * 20} 
                fill="none" stroke={baseColor} strokeWidth="0.5" opacity="0.5" />
      </svg>

      {/* Hexagram label */}
      <div style={{
        position: 'absolute',
        bottom: -22,
        fontSize: 9,
        color: '#9ca3af',
        whiteSpace: 'nowrap',
        fontFamily: 'monospace',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
      }}>
        {hexagram}
      </div>

      {/* Fuxi binary state */}
      <div style={{
        position: 'absolute',
        top: -18,
        fontSize: 7,
        fontFamily: 'monospace',
        color: isYang ? '#fbbf24' : '#60a5fa',
        letterSpacing: 2,
        background: 'rgba(0,0,0,0.6)',
        padding: '1px 4px',
        borderRadius: 3
      }}>
        {fuxi_state}
      </div>

      {/* Graph type badge */}
      <div style={{
        position: 'absolute',
        top: -35,
        fontSize: 7,
        color: '#6b7280',
        background: 'rgba(0,0,0,0.7)',
        padding: '1px 4px',
        borderRadius: 3,
        textTransform: 'uppercase',
        letterSpacing: 1
      }}>
        {graph_type}
      </div>

      <Handle type="target" position={Position.Top} style={{ opacity: 0.3, width: 6, height: 6 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.3, width: 6, height: 6 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0.3, width: 6, height: 6 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.3, width: 6, height: 6 }} />
    </div>
  );
};

// ============================================================
// MORPHING EDGE - Signal flow visualization
// ============================================================

const MorphingEdge = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
  const { type, adapter, activation, message_count } = data || {};

  const isCrossing = type?.includes('crossing');
  const isGrowth = type === 'growth';
  const isConnection = type === 'connection';

  const strokeColor = isGrowth ? '#10b981' : 
                      isCrossing ? '#f59e0b' : 
                      isConnection ? '#6b7280' : '#4b5563';
  const strokeWidth = isCrossing ? 2.5 : isGrowth ? 2 : 1.5;
  const strokeDasharray = adapter ? '4,4' : 'none';

  const pulseOpacity = 0.2 + (activation || 0) * 0.8;
  const flowSpeed = activation > 0.5 ? '1s' : '3s';

  // Curved path for organic feel
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2 - 30;
  const path = `M${sourceX},${sourceY} Q${midX},${midY} ${targetX},${targetY}`;

  return (
    <g>
      {/* Glow layer */}
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={strokeWidth + 6}
        fill="none"
        opacity={pulseOpacity * 0.15}
        style={{ filter: 'blur(6px)' }}
      />
      {/* Main edge with flow animation */}
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={strokeDasharray}
        opacity={pulseOpacity}
        style={{
          animation: activation > 0.3 ? `edge-flow ${flowSpeed} linear infinite` : 'none',
          strokeLinecap: 'round'
        }}
      />
      {/* Direction arrow */}
      <polygon
        points={`${targetX-4},${targetY-8} ${targetX+4},${targetY-8} ${targetX},${targetY}`}
        fill={strokeColor}
        opacity={pulseOpacity * 0.6}
      />
      {/* Adapter badge */}
      {adapter && (
        <foreignObject
          x={midX - 35}
          y={midY - 10}
          width={70}
          height={20}
        >
          <div style={{
            background: 'rgba(17, 24, 39, 0.9)',
            border: `1px solid ${strokeColor}`,
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 8,
            color: strokeColor,
            textAlign: 'center',
            fontFamily: 'monospace',
            backdropFilter: 'blur(4px)'
          }}>
            ⚙ {adapter}
          </div>
        </foreignObject>
      )}
      {/* Message count indicator */}
      {message_count > 0 && (
        <foreignObject
          x={midX - 8}
          y={midY + 5}
          width={16}
          height={16}
        >
          <div style={{
            background: strokeColor,
            borderRadius: '50%',
            width: 14,
            height: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 7,
            color: '#fff',
            fontWeight: 'bold'
          }}>
            {message_count > 9 ? '9+' : message_count}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

const nodeTypes = { morphing: MorphingNode };
const edgeTypes = { morphing: MorphingEdge };

// ============================================================
# FIELD OVERLAY - Unified tensor visualization
// ============================================================

const FieldOverlay = ({ coherence, tick, manifestation, nodeCount, edgeCount }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      left: 16,
      background: 'rgba(15, 23, 42, 0.92)',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      borderRadius: 12,
      padding: 16,
      color: '#e5e7eb',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 12,
      zIndex: 1000,
      minWidth: 220,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 12,
        borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
        paddingBottom: 8
      }}>
        <span style={{ fontSize: 16 }}>⚡</span>
        <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: 13 }}>
          UNIFIED FIELD TENSOR
        </span>
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9ca3af' }}>Tick</span>
          <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{tick.toString().padStart(4, '0')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9ca3af' }}>Nodes</span>
          <span>{nodeCount}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9ca3af' }}>Edges</span>
          <span>{edgeCount}</span>
        </div>

        {/* Coherence bar */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ color: '#9ca3af' }}>Coherence</span>
            <span style={{ 
              color: coherence > 0.8 ? '#10b981' : coherence > 0.5 ? '#f59e0b' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {(coherence * 100).toFixed(1)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: 4,
            background: 'rgba(75, 85, 99, 0.3)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${coherence * 100}%`,
              height: '100%',
              background: coherence > 0.8 ? '#10b981' : coherence > 0.5 ? '#f59e0b' : '#ef4444',
              borderRadius: 2,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {manifestation && (
          <div style={{ 
            marginTop: 8, 
            padding: 8, 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: 6,
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ color: '#60a5fa', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Manifestation
            </div>
            <div style={{ fontSize: 11, color: '#e5e7eb', wordBreak: 'break-all' }}>
              {manifestation.manifestation || 'None'}
            </div>
            {manifestation.output && (
              <div style={{ marginTop: 4, fontSize: 10, color: '#9ca3af' }}>
                {manifestation.output.dominant_circuit} → {manifestation.output.dominant_dimension}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// D3 FORCE SIMULATION HOOK
// ============================================================

const useForceSimulation = (nodes, edges, running) => {
  const simulationRef = useRef(null);
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (!nodes.length) return;

    // Create D3 simulation
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(120).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(600, 400))
      .force('collision', d3.forceCollide().radius(60))
      .force('x', d3.forceX(600).strength(0.05))
      .force('y', d3.forceY(400).strength(0.05));

    // Map nodes to D3 format
    const d3Nodes = nodes.map(n => ({
      id: n.id,
      x: positions[n.id]?.x || 600 + (Math.random() - 0.5) * 400,
      y: positions[n.id]?.y || 400 + (Math.random() - 0.5) * 300,
      vx: 0, vy: 0
    }));

    // Map edges to D3 format
    const d3Links = edges.map(e => ({
      source: e.source,
      target: e.target,
      type: e.type
    }));

    simulation.nodes(d3Nodes);
    simulation.force('link').links(d3Links);

    // Update positions on tick
    simulation.on('tick', () => {
      const newPositions = {};
      d3Nodes.forEach(n => {
        newPositions[n.id] = { x: n.x, y: n.y };
      });
      setPositions(newPositions);
    });

    if (running) {
      simulation.alpha(1).restart();
    } else {
      simulation.stop();
    }

    simulationRef.current = simulation;

    return () => simulation.stop();
  }, [nodes.length, edges.length, running]);

  return positions;
};

// ============================================================
// MAIN VISUALIZER
// ============================================================

const MorphingVisualizer = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [systemState, setSystemState] = useState({
    tick: 0, coherence: 0, manifestation: null, nodeCount: 0, edgeCount: 0
  });
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const { fitView } = useReactFlow();

  // D3 force positions
  const forcePositions = useForceSimulation(
    systemState.nodeCount > 0 ? nodes.map(n => ({ id: n.id })) : [],
    systemState.edgeCount > 0 ? edges.map(e => ({ source: e.source, target: e.target, type: e.type })) : [],
    isRunning
  );

  // Generate demo state with realistic morphing
  const generateDemoState = useCallback((tick = 0) => {
    const baseNodes = 12;
    const growth = Math.floor(tick / 4);
    const nodeCount = baseNodes + growth;

    const circuits = ['UNDERSTANDING', 'SENSING', 'KNOWING', 'CENTERING', 'EGO'];
    const channels = ['LOGIC_63_4', 'MUTATION_3_60', 'MATURATION_53_42', 'EXPLORATION_10_34', 'MONEY_21_45'];
    const graphTypes = ['DAG', 'RESERVOIR', 'HIERARCHICAL', 'ATTRACTOR', 'BIPARTITE'];
    const hexagrams = ['Creative', 'Receptive', 'Difficulty', 'Sprouting', 'Waiting', 'Conflict', 'Peace', 'Standstill'];

    const newNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const phase = (tick * 0.15) + (i * 0.7);
      const circuit = circuits[i % circuits.length];

      // State space oscillates with tick
      newNodes.push({
        id: `node_${i}`,
        being: 0.3 + 0.35 * Math.sin(phase) + 0.1 * Math.sin(tick * 0.3),
        design: 0.3 + 0.35 * Math.sin(phase + 1.2) + 0.1 * Math.cos(tick * 0.2),
        movement: 0.3 + 0.35 * Math.sin(phase + 2.4) + 0.05 * Math.sin(tick * 0.5),
        evolution: 0.3 + 0.35 * Math.sin(phase + 3.6) + 0.15 * Math.sin(tick * 0.15),
        space: 0.3 + 0.35 * Math.sin(phase + 4.8) + 0.08 * Math.cos(tick * 0.4),
        tension: Math.abs(Math.sin(phase * 1.5)) * (0.4 + Math.min(tick * 0.02, 0.5)),
        memory_gravity: 0.1 + Math.abs(Math.cos(phase * 0.8)) * 0.6 + Math.min(tick * 0.01, 0.2),
        attractor_weight: Math.random() * 0.8 + Math.min(tick * 0.015, 0.3),
        line: (i % 6) + 1,
        regime: Math.random() > 0.75 ? 'CHANGING' : 'STABLE',
        binary_state: Math.sin(phase + tick * 0.1) > 0 ? 'yang' : 'yin',
        channel: channels[i % channels.length],
        circuit,
        graph_type: graphTypes[i % graphTypes.length],
        fuxi_state: Array(6).fill(0).map((_, j) => {
          const bitPhase = phase + j * 0.8;
          return Math.sin(bitPhase + tick * 0.05) > 0 ? '1' : '0';
        }).join(''),
        hexagram: hexagrams[i % hexagrams.length],
        activation_level: Math.abs(Math.sin(phase * 2 + tick * 0.2)) * (0.3 + Math.min(tick * 0.01, 0.5))
      });
    }

    // Generate edges with dynamic topology
    const newEdges = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const connectionProb = 0.35 - (Math.abs(i - j) * 0.02);
        if (Math.random() < Math.max(connectionProb, 0.05)) {
          const isSameCircuit = newNodes[i].circuit === newNodes[j].circuit;
          const adapters = ['temporal_buffer', 'state_projection', 'tension_regulator', 'salience_mapper', null];
          const adapter = isSameCircuit ? null : adapters[Math.floor(Math.random() * adapters.length)];

          newEdges.push({
            source: `node_${i}`,
            target: `node_${j}`,
            type: isSameCircuit ? 'connection' : (adapter ? `crossing:${adapter}` : 'crossing'),
            adapter,
            activation: Math.random() * (0.3 + Math.min(tick * 0.02, 0.7)),
            message_count: Math.floor(Math.random() * 5) + (tick > 5 ? Math.floor(Math.random() * 10) : 0)
          });
        }
      }
    }

    // Add growth edges for new nodes
    for (let i = baseNodes; i < nodeCount; i++) {
      const parent = Math.floor(Math.random() * baseNodes);
      newEdges.push({
        source: `node_${parent}`,
        target: `node_${i}`,
        type: 'growth',
        adapter: null,
        activation: 0.8,
        message_count: 1
      });
    }

    return {
      tick,
      nodes: newNodes,
      edges: newEdges,
      field_coherence: 0.6 + Math.sin(tick * 0.08) * 0.25 + Math.min(tick * 0.005, 0.1),
      manifestation: {
        manifestation: `${circuits[tick % circuits.length]}_${['being', 'design', 'movement', 'evolution', 'space'][tick % 5]}_output`,
        output: {
          dominant_circuit: circuits[tick % circuits.length],
          dominant_dimension: ['being', 'design', 'movement', 'evolution', 'space'][tick % 5],
          aggregate_field: [0.5, 0.6, 0.4, 0.8, 0.3],
          activated_count: 2 + Math.floor(Math.random() * 4)
        },
        confidence: 0.6 + Math.sin(tick * 0.1) * 0.2
      }
    };
  }, []);

  const updateVisualization = useCallback((state) => {
    const { nodes: stateNodes, edges: stateEdges, tick, field_coherence, manifestation } = state;

    // Merge with D3 force positions
    const flowNodes = stateNodes.map((n, i) => {
      const forcePos = forcePositions[n.id];
      const baseX = forcePos ? forcePos.x : 600 + (n.being - 0.5) * 500;
      const baseY = forcePos ? forcePos.y : 400 + (n.design - 0.5) * 350;

      return {
        id: n.id,
        type: 'morphing',
        position: { 
          x: baseX + Math.sin(tick * 0.1 + i) * 20,
          y: baseY + Math.cos(tick * 0.1 + i) * 15
        },
        data: {
          ...n,
          onActivate: (id) => console.log('Activate:', id),
          onMutate: (id) => console.log('Mutate:', id)
        }
      };
    });

    const flowEdges = stateEdges.map((e, i) => ({
      id: `edge_${i}`,
      source: e.source,
      target: e.target,
      type: 'morphing',
      data: {
        type: e.type,
        adapter: e.adapter,
        activation: e.activation,
        message_count: e.message_count
      }
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
    setSystemState({ 
      tick, 
      coherence: field_coherence, 
      manifestation,
      nodeCount: stateNodes.length,
      edgeCount: stateEdges.length
    });
  }, [forcePositions, setNodes, setEdges]);

  // Initialize
  useEffect(() => {
    const initial = generateDemoState(0);
    updateVisualization(initial);
  }, [generateDemoState, updateVisualization]);

  // Auto-run simulation
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSystemState(prev => {
          const newState = generateDemoState(prev.tick + 1);
          updateVisualization(newState);
          return { ...prev, tick: prev.tick + 1 };
        });
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, speed, generateDemoState, updateVisualization]);

  const toggleRunning = () => setIsRunning(!isRunning);

  const injectStimulus = () => {
    const stimulus = Array(5).fill(0).map(() => Math.random());
    console.log('⚡ Injecting stimulus:', stimulus);
    // In production: fetch('/api/orchestrator/stimulus', { method: 'POST', body: JSON.stringify({ stimulus }) });
  };

  const resetField = () => {
    setIsRunning(false);
    const reset = generateDemoState(0);
    updateVisualization(reset);
    setSystemState(prev => ({ ...prev, tick: 0 }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f172a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.2}
        maxZoom={2}
      >
        <Background 
          color="#1e293b" 
          gap={24} 
          style={{ background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)' }}
        />
        <Controls 
          style={{ 
            background: 'rgba(15, 23, 42, 0.9)', 
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: 8 
          }} 
        />
        <MiniMap 
          nodeColor={(n) => CircuitColors[n.data?.circuit] || '#6b7280'}
          maskColor="rgba(0,0,0,0.85)"
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: 8
          }}
        />

        <FieldOverlay {...systemState} />

        {/* Control Panel */}
        <Panel position="top-right">
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: 12,
            padding: 16,
            color: '#e5e7eb',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            minWidth: 160
          }}>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Orchestrator
            </div>

            <button
              onClick={toggleRunning}
              style={{
                background: isRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                border: `1px solid ${isRunning ? '#ef4444' : '#10b981'}`,
                borderRadius: 6,
                padding: '10px 16px',
                color: isRunning ? '#ef4444' : '#10b981',
                cursor: 'pointer',
                marginBottom: 8,
                width: '100%',
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              {isRunning ? '⏹ HALT' : '▶ RUN'}
            </button>

            <button
              onClick={injectStimulus}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid #3b82f6',
                borderRadius: 6,
                padding: '8px 16px',
                color: '#3b82f6',
                cursor: 'pointer',
                marginBottom: 8,
                width: '100%',
                fontFamily: 'monospace',
                fontSize: 11,
                transition: 'all 0.2s'
              }}
            >
              ⚡ STIMULUS
            </button>

            <button
              onClick={resetField}
              style={{
                background: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid #6b7280',
                borderRadius: 6,
                padding: '8px 16px',
                color: '#9ca3af',
                cursor: 'pointer',
                marginBottom: 12,
                width: '100%',
                fontFamily: 'monospace',
                fontSize: 11,
                transition: 'all 0.2s'
              }}
            >
              ↺ RESET
            </button>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>
                Speed: {speed}ms
              </div>
              <input
                type="range"
                min={200}
                max={3000}
                step={100}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{ 
                  width: '100%',
                  accentColor: '#3b82f6'
                }}
              />
            </div>

            <div style={{ 
              marginTop: 12, 
              paddingTop: 12, 
              borderTop: '1px solid rgba(75, 85, 99, 0.3)',
              fontSize: 10,
              color: '#6b7280'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: wsConnected ? '#10b981' : '#ef4444'
                }} />
                <span>{wsConnected ? 'WS Connected' : 'Demo Mode'}</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-right">
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: 12,
            padding: 14,
            color: '#e5e7eb',
            fontSize: 10,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
              Circuits
            </div>
            {Object.entries(CircuitColors).map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ 
                  width: 10, height: 10, background: color, borderRadius: 2,
                  boxShadow: `0 0 6px ${color}66`
                }} />
                <span style={{ color: '#d1d5db' }}>{name}</span>
              </div>
            ))}

            <div style={{ marginTop: 10, fontWeight: 'bold', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
              Edges
            </div>
            <div style={{ color: '#6b7280', marginBottom: 2 }}>— stable connection</div>
            <div style={{ color: '#f59e0b', marginBottom: 2 }}>- - crossing (adapter)</div>
            <div style={{ color: '#10b981' }}>— growth (emergent)</div>

            <div style={{ marginTop: 10, fontSize: 9, color: '#4b5563', lineHeight: 1.4 }}>
              Nodes morph based on internal state space. 
              Double-click to mutate. Click to activate.
            </div>
          </div>
        </Panel>
      </ReactFlow>

      <style>{`
        @keyframes node-morph {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.08) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes edge-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        .react-flow__node {
          transition: transform 0.3s ease;
        }
        .react-flow__node:hover {
          z-index: 1000 !important;
        }
      `}</style>
    </div>
  );
};

// ============================================================
// APP ENTRY
// ============================================================

const App = () => (
  <ReactFlowProvider>
    <MorphingVisualizer />
  </ReactFlowProvider>
);

export default App;
