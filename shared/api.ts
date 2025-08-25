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
  type:
    | "code_update"
    | "participant_join"
    | "participant_leave"
    | "cursor_update"
    | "chat_message"
    | "voice_state_change";
  sessionId: string;
  participantId: string;
  data: any;
  timestamp: string;
}

/**
 * Chat types
 */
export interface ChatMessage {
  id: string;
  content: string;
  participantId: string;
  participantName: string;
  timestamp: string;
}

export interface SendMessageRequest {
  sessionId: string;
  participantId: string;
  message: string;
}

export interface TypingIndicator {
  participantId: string;
  participantName: string;
  isTyping: boolean;
}

/**
 * Voice chat types
 */
export interface VoiceState {
  participantId: string;
  isConnected: boolean;
  isMuted: boolean;
  isDeafened?: boolean;
}

export interface VoiceSignalData {
  sessionId: string;
  participantId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface VoiceStateChange {
  participantId: string;
  state: 'connected' | 'disconnected' | 'muted' | 'unmuted' | 'deafened' | 'undeafened';
}

/**
 * User management types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "professor";
  professorId?: string; // For students - professor email they're mapped to
  createdAt: string;
}

export interface StudentRegistrationRequest {
  email: string;
  password: string;
  name: string;
  professorEmail: string;
}

export interface StudentRegistrationResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: Omit<User, "password">;
}

export interface ProfessorStudent {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  totalProblems: number;
  completedProblems: number;
  averageScore: number;
  lastActive: string;
}

export interface Assignment {
  id: string;
  professorId: string;
  studentId: string;
  problemTitle: string;
  problemDescription: string;
  language: "python" | "javascript";
  difficulty: "easy" | "medium" | "hard";
  assignedAt: string;
  dueDate?: string;
  status: "pending" | "in_progress" | "completed";
  score?: number;
  submittedAt?: string;
}
