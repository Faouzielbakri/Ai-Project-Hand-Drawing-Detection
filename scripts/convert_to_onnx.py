#!/usr/bin/env python3
"""
Convert PyTorch Quick Draw models to ONNX format for browser inference.

Usage:
    python scripts/convert_to_onnx.py

This will create:
    - public/models/mobilenetv3.onnx (64x64 input)
    - public/models/efficientnet_b2.onnx (96x96 input)
"""

import torch
import timm
from pathlib import Path
import onnx

# Model configurations matching your training
MODELS = {
    "mobilenetv3": {
        "arch": "mobilenetv3_large_100",
        "size": 64,
        "input_path": "best_model.pt",
        "output_path": "public/models/mobilenetv3.onnx",
        "name": "MobileNetV3-Large"
    },
    "efficientnet": {
        "arch": "efficientnet_b2",
        "size": 96,
        "input_path": "best_model_new.pt",
        "output_path": "public/models/efficientnet_b2.onnx",
        "name": "EfficientNet-B2"
    }
}

NUM_CLASSES = 340


def convert_model(key: str) -> bool:
    """Convert a single model to ONNX format with embedded weights."""
    cfg = MODELS[key]

    print(f"\n{'='*50}")
    print(f"Converting: {cfg['name']}")
    print(f"{'='*50}")

    # Check if input model exists
    input_path = Path(cfg["input_path"])
    if not input_path.exists():
        print(f"  [SKIP] Model not found: {input_path}")
        return False

    # Create model architecture (same as training)
    print(f"  Creating {cfg['arch']} architecture...")
    model = timm.create_model(
        cfg["arch"],
        pretrained=False,
        in_chans=1,  # Grayscale input
        num_classes=NUM_CLASSES,
    )

    # Load weights
    print(f"  Loading weights from {input_path}...")
    state_dict = torch.load(input_path, map_location="cpu", weights_only=True)

    # Strip 'backbone.' prefix if present (from training wrapper)
    cleaned_state_dict = {}
    for k, v in state_dict.items():
        new_key = k.replace("backbone.", "") if k.startswith("backbone.") else k
        cleaned_state_dict[new_key] = v

    model.load_state_dict(cleaned_state_dict)
    model.eval()

    # Create dummy input matching model size
    dummy_input = torch.randn(1, 1, cfg["size"], cfg["size"])

    # Ensure output directory exists
    output_path = Path(cfg["output_path"])
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Remove old files
    if output_path.exists():
        output_path.unlink()
    data_path = output_path.with_suffix(".onnx.data")
    if data_path.exists():
        data_path.unlink()

    # Export to ONNX using legacy exporter (more compatible)
    print(f"  Exporting to ONNX...")

    # Use torch.onnx.export with dynamo=False for simpler export
    torch.onnx.export(
        model,
        dummy_input,
        str(output_path),
        export_params=True,
        opset_version=14,  # Use older opset for better compatibility
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "output": {0: "batch_size"}
        },
        dynamo=False,  # Use legacy exporter
    )

    # Check if external data file was created and merge it
    if data_path.exists():
        print(f"  Merging external data into single file...")
        # Load and save with external data converted to internal
        onnx_model = onnx.load(str(output_path), load_external_data=True)
        # Convert external data to internal tensors
        from onnx.external_data_helper import convert_model_to_external_data
        # Actually, we want the opposite - to internalize the data
        onnx.save(onnx_model, str(output_path))
        # Remove the data file
        if data_path.exists():
            data_path.unlink()
            print(f"  Removed external data file")

    # Verify output
    file_size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"  [OK] Saved: {output_path} ({file_size_mb:.1f} MB)")

    return True


def verify_onnx(key: str) -> bool:
    """Verify ONNX model can be loaded and run."""
    try:
        import onnxruntime as ort

        cfg = MODELS[key]
        output_path = Path(cfg["output_path"])

        if not output_path.exists():
            return False

        print(f"  Verifying with ONNX Runtime...")

        # Load model
        session = ort.InferenceSession(str(output_path))

        # Create test input
        import numpy as np
        test_input = np.random.randn(1, 1, cfg["size"], cfg["size"]).astype(np.float32)

        # Run inference
        outputs = session.run(None, {"input": test_input})

        # Check output shape
        assert outputs[0].shape == (1, NUM_CLASSES), f"Unexpected output shape: {outputs[0].shape}"

        print(f"  [OK] Verification passed! Output shape: {outputs[0].shape}")
        return True

    except ImportError:
        print("  [SKIP] onnxruntime not installed, skipping verification")
        return True
    except Exception as e:
        print(f"  [ERROR] Verification failed: {e}")
        return False


def main():
    print("\n" + "="*60)
    print("Quick Draw Model Conversion: PyTorch -> ONNX")
    print("="*60)

    success_count = 0

    for key in MODELS:
        if convert_model(key):
            if verify_onnx(key):
                success_count += 1

    print("\n" + "="*60)
    print(f"Conversion complete: {success_count}/{len(MODELS)} models")
    print("="*60)

    if success_count > 0:
        print("\nNext steps:")
        print("1. The ONNX models are in public/models/")
        print("2. Run: pnpm dev")
        print("3. Models will be loaded in the browser via ONNX Runtime Web")


if __name__ == "__main__":
    main()
