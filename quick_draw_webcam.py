#!/usr/bin/env python3
"""
Quick Draw Webcam Recognition
=============================
Real-time sketch recognition using webcam with OpenCV.

Features:
- Supports 'old' (MobileNetV3) and 'new' (EfficientNet-B2) models
- Captures from webcam (whiteboard with black lines)
- Inverts to match training format (black bg, white lines)
- Shows top 5 predictions in real-time loop
- Optimized for MPS (Apple Silicon)

Usage:
    python quick_draw_webcam.py --model new --interval 2
    python quick_draw_webcam.py --model old --interval 1
    python quick_draw_webcam.py --help
"""

import argparse
import time
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np
import torch
import torch.nn as nn
import timm


# ============================================
# CONFIGURATION
# ============================================

@dataclass
class ModelConfig:
    arch: str
    size: int
    path: str
    name: str


MODELS = {
    "old": ModelConfig(
        arch="mobilenetv3_large_100",
        size=64,
        path="best_model.pt",
        name="MobileNetV3 (64x64)"
    ),
    "new": ModelConfig(
        arch="efficientnet_b2",
        size=96,
        path="best_model_new.pt",
        name="EfficientNet-B2 (96x96)"
    )
}

NUM_CLASSES = 340

# All 340 Quick Draw classes
# ============================================
# ALL 340 CLASSES
# ============================================

CLASSES = ['airplane', 'alarm clock', 'ambulance', 'angel', 'animal migration', 'ant', 'anvil', 'apple', 'arm', 'asparagus', 'axe', 'backpack', 
'banana', 'bandage', 'barn', 'baseball', 'baseball bat', 'basket', 'basketball', 'bat', 'bathtub', 'beach', 'bear', 'beard', 'bed', 'bee', 'belt', 
'bench', 'bicycle', 'binoculars', 'bird', 'birthday cake', 'blackberry', 'blueberry', 'book', 'boomerang', 'bottlecap', 'bowtie', 'bracelet', 'brain', 
'bread', 'bridge', 'broccoli', 'broom', 'bucket', 'bulldozer', 'bus', 'bush', 'butterfly', 'cactus', 'cake', 'calculator', 'calendar', 'camel', 'camera', 
'camouflage', 'campfire', 'candle', 'cannon', 'canoe', 'car', 'carrot', 'castle', 'cat', 'ceiling fan', 'cell phone', 'cello', 'chair', 'chandelier', 'church', 
'circle', 'clarinet', 'clock', 'cloud', 'coffee cup', 'compass', 'computer', 'cookie', 'cooler', 'couch', 'cow', 'crab', 'crayon', 'crocodile', 'crown', 'cruise ship', 
'cup', 'diamond', 'dishwasher', 'diving board', 'dog', 'dolphin', 'donut', 'door', 'dragon', 'dresser', 'drill', 'drums', 'duck', 'dumbbell', 'ear', 'elbow', 'elephant', 
'envelope', 'eraser', 'eye', 'eyeglasses', 'face', 'fan', 'feather', 'fence', 'finger', 'fire hydrant', 'fireplace', 'firetruck', 'fish', 'flamingo', 'flashlight', 'flip flops', 
'floor lamp', 'flower', 'flying saucer', 'foot', 'fork', 'frog', 'frying pan', 'garden', 'garden hose', 'giraffe', 'goatee', 'golf club', 'grapes', 'grass', 'guitar', 'hamburger', 
'hammer', 'hand', 'harp', 'hat', 'headphones', 'hedgehog', 'helicopter', 'helmet', 'hexagon', 'hockey puck', 'hockey stick', 'horse', 'hospital', 'hot air balloon', 'hot dog', 'hot tub', 
'hourglass', 'house', 'house plant', 'hurricane', 'ice cream', 'jacket', 'jail', 'kangaroo', 'key', 'keyboard', 'knee', 'ladder', 'lantern', 'laptop', 'leaf', 'leg', 'light bulb', 'lighthouse', 
'lightning', 'line', 'lion', 'lipstick', 'lobster', 'lollipop', 'mailbox', 'map', 'marker', 'matches', 'megaphone', 'mermaid', 'microphone', 'microwave', 'monkey', 'moon', 'mosquito', 'motorbike', 
'mountain', 'mouse', 'moustache', 'mouth', 'mug', 'mushroom', 'nail', 'necklace', 'nose', 'ocean', 'octagon', 'octopus', 'onion', 'oven', 'owl', 'paint can', 'paintbrush', 'palm tree', 'panda', 
'pants', 'paper clip', 'parachute', 'parrot', 'passport', 'peanut', 'pear', 'peas', 'pencil', 'penguin', 'piano', 'pickup truck', 'picture frame', 'pig', 'pillow', 'pineapple', 'pizza', 'pliers', 
'police car', 'pond', 'pool', 'popsicle', 'postcard', 'potato', 'power outlet', 'purse', 'rabbit', 'raccoon', 'radio', 'rain', 'rainbow', 'rake', 'remote control', 'rhinoceros', 'river', 
'roller coaster', 'rollerskates', 'sailboat', 'sandwich', 'saw', 'saxophone', 'school bus', 'scissors', 'scorpion', 'screwdriver', 'sea turtle', 'see saw', 'shark', 'sheep', 'shoe', 'shorts', 
'shovel', 'sink', 'skateboard', 'skull', 'skyscraper', 'sleeping bag', 'smiley face', 'snail', 'snake', 'snorkel', 'snowflake', 'snowman', 'soccer ball', 'sock', 'speedboat', 'spider', 'spoon', 
'spreadsheet', 'square', 'squiggle', 'squirrel', 'stairs', 'star', 'steak', 'stereo', 'stethoscope', 'stitches', 'stop sign', 'stove', 'strawberry', 'streetlight', 'string bean', 'submarine', 
'suitcase', 'sun', 'swan', 'sweater', 'swing set', 'sword', 't-shirt', 'table', 'teapot', 'teddy-bear', 'telephone', 'television', 'tennis racquet', 'tent', 'The Eiffel Tower', 
'The Great Wall of China', 'The Mona Lisa', 'tiger', 'toaster', 'toe', 'toilet', 'tooth', 'toothbrush', 'toothpaste', 'tornado', 'tractor', 'traffic light', 'train', 'tree', 'triangle', 
'trombone', 'truck', 'trumpet', 'umbrella', 'underwear', 'van', 'vase', 'violin', 'washing machine', 'watermelon', 'waterslide', 'whale', 'wheel', 'windmill', 'wine bottle', 'wine glass', 
'wristwatch', 'yoga', 'zebra', 'zigzag']
 

