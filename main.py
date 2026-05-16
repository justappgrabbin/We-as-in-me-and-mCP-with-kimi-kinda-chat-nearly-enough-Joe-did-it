"""
Synth AI Scheduler Server — FastAPI + Supabase
===============================================
Deployable to Render. Three endpoints:
- POST /schedule — run tri-scheduler
- POST /ingest — book ingestion (placeholder for mesh)
- GET /health — system status

Environment:
- SUPABASE_URL
- SUPABASE_KEY
- PORT (Render sets this)
"""

import os
import json
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Import our scheduler
from synth_scheduler import (
    SynthScheduler, HDChart, TransitState,
    SwissEphemerisFeed, VargaEngine, CertaintyLevel
)


# ═══════════════════════════════════════════════════════════════════════
# SUPABASE CLIENT
# ═══════════════════════════════════════════════════════════════════════

class SupabaseClient:
    """Lightweight Supabase REST client."""

    def __init__(self, url: str, key: str):
        self.url = url.rstrip("/")
        self.key = key
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self.client = httpx.AsyncClient(timeout=30.0)

    async def insert(self, table: str, data: Dict) -> Dict:
        """Insert into Supabase table."""
        url = f"{self.url}/rest/v1/{table}"
        response = await self.client.post(url, headers=self.headers, json=data)
        if response.status_code not in [200, 201]:
            raise HTTPException(status_code=500, 
                            detail=f"Supabase insert failed: {response.text}")
        return response.json()

    async def select(self, table: str, query: str = "*", 
                     filters: Optional[Dict] = None) -> List[Dict]:
        """Select from Supabase table."""
        url = f"{self.url}/rest/v1/{table}?select={query}"
        if filters:
            for key, val in filters.items():
                url += f"&{key}=eq.{val}"
        response = await self.client.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=500,
                            detail=f"Supabase select failed: {response.text}")
        return response.json()

    async def close(self):
        await self.client.aclose()


# ═══════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ═══════════════════════════════════════════════════════════════════════

class BirthDataInput(BaseModel):
    """Input for chart calculation."""
    name: str = ""
    birth_date: str = Field(..., description="YYYY-MM-DD")
    birth_time: str = Field(..., description="HH:MM:SS")
    birth_place: str = ""
    longitude: float = 0.0
    latitude: float = 0.0

    # HD data (can be pre-calculated or empty for server calc)
    type: str = ""
    profile: str = ""
    authority: str = ""
    defined_centers: List[str] = []
    undefined_centers: List[str] = []
    defined_gates: List[int] = []
    gate_activations: Dict[str, Dict] = {}

    # Vedic/Draconic
    nakshatra: str = ""
    dasha_lord: str = ""
    draconic_sun: str = ""
    nodal_axis: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Demo User",
                "birth_date": "1990-06-15",
                "birth_time": "14:30:00",
                "birth_place": "New York, NY",
                "longitude": -74.006,
                "latitude": 40.7128,
                "type": "Generator",
                "profile": "6/2",
                "authority": "Sacral",
                "defined_centers": ["Sacral", "Heart", "Ajna", "Throat", "G"],
                "undefined_centers": ["Solar Plexus", "Spleen", "Root", "Crown"],
                "defined_gates": [34, 20, 10, 15, 59, 6, 25, 51, 21, 26, 40],
                "nakshatra": "Magha",
                "dasha_lord": "Jupiter",
                "draconic_sun": "Aries",
                "nodal_axis": "North Node in Libra"
            }
        }


class TransitInput(BaseModel):
    """Optional manual transit input. If empty, server calculates from ephemeris."""
    timestamp: Optional[str] = None
    planetary_positions: Dict[str, Dict] = {}
    lunar_phase: str = ""
    retrograde_planets: List[str] = []
    activated_gates: List[int] = []
    conditioned_gates: List[int] = []


class ScheduleRequest(BaseModel):
    """Full request to /schedule endpoint."""
    chart: BirthDataInput
    transit: Optional[TransitInput] = None
    use_ephemeris: bool = True
    save_to_db: bool = True


class ScheduleResponse(BaseModel):
    """Response from /schedule endpoint."""
    status: str
    timestamp: str
    scheduler_result: Dict
    saved_to_db: bool = False
    db_record_id: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    ephemeris_available: bool
    supabase_connected: bool
    uptime_seconds: float
    version: str = "1.0.0"


