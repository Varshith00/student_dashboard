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
} from "./routes/collaboration";

export function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);

  // Only create socket.io in production to avoid development conflicts
  let io = null;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Socket.io connection handling
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join collaboration session
      socket.on('join-session', (sessionId) => {
        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined session ${sessionId}`);
      });

      // Leave collaboration session
      socket.on('leave-session', (sessionId) => {
        socket.leave(sessionId);
        console.log(`Socket ${socket.id} left session ${sessionId}`);
      });

      // Handle code changes
      socket.on('code-change', (data) => {
        const { sessionId, code, cursor, participantId } = data;
        // Broadcast to all other participants in the session
        socket.to(sessionId).emit('code-update', {
          code,
          cursor,
          participantId
        });
      });

      // Handle cursor position updates
      socket.on('cursor-update', (data) => {
        const { sessionId, cursor, participantId } = data;
        socket.to(sessionId).emit('cursor-update', {
          cursor,
          participantId
        });
      });

      // Handle participant status updates
      socket.on('participant-update', (data) => {
        const { sessionId, participantId, status } = data;
        socket.to(sessionId).emit('participant-update', {
          participantId,
          status
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  } else {
    console.log('🔧 Development mode: Socket.io disabled');
  }

  // Make io instance available to routes (will be null in development)
  app.set('io', io);

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
  app.post("/api/auth/student-register", handleStudentRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/user", authMiddleware, handleGetUser);
  app.get("/api/auth/professor/:professorEmail", handleGetProfessor);

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
  app.post("/api/audio/transcribe", authMiddleware, handleAudioTranscription);
  app.post("/api/audio/analyze-answer", authMiddleware, handleAnswerAnalysis);
  app.post(
    "/api/audio/analyze-batch",
    authMiddleware,
    handleBatchAnswerAnalysis,
  );

  // Professor routes
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

  // Student routes
  app.get(
    "/api/student/assignments",
    authMiddleware,
    handleGetStudentAssignments,
  );

  // Collaboration routes
  app.post("/api/collaboration/create", authMiddleware, createSession);
  app.post("/api/collaboration/join", authMiddleware, joinSession);
  app.get("/api/collaboration/:sessionId", authMiddleware, getSession);
  app.post("/api/collaboration/update", authMiddleware, updateCode);
  app.post("/api/collaboration/leave", authMiddleware, leaveSession);

  return { app, httpServer, io };
}

// Development-specific server that avoids body parsing conflicts with Vite
export function createDevServer() {
  const app = express();

  // Middleware - but avoid express.json() which conflicts with Vite
  app.use(cors());

  // Custom body parser that works with Vite
  app.use('/api', (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      // Skip if body already parsed (to avoid double parsing)
      if (req.body !== undefined) {
        return next();
      }

      let body = '';
      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;

        if (body) {
          try {
            req.body = JSON.parse(body);
          } catch (e) {
            // If JSON parsing fails, try to handle as string or set empty object
            req.body = body.length > 0 ? { raw: body } : {};
          }
        } else {
          req.body = {};
        }
        next();
      };

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', finish);
      req.on('error', (err) => {
        console.error('Body parsing error:', err);
        req.body = {};
        finish();
      });

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn('Body parsing timeout');
        finish();
      }, 10000); // 10 second timeout

      req.on('end', () => clearTimeout(timeout));
      req.on('error', () => clearTimeout(timeout));
    } else {
      next();
    }
  });

  // Routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/student-register", handleStudentRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/user", authMiddleware, handleGetUser);
  app.get("/api/auth/professor/:professorEmail", handleGetProfessor);

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
  app.post("/api/audio/transcribe", authMiddleware, handleAudioTranscription);
  app.post("/api/audio/analyze-answer", authMiddleware, handleAnswerAnalysis);
  app.post(
    "/api/audio/analyze-batch",
    authMiddleware,
    handleBatchAnswerAnalysis,
  );

  // Professor routes
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

  // Student routes
  app.get(
    "/api/student/assignments",
    authMiddleware,
    handleGetStudentAssignments,
  );

  // Collaboration routes
  app.post("/api/collaboration/create", authMiddleware, createSession);
  app.post("/api/collaboration/join", authMiddleware, joinSession);
  app.get("/api/collaboration/:sessionId", authMiddleware, getSession);
  app.post("/api/collaboration/update", authMiddleware, updateCode);
  app.post("/api/collaboration/leave", authMiddleware, leaveSession);

  return { app };
}
