"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Github,
  BookOpen,
  Code2,
  Notebook,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

export function ShareSection() {
  const [copied, setCopied] = useState(false);

  const kaggleUrl =
    "https://www.kaggle.com/code/faouzielbakri/quick-draw-recognition/notebook";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(kaggleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Main Kaggle Link */}
      <Card className="border-2 border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Notebook className="h-5 w-5" />
            Source Code & Notebook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The complete training notebook is available on Kaggle. You can view
            the code, fork it, and run it yourself!
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <a href={kaggleUrl} target="_blank" rel="noopener noreferrer">
                <BookOpen className="mr-2 h-4 w-4" />
                View on Kaggle
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <Code2 className="h-4 w-4 flex-shrink-0" />
            <code className="break-all">{kaggleUrl}</code>
          </div>
        </CardContent>
      </Card>

      {/* What's in the notebook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            What You'll Find
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Part 1</Badge>
                <span className="font-medium">Setup & Data</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                <li>Device detection (CUDA/MPS/CPU)</li>
                <li>Data loading from Quick Draw</li>
                <li>Parquet file preprocessing</li>
                <li>Data visualization</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Part 2</Badge>
                <span className="font-medium">Model & Training</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                <li>MobileNetV3 architecture</li>
                <li>Custom DataLoader</li>
                <li>Mixed precision training</li>
                <li>OneCycleLR scheduler</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Part 3</Badge>
                <span className="font-medium">Evaluation</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                <li>Top-K accuracy metrics</li>
                <li>MAP@3 calculation</li>
                <li>Training visualizations</li>
                <li>Model checkpointing</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Part 4</Badge>
                <span className="font-medium">Inference</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                <li>Webcam capture code</li>
                <li>Image preprocessing</li>
                <li>Real-time predictions</li>
                <li>Submission generation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technologies used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Technologies Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>Python</Badge>
            <Badge>PyTorch</Badge>
            <Badge>timm</Badge>
            <Badge>OpenCV</Badge>
            <Badge>NumPy</Badge>
            <Badge>Pandas</Badge>
            <Badge variant="outline">ONNX</Badge>
            <Badge variant="outline">Next.js</Badge>
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">Tailwind CSS</Badge>
            <Badge variant="outline">ONNX Runtime Web</Badge>
          </div>
        </CardContent>
      </Card>

      {/* About the project */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            About This Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This project was developed as part of the{" "}
            <strong className="text-foreground">AI and PY Formation</strong>, a
            collaboration between{" "}
            <strong className="text-foreground">
              Samsung Innovation Campus
            </strong>{" "}
            and the{" "}
            <strong className="text-foreground">
              Ministry of Education of Morocco
            </strong>
            . The goal was to train a neural network to recognize hand-drawn
            doodles in real-time.
          </p>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Author</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong className="text-foreground">FAOUZI EL BAKRI</strong> -
                Teacher
              </p>
              <p className="text-xs italic">
                Special thanks to AHMED LAMERI for his support
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Key Achievements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4 list-disc">
              <li>Trained on 23.8 million doodles across 340 categories</li>
              <li>Achieved ~85% top-1 accuracy on validation set</li>
              <li>Converted to ONNX for browser-based inference</li>
              <li>Built interactive web demo with real-time predictions</li>
              <li>Supports both drawing canvas and camera input</li>
            </ul>
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg text-center">
            <p className="font-medium text-foreground">AI and PY Formation 2025</p>
            <p className="text-xs mt-1">
              Samsung Innovation Campus x Ministry of Education of Morocco
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Feel free to explore the code, fork it, and build your own
            projects!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