# ═══════════════════════════════════════════════════════════════════════
# APP LIFESPAN
# ═══════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init connections. Shutdown: cleanup."""
    # Startup
    app.state.start_time = datetime.now()
    app.state.scheduler = SynthScheduler(use_ephemeris=False)  # Will init ephemeris if available

    # Supabase
    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_KEY", "")
    if supabase_url and supabase_key:
        app.state.supabase = SupabaseClient(supabase_url, supabase_key)
        app.state.supabase_connected = True
    else:
        app.state.supabase = None
        app.state.supabase_connected = False

    # Try to init ephemeris
    try:
        app.state.ephemeris = SwissEphemerisFeed()
        app.state.scheduler = SynthScheduler(use_ephemeris=True)
        app.state.ephemeris_available = True
    except Exception as e:
        app.state.ephemeris = None
        app.state.ephemeris_available = False
        print(f"Ephemeris not available: {e}")

    print(f"Server started. Ephemeris: {app.state.ephemeris_available}. Supabase: {app.state.supabase_connected}")

    yield

    # Shutdown
    if app.state.supabase:
        await app.state.supabase.close()
    print("Server shutdown complete.")


# ═══════════════════════════════════════════════════════════════════════
# FASTAPI APP
# ═══════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="Synth AI Scheduler",
    description="Tri-scheduler API: Body/Mind/Heart perspectives with questioning orchestrator",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allow your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════

def input_to_hdchart(data: BirthDataInput) -> HDChart:
    """Convert API input to HDChart object."""
    return HDChart(
        name=data.name,
        birth_date=data.birth_date,
        birth_time=data.birth_time,
        birth_place=data.birth_place,
        longitude=data.longitude,
        latitude=data.latitude,
        type=data.type,
        profile=data.profile,
        authority=data.authority,
        defined_centers=set(data.defined_centers),
        undefined_centers=set(data.undefined_centers),
        defined_gates=set(data.defined_gates),
        undefined_gates=set(range(1, 65)) - set(data.defined_gates),
        gate_activations={int(k): v for k, v in data.gate_activations.items()},
        nakshatra=data.nakshatra,
        dasha_lord=data.dasha_lord,
        draconic_sun=data.draconic_sun,
        nodal_axis=data.nodal_axis
    )


def transit_input_to_state(data: Optional[TransitInput]) -> Optional[TransitState]:
    """Convert API transit input to TransitState."""
    if not data:
        return None

    ts = datetime.fromisoformat(data.timestamp) if data.timestamp else datetime.now()
    return TransitState(
        timestamp=ts,
        planetary_positions=data.planetary_positions,
        lunar_phase=data.lunar_phase,
        retrograde_planets=set(data.retrograde_planets),
        activated_gates=set(data.activated_gates),
        conditioned_gates=set(data.conditioned_gates)
    )


