import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Prediction, ModelKey } from "@/services/inference/types";

interface QuickDrawState {
  // Model state
  selectedModel: ModelKey;
  isModelLoaded: boolean;
  isModelLoading: boolean;

  // Prediction state
  predictions: Prediction[];
  isInferring: boolean;
  inferenceTimeMs: number | null;

  // UI state
  activeTab: string;

  // Actions
  setModel: (model: ModelKey) => void;
  setModelLoaded: (loaded: boolean) => void;
  setModelLoading: (loading: boolean) => void;
  setPredictions: (predictions: Prediction[], inferenceTimeMs: number) => void;
  setInferring: (inferring: boolean) => void;
  clearPredictions: () => void;
  setActiveTab: (tab: string) => void;
}

export const useQuickDrawStore = create<QuickDrawState>()(
  devtools(
    (set) => ({
      // Initial state
      selectedModel: "efficientnet",
      isModelLoaded: false,
      isModelLoading: false,
      predictions: [],
      isInferring: false,
      inferenceTimeMs: null,
      activeTab: "draw",

      // Actions
      setModel: (model) =>
        set({ selectedModel: model, isModelLoaded: false, isModelLoading: false }),

      setModelLoaded: (isModelLoaded) => set({ isModelLoaded, isModelLoading: false }),

      setModelLoading: (isModelLoading) => set({ isModelLoading }),

      setPredictions: (predictions, inferenceTimeMs) =>
        set({ predictions, inferenceTimeMs, isInferring: false }),

      setInferring: (isInferring) => set({ isInferring }),

      clearPredictions: () => set({ predictions: [], inferenceTimeMs: null }),

      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    { name: "quick-draw-store" }
  )
);
