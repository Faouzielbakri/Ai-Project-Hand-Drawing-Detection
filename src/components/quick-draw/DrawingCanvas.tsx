"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eraser, RotateCcw } from "lucide-react";
import { useInference } from "@/hooks/useInference";

const CANVAS_SIZE = 280;
const LINE_WIDTH = 8;

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const throttleRef = useRef<number>(0);

  const { predictFromCanvas, isModelLoaded, isInferring } = useInference();

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, []);

  // Get stroke color based on stroke count (temporal coloring like training)
  const getStrokeColor = useCallback((strokeNum: number): string => {
    // Match training: color = 255 - min(t, 10) * 13
    const intensity = 255 - Math.min(strokeNum, 10) * 13;
    return `rgb(${intensity},${intensity},${intensity})`;
  }, []);

  // Get position from mouse or touch event
  const getPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  // Trigger prediction with throttling/debouncing
  const triggerPrediction = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isModelLoaded) return;

    predictFromCanvas(canvas);
  }, [predictFromCanvas, isModelLoaded]);

  // Handle drawing start
  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      setIsDrawing(true);
      const pos = getPosition(e);
      lastPosRef.current = pos;

      // Set stroke color for this stroke
      ctx.strokeStyle = getStrokeColor(strokeCount);
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    },
    [getPosition, getStrokeColor, strokeCount]
  );

  // Handle drawing move
  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      const pos = getPosition(e);

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastPosRef.current = pos;

      // Throttle predictions during drawing (every 300ms)
      const now = Date.now();
      if (now - throttleRef.current > 300) {
        throttleRef.current = now;
        triggerPrediction();
      }
    },
    [isDrawing, getPosition, triggerPrediction]
  );

  // Handle drawing end
  const handleEnd = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setStrokeCount((prev) => prev + 1);

    // Debounce prediction after stroke ends
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(triggerPrediction, 100);
  }, [isDrawing, triggerPrediction]);

  // Clear canvas
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    setStrokeCount(0);
  }, []);

  // Prevent scrolling on touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    return () => canvas.removeEventListener("touchmove", preventScroll);
  }, [isDrawing]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Drawing Canvas</span>
          <span className="text-sm font-normal text-muted-foreground">
            Strokes: {strokeCount}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="border border-border rounded-lg cursor-crosshair touch-none"
            style={{ maxWidth: "100%", height: "auto" }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>

        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={handleClear} disabled={isInferring}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Draw with your mouse or finger. Earlier strokes appear brighter (like
          the training data).
        </p>
      </CardContent>
    </Card>
  );
}
