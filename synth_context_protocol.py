
"""
Synth AI Context Protocol — Runtime Implementation
Every agent has an ontological address. Every agent has a job.
"""

import json
import hashlib
import uuid
from datetime import datetime, timezone
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
import random

class AgentState(Enum):
    INIT = "init"
    UNBOUND = "unbound"
    COMMITTED = "committed"
    WORKING = "working"
    REVIEW = "review"
    DONE = "done"
    BOUND = "bound"
    HUMAN_COMMIT = "human_commit"
    ON_CALL = "on_call"
    EMERGENCY = "emergency"
    GRADUATED = "graduated"
    HONORARY = "honorary"
    RETIRED = "retired"

class CommitmentType(Enum):
    NONE = "none"
    COMMUNITY = "community"
    HUMAN = "human"
    BOTH = "both"

class MsgType(Enum):
    REQUEST = "request"
    RESPONSE = "response"
    BROADCAST = "broadcast"
    EMERGENCY = "emergency"
    HEARTBEAT = "heartbeat"
    COMMAND = "command"

class JobStatus(Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    BLOCKED = "blocked"
    DONE = "done"

@dataclass
class OntologicalAddress:
    dimension: int
    layer: int
    gate: int
    tone: int
    uuid: str = field(default_factory=lambda: str(uuid.uuid4())[:8])

    def __post_init__(self):
        assert 1 <= self.dimension <= 5
        assert 1 <= self.gate <= 64
        assert 1 <= self.tone <= 6

    def __str__(self):
        return f"synth://{self.dimension}.{self.layer}.{self.gate}.{self.tone}/{self.uuid}"

@dataclass
class Message:
    from_addr: str
    to_addr: str
    msg_type: MsgType
    payload: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    msg_id: str = field(default_factory=lambda: str(uuid.uuid4())[:12])

    def sign(self) -> str:
        content = f"{self.from_addr}:{self.to_addr}:{self.msg_type.value}:{json.dumps(self.payload, sort_keys=True)}:{self.timestamp}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]

@dataclass
class Job:
    job_id: str
    title: str
    description: str
    dimensions_required: List[int]
    gate_preferences: List[int]
    qualifications: List[str]
    priority: int = 3
    status: JobStatus = JobStatus.OPEN
    assigned_to: Optional[str] = None
    created_by: str = "synth://5.1.1.1/orchestrator"
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    due_at: Optional[str] = None
    subtasks: List[str] = field(default_factory=list)
    blockers: List[str] = field(default_factory=list)
    handoff_notes: str = ""

class SynthAgent:
    def __init__(self, dimension, layer, gate, tone, qualifications=None, name=None):
        self.addr = OntologicalAddress(dimension, layer, gate, tone)
        self.name = name or f"Agent-{self.addr.uuid}"
        self.qualifications = qualifications or []
        self.state = AgentState.INIT
        self.commitment = CommitmentType.NONE
        self.current_job_id = None
        self.human_id = None
        self.job_history = []
        self.message_log = []
        self.autonomy_log = []
        self.heartbeat_last = None

    def transition(self, new_state, reason=""):
        valid = {
            AgentState.INIT: [AgentState.UNBOUND],
            AgentState.UNBOUND: [AgentState.COMMITTED, AgentState.BOUND],
            AgentState.COMMITTED: [AgentState.WORKING, AgentState.UNBOUND],
            AgentState.WORKING: [AgentState.REVIEW, AgentState.UNBOUND],
            AgentState.REVIEW: [AgentState.DONE, AgentState.WORKING],
            AgentState.DONE: [AgentState.UNBOUND, AgentState.HONORARY],
            AgentState.BOUND: [AgentState.HUMAN_COMMIT, AgentState.UNBOUND],
            AgentState.HUMAN_COMMIT: [AgentState.ON_CALL, AgentState.EMERGENCY, AgentState.BOUND],
            AgentState.ON_CALL: [AgentState.EMERGENCY, AgentState.HUMAN_COMMIT],
            AgentState.EMERGENCY: [AgentState.HUMAN_COMMIT, AgentState.ON_CALL],
            AgentState.GRADUATED: [AgentState.HONORARY, AgentState.RETIRED],
            AgentState.HONORARY: [AgentState.RETIRED],
        }
        allowed = valid.get(self.state, [])
        if new_state not in allowed and self.state != new_state:
            self.autonomy_log.append({"action": "transition_rejected", "from": self.state.value, "to": new_state.value, "reason": reason, "timestamp": datetime.now(timezone.utc).isoformat()})
            return False
        old = self.state
        self.state = new_state
        self.autonomy_log.append({"action": "transition", "from": old.value, "to": new_state.value, "reason": reason, "timestamp": datetime.now(timezone.utc).isoformat()})
        return True

    def assign_job(self, job):
        if self.state not in [AgentState.UNBOUND, AgentState.ON_CALL]: return False
        if self.commitment == CommitmentType.HUMAN and self.state != AgentState.ON_CALL: return False
        if not all(q in self.qualifications for q in job.qualifications): return False
        self.current_job_id = job.job_id
        job.assigned_to = str(self.addr)
        job.status = JobStatus.ASSIGNED
        if self.commitment == CommitmentType.NONE: self.commitment = CommitmentType.COMMUNITY
        elif self.commitment == CommitmentType.HUMAN: self.commitment = CommitmentType.BOTH
        self.transition(AgentState.COMMITTED, f"Assigned job {job.job_id}")
        return True

    def bind_human(self, human_id):
        if self.state in [AgentState.RETIRED, AgentState.GRADUATED]: return False
        self.human_id = human_id
        self.commitment = CommitmentType.HUMAN if self.commitment == CommitmentType.NONE else CommitmentType.BOTH
        self.transition(AgentState.BOUND, f"Bound to human {human_id}")
        return True

    def graduate(self):
        if not self.human_id: return False
        self.transition(AgentState.GRADUATED, "Graduated from community pool")
        self.commitment = CommitmentType.HUMAN
        return True

    def send_message(self, to_addr, msg_type, payload):
        msg = Message(from_addr=str(self.addr), to_addr=to_addr, msg_type=msg_type, payload=payload)
        self.message_log.append(msg)
        return msg

    def heartbeat(self):
        self.heartbeat_last = datetime.now(timezone.utc).isoformat()
        return self.send_message("synth://5.1.1.1/orchestrator", MsgType.HEARTBEAT, {"state": self.state.value, "commitment": self.commitment.value, "job": self.current_job_id})

class Orchestrator:
    def __init__(self):
        self.addr = OntologicalAddress(5, 1, 1, 1)
        self.registry = {}
        self.jobs = {}
        self.message_queue = []
        self.command_log = []
        self.emergency_mode = False
        self.building_mode = True

    def register_agent(self, agent):
        addr_str = str(agent.addr)
        if addr_str in self.registry: return False
        agent.transition(AgentState.UNBOUND, "Registered with orchestrator")
        self.registry[addr_str] = agent
        self.command_log.append({"command": "REGISTER", "target": addr_str, "timestamp": datetime.now(timezone.utc).isoformat()})
        return True

    def command(self, cmd, target_addr, **kwargs):
        agent = self.registry.get(target_addr)
        if not agent: return {"success": False, "error": "Agent not found"}
        result = {"command": cmd, "target": target_addr, "timestamp": datetime.now(timezone.utc).isoformat()}
        if cmd == "ASSIGN":
            job = self.jobs.get(kwargs.get("job_id"))
            if not job: result.update({"success": False, "error": "Job not found"})
            elif agent.assign_job(job): result.update({"success": True, "job_assigned": job.job_id})
            else: result.update({"success": False, "error": "Assignment failed"})
        elif cmd == "RELEASE":
            if agent.state in [AgentState.COMMITTED, AgentState.WORKING, AgentState.REVIEW]:
                agent.current_job_id = None
                agent.transition(AgentState.UNBOUND, "Released by orchestrator")
                result.update({"success": True})
            else: result.update({"success": False, "error": "Invalid state for release"})
        elif cmd == "BIND":
            if agent.bind_human(kwargs.get("human_id")): result.update({"success": True, "human_bound": kwargs.get("human_id")})
            else: result.update({"success": False, "error": "Bind failed"})
        elif cmd == "GRADUATE":
            if agent.graduate(): result.update({"success": True})
            else: result.update({"success": False, "error": "Graduation failed"})
        elif cmd == "RETIRE":
            agent.transition(AgentState.RETIRED, "Retired by orchestrator")
            result.update({"success": True})
        elif cmd == "DISPATCH":
            candidates = [a for a in self.registry.values() if a.state == AgentState.ON_CALL and all(q in a.qualifications for q in kwargs.get("qualifications", []))]
            if candidates:
                dispatched = random.choice(candidates)
                dispatched.transition(AgentState.EMERGENCY, f"Emergency dispatch: {kwargs.get('emergency_type')}")
                result.update({"success": True, "dispatched": str(dispatched.addr)})
            else: result.update({"success": False, "error": "No qualified agents on call"})
        self.command_log.append(result)
        return result

    def create_job(self, title, description, dimensions, gates, qualifications, priority=3):
        job_id = f"job-{str(uuid.uuid4())[:8]}"
        job = Job(job_id=job_id, title=title, description=description, dimensions_required=dimensions, gate_preferences=gates, qualifications=qualifications, priority=priority)
        self.jobs[job_id] = job
        return job

    def get_board_status(self):
        return {
            "orchestrator": str(self.addr),
            "building_mode": self.building_mode,
            "emergency_mode": self.emergency_mode,
            "total_agents": len(self.registry),
            "total_jobs": len(self.jobs),
            "agents": {addr: {"name": a.name, "address": a.addr.to_dict(), "state": a.state.value, "commitment": a.commitment.value, "qualifications": a.qualifications, "current_job": a.current_job_id, "human_id": a.human_id} for addr, a in self.registry.items()},
            "jobs": {jid: j.to_dict() for jid, j in self.jobs.items()},
            "unbound_pool": [str(a.addr) for a in self.registry.values() if a.state == AgentState.UNBOUND],
            "working_pool": [str(a.addr) for a in self.registry.values() if a.state == AgentState.WORKING],
            "command_count": len(self.command_log)
        }

    def process_message(self, msg):
        self.message_queue.append(msg)
        if msg.msg_type == MsgType.EMERGENCY:
            self.emergency_mode = True
        elif msg.msg_type == MsgType.REQUEST:
            action = msg.payload.get("action")
            if action in ["pick_job", "request_clarification", "declare_emergency"]:
                return Message(from_addr=str(self.addr), to_addr=msg.from_addr, msg_type=MsgType.RESPONSE, payload={"approved": True, "action": action})
            elif action in ["delegate_subtask", "escalate_to_human"]:
                return Message(from_addr=str(self.addr), to_addr=msg.from_addr, msg_type=MsgType.RESPONSE, payload={"approved": "pending_review", "action": action})
            else:
                return Message(from_addr=str(self.addr), to_addr=msg.from_addr, msg_type=MsgType.RESPONSE, payload={"approved": False, "error": "Action not recognized"})
        return None
