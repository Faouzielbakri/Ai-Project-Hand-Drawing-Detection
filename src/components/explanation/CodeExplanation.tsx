"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Code,
  Database,
  Cpu,
  ArrowRight,
  Layers,
  Zap,
  Image as ImageIcon,
} from "lucide-react";

export function CodeExplanation() {
  return (
    <div className="space-y-6">
      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Model Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pipeline Diagram */}
          <div className="bg-muted rounded-lg p-4 overflow-x-auto">
            <div className="flex items-center justify-center gap-2 min-w-max">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-background rounded-lg border flex items-center justify-center">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <span className="text-xs mt-1">Input</span>
                <span className="text-xs text-muted-foreground">280x280</span>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground" />

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-background rounded-lg border flex items-center justify-center">
                  <Zap className="h-8 w-8" />
                </div>
                <span className="text-xs mt-1">Preprocess</span>
                <span className="text-xs text-muted-foreground">
                  Grayscale
                </span>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground" />

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-background rounded-lg border flex items-center justify-center">
                  <span className="text-lg font-bold">64</span>
                </div>
                <span className="text-xs mt-1">Resize</span>
                <span className="text-xs text-muted-foreground">
                  64x64 / 96x96
                </span>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground" />

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-primary/10 rounded-lg border-2 border-primary flex items-center justify-center">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>
                <span className="text-xs mt-1 font-medium">CNN Model</span>
                <span className="text-xs text-muted-foreground">
                  MobileNet/EfficientNet
                </span>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground" />

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-lg border-2 border-green-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-500">340</span>
                </div>
                <span className="text-xs mt-1">Output</span>
                <span className="text-xs text-muted-foreground">Classes</span>
              </div>
            </div>
          </div>

          {/* Model comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">MobileNetV3</Badge>
                <Badge variant="secondary">Fast</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Input: 64x64 pixels</li>
                <li>Architecture: MobileNetV3-Large</li>
                <li>Best for: Real-time drawing</li>
                <li>Speed: ~20ms inference</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">EfficientNet-B2</Badge>
                <Badge>Accurate</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Input: 96x96 pixels</li>
                <li>Architecture: EfficientNet-B2</li>
                <li>Best for: Better accuracy</li>
                <li>Speed: ~50ms inference</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Training Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The model was trained on the{" "}
            <strong>Google Quick Draw dataset</strong> containing millions of
            doodles across 340 categories.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">340</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">70K</div>
              <div className="text-sm text-muted-foreground">
                Samples/Class
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">23.8M</div>
              <div className="text-sm text-muted-foreground">Total Samples</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Sample Categories:</h4>
            <div className="flex flex-wrap gap-1">
              {[
                "airplane",
                "apple",
                "bicycle",
                "cat",
                "dog",
                "fish",
                "guitar",
                "house",
                "pizza",
                "sun",
                "tree",
                "umbrella",
              ].map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                +328 more
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Snippets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Key Code Snippets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preprocessing code */}
          <div className="space-y-2">
            <h4 className="font-medium">Image Preprocessing (Python)</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`# Convert to grayscale and normalize
gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

# Invert (white bg → black bg, black lines → white)
inverted = cv2.bitwise_not(gray)

# Threshold for noise removal
_, binary = cv2.threshold(inverted, 40, 255, cv2.THRESH_BINARY)

# Resize to model input size
img = cv2.resize(binary, (64, 64), interpolation=cv2.INTER_AREA)

# Normalize to [-1, 1] range
img = (img / 127.5) - 1.0`}</code>
            </pre>
          </div>

          {/* Model creation code */}
          <div className="space-y-2">
            <h4 className="font-medium">Model Architecture (Python)</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`import timm

# Create MobileNetV3 for grayscale input
model = timm.create_model(
    'mobilenetv3_large_100',
    pretrained=False,
    in_chans=1,        # Grayscale (1 channel)
    num_classes=340    # Quick Draw categories
)

# Or EfficientNet for better accuracy
model = timm.create_model(
    'efficientnet_b2',
    pretrained=False,
    in_chans=1,
    num_classes=340
)`}</code>
            </pre>
          </div>

          {/* Inference code */}
          <div className="space-y-2">
            <h4 className="font-medium">Inference (Browser/JavaScript)</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`import * as ort from 'onnxruntime-web';

// Load ONNX model
const session = await ort.InferenceSession.create('/models/mobilenetv3.onnx');

// Create tensor from preprocessed image
const tensor = new ort.Tensor('float32', imageData, [1, 1, 64, 64]);

// Run inference
const results = await session.run({ input: tensor });
const predictions = results.output.data;

// Get top 5 with softmax
const probs = softmax(predictions);
const top5 = getTop5(probs, classNames);`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Training process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Training Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Data Preparation</h4>
                <p className="text-sm text-muted-foreground">
                  Loaded 70,000 samples per class from Quick Draw dataset.
                  Shuffled and split into train/validation sets (98%/2%).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Model Training</h4>
                <p className="text-sm text-muted-foreground">
                  Trained for 20 epochs using AdamW optimizer with OneCycleLR
                  scheduler. Mixed precision (FP16) for faster training on GPU.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Evaluation</h4>
                <p className="text-sm text-muted-foreground">
                  Achieved ~85% Top-1 accuracy and ~95% Top-3 accuracy on
                  validation set. MAP@3 score used for final evaluation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-medium">Export to ONNX</h4>
                <p className="text-sm text-muted-foreground">
                  Converted PyTorch model to ONNX format for browser inference
                  using ONNX Runtime Web (WebAssembly).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
