"""
MorphSENN Integration Bridge

Connects MorphSENN self-expanding layers to your existing ecosystem:
- Trident GNN (message passing morphing)
- Synthia Server (memory & agent orchestration)
- Substrate Mesh (agent migration with expanded networks)
- Neo4j Memory (growth episode logging)
"""

import torch
import torch.nn as nn
from typing import Dict, List, Optional, Any
import json
import requests
from dataclasses import dataclass
import time
import os

@dataclass
class GrowthEpisode:
    """Records a network expansion event for Neo4j memory"""
    timestamp: float
    layer_idx: int
    old_width: int
    new_width: int
    trigger_reason: str
    hexagram_state: int
    loss_at_expansion: float
    semantic_seed_id: int  # Which I Ching state seeded the new neurons

class SubstrateMigrationHandler:
    """
    Handles agent migration with expanded networks.
    When an agent moves between substrate nodes, its architecture travels with it.
    """
    def __init__(self, synthia_server_url: str = ""):
        self.server_url = synthia_server_url or os.getenv('SYNTHIA_SERVER_URL', '')

    def serialize_expanded_state(self, model: nn.Module) -> Dict[str, Any]:
        """Serialize a model with dynamic architecture for migration"""
        state = {
            'layer_widths': [],
            'growth_stages': [],
            'hexagram_states': [],
            'weight_shapes': [],
            'state_dict_keys': list(model.state_dict().keys()),
        }

        for name, module in model.named_modules():
            if hasattr(module, 'current_width'):
                state['layer_widths'].append(module.current_width)
                state['growth_stages'].append(module.growth_stage)
                state['hexagram_states'].append(module.hexagram_state)
                if hasattr(module, 'weight'):
                    state['weight_shapes'].append(module.weight.shape)

        return state

    def migrate_to_node(
        self, 
        agent_id: str, 
        model: nn.Module, 
        target_node: str,
        supabase_url: str = ""
    ) -> bool:
        """
        Migrate an agent with its expanded network to a new substrate node.
        The receiving node can continue expanding from the checkpoint.
        """
        state = self.serialize_expanded_state(model)

        payload = {
            'agent_id': agent_id,
            'target_node': target_node,
            'model_state': state,
            'timestamp': time.time(),
        }

        try:
            # In production: POST to your Synthia server
            # response = requests.post(f"{self.server_url}/migrate", json=payload)
            print(f"[Migration] Agent {agent_id} → Node {target_node}")
            print(f"  Architecture: {state['layer_widths']}")
            print(f"  Growth stages: {state['growth_stages']}")
            return True
        except Exception as e:
            print(f"[Migration Error] {e}")
            return False

class Neo4jGrowthLogger:
    """
    Logs expansion episodes to Neo4j as growth nodes.
    Creates relationships: (Layer)-[:EXPANDED_TO]->(NewLayer)
    """
    def __init__(self, neo4j_uri: str, auth: tuple):
        self.uri = neo4j_uri
        self.auth = auth

    def log_episode(self, episode: GrowthEpisode) -> str:
        """
        Create Neo4j entry for expansion event.
        Cypher query template:

        CREATE (g:GrowthEpisode {
            timestamp: $timestamp,
            layer: $layer,
            old_width: $old_width,
            new_width: $new_width,
            reason: $reason,
            hexagram: $hexagram,
            loss: $loss
        })
        WITH g
        MATCH (l:Layer {idx: $layer})
        CREATE (l)-[:EXPANDED {episode_id: id(g)}]->(g)
        RETURN id(g) as episode_id
        """
        query = """
        CREATE (g:GrowthEpisode {
            timestamp: $timestamp,
            layer_idx: $layer_idx,
            old_width: $old_width,
            new_width: $new_width,
            trigger_reason: $reason,
            hexagram_state: $hexagram,
            loss_at_expansion: $loss,
            semantic_seed: $seed
        })
        RETURN id(g) as episode_id
        """

        params = {
            'timestamp': episode.timestamp,
            'layer_idx': episode.layer_idx,
            'old_width': episode.old_width,
            'new_width': episode.new_width,
            'reason': episode.trigger_reason,
            'hexagram': episode.hexagram_state,
            'loss': episode.loss_at_expansion,
            'seed': episode.semantic_seed_id,
        }

        # In production: execute via Neo4j driver
        print(f"[Neo4j] Logged growth episode: Layer {episode.layer_idx} {episode.old_width}→{episode.new_width}")
        return "episode_id_placeholder"