ID2CLASS = {i: c.replace(' ', '_') for i, c in enumerate(CLASSES)}
print(f"✓ Loaded {len(CLASSES)} classes")



# ============================================
# MODEL LOADER
# ============================================

class QuickDrawModel:
    """Wrapper for Quick Draw recognition model with MPS optimization."""
    
    def __init__(self, model_key: str = "new"):
        self.config = MODELS[model_key]
        self.device = self._get_device()
        self.model = self._load_model()
        
    def _get_device(self) -> torch.device:
        """Get best available device (MPS > CUDA > CPU)."""
        if torch.backends.mps.is_available():
            device = torch.device("mps")
            print(f"✓ Using MPS (Apple Silicon)")
        elif torch.cuda.is_available():
            device = torch.device("cuda")
            print(f"✓ Using CUDA")
        else:
            device = torch.device("cpu")
            print(f"✓ Using CPU")
        return device
    
    def _load_model(self) -> nn.Module:
        """Load the model with weights."""
        # Create model architecture
        model = timm.create_model(
            self.config.arch,
            pretrained=False,
            in_chans=1,
            num_classes=NUM_CLASSES
        )
        
        # Load weights
        model_path = Path(self.config.path)
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {self.config.path}")
        
        state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
        
        # Strip 'backbone.' prefix if present (from training wrapper)
        new_state_dict = {}
        for k, v in state_dict.items():
            new_key = k.replace("backbone.", "") if k.startswith("backbone.") else k
            new_state_dict[new_key] = v
        
        model.load_state_dict(new_state_dict)
        model.to(self.device)
        model.eval()
        
        print(f"✓ Loaded: {self.config.path}")
        print(f"✓ Model: {self.config.name}")
        
        return model
    
    @torch.no_grad()
    def predict(self, image: np.ndarray, top_k: int = 5) -> list[tuple[str, float]]:
        """
        Predict from grayscale image (expects black bg, white lines format).
        
        Args:
            image: Grayscale numpy array (any size)
            top_k: Number of top predictions to return
            
        Returns:
            List of (class_name, probability) tuples
        """
        # Resize to model input size
        img = cv2.resize(image, (self.config.size, self.config.size), interpolation=cv2.INTER_AREA)
        
        # Normalize to [-1, 1] (same as training)
        img = img.astype(np.float32)
        img = (img / 127.5) - 1.0
        
        # Convert to tensor: (H, W) -> (1, 1, H, W)
        tensor = torch.from_numpy(img).unsqueeze(0).unsqueeze(0).to(self.device)
        
        # Forward pass
        outputs = self.model(tensor)
        probs = torch.softmax(outputs, dim=1)
        top_probs, top_indices = probs.topk(top_k, dim=1)
        
        # Format results
        results = []
        for prob, idx in zip(top_probs[0], top_indices[0]):
            class_name = ID2CLASS[idx.item()]
            results.append((class_name, prob.item()))
        
        return results


