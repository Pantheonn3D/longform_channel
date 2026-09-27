#!/usr/bin/env bash
# Download the Kokoro TTS model (~350 MB, Apache-2.0) used for scratch narration.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p models
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -f "models/$f" ] || curl -fL -o "models/$f" "$base/$f"
done
