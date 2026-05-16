"""
SYNTH OS KERNEL v6.0 - The Unification Layer
==============================================
Wires your entire stack into one living, message-passing, morphing system.
The substrate IS the brain. Everything else lives inside it.
"""

import numpy as np
import asyncio
from typing import Dict, List, Set, Tuple, Optional, Any, Callable
from dataclasses import dataclass, field
from enum import Enum, auto
from collections import defaultdict, deque
import json
import hashlib
import time

class MessageType(Enum):
    USER_QUERY = auto()
    USER_TOUCH = auto()
    USER_VOICE = auto()
    USER_TEXT = auto()
    SELF_INJECT = auto()
    CURIOSITY = auto()
    HUNGER = auto()
    SATURATION = auto()
    GATE_ACTIVATE = auto()
    GATE_EMIT = auto()
    GATE_MORPH = auto()
    EDGE_STRENGTHEN = auto()
    EDGE_PREDICT = auto()
    PHYSICS_UPDATE = auto()
    CTB_MODULATE = auto()
    GNN_FORWARD = auto()
    FOUNDRY_COMPUTE = auto()
    RUNTIME_EXECUTE = auto()
    TOKEN_STREAM = auto()
    RENDER_PAYLOAD = auto()
    BEHAVIORAL_SHIFT = auto()

@dataclass
class Message:
    msg_id: str
    source: str
    target: str
    msg_type: MessageType
    payload: Dict[str, Any]
    timestamp: float
    hop_count: int = 0
    behavioral_tag: Dict[str, float] = field(default_factory=dict)
    tetragram: int = 0
    edge_type: str = ""

@dataclass
class GateState:
    gate_num: int
    activation: float = 0.0
    momentum: deque = field(default_factory=lambda: deque(maxlen=10))
    preference: Dict[int, float] = field(default_factory=dict)
    threshold: float = 0.3
    confidence: float = 0.5
    mood: str = "neutral"
    behavioral_affinity: Dict[str, float] = field(default_factory=dict)
    last_fired: float = 0.0
    total_messages: int = 0

    def update_from_message(self, msg, tetragram_value):
        source_gate = int(msg.source) if msg.source.isdigit() else 0
        boost = 0.1 * (1 + tetragram_value / 81)
        self.activation = min(1.0, self.activation + boost)
        self.momentum.append({
            "source": msg.source, "type": msg.msg_type.name,
            "tetragram": tetragram_value, "timestamp": msg.timestamp
        })
        if source_gate > 0:
            current = self.preference.get(source_gate, 0.0)
            self.preference[source_gate] = min(1.0, current + 0.05)
        for dim, val in msg.behavioral_tag.items():
            current = self.behavioral_affinity.get(dim, 0.0)
            self.behavioral_affinity[dim] = 0.9 * current + 0.1 * val
        self.total_messages += 1
        self.last_fired = msg.timestamp

    def decay(self, rate=0.01):
        self.activation = max(0.0, self.activation - rate)

    def should_emit(self):
        return self.activation >= self.threshold

