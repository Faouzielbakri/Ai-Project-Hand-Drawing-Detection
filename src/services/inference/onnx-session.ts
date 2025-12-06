import * as ort from "onnxruntime-web";
import { MODELS, ModelKey, Prediction } from "./types";
import { CLASSES, getClassName, formatClassName } from "./classes";

// Configure ONNX Runtime
ort.env.wasm.wasmPaths = "/";

class ONNXSessionManager {
  private sessions: Map<string, ort.InferenceSession> = new Map();
  private loadingPromises: Map<string, Promise<ort.InferenceSession>> =
    new Map();

  async getSession(modelKey: ModelKey): Promise<ort.InferenceSession> {
    // Return cached session
    if (this.sessions.has(modelKey)) {
      return this.sessions.get(modelKey)!;
    }

    // Return existing loading promise
    if (this.loadingPromises.has(modelKey)) {
      return this.loadingPromises.get(modelKey)!;
    }

    // Create new loading promise
    const loadPromise = this.loadSession(modelKey);
    this.loadingPromises.set(modelKey, loadPromise);

    const session = await loadPromise;
    this.sessions.set(modelKey, session);
    this.loadingPromises.delete(modelKey);

    return session;
  }

  private async loadSession(modelKey: ModelKey): Promise<ort.InferenceSession> {
    const config = MODELS[modelKey];
    if (!config) throw new Error(`Unknown model: ${modelKey}`);

    console.log(`Loading model: ${config.name} from ${config.path}`);

    // Configure session options for WebAssembly
    const options: ort.InferenceSession.SessionOptions = {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    };

    const session = await ort.InferenceSession.create(config.path, options);
    console.log(`Model loaded: ${config.name}`);

    return session;
  }

  isLoaded(modelKey: ModelKey): boolean {
    return this.sessions.has(modelKey);
  }

  isLoading(modelKey: ModelKey): boolean {
    return this.loadingPromises.has(modelKey);
  }
}

// Singleton instance
export const sessionManager = new ONNXSessionManager();

/**
 * Run inference on preprocessed image data
 */
export async function runInference(
  modelKey: ModelKey,
  imageData: Float32Array
): Promise<{ predictions: Prediction[]; inferenceTimeMs: number }> {
  const session = await sessionManager.getSession(modelKey);
  const config = MODELS[modelKey];

  const startTime = performance.now();

  // Create tensor: [1, 1, H, W] for grayscale
  const tensor = new ort.Tensor("float32", imageData, [
    1,
    1,
    config.inputSize,
    config.inputSize,
  ]);

  // Run inference
  const results = await session.run({ input: tensor });
  const output = results.output.data as Float32Array;

  // Compute softmax and top-5
  const predictions = computeTop5(output);
  const inferenceTimeMs = performance.now() - startTime;

  return { predictions, inferenceTimeMs };
}

/**
 * Compute softmax and return top 5 predictions
 */
function computeTop5(logits: Float32Array): Prediction[] {
  // Softmax with numerical stability
  const maxLogit = Math.max(...logits);
  const exps = Array.from(logits).map((x) => Math.exp(x - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((x) => x / sumExps);

  // Get top 5 indices
  const indexed = probs.map((p, i) => ({ index: i, prob: p }));
  indexed.sort((a, b) => b.prob - a.prob);

  return indexed.slice(0, 5).map((item, rank) => ({
    className: getClassName(item.index),
    displayName: formatClassName(getClassName(item.index)),
    probability: item.prob,
    rank: rank + 1,
  }));
}

/**
 * Preload a model (useful for warming up)
 */
export async function preloadModel(modelKey: ModelKey): Promise<void> {
  await sessionManager.getSession(modelKey);
}

/**
 * Check if a model is already loaded
 */
export function isModelLoaded(modelKey: ModelKey): boolean {
  return sessionManager.isLoaded(modelKey);
}

/**
 * Check if a model is currently loading
 */
export function isModelLoading(modelKey: ModelKey): boolean {
  return sessionManager.isLoading(modelKey);
}
