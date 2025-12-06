import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quick Draw Recognition - AI Sketch Detection",
  description:
    "AI-powered sketch recognition that can identify 340 different objects. Draw, capture, or upload images to see real-time predictions using MobileNetV3 and EfficientNet models.",
  keywords: [
    "Quick Draw",
    "AI",
    "Machine Learning",
    "Sketch Recognition",
    "Deep Learning",
    "PyTorch",
    "ONNX",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
