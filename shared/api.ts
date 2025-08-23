/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Collaboration session types
 */
export interface CollaborationSession {
  id: string;
  hostId: string;
  language: "python" | "javascript";
  code: string;
  participants: Participant[];
  createdAt: string;
  lastActivity: string;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  color: string;
  isActive: boolean;
  permission: "read" | "write";
  cursor?: { line: number; column: number };
  joinedAt: string;
}

export interface CreateSessionRequest {
  language: "python" | "javascript";
  initialCode?: string;
}

export interface CreateSessionResponse {
  success: boolean;
  sessionId?: string;
  message?: string;
}

export interface JoinSessionRequest {
  sessionId: string;
}

export interface JoinSessionResponse {
  success: boolean;
  session?: CollaborationSession;
  participantId?: string;
  message?: string;
}

export interface UpdateCodeRequest {
  sessionId: string;
  participantId: string;
  code: string;
  cursor?: { line: number; column: number };
}

export interface SessionEvent {
  type: "code_update" | "participant_join" | "participant_leave" | "cursor_update";
  sessionId: string;
  participantId: string;
  data: any;
  timestamp: string;
}