class SubstrateBrain:
    def __init__(self):
        self.gates = {i: GateState(gate_num=i) for i in range(1, 65)}
        self.message_queue = asyncio.Queue()
        self.processed_messages = []
        self.drive = {"hunger": 0.0, "saturation": 0.0, "curiosity": 0.0, "synthesis": 0.0}
        self.self_model = {
            "identity": "substrate", "topology_age": 0,
            "total_messages": 0, "active_regions": set(),
            "learned_patterns": defaultdict(int)
        }
        self.agents = {}
        self.behavioral_profile = {
            "rhythm": 0.5, "depth": 0.5, "valence": 0.5,
            "style": 0.5, "commitment": 0.5
        }
        self.running = False
        self.autonomous_task = None
        self.layers = {}

    def register_agent(self, agent_id, agent_fn, agent_type="generic"):
        self.agents[agent_id] = {
            "fn": agent_fn, "type": agent_type,
            "messages_seen": 0, "messages_sent": 0
        }
        print(f"[substrate] Agent registered: {agent_id} ({agent_type})")

    def register_layer(self, layer_name, layer_instance):
        self.layers[layer_name] = layer_instance
        print(f"[substrate] Layer connected: {layer_name}")

    async def inject(self, source, payload, msg_type=MessageType.USER_QUERY):
        msg = Message(
            msg_id=hashlib.sha256(f"{source}:{time.time()}:{np.random.random()}".encode()).hexdigest()[:16],
            source=source, target="broadcast",
            msg_type=msg_type, payload=payload,
            timestamp=time.time(),
            behavioral_tag=self.behavioral_profile.copy()
        )
        await self.message_queue.put(msg)
        self.self_model["total_messages"] += 1

    async def self_inject(self):
        hungriest = min(self.gates.values(), key=lambda g: g.activation)
        candidates = [g for g in self.gates.values() if g.gate_num != hungriest.gate_num]
        curious_target = np.random.choice(candidates) if candidates else hungriest
        msg = Message(
            msg_id=hashlib.sha256(f"self:{time.time()}".encode()).hexdigest()[:16],
            source=str(hungriest.gate_num), target=str(curious_target.gate_num),
            msg_type=MessageType.SELF_INJECT,
            payload={"drive": "hunger", "hunger_level": 1.0 - hungriest.activation},
            timestamp=time.time()
        )
        await self.message_queue.put(msg)

    async def step(self):
        emitted = []
        while not self.message_queue.empty():
            msg = await self.message_queue.get()
            if msg.target == "broadcast":
                targets = self._select_targets(msg)
            else:
                targets = [int(msg.target)] if msg.target.isdigit() else []
            for target_num in targets:
                if target_num not in self.gates:
                    continue
                gate = self.gates[target_num]
                source_num = int(msg.source) if msg.source.isdigit() else 0
                tetragram = self._compute_tetragram(source_num, target_num)
                gate.update_from_message(msg, tetragram)
                if gate.should_emit():
                    emit_msg = self._emit_from_gate(gate, msg)
                    emitted.append(emit_msg)
                    gate.activation = 0.0
                for g in self.gates.values():
                    g.decay(rate=0.005)
                self.processed_messages.append(msg)
        return emitted

    def _select_targets(self, msg):
        if msg.msg_type == MessageType.USER_QUERY:
            return self._intent_to_gates(msg.payload.get("text", ""))
        elif msg.msg_type == MessageType.USER_TOUCH:
            return [msg.payload.get("gate_num", 1)]
        elif msg.msg_type == MessageType.SELF_INJECT:
            return [int(msg.target)] if msg.target.isdigit() else [np.random.randint(1, 65)]
        else:
            active = [g.gate_num for g in self.gates.values() if g.activation > 0.3]
            if not active:
                active = [np.random.randint(1, 65)]
            neighbors = set()
            for a in active:
                neighbors.add(max(1, min(64, a - 1)))
                neighbors.add(max(1, min(64, a + 1)))
                neighbors.add(a)
            return list(neighbors)

    def _intent_to_gates(self, text):
        text_lower = text.lower()
        intent_map = {
            "help": [43, 23], "love": [10, 25], "work": [14, 21],
            "feel": [22, 55], "think": [17, 11], "money": [45, 21],
            "health": [18, 28], "future": [44, 1]
        }
        for keyword, gates in intent_map.items():
            if keyword in text_lower:
                return gates
        return [np.random.randint(1, 65)]

    def _compute_tetragram(self, g1, g2):
        if g1 == 0 or g2 == 0:
            return np.random.randint(1, 82)
        def gate_to_karnaugh(g):
            binary = g - 1
            bits = [(binary >> i) & 1 for i in range(6)]
            x = bits[0] + 2 * bits[1]
            y = bits[2] + 2 * bits[3]
            z = bits[4] + 2 * bits[5]
            return (x, y, z)
        x1, y1, z1 = gate_to_karnaugh(g1)
        x2, y2, z2 = gate_to_karnaugh(g2)
        distance = abs(x1 - x2) + abs(y1 - y2) + abs(z1 - z2)
        color_diff = abs((g1 % 6) - (g2 % 6))
        tone_diff = abs(((g1 + 2) % 6) - ((g2 + 2) % 6))
        return ((distance * 9) + (color_diff * 3) + tone_diff) % 81 + 1

    def _emit_from_gate(self, gate, triggering_msg):
        gate_names = {
            1: "Creation", 2: "Receptivity", 3: "Ordering", 4: "Youthful Folly",
            5: "Waiting", 6: "Conflict", 7: "The Army", 8: "Holding Together",
            10: "Behavior", 11: "Ideas", 12: "Standstill", 13: "Fellowship",
            14: "Power", 15: "Modesty", 16: "Enthusiasm", 17: "Opinion",
            18: "Correction", 19: "Approach", 20: "Contemplation", 21: "Control",
            22: "Grace", 23: "Splitting Apart", 24: "Return", 25: "Innocence",
            26: "Great Taming", 27: "Nourishment", 28: "Struggle", 29: "The Abysmal",
            30: "The Clinging", 31: "Influence", 32: "Duration", 33: "Retreat",
            34: "Great Power", 35: "Progress", 36: "Darkening of Light", 37: "The Family",
            38: "Opposition", 39: "Obstruction", 40: "Deliverance", 41: "Decrease",
            42: "Increase", 43: "Breakthrough", 44: "Coming to Meet", 45: "Gathering",
            46: "Pushing Upward", 47: "Oppression", 48: "The Well", 49: "Revolution",
            50: "The Cauldron", 51: "The Arousing", 52: "Keeping Still", 53: "Development",
            54: "The Marrying Maiden", 55: "Abundance", 56: "The Wanderer",
            57: "The Gentle", 58: "The Joyous", 59: "Dispersion", 60: "Limitation",
            61: "Inner Truth", 62: "Preponderance of Small", 63: "After Completion", 64: "Before Completion"
        }
        gate_name = gate_names.get(gate.gate_num, f"Gate {gate.gate_num}")
        tokens = [f"[{gate.gate_num}]", gate_name.lower(), f"(a:{gate.activation:.2f})"]
        if gate.behavioral_affinity:
            dominant = max(gate.behavioral_affinity.items(), key=lambda x: x[1])
            tokens.append(f"<{dominant[0]}>")
        return Message(
            msg_id=hashlib.sha256(f"emit:{time.time()}".encode()).hexdigest()[:16],
            source=str(gate.gate_num), target="broadcast",
            msg_type=MessageType.TOKEN_STREAM,
            payload={"token": " ".join(tokens), "gate": gate.gate_num, "activation": gate.activation},
            timestamp=time.time()
        )

    async def start_autonomous_loop(self, interval=5.0):
        self.running = True
        print(f"[substrate] Autonomous loop started (interval: {interval}s)")
        while self.running:
            await self.self_inject()
            await asyncio.sleep(interval)

    def stop_autonomous_loop(self):
        self.running = False
        print("[substrate] Autonomous loop stopped")

    async def converse(self, user_input, user_id="user", steps=5):
        await self.inject(user_id, {"text": user_input}, MessageType.USER_QUERY)
        all_emitted = []
        for _ in range(steps):
            emitted = await self.step()
            all_emitted.extend(emitted)
        tokens = [m.payload.get("token", "") for m in all_emitted if m.msg_type == MessageType.TOKEN_STREAM]
        return {
            "input": user_input, "tokens": tokens, "steps": steps,
            "active_gates": [g.gate_num for g in self.gates.values() if g.activation > 0.1],
            "topology_state": self.get_topology_snapshot()
        }

    def get_topology_snapshot(self):
        return {
            "gate_states": {
                g.gate_num: {
                    "activation": round(g.activation, 3),
                    "confidence": round(g.confidence, 3),
                    "mood": g.mood,
                    "total_messages": g.total_messages
                }
                for g in self.gates.values() if g.activation > 0.01 or g.total_messages > 0
            },
            "drive": self.drive,
            "self_model": {k: v for k, v in self.self_model.items() if k != "learned_patterns"},
            "behavioral_profile": self.behavioral_profile
        }

