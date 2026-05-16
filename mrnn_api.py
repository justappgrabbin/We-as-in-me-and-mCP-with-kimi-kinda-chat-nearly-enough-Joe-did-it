
from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import numpy as np
from typing import List, Dict, Optional
import uvicorn

# Import the orchestrator (from the Python module we built)
# from orchestrator import MessagePassingOrchestrator, UnifiedFieldTensor, MonopoleController

app = FastAPI(title="Magnetite Resonance Neural Network", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global orchestrator instance
orch = None

class StimulusRequest(BaseModel):
    stimulus: List[float]
    target_nodes: Optional[List[str]] = None

class ConfigRequest(BaseModel):
    growth_threshold: Optional[float] = None
    coherence_target: Optional[float] = None

@app.on_event("startup")
async def startup():
    global orch
    # Initialize with 12 seed nodes
    # orch = MessagePassingOrchestrator(initial_nodes=12)
    print("🧠 MRNN Orchestrator initialized")

@app.get("/")
async def root():
    return {
        "system": "Magnetite Resonance Neural Network",
        "status": "active",
        "dimensions": ["being", "design", "movement", "evolution", "space"],
        "circuits": ["understanding", "sensing", "knowing", "centering", "ego"]
    }

@app.get("/api/orchestrator/state")
async def get_state():
    """Get current field state snapshot"""
    if orch is None:
        return {"error": "Orchestrator not initialized"}
    return orch.get_state_snapshot()

@app.post("/api/orchestrator/step")
async def step(request: Optional[StimulusRequest] = None):
    """Advance one step with optional stimulus"""
    if orch is None:
        return {"error": "Orchestrator not initialized"}

    stimulus = None
    if request and request.stimulus:
        stimulus = np.array(request.stimulus)

    result = orch.step(stimulus)
    return {
        "step_result": result,
        "state": orch.get_state_snapshot()
    }

@app.post("/api/orchestrator/stimulus")
async def inject_stimulus(request: StimulusRequest):
    """Inject external stimulus into the field"""
    if orch is None:
        return {"error": "Orchestrator not initialized"}

    stimulus = np.array(request.stimulus)
    result = orch.step(stimulus)

    return {
        "stimulus_applied": True,
        "stimulus_vector": request.stimulus,
        "activated_nodes": result["activated"],
        "manifestation": result["manifestation"],
        "state": orch.get_state_snapshot()
    }

@app.get("/api/orchestrator/nodes/{node_id}")
async def get_node(node_id: str):
    """Get detailed state of a specific node"""
    if orch is None or node_id not in orch.nodes:
        return {"error": "Node not found"}

    node = orch.nodes[node_id]
    return {
        "id": node.id,
        "field_vector": node.get_field_vector().tolist(),
        "resonance_score": node.get_resonance_score(),
        "state_space": {
            "being": node.being,
            "design": node.design,
            "movement": node.movement,
            "evolution": node.evolution,
            "space": node.space
        },
        "dynamics": {
            "tension": node.tension,
            "memory_gravity": node.memory_gravity,
            "attractor_weight": node.attractor_weight,
            "recursion_depth": node.recursion_depth
        },
        "identity": {
            "channel": node.channel_mode.name,
            "circuit": node.circuit_family.name,
            "graph_type": node.graph_type.name,
            "line": node.line,
            "regime": node.regime.name,
            "binary_state": "yang" if node.binary_state == BinaryState.YANG else "yin"
        },
        "history": {
            "activation_history": node.activation_history[-21:],
            "history_length": len(node.activation_history)
        }
    }

@app.get("/api/orchestrator/field")
async def get_field_tensor():
    """Get the unified field tensor projection"""
    if orch is None:
        return {"error": "Orchestrator not initialized"}

    return {
        "tensor_shape": list(orch.field.tensor.shape),
        "dimensions": ["being", "design", "movement", "evolution", "space"],
        "coherence": orch.monopole.compute_field_coherence(list(orch.nodes.values())),
        "attractor_basins": orch.monopole.attractor_basins
    }

@app.post("/api/orchestrator/config")
async def update_config(request: ConfigRequest):
    """Update orchestrator configuration"""
    if orch is None:
        return {"error": "Orchestrator not initialized"}

    if request.growth_threshold is not None:
        orch.growth_threshold = request.growth_threshold

    return {
        "config_updated": True,
        "growth_threshold": orch.growth_threshold,
        "current_nodes": len(orch.nodes)
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time WebSocket for live visualization"""
    await websocket.accept()

    try:
        while True:
            if orch is not None:
                # Auto-step and send state
                result = orch.step()
                state = orch.get_state_snapshot()

                await websocket.send_json({
                    "type": "state_update",
                    "tick": result["tick"],
                    "coherence": result["field_coherence"],
                    "node_count": result["node_count"],
                    "activated": result["activated"],
                    "manifestation": result["manifestation"],
                    "nodes": state["nodes"],
                    "edges": state["edges"]
                })

            await asyncio.sleep(1.0)  # 1 second updates

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@app.get("/api/channels")
async def get_channel_map():
    """Get the complete channel-neural mapping"""
    from orchestrator import CHANNEL_MAP

    channels = {}
    for channel, mapping in CHANNEL_MAP.items():
        channels[channel.name] = {
            "circuit": mapping["circuit"].name,
            "neural_analogue": mapping["neural"],
            "graph_type": mapping["graph"].name,
            "behavior": mapping["behavior"],
            "inductive_bias": mapping["inductive_bias"]
        }

    return {
        "total_channels": len(channels),
        "circuits": {
            "UNDERSTANDING": {"base": "DFF", "mode": "logical_feedforward"},
            "SENSING": {"base": "DBN", "mode": "developmental_belief"},
            "KNOWING": {"base": "LSM", "mode": "pulsed_emergent"},
            "CENTERING": {"base": "Integration", "mode": "agency_action"},
            "EGO": {"base": "Defense", "mode": "resource_control"}
        },
        "channels": channels
    }

@app.get("/api/adapters")
async def get_adapter_rules():
    """Get adapter translation rules for crossings"""
    from orchestrator import ADAPTER_RULES

    rules = []
    for (g1, g2), adapter in ADAPTER_RULES.items():
        rules.append({
            "from_graph": g1.name,
            "to_graph": g2.name,
            "adapter": adapter,
            "purpose": f"Translate {g1.name} signals to {g2.name} space"
        })

    return {
        "total_rules": len(rules),
        "universal_fallback": "universal_normalizer",
        "rules": rules
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
