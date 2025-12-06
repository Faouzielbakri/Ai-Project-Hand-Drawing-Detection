import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quick Draw Recognition - AI Sketch Detection",
  description:
    "AI-powered sketch recognition that can identify 340 different objects. Draw, capture, or upload images to see real-time predictions. AI and PY Formation - Samsung x Ministry of Education Morocco.",
  keywords: [
    "Quick Draw",
    "AI",
    "Machine Learning",
    "Sketch Recognition",
    "Deep Learning",
    "PyTorch",
    "ONNX",
  ],
  metadataBase: new URL("https://ai-project-hand-drawing-detection.vercel.app"),
  openGraph: {
    title: "Quick Draw Recognition - AI Sketch Detection",
    description:
      "AI-powered sketch recognition with 340 categories. Draw, capture, or upload images for real-time predictions!",
    url: "https://ai-project-hand-drawing-detection.vercel.app",
    siteName: "Quick Draw Recognition",
    images: [
      {
        url: "/ministre.png",
        width: 512,
        height: 512,
        alt: "Quick Draw Recognition - AI and PY Formation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quick Draw Recognition - AI Sketch Detection",
    description:
      "AI-powered sketch recognition with 340 categories. Draw, capture, or upload!",
    images: ["/ministre.png"],
  },
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
