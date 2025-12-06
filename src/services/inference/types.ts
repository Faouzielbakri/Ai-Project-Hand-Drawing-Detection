export interface ModelConfig {
  name: string;
  path: string;
  inputSize: number;
  description: string;
}

export interface Prediction {
  className: string;
  displayName: string;
  probability: number;
  rank: number;
}

export interface InferenceResult {
  predictions: Prediction[];
  inferenceTimeMs: number;
  modelName: string;
}

export const MODELS: Record<string, ModelConfig> = {
  mobilenetv3: {
    name: "MobileNetV3",
    path: "/models/mobilenetv3.onnx",
    inputSize: 64,
    description: "Faster, smaller model",
  },
  efficientnet: {
    name: "EfficientNet-B2",
    path: "/models/efficientnet_b2.onnx",
    inputSize: 96,
    description: "More accurate model",
  },
};

export type ModelKey = keyof typeof MODELS;
