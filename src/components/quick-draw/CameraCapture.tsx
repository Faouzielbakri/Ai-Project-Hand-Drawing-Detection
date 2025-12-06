"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CameraOff, RefreshCw, Scan } from "lucide-react";
import { useInference } from "@/hooks/useInference";
import { getVideoFrameData } from "@/services/inference/preprocessor";

export function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { predictFromImageData, isModelLoaded, isInferring } = useInference();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError(
        "Could not access camera. Please ensure you have granted camera permissions."
      );
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setPreviewUrl(null);
  }, []);

  // Capture frame and predict
  const captureAndPredict = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isModelLoaded) return;

    try {
      // Get frame data
      const imageData = getVideoFrameData(video, canvas);

      // Create preview (inverted for display)
      const previewCanvas = document.createElement("canvas");
      previewCanvas.width = imageData.width;
      previewCanvas.height = imageData.height;
      const previewCtx = previewCanvas.getContext("2d");
      if (previewCtx) {
        // Show inverted preview (what the model sees)
        const invertedData = new ImageData(imageData.width, imageData.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const gray = Math.round(
            0.299 * imageData.data[i] +
              0.587 * imageData.data[i + 1] +
              0.114 * imageData.data[i + 2]
          );
          const inverted = 255 - gray;
          const thresholded = inverted < 40 ? 0 : 255;
          invertedData.data[i] = thresholded;
          invertedData.data[i + 1] = thresholded;
          invertedData.data[i + 2] = thresholded;
          invertedData.data[i + 3] = 255;
        }
        previewCtx.putImageData(invertedData, 0, 0);
        setPreviewUrl(previewCanvas.toDataURL());
      }

      // Run prediction (with invert=true for webcam)
      await predictFromImageData(imageData, true);
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture frame");
    }
  }, [predictFromImageData, isModelLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Camera Capture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center gap-4">
          {/* Video preview */}
          <div className="relative w-full max-w-sm aspect-square bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover ${
                isStreaming ? "block" : "hidden"
              }`}
              playsInline
              muted
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <CameraOff className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex gap-2">
            {!isStreaming ? (
              <Button onClick={startCamera}>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button onClick={stopCamera} variant="outline">
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop
                </Button>
                <Button
                  onClick={captureAndPredict}
                  disabled={!isModelLoaded || isInferring}
                >
                  <Scan className="mr-2 h-4 w-4" />
                  {isInferring ? "Analyzing..." : "Capture & Recognize"}
                </Button>
              </>
            )}
          </div>

          {/* Processed preview */}
          {previewUrl && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Processed image (what the model sees):
              </p>
              <img
                src={previewUrl}
                alt="Processed"
                className="w-32 h-32 rounded border"
              />
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Point the camera at a whiteboard or paper with a drawing. The image
          will be inverted (white background → black) to match the training
          data.
        </p>
      </CardContent>
    </Card>
  );
}
