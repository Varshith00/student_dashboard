import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
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
  handleStudentRegister,
  handleLogin,
  handleGetUser,
  handleGetProfessor,
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
import {
  handleGetStudents,
  handleAssignProblem,
  handleBulkAssignProblem,
  handleGetAssignments,
  handleGetClassAnalytics,
  handleGetStudentDetails,
  handleUpdateAssignmentProgress,
  handleDeleteAssignment,
  handleGetStudentAssignments,
} from "./routes/professor";
import {
  createSession,
  joinSession,
  updateCode,
  getSession,
  leaveSession,
  sendMessage,
  validateSession,
} from "./routes/collaboration";

export function attachSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-session", (sessionId) => {
      socket.join(sessionId);
      console.log(`🔥 Socket ${socket.id} joined session room ${sessionId}`);
      socket.emit("room-joined", { sessionId });
      socket.to(sessionId).emit("socket-user-joined", {
        socketId: socket.id,
        sessionId,
      });
    });

    socket.on("leave-session", (sessionId) => {
      socket.leave(sessionId);
      console.log(`Socket ${socket.id} left session ${sessionId}`);
    });

    socket.on("code-change", (data) => {
      const { sessionId, code, cursor, participantId } = data;
      socket.to(sessionId).emit("code-update", {
        code,
        cursor,
        participantId,
      });
    });

    socket.on("cursor-update", (data) => {
      const { sessionId, cursor, participantId } = data;
      socket.to(sessionId).emit("cursor-update", {
        cursor,
        participantId,
      });
    });

    socket.on("participant-update", (data) => {
      const { sessionId, participantId, status } = data;
      socket.to(sessionId).emit("participant-update", {
        participantId,
        status,
      });
    });

    socket.on("send-message", (data) => {
      const { sessionId, message, participantId, participantName } = data;
      console.log(
        `🔥 Received message from ${participantName} in session ${sessionId}: ${message}`,
      );

      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        content: message,
        participantId,
        participantName,
        timestamp: new Date().toISOString(),
      };

      console.log(`🔥 Broadcasting message to session room ${sessionId}`);
      io.to(sessionId).emit("new-message", messageData);
      console.log(`🔥 Message broadcasted successfully`);
    });

    socket.on("typing-start", (data) => {
      const { sessionId, participantId, participantName } = data;
      socket.to(sessionId).emit("user-typing", {
        participantId,
        participantName,
        isTyping: true,
      });
    });

    socket.on("typing-stop", (data) => {
      const { sessionId, participantId, participantName } = data;
      socket.to(sessionId).emit("user-typing", {
        participantId,
        participantName,
        isTyping: false,
      });
    });

    socket.on("voice-offer", (data) => {
      const { sessionId, offer, participantId } = data;
      socket.to(sessionId).emit("voice-offer", {
        offer,
        participantId,
      });
    });

    socket.on("voice-answer", (data) => {
      const { sessionId, answer, participantId } = data;
      socket.to(sessionId).emit("voice-answer", {
        answer,
        participantId,
      });
    });

    socket.on("voice-ice-candidate", (data) => {
      const { sessionId, candidate, participantId } = data;
      socket.to(sessionId).emit("voice-ice-candidate", {
        candidate,
        participantId,
      });
    });

    socket.on("voice-state-change", (data) => {
      const { sessionId, participantId, state } = data;
      socket.to(sessionId).emit("voice-state-change", {
        participantId,
        state,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

export function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  attachSocketHandlers(io);

  app.set("io", io);

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/student-register", handleStudentRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/user", authMiddleware, handleGetUser);
  app.get("/api/auth/professor/:professorEmail", handleGetProfessor);

  app.post("/api/execute-python", authMiddleware, handleExecutePython);
  app.post("/api/execute-javascript", authMiddleware, handleExecuteJavaScript);
  app.post("/api/ai/generate-question", authMiddleware, handleGenerateQuestion);
  app.post("/api/ai/analyze-code", authMiddleware, handleAnalyzeCode);
  app.post("/api/ai/get-hint", authMiddleware, handleGetHint);

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

  app.post("/api/audio/transcribe", authMiddleware, handleAudioTranscription);
  app.post("/api/audio/analyze-answer", authMiddleware, handleAnswerAnalysis);
  app.post(
    "/api/audio/analyze-batch",
    authMiddleware,
    handleBatchAnswerAnalysis,
  );

  app.get("/api/professor/students", authMiddleware, handleGetStudents);
  app.post(
    "/api/professor/assign-problem",
    authMiddleware,
    handleAssignProblem,
  );
  app.post(
    "/api/professor/bulk-assign-problem",
    authMiddleware,
    handleBulkAssignProblem,
  );
  app.get("/api/professor/assignments", authMiddleware, handleGetAssignments);
  app.get("/api/professor/analytics", authMiddleware, handleGetClassAnalytics);
  app.get(
    "/api/professor/students/:studentId",
    authMiddleware,
    handleGetStudentDetails,
  );
  app.put(
    "/api/professor/assignments/:assignmentId/progress",
    authMiddleware,
    handleUpdateAssignmentProgress,
  );
  app.delete(
    "/api/professor/assignments/:assignmentId",
    authMiddleware,
    handleDeleteAssignment,
  );

  app.get(
    "/api/student/assignments",
    authMiddleware,
    handleGetStudentAssignments,
  );

  app.post("/api/collaboration/create", authMiddleware, createSession);
  app.post("/api/collaboration/join", authMiddleware, joinSession);
  app.get("/api/collaboration/:sessionId", authMiddleware, getSession);
  app.get("/api/collaboration/validate/:sessionId", validateSession);
  app.post("/api/collaboration/update", authMiddleware, updateCode);
  app.post("/api/collaboration/message", authMiddleware, sendMessage);
  app.post("/api/collaboration/leave", authMiddleware, leaveSession);

  return { app, httpServer, io };
}

export function createDevServer() {
  const app = express();

  app.use(cors());

  app.use("/api", (req, res, next) => {
    if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "PATCH"
    ) {
      if (
        req.body !== undefined ||
        req.body === null ||
        (req as any)._bodyParsed
      ) {
        return next();
      }

      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes("application/json")) {
        req.body = {};
        return next();
      }

      (req as any)._bodyParsed = true;

      let body = "";
      let finished = false;
      let hasListeners = false;

      const finish = () => {
        if (finished) return;
        finished = true;

        if (body) {
          try {
            req.body = JSON.parse(body);
          } catch (e) {
            console.error("JSON parsing failed:", e);
            req.body = {};
          }
        } else {
          req.body = {};
        }
        next();
      };

      if (req.readableEnded || req.complete) {
        req.body = {};
        return next();
      }

      if (!hasListeners) {
        hasListeners = true;

        req.on("data", (chunk) => {
          if (!finished) {
            body += chunk.toString();
          }
        });

        req.on("end", () => {
          if (!finished) {
            finish();
          }
        });

        req.on("error", (err) => {
          console.error("Body parsing error:", err);
          if (!finished) {
            req.body = {};
            finish();
          }
        });

        const timeout = setTimeout(() => {
          if (!finished) {
            console.warn("Body parsing timeout");
            finish();
          }
        }, 10000);

        req.on("end", () => clearTimeout(timeout));
        req.on("error", () => clearTimeout(timeout));
      }
    } else {
      next();
    }
  });

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/student-register", handleStudentRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/user", authMiddleware, handleGetUser);
  app.get("/api/auth/professor/:professorEmail", handleGetProfessor);

  app.post("/api/execute-python", authMiddleware, handleExecutePython);
  app.post("/api/execute-javascript", authMiddleware, handleExecuteJavaScript);
  app.post("/api/ai/generate-question", authMiddleware, handleGenerateQuestion);
  app.post("/api/ai/analyze-code", authMiddleware, handleAnalyzeCode);
  app.post("/api/ai/get-hint", authMiddleware, handleGetHint);

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

  app.post("/api/audio/transcribe", authMiddleware, handleAudioTranscription);
  app.post("/api/audio/analyze-answer", authMiddleware, handleAnswerAnalysis);
  app.post(
    "/api/audio/analyze-batch",
    authMiddleware,
    handleBatchAnswerAnalysis,
  );

  app.get("/api/professor/students", authMiddleware, handleGetStudents);
  app.post(
    "/api/professor/assign-problem",
    authMiddleware,
    handleAssignProblem,
  );
  app.post(
    "/api/professor/bulk-assign-problem",
    authMiddleware,
    handleBulkAssignProblem,
  );
  app.get("/api/professor/assignments", authMiddleware, handleGetAssignments);
  app.get("/api/professor/analytics", authMiddleware, handleGetClassAnalytics);
  app.get(
    "/api/professor/students/:studentId",
    authMiddleware,
    handleGetStudentDetails,
  );
  app.put(
    "/api/professor/assignments/:assignmentId/progress",
    authMiddleware,
    handleUpdateAssignmentProgress,
  );
  app.delete(
    "/api/professor/assignments/:assignmentId",
    authMiddleware,
    handleDeleteAssignment,
  );

  app.get(
    "/api/student/assignments",
    authMiddleware,
    handleGetStudentAssignments,
  );

  app.post("/api/collaboration/create", authMiddleware, createSession);
  app.post("/api/collaboration/join", authMiddleware, joinSession);
  app.get("/api/collaboration/:sessionId", authMiddleware, getSession);
  app.get("/api/collaboration/validate/:sessionId", validateSession);
  app.post("/api/collaboration/update", authMiddleware, updateCode);
  app.post("/api/collaboration/message", authMiddleware, sendMessage);
  app.post("/api/collaboration/leave", authMiddleware, leaveSession);

  return { app };
}
