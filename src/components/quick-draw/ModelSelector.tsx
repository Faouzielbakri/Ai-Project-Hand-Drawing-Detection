"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuickDrawStore } from "@/lib/store/useQuickDrawStore";
import { useInference } from "@/hooks/useInference";
import { MODELS, ModelKey } from "@/services/inference/types";
import { Cpu, Zap, Download, Loader2, Check } from "lucide-react";

export function ModelSelector() {
  const { selectedModel, setModel, isModelLoaded, isModelLoading } =
    useQuickDrawStore();
  const { loadModel } = useInference();

  const handleToggle = (checked: boolean) => {
    const newModel: ModelKey = checked ? "efficientnet" : "mobilenetv3";
    setModel(newModel);
  };

  const currentModel = MODELS[selectedModel];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Model
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <Label htmlFor="model-toggle" className="text-sm">
              MobileNetV3
            </Label>
          </div>
          <Switch
            id="model-toggle"
            checked={selectedModel === "efficientnet"}
            onCheckedChange={handleToggle}
            disabled={isModelLoading}
          />
          <div className="flex items-center gap-2">
            <Label htmlFor="model-toggle" className="text-sm">
              EfficientNet
            </Label>
            <Badge variant="secondary" className="text-xs">
              Better
            </Badge>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Selected:</strong> {currentModel.name}
          </p>
          <p>
            <strong>Input:</strong> {currentModel.inputSize}x
            {currentModel.inputSize}px
          </p>
          <p>{currentModel.description}</p>
        </div>

        {/* Load Model Button */}
        {!isModelLoaded && !isModelLoading && (
          <Button onClick={loadModel} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Load Model
          </Button>
        )}

        {isModelLoading && (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Model...
          </Button>
        )}

        {isModelLoaded && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 p-2 rounded">
            <Check className="h-4 w-4" />
            Model ready!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