# ═══════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@app.get("/", tags=["health"])
async def root():
    """Root — redirect to docs."""
    return {"message": "Synth AI Scheduler API", "docs": "/docs", "health": "/health"}


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Health check — ephemeris status, supabase status, uptime."""
    uptime = (datetime.now() - app.state.start_time).total_seconds()
    return HealthResponse(
        status="healthy",
        ephemeris_available=app.state.ephemeris_available,
        supabase_connected=app.state.supabase_connected,
        uptime_seconds=uptime
    )


@app.post("/schedule", response_model=ScheduleResponse, tags=["scheduler"])
async def run_scheduler(request: ScheduleRequest, background_tasks: BackgroundTasks):
    """
    Run the tri-scheduler. 

    If transit is provided, uses it. Otherwise calculates from ephemeris.
    If ephemeris unavailable, returns error unless transit is provided.
    """
    try:
        # Build chart
        chart = input_to_hdchart(request.chart)

        # Build or fetch transit
        transit = None
        if request.transit:
            transit = transit_input_to_state(request.transit)
        elif app.state.ephemeris_available and request.use_ephemeris:
            transit = app.state.ephemeris.get_transit()
        else:
            raise HTTPException(
                status_code=400,
                detail="No transit provided and ephemeris unavailable. Provide transit data or install pyswisseph."
            )

        # Run scheduler
        result = app.state.scheduler.calculate(chart, transit)

        # Save to Supabase if configured
        saved = False
        record_id = None
        if request.save_to_db and app.state.supabase_connected:
            try:
                db_record = {
                    "user_name": chart.name,
                    "birth_date": chart.birth_date,
                    "timestamp": result["timestamp"],
                    "body_certainty": result["perspectives"]["BODY"]["certainty"],
                    "mind_certainty": result["perspectives"]["MIND"]["certainty"],
                    "heart_certainty": result["perspectives"]["HEART"]["certainty"],
                    "tensions_count": len(result.get("tensions", [])),
                    "questions_count": len(result.get("questions", [])),
                    "result_json": json.dumps(result),
                    "created_at": datetime.now().isoformat()
                }
                db_result = await app.state.supabase.insert("scheduler_runs", db_record)
                saved = True
                record_id = db_result[0].get("id") if db_result else None
            except Exception as e:
                print(f"DB save failed (non-critical): {e}")

        return ScheduleResponse(
            status="success",
            timestamp=result["timestamp"],
            scheduler_result=result,
            saved_to_db=saved,
            db_record_id=record_id
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduler error: {str(e)}")


@app.post("/schedule/quick", tags=["scheduler"])
async def quick_schedule(chart: BirthDataInput, use_ephemeris: bool = True):
    """Quick schedule — minimal input, returns just the questions and tensions."""
    request = ScheduleRequest(chart=chart, use_ephemeris=use_ephemeris, save_to_db=False)
    response = await run_scheduler(request, BackgroundTasks())

    # Return simplified view
    result = response.scheduler_result
    return {
        "timestamp": result["timestamp"],
        "what_body_says": result["perspectives"]["BODY"]["says"],
        "what_mind_says": result["perspectives"]["MIND"]["says"],
        "what_heart_says": result["perspectives"]["HEART"]["says"],
        "tensions": [t["description"] for t in result.get("tensions", [])],
        "questions": [q["question"] for q in result.get("questions", [])],
        "open_questions": result.get("open_questions", 0)
    }


@app.get("/history/{user_name}", tags=["history"])
async def get_user_history(user_name: str, limit: int = 10):
    """Get scheduler history for a user from Supabase."""
    if not app.state.supabase_connected:
        raise HTTPException(status_code=503, detail="Supabase not configured")

    try:
        results = await app.state.supabase.select(
            "scheduler_runs",
            query="*",
            filters={"user_name": user_name}
        )
        # Sort by timestamp desc, limit
        results.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return {"user": user_name, "runs": results[:limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History fetch failed: {e}")


@app.post("/question/respond", tags=["questions"])
async def respond_to_question(question_id: str, response: str, user_name: str = ""):
    """User responds to a raised question. Stores in Supabase."""
    if app.state.supabase_connected:
        try:
            await app.state.supabase.insert("question_responses", {
                "question_id": question_id,
                "user_name": user_name,
                "response": response,
                "responded_at": datetime.now().isoformat()
            })
        except Exception as e:
            print(f"Response save failed: {e}")

    return {
        "status": "recorded",
        "question_id": question_id,
        "user_can": "The system will incorporate this into future scheduler runs"
    }


@app.get("/varga/{user_name}", tags=["varga"])
async def get_varga_layers(user_name: str):
    """Get Varga (divisional chart) layers for a user."""
    if not app.state.supabase_connected:
        raise HTTPException(status_code=503, detail="Supabase not configured")

    # Fetch user's birth data
    try:
        users = await app.state.supabase.select("users", query="*", 
                                               filters={"name": user_name})
        if not users:
            raise HTTPException(status_code=404, detail="User not found")

        user = users[0]
        # Calculate Vargas if ephemeris available
        if app.state.ephemeris_available:
            # This would need full birth chart calculation
            return {"user": user_name, "vargas": "Full calculation requires birth planetary positions"}
        else:
            return {"user": user_name, "vargas": "Ephemeris not available"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Varga fetch failed: {e}")


# ═══════════════════════════════════════════════════════════════════════
# RENDER-SPECIFIC: STARTUP
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)


# ═══════════════════════════════════════════════════════════════════════
# STATIC RESONANCE/MRNN UI + OPTIONAL MRNN SUB-APP
# Added integration layer. Existing scheduler endpoints above are untouched.
# ═══════════════════════════════════════════════════════════════════════
from pathlib import Path as _Path
from fastapi.responses import FileResponse as _FileResponse
from fastapi.staticfiles import StaticFiles as _StaticFiles

_STATIC_DIR = _Path(__file__).parent / "static"

@app.get("/ui", include_in_schema=False)
async def resonance_ui():
    return _FileResponse(_STATIC_DIR / "index.html")

@app.get("/visualizer", include_in_schema=False)
async def resonance_visualizer():
    return _FileResponse(_STATIC_DIR / "mrnn_visualizer.html")

try:
    from mrnn_api import app as _mrnn_app
    app.mount("/mrnn", _mrnn_app)
except Exception as _mrnn_mount_error:
    @app.get("/mrnn/status")
    async def mrnn_mount_status():
        return {"mounted": False, "error": str(_mrnn_mount_error)}

app.mount("/static", _StaticFiles(directory=str(_STATIC_DIR)), name="static")