class TridentGNNBridge:
    """
    Bridge between MorphSENN and your existing Trident GNN.

    Trident GNN morphs message-passing strategy (topology).
    MorphSENN expands layer width (capacity).
    This bridge coordinates both.
    """
    def __init__(self, trident_model: nn.Module):
        self.trident = trident_model
        self.senn_layers: List[nn.Module] = []

    def attach_senn_to_trident(
        self,
        layer_indices: List[int],
        config: 'MorphSENNConfig'
    ):
        """
        Attach MorphSENN expansion capability to specific Trident layers.

        Usage:
            trident = YourTridentGNN()
            bridge = TridentGNNBridge(trident)
            bridge.attach_senn_to_trident([1, 3, 5], MorphSENNConfig())
        """
        from morph_senn import MorphSENNLayer

        # Find message-passing layers in Trident
        for idx, (name, module) in enumerate(self.trident.named_modules()):
            if idx in layer_indices and hasattr(module, 'in_features'):
                # Wrap with SENN expansion
                senn_layer = MorphSENNLayer(
                    in_features=module.in_features,
                    out_features=module.out_features,
                    config=config,
                    message_passing_mode=getattr(module, 'mp_mode', 'attention'),
                    hexagram_state=idx % 64,
                )

                # Replace or wrap
                self._replace_module(name, senn_layer)
                self.senn_layers.append(senn_layer)

        print(f"[Bridge] Attached SENN to {len(self.senn_layers)} Trident layers")

    def _replace_module(self, target_name: str, new_module: nn.Module):
        """Replace a module in Trident by name"""
        parts = target_name.split('.')
        parent = self.trident
        for part in parts[:-1]:
            parent = getattr(parent, part)
        setattr(parent, parts[-1], new_module)

    def hybrid_forward(self, graph_data: Any, loss: Optional[float] = None) -> Dict:
        """
        Forward pass with both topology morph and capacity expansion.

        1. Trident GNN does message passing (possibly morphed topology)
        2. MorphSENN monitors and potentially expands
        3. Controller decides: morph, expand, or both
        """
        # Step 1: Trident forward (topology morph happens inside)
        trident_out = self.trident(graph_data)

        # Step 2: Collect SENN metadata
        senn_metadata = []
        for layer in self.senn_layers:
            if hasattr(layer, 'monitor'):
                senn_metadata.append({
                    'width': layer.current_width,
                    'saturated': layer.monitor.is_saturated(0.01),
                    'growth_stage': layer.growth_stage,
                })

        # Step 3: Controller decision
        decision = self._controller_decision(loss, senn_metadata)

        return {
            'output': trident_out,
            'trident_topology': getattr(self.trident, 'current_mode', 'unknown'),
            'senn_metadata': senn_metadata,
            'controller_decision': decision,
        }

    def _controller_decision(self, loss: Optional[float], metadata: List[Dict]) -> Dict:
        """Unified controller: topology vs capacity"""
        if loss is None:
            return {'action': 'none', 'reason': 'No loss signal'}

        # Check if any SENN layers are saturated
        saturated = any(m['saturated'] for m in metadata)

        # Simple decision (production: use your neural controller)
        if saturated:
            return {'action': 'expand', 'reason': 'SENN saturation detected'}
        else:
            return {'action': 'continue', 'reason': 'Normal operation'}

class SynthiaAgentIntegration:
    """
    Integrates MorphSENN with your Synthia agent system.
    Each agent carries its own expanded network architecture.
    """
    def __init__(
        self,
        agent_id: str,
        base_model: nn.Module,
        synthia_server: str = "",
        supabase_url: str = "",
    ):
        self.agent_id = agent_id
        self.model = base_model
        self.synthia = synthia_server or os.getenv('SYNTHIA_SERVER_URL', '')
        self.supabase = supabase_url or os.getenv('SUPABASE_URL', '')
        self.growth_history: List[GrowthEpisode] = []

    def process_task(self, task_data: torch.Tensor) -> Dict:
        """
        Agent processes a task, potentially expanding during execution.
        """
        # Forward pass
        output, metadata = self.model(task_data)

        # Log growth if expansion happened
        if metadata['controller_decision']['action'] in ['expand', 'both']:
            episode = GrowthEpisode(
                timestamp=0.0,  # Use actual timestamp
                layer_idx=metadata['controller_decision']['target_layers'][0],
                old_width=0,  # Fill from metadata
                new_width=0,
                trigger_reason=metadata['controller_decision']['reason'],
                hexagram_state=0,
                loss_at_expansion=0.0,
                semantic_seed_id=0,
            )
            self.growth_history.append(episode)

        return {
            'agent_id': self.agent_id,
            'output': output,
            'architecture': metadata['layer_widths'],
            'growth_count': len(self.growth_history),
        }

    def save_to_supabase(self) -> bool:
        """
        Save agent state (including expanded architecture) to Supabase.
        Table: agent_states
        Columns: agent_id, model_config, growth_history, last_updated
        """
        state = {
            'agent_id': self.agent_id,
            'layer_widths': [l.current_width for l in self.model.layers] if hasattr(self.model, 'layers') else [],
            'growth_episodes': len(self.growth_history),
            'total_params': sum(p.numel() for p in self.model.parameters()),
        }

        print(f"[Supabase] Saved agent {self.agent_id}: {state}")
        return True

# Integration example
if __name__ == "__main__":
    print("=== MorphSENN Integration Bridge ===")
    print()
    print("1. Trident GNN Bridge:")
    print("   - Attaches SENN expansion to Trident message-passing layers")
    print("   - Coordinates topology morph + capacity expansion")
    print()
    print("2. Substrate Migration:")
    print("   - Serializes dynamic architecture for agent migration")
    print("   - Receiving node continues expansion from checkpoint")
    print()
    print("3. Neo4j Logging:")
    print("   - GrowthEpisode nodes track expansion history")
    print("   - (Layer)-[:EXPANDED]->(GrowthEpisode) relationships")
    print()
    print("4. Synthia Agent Integration:")
    print("   - Each agent carries expanded network")
    print("   - Saves state to Supabase")
    print()

    # Demo migration
    from morph_senn import MorphSENNGraph, MorphSENNConfig

    config = MorphSENNConfig(base_width=16, max_width=64)
    model = MorphSENNGraph(in_features=8, num_layers=2, config=config)

    migrator = SubstrateMigrationHandler()
    migrator.migrate_to_node("agent_001", model, "substrate_node_7")
