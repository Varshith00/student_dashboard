import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleExecutePython } from "./routes/execute-python";
import { handleGenerateQuestion, handleAnalyzeCode, handleGetHint } from "./routes/ai-questions";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' })); // Increase limit for code submissions
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Python code execution endpoint
  app.post("/api/execute-python", handleExecutePython);

  // AI-powered endpoints using Gemini
  app.post("/api/ai/generate-question", handleGenerateQuestion);
  app.post("/api/ai/analyze-code", handleAnalyzeCode);
  app.post("/api/ai/get-hint", handleGetHint);

  return app;
}
