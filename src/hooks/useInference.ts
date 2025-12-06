"use client";

import { useCallback } from "react";
import { useQuickDrawStore } from "@/lib/store/useQuickDrawStore";
import {
  runInference,
  preloadModel,
  preprocessCanvas,
  preprocessImageData,
  MODELS,
} from "@/services/inference";

export function useInference() {
  const {
    selectedModel,
    isModelLoaded,
    isModelLoading,
    isInferring,
    predictions,
    inferenceTimeMs,
    setModelLoaded,
    setModelLoading,
    setPredictions,
    setInferring,
    clearPredictions,
  } = useQuickDrawStore();

  // Manual model loading - user must click to load
  const loadModel = useCallback(async () => {
    if (isModelLoaded || isModelLoading) return;

    setModelLoading(true);
    try {
      console.log(`Loading model: ${selectedModel}...`);
      await preloadModel(selectedModel);
      console.log(`Model loaded: ${selectedModel}`);
      setModelLoaded(true);
    } catch (error) {
      console.error("Failed to load model:", error);
      setModelLoading(false);
    }
  }, [selectedModel, isModelLoaded, isModelLoading, setModelLoaded, setModelLoading]);

  // Run inference on canvas
  const predictFromCanvas = useCallback(
    async (canvas: HTMLCanvasElement) => {
      if (!isModelLoaded || isInferring) return;

      setInferring(true);
      try {
        const inputSize = MODELS[selectedModel].inputSize;
        const imageData = preprocessCanvas(canvas, inputSize);
        const result = await runInference(selectedModel, imageData);
        setPredictions(result.predictions, result.inferenceTimeMs);
      } catch (error) {
        console.error("Inference failed:", error);
        setInferring(false);
      }
    },
    [selectedModel, isModelLoaded, isInferring, setInferring, setPredictions]
  );

  // Run inference on ImageData (for webcam/upload)
  const predictFromImageData = useCallback(
    async (imageData: ImageData, invert: boolean = true) => {
      if (!isModelLoaded || isInferring) return;

      setInferring(true);
      try {
        const inputSize = MODELS[selectedModel].inputSize;
        const processed = preprocessImageData(imageData, {
          inputSize,
          invert,
          threshold: invert ? 40 : undefined,
          whiteLevel: 255,
        });
        const result = await runInference(selectedModel, processed);
        setPredictions(result.predictions, result.inferenceTimeMs);
      } catch (error) {
        console.error("Inference failed:", error);
        setInferring(false);
      }
    },
    [selectedModel, isModelLoaded, isInferring, setInferring, setPredictions]
  );

  return {
    selectedModel,
    isModelLoaded,
    isModelLoading,
    isInferring,
    predictions,
    inferenceTimeMs,
    loadModel,
    predictFromCanvas,
    predictFromImageData,
    clearPredictions,
  };
}