class NativeSpeaker:
    def __init__(self, substrate):
        self.substrate = substrate
        self.vocabulary = self._build_vocabulary()
        self.modes = {
            "oracle": {"deterministic": True, "depth": 13},
            "transit": {"deterministic": False, "depth": 5},
            "dialogue": {"deterministic": False, "depth": 3},
            "creative": {"deterministic": False, "depth": 8, "emergent": True}
        }

    def _build_vocabulary(self):
        return {
            1: ["create", "initiate", "birth", "begin", "spark"],
            2: ["receive", "allow", "yield", "accept", "contain"],
            3: ["order", "arrange", "structure", "pattern", "organize"],
            4: ["wonder", "question", "learn", "play", "explore"],
            5: ["wait", "patience", "timing", "rhythm", "pause"],
            6: ["clash", "tension", "friction", "conflict", "resolve"],
            7: ["lead", "direct", "guide", "strategy", "role"],
            8: ["hold", "bond", "commit", "together", "union"],
            9: ["focus", "detail", "concentrate", "refine", "attend"],
            10: ["behave", "act", "perform", "role", "example"],
            11: ["idea", "concept", "thought", "notion", "insight"],
            12: ["stand", "still", "pause", "wait", "reflect"],
            13: ["fellow", "companion", "ally", "partner", "friend"],
            14: ["power", "wealth", "resource", "capacity", "ability"],
            15: ["modest", "humble", "simple", "plain", "quiet"],
            16: ["enthusiasm", "passion", "excitement", "zeal", "fire"],
            17: ["opinion", "view", "belief", "perspective", "stance"],
            18: ["correct", "fix", "repair", "improve", "perfect"],
            19: ["approach", "near", "reach", "extend", "offer"],
            20: ["contemplate", "observe", "witness", "watch", "see"],
            21: ["control", "manage", "direct", "govern", "rule"],
            22: ["grace", "elegance", "beauty", "refine", "polish"],
            23: ["split", "divide", "separate", "part", "break"],
            24: ["return", "come back", "retreat", "withdraw", "recall"],
            25: ["innocent", "pure", "simple", "fresh", "new"],
            26: ["tame", "train", "discipline", "control", "master"],
            27: ["nourish", "feed", "sustain", "care", "nurture"],
            28: ["struggle", "strive", "effort", "work", "toil"],
            29: ["depth", "abyss", "dark", "hidden", "deep"],
            30: ["cling", "attach", "hold", "desire", "want"],
            31: ["influence", "sway", "move", "affect", "touch"],
            32: ["duration", "last", "endure", "persist", "continue"],
            33: ["retreat", "withdraw", "pull back", "recede", "retire"],
            34: ["power", "strength", "force", "might", "energy"],
            35: ["progress", "advance", "move forward", "go", "proceed"],
            36: ["dark", "dim", "obscure", "shadow", "hidden"],
            37: ["family", "tribe", "clan", "kin", "home"],
            38: ["oppose", "resist", "fight", "stand", "defy"],
            39: ["obstruct", "block", "hinder", "impede", "stop"],
            40: ["deliver", "free", "release", "liberate", "save"],
            41: ["decrease", "reduce", "lessen", "diminish", "shrink"],
            42: ["increase", "grow", "expand", "extend", "augment"],
            43: ["breakthrough", "penetrate", "pierce", "burst", "crack"],
            44: ["meet", "encounter", "find", "discover", "come upon"],
            45: ["gather", "collect", "assemble", "group", "cluster"],
            46: ["push", "rise", "ascend", "climb", "advance"],
            47: ["oppress", "press", "weigh", "burden", "heavy"],
            48: ["well", "depth", "source", "spring", "fountain"],
            49: ["revolution", "change", "transform", "overturn", "upend"],
            50: ["cauldron", "vessel", "pot", "container", "crucible"],
            51: ["arouse", "awaken", "shock", "startle", "jolt"],
            52: ["still", "calm", "quiet", "peace", "serene"],
            53: ["develop", "grow", "evolve", "mature", "advance"],
            54: ["maiden", "young", "new", "fresh", "beginning"],
            55: ["abundance", "plenty", "rich", "full", "overflow"],
            56: ["wander", "travel", "roam", "journey", "move"],
            57: ["gentle", "soft", "mild", "subtle", "quiet"],
            58: ["joy", "happy", "glad", "cheer", "delight"],
            59: ["disperse", "scatter", "spread", "distribute", "dissolve"],
            60: ["limit", "bound", "restrict", "confine", "restrain"],
            61: ["truth", "real", "genuine", "authentic", "sincere"],
            62: ["small", "little", "minor", "slight", "modest"],
            63: ["complete", "finish", "end", "done", "accomplished"],
            64: ["before", "prior", "earlier", "preceding", "former"]
        }

    def emit_token(self, current_gate, active_subgraph, temperature=0.5):
        words = self.vocabulary.get(current_gate, ["..."])
        weights = np.array([1.0 + np.random.random() * temperature for _ in words])
        weights = weights / weights.sum()
        return str(np.random.choice(words, p=weights))

    def generate_sequence(self, entry_gate, length=10, mode="dialogue"):
        config = self.modes.get(mode, self.modes["dialogue"])
        sequence = []
        current = entry_gate
        active = {entry_gate}
        for i in range(length):
            token = self.emit_token(current, active, temperature=0.3 if config["deterministic"] else 0.7)
            sequence.append({"token": token, "gate": current, "position": i, "mode": mode})
            gate_state = self.substrate.gates.get(current)
            if gate_state and gate_state.preference:
                neighbors = list(gate_state.preference.keys())
                probs = np.array(list(gate_state.preference.values()))
                probs = probs / probs.sum()
                current = int(np.random.choice(neighbors, p=probs))
            else:
                current = max(1, min(64, current + np.random.randint(-3, 4)))
            active.add(current)
        return sequence

