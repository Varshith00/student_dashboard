import { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { authFetch } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Play,
  Square,
  RotateCcw,
  Copy,
  Share,
  Users,
  Settings,
  UserPlus,
  Terminal,
  Code,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  ArrowLeft,
  LogOut,
  Brain,
  Lightbulb,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { CollaborationSession, Participant, ChatMessage, TypingIndicator } from "@shared/api";
import ChatInterface from "@/components/ChatInterface";
import VoiceChat from "@/components/VoiceChat";

interface CollaborativeEditorProps {
  sessionId?: string;
  language?: "python" | "javascript";
}

export default function CollaborativeEditor({
  sessionId,
  language = "python",
}: CollaborativeEditorProps) {
  const editorRef = useRef<any>(null);
  const navigate = useNavigate();

  // Core editor state
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  // Session state
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [participantId, setParticipantId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<"write" | "read">("write");

  // Join session state
  const [joinSessionId, setJoinSessionId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // AI features state
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);

  // Socket connection
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");

  function getDefaultCode(lang: "python" | "javascript") {
    if (lang === "python") {
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

  // Initialize socket connection (only in production)
  useEffect(() => {
    if (!session?.id) return;

    // Check if we're in production environment
    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction) {
      // In development, skip socket connection to avoid conflicts
      setConnectionStatus("disconnected");
      console.log("🔧 Development mode: Real-time collaboration disabled");
      return;
    }

    setConnectionStatus("connecting");

    try {
      socketRef.current = io(window.location.origin, {
        transports: ["websocket", "polling"],
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Connected to socket server");
        setConnectionStatus("connected");
        socket.emit("join-session", session.id);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
        setConnectionStatus("disconnected");
      });

      socket.on("connect_error", () => {
        console.log("Socket connection failed");
        setConnectionStatus("disconnected");
      });

      // Handle real-time code updates
      socket.on("code-update", (data) => {
        const {
          code: newCode,
          cursor,
          participantId: updateParticipantId,
          participantName,
        } = data;
        if (updateParticipantId !== participantId) {
          setCode(newCode);
          // Update the editor content
          if (editorRef.current) {
            editorRef.current.setValue(newCode);
          }
        }
      });

      // Handle participant updates
      socket.on("participant-joined", (data) => {
        const { participant, session: updatedSession } = data;
        setSession(updatedSession);
      });

      socket.on("participant-left", (data) => {
        const {
          participantId: leftParticipantId,
          participantName,
          session: updatedSession,
        } = data;
        setSession(updatedSession);
      });

      socket.on("cursor-update", (data) => {
        const { cursor, participantId: cursorParticipantId } = data;
        // Handle cursor position updates from other participants
        // Could be used to show cursors in the editor
      });

      // Handle chat messages
      socket.on("new-message", (messageData: ChatMessage) => {
        setMessages((prev) => [...prev, messageData]);
      });

      // Handle typing indicators
      socket.on("user-typing", (data: TypingIndicator) => {
        setTypingUsers((prev) => {
          const filtered = prev.filter((user) => user.participantId !== data.participantId);
          if (data.isTyping) {
            return [...filtered, data];
          }
          return filtered;
        });
      });

      return () => {
        if (socket) {
          socket.emit("leave-session", session.id);
          socket.disconnect();
        }
      };
    } catch (error) {
      console.error("Failed to initialize socket connection:", error);
      setConnectionStatus("disconnected");
    }
  }, [session?.id, participantId]);

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      if (sessionId) {
        // Join existing session
        await joinExistingSession(sessionId);
      } else {
        // Create new session
        await createNewSession();
      }
    };

    initializeSession();
  }, [sessionId, language]);

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/collaboration/create", {
        method: "POST",
        body: JSON.stringify({
          language,
          initialCode: getDefaultCode(language),
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Navigate to the new session
        navigate(`/student/collaboration/${data.sessionId}`);
      } else {
        toast.error(data.message || "Failed to create session");
      }
    } catch (error) {
      toast.error("Failed to create collaboration session");
      console.error("Error creating session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinExistingSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/collaboration/join", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      if (data.success && data.session && data.participantId) {
        setSession(data.session);
        setParticipantId(data.participantId);
        setCode(data.session.code);
        setMessages(data.session.messages || []);
        setIsConnected(true);

        // Set permission based on participant data
        const participant = data.session.participants.find(
          (p) => p.id === data.participantId,
        );
        if (participant) {
          setPermission(participant.permission);
        }

        toast.success("Successfully joined collaboration session!");
      } else {
        toast.error(data.message || "Failed to join session");
        navigate("/student/collaboration/new");
      }
    } catch (error) {
      toast.error("Failed to join collaboration session");
      console.error("Error joining session:", error);
      navigate("/student/collaboration/new");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinSessionId.trim()) {
      toast.error("Please enter a session ID");
      return;
    }

    setIsJoining(true);
    try {
      const response = await authFetch("/api/collaboration/join", {
        method: "POST",
        body: JSON.stringify({ sessionId: joinSessionId }),
      });

      const data = await response.json();
      if (data.success) {
        navigate(`/student/collaboration/${joinSessionId}`);
      } else {
        toast.error(data.message || "Failed to join session");
      }
    } catch (error) {
      toast.error("Failed to join session");
      console.error("Error joining session:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const updateCode = async (newCode: string) => {
    if (!session || !participantId || permission === "read") return;

    try {
      // Emit real-time update via socket (only in production)
      if (socketRef.current && connectionStatus === "connected") {
        socketRef.current.emit("code-change", {
          sessionId: session.id,
          participantId,
          code: newCode,
          cursor: editorRef.current?.getPosition(),
        });
      }

      const response = await authFetch("/api/collaboration/update", {
        method: "POST",
        body: JSON.stringify({
          sessionId: session.id,
          participantId,
          code: newCode,
          cursor: editorRef.current?.getPosition(),
        }),
      });

      const data = await response.json();
      if (data.success && data.session) {
        setSession(data.session);
      }
    } catch (error) {
      console.error("Error updating code:", error);
    }
  };

  const runCode = async () => {
    if (!code) return;

    setIsRunning(true);
    setOutput("");
    setHasError(false);
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      const endpoint =
        session?.language === "python"
          ? "/api/execute-python"
          : "/api/execute-javascript";
      const response = await authFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (result.success) {
        setOutput(result.output || "Code executed successfully (no output)");
        setHasError(false);
      } else {
        setOutput(result.error || "An error occurred");
        setHasError(true);
      }
    } catch (error) {
      setOutput(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setHasError(true);
      setExecutionTime(Date.now() - startTime);
    }

    setIsRunning(false);
  };

  const analyzeCode = async () => {
    if (!code) {
      toast.error("Please write some code first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await authFetch("/api/ai/analyze-code", {
        method: "POST",
        body: JSON.stringify({
          code,
          language: session?.language || language,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAiSuggestion(result.analysis);
        toast.success("AI analysis complete!");
      } else {
        toast.error(result.error || "Analysis failed");
      }
    } catch (error) {
      toast.error("Failed to analyze code");
      console.error("Error analyzing code:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHint = async () => {
    if (!code) {
      toast.error("Please write some code first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await authFetch("/api/ai/get-hint", {
        method: "POST",
        body: JSON.stringify({
          code,
          language: session?.language || language,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAiSuggestion(result.hint);
        toast.success("AI hint generated!");
      } else {
        toast.error(result.error || "Failed to get hint");
      }
    } catch (error) {
      toast.error("Failed to get hint");
      console.error("Error getting hint:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copySessionLink = async () => {
    if (!session) return;

    const link = `${window.location.origin}/student/collaboration/${session.id}`;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
        toast.success("Session link copied to clipboard!");
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (success) {
          toast.success("Session link copied to clipboard!");
        } else {
          throw new Error("Copy command failed");
        }
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Show the link to the user if copying fails
      prompt("Copy this session link:", link);
    }
  };

  const copySessionId = async () => {
    if (!session) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(session.id);
        toast.success("Session ID copied to clipboard!");
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = session.id;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (success) {
          toast.success("Session ID copied to clipboard!");
        } else {
          throw new Error("Copy command failed");
        }
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Show the ID to the user if copying fails
      prompt("Copy this session ID:", session.id);
    }
  };

  const handleBack = () => {
    navigate("/student/dashboard");
  };

  const handleLeaveSession = async () => {
    if (!session || !participantId) return;

    try {
      await authFetch("/api/collaboration/leave", {
        method: "POST",
        body: JSON.stringify({
          sessionId: session.id,
          participantId,
        }),
      });

      toast.success("Left collaboration session");
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Error leaving session:", error);
      navigate("/student/dashboard");
    }
  };

  // Chat functions
  const handleSendMessage = (message: string) => {
    if (!socketRef.current || !session || !participantId) return;

    const participant = session.participants.find((p) => p.id === participantId);
    if (!participant) return;

    socketRef.current.emit("send-message", {
      sessionId: session.id,
      message,
      participantId,
      participantName: participant.name,
    });
  };

  const handleTypingStart = () => {
    if (!socketRef.current || !session || !participantId) return;

    const participant = session.participants.find((p) => p.id === participantId);
    if (!participant) return;

    socketRef.current.emit("typing-start", {
      sessionId: session.id,
      participantId,
      participantName: participant.name,
    });
  };

  const handleTypingStop = () => {
    if (!socketRef.current || !session || !participantId) return;

    const participant = session.participants.find((p) => p.id === participantId);
    if (!participant) return;

    socketRef.current.emit("typing-stop", {
      sessionId: session.id,
      participantId,
      participantName: participant.name,
    });
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      // Debounce the update to avoid too many API calls
      const timeoutId = setTimeout(() => {
        updateCode(value);
      }, 500); // Reduced debounce time for better real-time feel
      return () => clearTimeout(timeoutId);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {sessionId ? "Joining session..." : "Creating session..."}
          </p>
        </div>
      </div>
    );
  }

  // Show join session interface if no session yet
  if (!session) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Join Collaboration Session
            </CardTitle>
            <CardDescription>
              Enter a session ID to join an existing collaboration session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session ID</label>
              <Input
                placeholder="Enter session ID (e.g., collab_123_abc)"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinSession()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleJoinSession}
                disabled={isJoining || !joinSessionId.trim()}
                className="flex-1"
              >
                {isJoining ? "Joining..." : "Join Session"}
              </Button>
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Or</p>
              <Button
                variant="outline"
                onClick={createNewSession}
                className="w-full"
              >
                Create New Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Collaborative Session</h1>
              <Badge
                variant={
                  connectionStatus === "connected"
                    ? "secondary"
                    : connectionStatus === "connecting"
                      ? "outline"
                      : "destructive"
                }
              >
                {connectionStatus === "connected"
                  ? "Live Sync"
                  : connectionStatus === "connecting"
                    ? "Connecting..."
                    : process.env.NODE_ENV === "production"
                      ? "Disconnected"
                      : "Dev Mode"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Session ID:</span>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                {session.id}
              </code>
              <Button variant="outline" size="sm" onClick={copySessionId}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Participants */}
            <div className="flex items-center gap-1 border-r pr-2 mr-2">
              {session.participants
                .filter((p) => p.isActive)
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white relative"
                    style={{ backgroundColor: participant.color }}
                    title={participant.name}
                  >
                    {participant.name.charAt(0).toUpperCase()}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                  </div>
                ))}
              <Button variant="outline" size="sm" onClick={copySessionLink}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={copySessionLink}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button variant="outline" size="sm" onClick={handleLeaveSession}>
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b p-3 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                <span className="font-semibold">
                  {session.language === "python" ? "Python" : "JavaScript"}{" "}
                  Editor
                </span>
                <Badge
                  variant={permission === "write" ? "default" : "secondary"}
                >
                  {permission === "write" ? (
                    <Edit className="w-3 h-3 mr-1" />
                  ) : (
                    <Eye className="w-3 h-3 mr-1" />
                  )}
                  {permission === "write" ? "Can Edit" : "Read Only"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const defaultCode = getDefaultCode(session.language);
                    setCode(defaultCode);
                    updateCode(defaultCode);
                  }}
                  disabled={isRunning || permission === "read"}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeCode}
                  disabled={isAnalyzing || !code}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getHint}
                  disabled={isAnalyzing || !code}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  AI Hint
                </Button>
                <Button
                  onClick={runCode}
                  disabled={isRunning}
                  size="sm"
                  className="bg-success hover:bg-success/90"
                >
                  {isRunning ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage={session.language}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: session.language === "python" ? 4 : 2,
                insertSpaces: true,
                wordWrap: "on",
                bracketPairColorization: { enabled: true },
                guides: {
                  indentation: true,
                  bracketPairs: true,
                },
                readOnly: permission === "read",
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="h-48 border-t bg-background">
            <div className="flex items-center justify-between p-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="font-semibold">Output</span>
                {executionTime !== null && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {executionTime}ms
                  </Badge>
                )}
              </div>
              {output && (
                <div className="flex items-center gap-1">
                  {hasError ? (
                    <XCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                  <span
                    className={`text-sm ${hasError ? "text-destructive" : "text-success"}`}
                  >
                    {hasError ? "Error" : "Success"}
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 h-full overflow-y-auto">
              {isRunning ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  Executing code...
                </div>
              ) : output ? (
                <pre
                  className={`text-sm whitespace-pre-wrap font-mono ${
                    hasError ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {output}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Click "Run Code" to execute your {session.language} code.
                  Output will appear here.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Collaboration Tools */}
        <div className="w-80 border-l bg-muted/30">
          <Tabs defaultValue="participants" className="h-full">
            <TabsList className="grid w-full grid-cols-5 m-4 text-xs">
              <TabsTrigger value="participants">Team</TabsTrigger>
              <TabsTrigger value="chat">
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="voice">
                <Phone className="w-3 h-3 mr-1" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="px-4 pb-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participants</CardTitle>
                  <CardDescription>
                    {session.participants.filter((p) => p.isActive).length} of{" "}
                    {session.participants.length} active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className={`flex items-center gap-3 p-2 rounded-lg bg-background ${
                          !participant.isActive && "opacity-50"
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ backgroundColor: participant.color }}
                        >
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {participant.name}
                            {participant.id === participantId && " (You)"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {participant.isActive ? "Active" : "Away"}
                            {participant.cursor &&
                              ` • Line ${participant.cursor.line}`}
                            {" • " + participant.permission}
                          </p>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${participant.isActive ? "bg-success" : "bg-muted-foreground"}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <UserPlus className="h-4 w-4" />
                <AlertDescription>
                  Share the session ID or use the Share button to invite more
                  collaborators
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="ai" className="px-4 pb-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription>
                    Get AI-powered code analysis and suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={analyzeCode}
                      disabled={isAnalyzing || !code}
                      className="flex-1"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getHint}
                      disabled={isAnalyzing || !code}
                      className="flex-1"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Get Hint
                    </Button>
                  </div>

                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      Analyzing code...
                    </div>
                  )}

                  {aiSuggestion && (
                    <div className="p-3 bg-background rounded-lg border">
                      <h4 className="font-medium text-sm mb-2">
                        AI Suggestion:
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {aiSuggestion}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="px-4 pb-4 h-full">
              <div className="h-full">
                <ChatInterface
                  sessionId={session.id}
                  participantId={participantId}
                  participant={session.participants.find((p) => p.id === participantId)!}
                  messages={messages}
                  typingUsers={typingUsers}
                  onSendMessage={handleSendMessage}
                  onTypingStart={handleTypingStart}
                  onTypingStop={handleTypingStop}
                  disabled={permission === "read"}
                />
              </div>
            </TabsContent>

            <TabsContent value="voice" className="px-4 pb-4 h-full">
              <div className="h-full">
                <VoiceChat
                  sessionId={session.id}
                  participantId={participantId}
                  participant={session.participants.find((p) => p.id === participantId)!}
                  participants={session.participants}
                  socket={socketRef.current}
                  disabled={permission === "read"}
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="px-4 pb-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Session Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {session.language === "python"
                          ? "Python"
                          : "JavaScript"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Your Permission
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          permission === "write" ? "default" : "secondary"
                        }
                      >
                        {permission === "write" ? "Editor" : "Viewer"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Session ID</label>
                    <div className="flex gap-2 mt-1">
                      <code className="flex-1 bg-muted px-2 py-1 rounded text-xs">
                        {session.id}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copySessionId}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={copySessionLink}
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share Session Link
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleLeaveSession}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Leave Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
