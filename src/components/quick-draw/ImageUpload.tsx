"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image as ImageIcon, X, Scan } from "lucide-react";
import { useInference } from "@/hooks/useInference";
import { loadImageAsImageData } from "@/services/inference/preprocessor";

export function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { predictFromImageData, isModelLoaded, isInferring } = useInference();

  // Handle file selection
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
  }, []);

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Process and predict
  const processAndPredict = useCallback(async () => {
    if (!selectedFile || !isModelLoaded) return;

    try {
      setError(null);
      const { imageData, width, height } = await loadImageAsImageData(
        selectedFile
      );

      // Create processed preview (inverted)
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const invertedData = new ImageData(width, height);
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
        ctx.putImageData(invertedData, 0, 0);
        setProcessedUrl(canvas.toDataURL());
      }

      // Run prediction
      await predictFromImageData(imageData, true);
    } catch (err) {
      console.error("Processing error:", err);
      setError("Failed to process image");
    }
  }, [selectedFile, predictFromImageData, isModelLoaded]);

  // Clear selection
  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setError(null);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Drop zone */}
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop an image here, or click to select
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              id="image-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="image-upload" className="cursor-pointer">
                Select Image
              </label>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">Original</p>
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded border"
                />
              </div>

              {processedUrl && (
                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">Processed</p>
                  <img
                    src={processedUrl}
                    alt="Processed"
                    className="w-40 h-40 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2 justify-center">
              <Button onClick={handleClear} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button
                onClick={processAndPredict}
                disabled={!isModelLoaded || isInferring}
              >
                <Scan className="mr-2 h-4 w-4" />
                {isInferring ? "Analyzing..." : "Recognize"}
              </Button>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          Upload a photo of a drawing on white paper. The image will be
          processed (inverted, cropped to square) before recognition.
        </p>
      </CardContent>
    </Card>
  );
}
