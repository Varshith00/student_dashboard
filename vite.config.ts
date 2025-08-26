import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer, createDevServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      console.log(
        "🔧 Development mode: Using full server configuration with Socket.io",
      );

      // Use the full server configuration that includes Socket.io
      const { app, httpServer, io } = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);

      // Note: Socket.io will run on the HTTP server created above
      // The client should connect to the same port (8080)
      if (io) {
        console.log("✅ Socket.io enabled in development mode");
      }
    },
  };
}
