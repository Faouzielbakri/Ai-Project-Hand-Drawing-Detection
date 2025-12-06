"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrawingCanvas } from "./DrawingCanvas";
import { CameraCapture } from "./CameraCapture";
import { ImageUpload } from "./ImageUpload";
import { PredictionsPanel } from "./PredictionsPanel";
import { ModelSelector } from "./ModelSelector";
import { CodeExplanation } from "@/components/explanation/CodeExplanation";
import { ShareSection } from "@/components/sharing/ShareSection";
import { Pencil, Camera, Upload, Code, Share2, Sparkles } from "lucide-react";
import { useQuickDrawStore } from "@/lib/store/useQuickDrawStore";

export function QuickDrawApp() {
  const { activeTab, setActiveTab } = useQuickDrawStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <Image
                src="/ministre.png"
                alt="Ministry of Education Morocco"
                width={60}
                height={60}
                className="object-contain"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  Quick Draw Recognition
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered sketch recognition with 340 categories
                </p>
              </div>
            </div>

            {/* Formation Badge */}
            <div className="text-right text-sm">
              <p className="font-semibold text-primary">AI and PY Formation</p>
              <p className="text-muted-foreground text-xs">
                Samsung x Ministry of Education
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input Modes (2 cols on large screens) */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5 h-auto">
                <TabsTrigger
                  value="draw"
                  className="flex flex-col sm:flex-row items-center gap-1 py-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Draw</span>
                </TabsTrigger>
                <TabsTrigger
                  value="camera"
                  className="flex flex-col sm:flex-row items-center gap-1 py-2"
                >
                  <Camera className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Camera</span>
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="flex flex-col sm:flex-row items-center gap-1 py-2"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Upload</span>
                </TabsTrigger>
                <TabsTrigger
                  value="explain"
                  className="flex flex-col sm:flex-row items-center gap-1 py-2"
                >
                  <Code className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">How it Works</span>
                </TabsTrigger>
                <TabsTrigger
                  value="share"
                  className="flex flex-col sm:flex-row items-center gap-1 py-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Code</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draw" className="mt-4">
                <DrawingCanvas />
              </TabsContent>

              <TabsContent value="camera" className="mt-4">
                <CameraCapture />
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <ImageUpload />
              </TabsContent>

              <TabsContent value="explain" className="mt-4">
                <CodeExplanation />
              </TabsContent>

              <TabsContent value="share" className="mt-4">
                <ShareSection />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Predictions & Model Selection */}
          <div className="space-y-4">
            <ModelSelector />
            <PredictionsPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto py-4 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <div className="text-center sm:text-left">
              <p>
                Developed by <strong className="text-foreground">FAOUZI EL BAKRI</strong>
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p>AI and PY Formation 2025</p>
              <p className="text-xs">
                Samsung Innovation Campus x Ministry of Education of Morocco
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