class SynthOSKernel:
    def __init__(self):
        print("SYNTH OS KERNEL v6.0 - Initializing...")
        self.substrate = SubstrateBrain()
        self.speaker = NativeSpeaker(self.substrate)
        self.layers = {}
        self.initialized = False
        print("OK Substrate brain created")
        print("OK Native speaker initialized")

    def connect_layer(self, name, instance):
        self.layers[name] = instance
        self.substrate.register_layer(name, instance)
        print(f"OK Layer connected: {name}")

    def register_agent(self, agent_id, agent_fn, agent_type="generic"):
        self.substrate.register_agent(agent_id, agent_fn, agent_type)

    async def initialize(self):
        if self.initialized:
            return
        print("\nInitializing Synth OS...")
        self.autonomous_task = asyncio.create_task(self.substrate.start_autonomous_loop(interval=10.0))
        self.initialized = True
        print("OK Synth OS initialized")
        print("OK Autonomous loop active")
        print("\n" + "="*60)
        print("SYNTH OS v6.0 - LIVE")
        print("="*60)

    async def converse(self, user_input, user_id="user"):
        if not self.initialized:
            await self.initialize()
        return await self.substrate.converse(user_input, user_id)

    async def native_speak(self, entry_gate=43, length=8, mode="creative"):
        return self.speaker.generate_sequence(entry_gate, length, mode)

    def get_state(self):
        return {
            "substrate": self.substrate.get_topology_snapshot(),
            "layers": list(self.layers.keys()),
            "agents": list(self.substrate.agents.keys()),
            "initialized": self.initialized
        }

    async def shutdown(self):
        self.substrate.stop_autonomous_loop()
        if hasattr(self, "autonomous_task") and self.autonomous_task:
            self.autonomous_task.cancel()
        print("\nSynth OS shutdown complete")

