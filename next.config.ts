import type { NextConfig } from "next";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Enable Turbopack with empty config (allows webpack for build)
  turbopack: {},

  // Configure webpack for ONNX Runtime Web (used in production build)
  webpack: (config, { isServer }) => {
    // Only for client-side builds
    if (!isServer) {
      // Copy ONNX Runtime WASM and MJS files to public folder
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(
                process.cwd(),
                "node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded*.wasm"
              ),
              to: path.join(process.cwd(), "public/[name][ext]"),
            },
            {
              from: path.join(
                process.cwd(),
                "node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded*.mjs"
              ),
              to: path.join(process.cwd(), "public/[name][ext]"),
            },
          ],
        })
      );

      // Disable server-side features for onnxruntime-web
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },

  // Headers for WASM and model files
  async headers() {
    return [
      {
        source: "/:path*.wasm",
        headers: [
          {
            key: "Content-Type",
            value: "application/wasm",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
