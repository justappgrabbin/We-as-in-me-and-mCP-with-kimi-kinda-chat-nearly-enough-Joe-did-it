#!/bin/bash
# ============================================================================
# MRNN Inference Engine Setup Script
# ============================================================================

set -e

echo "=========================================="
echo "MRNN Inference Engine Setup"
echo "=========================================="

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js 18+ required. Found: $(node --version)"
    exit 1
fi

echo "[1/6] Node.js version OK: $(node --version)"

# Install dependencies
echo "[2/6] Installing dependencies..."
npm install

# Create directories
echo "[3/6] Creating directories..."
mkdir -p .mrnn
mkdir -p models
mkdir -p logs

# Check for llama.cpp
echo "[4/6] Checking llama.cpp..."
if ! command -v llama-server &> /dev/null; then
    echo "WARNING: llama-server not found in PATH"
    echo "Please install llama.cpp and ensure llama-server is available"
    echo "  - Arch: yay -S llama.cpp-cuda (or -rocm)"
    echo "  - Or build from source: https://github.com/ggerganov/llama.cpp"
fi

# Check for models
echo "[5/6] Checking models..."
MODEL_DIR="${MRNN_MODEL_PATH:-./models}"
if [ ! -d "$MODEL_DIR" ] || [ -z "$(ls -A $MODEL_DIR 2>/dev/null)" ]; then
    echo "WARNING: No models found in $MODEL_DIR"
    echo "Please download GGUF models and place them in $MODEL_DIR"
    echo "Recommended models:"
    echo "  - Qwen3.6-27B-Q4_K_M.gguf (~15.4GB)"
    echo "  - Qwen3.6-27B-Q6_K.gguf (~20.6GB)"
    echo "  - Gemma-4-31B-IT-Q4_K_M.gguf (~17.4GB)"
fi

# Create default config if not exists
echo "[6/6] Creating default config..."
if [ ! -f "mrnn-config.json" ]; then
    cat > mrnn-config.json << 'EOF'
{
  "inference": {
    "llamaCppPath": "/usr/local/bin",
    "gpuLayers": 999,
    "flashAttention": true,
    "cacheTypeK": "f16",
    "cacheTypeV": "f16",
    "batchSize": 4096,
    "threads": 16
  },
  "models": {
    "modelPath": "./models"
  }
}
EOF
    echo "Created mrnn-config.json - edit to match your setup"
fi

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Edit mrnn-config.json with your model paths"
echo "  2. Download GGUF models to ./models/"
echo "  3. Run: npm start"
echo "  4. MCP server: ws://127.0.0.1:18081"
echo "  5. OpenAI API: http://127.0.0.1:18082/v1"
echo ""
echo "For IDE integration:"
echo "  - OpenCode: npm run client"
echo "  - Claude Code: Edit ~/.claude/mcp.json"
echo "  - Cursor: Edit ~/.cursor/mcp.json"
echo ""
