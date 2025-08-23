import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleExecutePython } from "./routes/execute-python";
import { handleExecuteJavaScript } from "./routes/execute-javascript";
import {
  handleGenerateQuestion,
  handleAnalyzeCode,
  handleGetHint,
} from "./routes/ai-questions";
import {
  handleRegister,
  handleLogin,
  handleGetUser,
  authMiddleware,
} from "./routes/auth";
import {
  handleStartTechnicalInterview,
  handleTechnicalInterviewMessage,
  handleEndTechnicalInterview,
  handleStartBehavioralInterview,
  handleBehavioralInterviewMessage,
  handleEndBehavioralInterview,
} from "./routes/interview";
import {
  handleAudioTranscription,
  handleAnswerAnalysis,
  handleBatchAnswerAnalysis,
} from "./routes/audio-transcription";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" })); // Increase limit for code submissions
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/user", authMiddleware, handleGetUser);

  // Protected routes (require authentication)
  app.post("/api/execute-python", authMiddleware, handleExecutePython);
  app.post("/api/execute-javascript", authMiddleware, handleExecuteJavaScript);
  app.post("/api/ai/generate-question", authMiddleware, handleGenerateQuestion);
  app.post("/api/ai/analyze-code", authMiddleware, handleAnalyzeCode);
  app.post("/api/ai/get-hint", authMiddleware, handleGetHint);

  // Interview routes
  app.post(
    "/api/interview/technical/start",
    authMiddleware,
    handleStartTechnicalInterview,
  );
  app.post(
    "/api/interview/technical/message",
    authMiddleware,
    handleTechnicalInterviewMessage,
  );
  app.post(
    "/api/interview/technical/end",
    authMiddleware,
    handleEndTechnicalInterview,
  );
  app.post(
    "/api/interview/behavioral/start",
    authMiddleware,
    handleStartBehavioralInterview,
  );
  app.post(
    "/api/interview/behavioral/message",
    authMiddleware,
    handleBehavioralInterviewMessage,
  );
  app.post(
    "/api/interview/behavioral/end",
    authMiddleware,
    handleEndBehavioralInterview,
  );

  // Audio analysis routes
  app.post(
    "/api/audio/transcribe",
    authMiddleware,
    handleAudioTranscription,
  );
  app.post(
    "/api/audio/analyze-answer",
    authMiddleware,
    handleAnswerAnalysis,
  );
  app.post(
    "/api/audio/analyze-batch",
    authMiddleware,
    handleBatchAnswerAnalysis,
  );

  return app;
}
