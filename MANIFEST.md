# Resonance MRNN Render Bundle

## What changed
- Preserved the purple Resonance OS shell as `static/index.html`.
- Preserved the MRNN visualizer as `static/mrnn_visualizer.html` and embedded it in the OS as the `MRNN` dock module.
- Preserved the scheduler API from `main.py`; existing endpoints remain unchanged.
- Added `/ui` for the Resonance OS interface.
- Added `/visualizer` for the standalone MRNN visualizer.
- Mounted `mrnn_api.py` under `/mrnn` when its dependencies/imports are available.
- Added visible Render callback configuration in Settings. Default: `window.location.origin`. Override: `localStorage.RENDER_API_BASE` or the visualizer query string `?api=https://your-service.onrender.com`.

## No-secret-pruning guarantee
All source uploads are copied into `originals/`, and the major standalone files are also included at top level where deployment needs them. Nothing was intentionally removed.

## Render deployment
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- UI: `/ui`
- Scheduler docs: `/docs`
- Health: `/health`
- MRNN visualizer: `/visualizer`
- Mounted MRNN API, if import succeeds: `/mrnn/...`

## Important note
`mrnn_api.py` still contains its original placeholder orchestrator initialization. I did not fake that connection. If the Python orchestrator module is supplied later, the mounted `/mrnn` endpoints can become live without changing the UI contract.
