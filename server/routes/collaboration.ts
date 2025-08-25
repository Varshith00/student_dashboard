import { RequestHandler } from "express";
import {
  CollaborationSession,
  Participant,
  CreateSessionRequest,
  CreateSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  UpdateCodeRequest,
  SessionEvent,
  ChatMessage,
  SendMessageRequest,
} from "@shared/api";

// In-memory storage for demo (in production, use a proper database)
const activeSessions: Map<string, CollaborationSession> = new Map();
const sessionEvents: Map<string, SessionEvent[]> = new Map();

// Colors for participants
const participantColors = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
];

function getDefaultCode(language: "python" | "javascript"): string {
  if (language === "python") {
    return `# Collaborative Python Session
# Problem: Two Sum - Find two numbers that add up to target

def two_sum(nums, target):
    """
    Find two numbers in array that add up to target
    Args:
        nums: List of integers
        target: Target sum
    Returns:
        List of two indices
    """
    # TODO: Implement solution here
    pass

# Test the function
test_nums = [2, 7, 11, 15]
test_target = 9
result = two_sum(test_nums, test_target)
print(f"Result: {result}")
`;
  } else {
    return `// Collaborative JavaScript Session
// Problem: Two Sum - Find two numbers that add up to target

function twoSum(nums, target) {
    /**
     * Find two numbers in array that add up to target
     * @param {number[]} nums - Array of integers
     * @param {number} target - Target sum
     * @returns {number[]} Array of two indices
     */
    // TODO: Implement solution here
}

// Test the function
const testNums = [2, 7, 11, 15];
const testTarget = 9;
const result = twoSum(testNums, testTarget);
console.log(\`Result: \${result}\`);
`;
  }
}

export const createSession: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { language, initialCode }: CreateSessionRequest = req.body;

    if (!language || !["python", "javascript"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language specified",
      });
    }

    const sessionId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Create host participant
    const hostParticipant: Participant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: user.id,
      name: user.name,
      color: participantColors[0],
      isActive: true,
      permission: "write",
      joinedAt: now,
    };

    const session: CollaborationSession = {
      id: sessionId,
      hostId: user.id,
      language,
      code: initialCode || getDefaultCode(language),
      participants: [hostParticipant],
      messages: [],
      voiceStates: [],
      createdAt: now,
      lastActivity: now,
    };

    activeSessions.set(sessionId, session);
    sessionEvents.set(sessionId, []);

    const response: CreateSessionResponse = {
      success: true,
      sessionId: sessionId,
    };

    res.json(response);
  } catch (error) {
    console.error("Error creating collaboration session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const joinSession: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { sessionId }: JoinSessionRequest = req.body;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if user is already in session
    const existingParticipant = session.participants.find(
      (p) => p.userId === user.id,
    );
    if (existingParticipant) {
      existingParticipant.isActive = true;
      existingParticipant.joinedAt = new Date().toISOString();
    } else {
      // Add new participant
      const colorIndex = session.participants.length % participantColors.length;
      const newParticipant: Participant = {
        id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: user.id,
        name: user.name,
        color: participantColors[colorIndex],
        isActive: true,
        permission: "write", // All participants can edit by default
        joinedAt: new Date().toISOString(),
      };
      session.participants.push(newParticipant);
    }

    session.lastActivity = new Date().toISOString();
    activeSessions.set(sessionId, session);

    // Emit participant join event via socket.io
    const io = (req as any).app?.get("io");
    if (io) {
      io.to(sessionId).emit("participant-joined", {
        participant:
          existingParticipant ||
          session.participants[session.participants.length - 1],
        session,
      });
    }

    // Add join event
    const joinEvent: SessionEvent = {
      type: "participant_join",
      sessionId,
      participantId:
        existingParticipant?.id ||
        session.participants[session.participants.length - 1].id,
      data: { userName: user.name },
      timestamp: new Date().toISOString(),
    };

    const events = sessionEvents.get(sessionId) || [];
    events.push(joinEvent);
    sessionEvents.set(sessionId, events);

    const response: JoinSessionResponse = {
      success: true,
      session,
      participantId:
        existingParticipant?.id ||
        session.participants[session.participants.length - 1].id,
    };

    res.json(response);
  } catch (error) {
    console.error("Error joining collaboration session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCode: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { sessionId, participantId, code, cursor }: UpdateCodeRequest =
      req.body;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Find participant
    const participant = session.participants.find(
      (p) => p.id === participantId && p.userId === user.id,
    );
    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this session",
      });
    }

    if (participant.permission === "read") {
      return res.status(403).json({
        success: false,
        message: "Read-only access",
      });
    }

    // Update session
    session.code = code;
    session.lastActivity = new Date().toISOString();

    // Update participant cursor
    if (cursor) {
      participant.cursor = cursor;
    }

    activeSessions.set(sessionId, session);

    // Emit real-time update via socket.io
    const io = (req as any).app?.get("io");
    if (io) {
      io.to(sessionId).emit("code-update", {
        code,
        cursor,
        participantId,
        participantName: participant.name,
      });
    }

    // Add code update event
    const updateEvent: SessionEvent = {
      type: "code_update",
      sessionId,
      participantId,
      data: { code, cursor },
      timestamp: new Date().toISOString(),
    };

    const events = sessionEvents.get(sessionId) || [];
    events.push(updateEvent);
    sessionEvents.set(sessionId, events);

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Error updating code:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSession: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if user is participant
    const participant = session.participants.find((p) => p.userId === user.id);
    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "Not a participant in this session",
      });
    }

    res.json({
      success: true,
      session,
      participantId: participant.id,
    });
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const leaveSession: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { sessionId, participantId } = req.body;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Find and deactivate participant
    const participant = session.participants.find(
      (p) => p.id === participantId && p.userId === user.id,
    );
    if (participant) {
      participant.isActive = false;
    }

    session.lastActivity = new Date().toISOString();
    activeSessions.set(sessionId, session);

    // Emit participant leave event via socket.io
    const io = (req as any).app?.get("io");
    if (io) {
      io.to(sessionId).emit("participant-left", {
        participantId,
        participantName: participant?.name,
        session,
      });
    }

    // Add leave event
    const leaveEvent: SessionEvent = {
      type: "participant_leave",
      sessionId,
      participantId,
      data: { userName: user.name },
      timestamp: new Date().toISOString(),
    };

    const events = sessionEvents.get(sessionId) || [];
    events.push(leaveEvent);
    sessionEvents.set(sessionId, events);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error leaving session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Clean up inactive sessions (call this periodically)
export const cleanupSessions = () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.lastActivity < oneHourAgo) {
      activeSessions.delete(sessionId);
      sessionEvents.delete(sessionId);
      console.log(`Cleaned up inactive session: ${sessionId}`);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupSessions, 60 * 60 * 1000);