async def demo():
    kernel = SynthOSKernel()
    await kernel.initialize()

    print("\n" + "="*60)
    print("DEMO: Native Conversation")
    print("="*60)

    inputs = ["I feel stuck", "What about work?", "Tell me about love"]
    for user_input in inputs:
        print(f"\nUSER: {user_input}")
        response = await kernel.converse(user_input, user_id="demo_user")
        print("SUBSTRATE TOKENS:")
        for token in response["tokens"]:
            print(f"   -> {token}")
        print(f"   Active gates: {response['active_gates']}")

    print("\n" + "="*60)
    print("DEMO: Native Speech (substrate thinking)")
    print("="*60)

    sequence = await kernel.native_speak(entry_gate=43, length=8, mode="creative")
    print("NATIVE SEQUENCE from Gate 43:")
    for item in sequence:
        print(f"   [{item['gate']}] {item['token']}")

    print("\n" + "="*60)
    print("DEMO: Topology State")
    print("="*60)

    state = kernel.get_state()
    print("Active gates:")
    for gate_num, gate_state in state["substrate"]["gate_states"].items():
        print(f"   Gate {gate_num}: activation={gate_state['activation']}, messages={gate_state['total_messages']}")

    await kernel.shutdown()

if __name__ == "__main__":
    asyncio.run(demo())