# ============================================
# WEBCAM CAPTURE & PROCESSING
# ============================================

class WhiteboardCapture:
    """Captures and processes whiteboard images for sketch recognition."""
    
    def __init__(self, camera_id: int = 0, display_size: int = 400):
        self.camera_id = camera_id
        self.display_size = display_size
        self.cap: Optional[cv2.VideoCapture] = None
        
    def open(self) -> bool:
        """Open the webcam."""
        self.cap = cv2.VideoCapture(self.camera_id)
        if not self.cap.isOpened():
            print(f"✗ Could not open camera {self.camera_id}")
            return False
        
        # Set resolution for better quality
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        print(f"✓ Camera opened (ID: {self.camera_id})")
        return True
    
    def close(self):
        """Release the webcam."""
        if self.cap is not None:
            self.cap.release()
            
    def read_frame(self) -> Optional[np.ndarray]:
        """Read a frame from webcam."""
        if self.cap is None:
            return None
        ret, frame = self.cap.read()
        return frame if ret else None
    
    def process_for_model(
        self, 
        frame: np.ndarray, 
        threshold_value: int = 60,
        white_level: int = 225
    ) -> np.ndarray:
        """
        Process webcam frame for model input.
        
        Whiteboard capture (white bg, black lines) -> Model format (black bg, white lines)
        
        Args:
            frame: BGR frame from camera
            threshold_value: Pixels below this (after invert) become pure black (0)
            white_level: Pixels above threshold become this value (195-255 range)
        """
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Crop to square (center)
        h, w = gray.shape
        size = min(h, w)
        start_x = (w - size) // 2
        start_y = (h - size) // 2
        cropped = gray[start_y:start_y+size, start_x:start_x+size]
        
        # Invert colors: white board + black lines -> black bg + white lines
        inverted = cv2.bitwise_not(cropped)
        
        # Clean thresholding: 
        # - Below threshold -> pure black (0)
        # - Above threshold -> white-ish (white_level, e.g., 225)
        # This removes gray noise from whiteboard while keeping strokes clean
        _, binary = cv2.threshold(inverted, threshold_value, white_level, cv2.THRESH_BINARY)
        
        return binary
    
    def create_display(
        self, 
        original: np.ndarray, 
        processed: np.ndarray, 
        predictions: list[tuple[str, float]],
        interval: float
    ) -> np.ndarray:
        """
        Create a display image showing:
        - Original camera feed
        - Processed (inverted) image
        - Top 5 predictions
        """
        display_h = self.display_size
        display_w = self.display_size * 2 + 300  # Two images + predictions panel
        
        # Create canvas
        canvas = np.zeros((display_h, display_w, 3), dtype=np.uint8)
        canvas[:] = (30, 30, 30)  # Dark gray background
        
        # Resize and place original frame
        h, w = original.shape[:2]
        size = min(h, w)
        start_x = (w - size) // 2
        start_y = (h - size) // 2
        cropped_orig = original[start_y:start_y+size, start_x:start_x+size]
        resized_orig = cv2.resize(cropped_orig, (display_h, display_h))
        canvas[0:display_h, 0:display_h] = resized_orig
        
        # Resize and place processed (inverted) image
        resized_proc = cv2.resize(processed, (display_h, display_h))
        # Convert grayscale to BGR for display
        proc_bgr = cv2.cvtColor(resized_proc, cv2.COLOR_GRAY2BGR)
        canvas[0:display_h, display_h:display_h*2] = proc_bgr
        
        # Add labels
        cv2.putText(canvas, "Camera (Whiteboard)", (10, 25), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(canvas, "Inverted (Model Input)", (display_h + 10, 25), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Draw predictions panel
        panel_x = display_h * 2 + 10
        cv2.putText(canvas, "TOP 5 PREDICTIONS", (panel_x, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        cv2.line(canvas, (panel_x, 40), (panel_x + 280, 40), (100, 100, 100), 1)
        
        # Draw each prediction
        for i, (name, prob) in enumerate(predictions):
            y_pos = 70 + i * 60
            display_name = name.replace('_', ' ')
            
            # Confidence bar
            bar_width = int(prob * 200)
            bar_color = (0, int(255 * prob), int(255 * (1 - prob)))  # Green to red gradient
            cv2.rectangle(canvas, (panel_x, y_pos), (panel_x + bar_width, y_pos + 20), bar_color, -1)
            cv2.rectangle(canvas, (panel_x, y_pos), (panel_x + 200, y_pos + 20), (100, 100, 100), 1)
            
            # Class name and probability
            cv2.putText(canvas, f"{i+1}. {display_name}", (panel_x, y_pos - 5), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            cv2.putText(canvas, f"{prob*100:.1f}%", (panel_x + 210, y_pos + 15), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Add info at bottom
        cv2.putText(canvas, f"Prediction interval: {interval}s | Press 'q' to quit | 'p' to pause", 
                    (10, display_h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1)
        
        return canvas


# ============================================
# MAIN APPLICATION
# ============================================

def run_recognition_loop(
    model_key: str = "new",
    interval: float = 2.0,
    camera_id: int = 0,
    display_size: int = 400,
    threshold: int = 60,
    white_level: int = 225
):
    """
    Main recognition loop.
    
    Args:
        model_key: 'new' (EfficientNet) or 'old' (MobileNet)
        interval: Seconds between predictions
        camera_id: Camera device ID
        display_size: Size of display windows
        threshold: Pixel threshold (0-255), below = black
        white_level: White pixel value (195-255)
    """
    print("\n" + "=" * 50)
    print("🎨 Quick Draw Webcam Recognition")
    print("=" * 50)
    
    # Load model
    print(f"\n[Loading Model: {model_key}]")
    model = QuickDrawModel(model_key)
    
    # Initialize camera
    print(f"\n[Initializing Camera]")
    capture = WhiteboardCapture(camera_id, display_size)
    if not capture.open():
        return
    
    print(f"\n[Starting Recognition Loop]")
    print(f"  - Interval: {interval} seconds")
    print(f"  - Threshold: {threshold} (pixels below -> black)")
    print(f"  - White level: {white_level} (pixels above threshold)")
    print(f"  - Press 'q' to quit")
    print(f"  - Press 'p' to pause/resume")
    print(f"  - Press 's' to take snapshot")
    print(f"  - Press '+'/'-' to adjust threshold")
    
    # State
    last_prediction_time = 0
    predictions = [("waiting...", 0.0)] * 5
    paused = False
    current_threshold = threshold
    
    try:
        while True:
            # Read frame
            frame = capture.read_frame()
            if frame is None:
                print("✗ Failed to read frame")
                break
            
            # Process for model with current threshold
            processed = capture.process_for_model(frame, current_threshold, white_level)
            
            # Predict at intervals
            current_time = time.time()
            if not paused and (current_time - last_prediction_time) >= interval:
                predictions = model.predict(processed, top_k=5)
                last_prediction_time = current_time
                
                # Print to console
                print(f"\n[{time.strftime('%H:%M:%S')}] Predictions (threshold={current_threshold}):")
                for i, (name, prob) in enumerate(predictions):
                    print(f"  {i+1}. {name.replace('_', ' '):<25} {prob*100:5.1f}%")
            
            # Create display
            display_img = capture.create_display(frame, processed, predictions, interval)
            
            # Add threshold info
            cv2.putText(display_img, f"Threshold: {current_threshold} (+/-)", 
                        (display_size + 10, display_size - 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
            
            # Add pause indicator
            if paused:
                cv2.putText(display_img, "PAUSED", (display_size - 60, display_size - 40), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Show window
            cv2.imshow("Quick Draw Recognition", display_img)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("\n[Quit]")
                break
            elif key == ord('p'):
                paused = not paused
                print(f"\n[{'Paused' if paused else 'Resumed'}]")
            elif key == ord('s'):
                # Save snapshot
                timestamp = time.strftime("%Y%m%d_%H%M%S")
                cv2.imwrite(f"snapshot_{timestamp}.png", display_img)
                cv2.imwrite(f"processed_{timestamp}.png", processed)
                print(f"\n[Snapshot saved: snapshot_{timestamp}.png]")
            elif key == ord('+') or key == ord('='):
                current_threshold = min(current_threshold + 5, 200)
                print(f"\n[Threshold: {current_threshold}]")
            elif key == ord('-') or key == ord('_'):
                current_threshold = max(current_threshold - 5, 10)
                print(f"\n[Threshold: {current_threshold}]")
                
    except KeyboardInterrupt:
        print("\n[Interrupted]")
    finally:
        capture.close()
        cv2.destroyAllWindows()
        print("\n✓ Cleanup complete")


# ============================================
# CLI ENTRY POINT
# ============================================

def main():
    parser = argparse.ArgumentParser(
        description="Quick Draw Webcam Recognition",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python quick_draw_webcam.py --model new --interval 2
  python quick_draw_webcam.py --model old --interval 1
  python quick_draw_webcam.py --camera 1 --interval 0.5

Controls:
  q - Quit
  p - Pause/Resume predictions
  s - Save snapshot
        """
    )
    
    parser.add_argument(
        "--model", "-m",
        choices=["new", "old"],
        default="new",
        help="Model to use: 'new' (EfficientNet-B2, 96x96) or 'old' (MobileNetV3, 64x64)"
    )
    
    parser.add_argument(
        "--interval", "-i",
        type=float,
        default=2.0,
        help="Seconds between predictions (default: 2.0)"
    )
    
    parser.add_argument(
        "--camera", "-c",
        type=int,
        default=0,
        help="Camera device ID (default: 0)"
    )
    
    parser.add_argument(
        "--display-size", "-d",
        type=int,
        default=400,
        help="Display window size in pixels (default: 400)"
    )
    
    parser.add_argument(
        "--threshold", "-t",
        type=int,
        default=60,
        help="Threshold for binarization (0-255). Pixels below become black. (default: 60)"
    )
    
    parser.add_argument(
        "--white-level", "-w",
        type=int,
        default=225,
        help="White pixel value (195-255). Pixels above threshold become this. (default: 225)"
    )
    
    args = parser.parse_args()
    
    run_recognition_loop(
        model_key=args.model,
        interval=args.interval,
        camera_id=args.camera,
        display_size=args.display_size,
        threshold=args.threshold,
        white_level=args.white_level
    )


if __name__ == "__main__":
    main()