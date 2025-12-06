import argparse
import time
import cv2
import numpy as np
import torch
import timm
from pathlib import Path

# ------------------------------------------
# MODELS
# ------------------------------------------
MODELS = {
    "old": {
        "arch": "mobilenetv3_large_100",
        "size": 64,
        "path": "best_model.pt",
    },
    "new": {
        "arch": "efficientnet_b2",
        "size": 96,
        "path": "best_model_new.pt",
    }
}

# 340 classes
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


# ------------------------------------------
# LOAD MODEL
# ------------------------------------------
def load_model(key):
    cfg = MODELS[key]

    # Device
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")

    model = timm.create_model(
        cfg["arch"],
        pretrained=False,
        in_chans=1,
        num_classes=len(CLASSES)
    )

    if not Path(cfg["path"]).exists():
        raise FileNotFoundError(f"Model weights not found: {cfg['path']}")

    state = torch.load(cfg["path"], map_location=device, weights_only=True)

    # Clean possible backbone prefix
    fixed = {}
    for k, v in state.items():
        fixed[k.replace("backbone.", "")] = v

    model.load_state_dict(fixed)
    model.to(device)
    model.eval()

    print(f"[✔] Loaded model: {key} ({cfg['arch']}) on {device}")
    return model, device, cfg["size"]



def preprocess_webcam_frame(frame, size):
    # frame: BGR from OpenCV

    # 1. Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # 2. Invert → white lines on black (match canvas)
    gray = 255 - gray

    # 3. Optional: threshold to remove noise
    _, gray = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY)

    # 4. Resize to model input size
    img = cv2.resize(gray, (size, size), interpolation=cv2.INTER_AREA)

    # 5. Float32 + normalize EXACTLY like notebook
    img = img.astype(np.float32)
    img = (img / 127.5) - 1.0

    # 6. Convert to torch tensor
    tensor = torch.from_numpy(img).unsqueeze(0).unsqueeze(0)
    return tensor




# ------------------------------------------
# PREDICT
# ------------------------------------------
@torch.no_grad()
def predict(gray, model, device):
    gray = gray.astype(np.float32)
    gray = (gray / 127.5) - 1.0
    t = torch.from_numpy(gray).unsqueeze(0).unsqueeze(0).to(device)

    out = model(t)
    probs = torch.softmax(out, dim=1)[0]
    top_probs, top_ids = probs.topk(5)

    result = []
    for p, idx in zip(top_probs, top_ids):
        result.append((CLASSES[idx.item()], float(p.item())))
    return result


# ------------------------------------------
# MAIN
# ------------------------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("model", choices=["old", "new"], help="select the model")
    parser.add_argument("--top", type=int, default=5, help="top K predictions")
    parser.add_argument("--every", type=float, default=5.0, help="predict every N seconds")
    args = parser.parse_args()

    model, device, size = load_model(args.model)

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Webcam not found")
        return

    last_time = 0

    print("\n[✔] Webcam running. Press CTRL+C to stop.\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        # Show the webcam feed
        cv2.imshow("Webcam - Drawing Detection", frame)

        now = time.time()
        if now - last_time >= args.every:
            last_time = now

        # Use the SAME preprocessing as training
        tensor = preprocess_webcam_frame(frame, size).to(device)

        out = model(tensor)
        probs = torch.softmax(out, dim=1)[0]
        top_probs, top_ids = probs.topk(args.top)

        preds = []
        for p, idx in zip(top_probs, top_ids):
            preds.append((CLASSES[idx.item()], float(p.item())))


            print("\n============================")
            print(f" TOP {args.top} PREDICTIONS")
            print("============================")

            for rank, (cls, p) in enumerate(preds, 1):
                bar = "█" * int(p * 30)
                print(f"{rank}. {cls:<25} {p*100:5.1f}% {bar}")

        # exit on Q
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
