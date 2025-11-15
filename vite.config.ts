import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { Server as IOServer } from "socket.io";
import { attachSocketHandlers, createDevServer } from "./server";

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
    apply: "serve",
    configureServer(server) {
      console.log(
        "🔧 Development mode: Attaching API and Socket.io to Vite server",
      );

      // Create the Express app with routes suitable for Vite dev
      const { app } = createDevServer();

      // Attach Socket.io to Vite's own http server so it actually listens
      const io = new IOServer(server.httpServer, {
        cors: { origin: "*", methods: ["GET", "POST"] },
      });
      attachSocketHandlers(io);

      // Make io available to API routes
      app.set("io", io);

      // Mount Express app into Vite dev server
      server.middlewares.use(app);

      console.log(
        "✅ Socket.io enabled in development mode on Vite httpServer",
      );
    },
  };
}
