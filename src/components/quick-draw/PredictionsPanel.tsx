"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useInference } from "@/hooks/useInference";
import { Sparkles, Clock, Loader2, Download } from "lucide-react";

export function PredictionsPanel() {
  const {
    predictions,
    inferenceTimeMs,
    isModelLoaded,
    isModelLoading,
    isInferring,
  } = useInference();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Predictions
          {isInferring && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Model not loaded */}
        {!isModelLoaded && !isModelLoading && (
          <div className="text-center py-8 text-muted-foreground space-y-2">
            <Download className="h-8 w-8 mx-auto opacity-50" />
            <p>Click &quot;Load Model&quot; above to start</p>
          </div>
        )}

        {/* Model loading state */}
        {isModelLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading model...
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Model loaded but no predictions yet */}
        {isModelLoaded && predictions.length === 0 && !isInferring && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Start drawing to see predictions!</p>
          </div>
        )}

        {/* Predictions */}
        {predictions.length > 0 && (
          <div className="space-y-3">
            {predictions.map((pred, index) => (
              <div key={pred.className} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    {index === 0 && (
                      <Badge variant="default" className="text-xs">
                        Top
                      </Badge>
                    )}
                    {pred.displayName}
                  </span>
                  <span className="text-muted-foreground">
                    {(pred.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={pred.probability * 100}
                  className={index === 0 ? "h-3" : "h-2"}
                />
              </div>
            ))}
          </div>
        )}

        {/* Inference time */}
        {inferenceTimeMs !== null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3 w-3" />
            Inference: {inferenceTimeMs.toFixed(0)}ms
          </div>
        )}
      </CardContent>
    </Card>
  );
}
