import { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
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
import { authFetch } from "@/contexts/AuthContext";
import {
  Play,
  Square,
  RotateCcw,
  Copy,
  Share,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Settings,
  UserPlus,
  Terminal,
  Code,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; column: number };
  isActive: boolean;
}

interface CollaborativeEditorProps {
  sessionId?: string;
  language?: "python" | "javascript";
}

export default function CollaborativeEditor({
  sessionId,
  language = "python",
}: CollaborativeEditorProps) {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState(getDefaultCode(language));
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  // Collaboration features
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "You", color: "#3b82f6", isActive: true },
    {
      id: "2",
      name: "Alex Chen",
      color: "#ef4444",
      cursor: { line: 5, column: 10 },
      isActive: true,
    },
    {
      id: "3",
      name: "Sarah Johnson",
      color: "#22c55e",
      cursor: { line: 12, column: 0 },
      isActive: false,
    },
  ]);

  const [isConnected, setIsConnected] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [permission, setPermission] = useState<"write" | "read">("write");

  // Chat
  const [chatMessages, setChatMessages] = useState([
    {
      id: "1",
      sender: "Alex Chen",
      message: "Hey, ready to work on this together?",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      sender: "You",
      message: "Yes! Let's start with the algorithm approach",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      sender: "Sarah Johnson",
      message: "I think we should use a recursive solution",
      timestamp: new Date(Date.now() - 180000),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

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

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setHasError(false);
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      const endpoint =
        language === "python"
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

  const copySessionLink = () => {
    const link = `${window.location.origin}/student/collaboration/${sessionId}`;
    navigator.clipboard.writeText(link);
    // Could add toast notification here
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "You",
          message: newMessage,
          timestamp: new Date(),
        },
      ]);
      setNewMessage("");
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Collaborative Session</h1>
              <Badge variant={isConnected ? "secondary" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Session ID:</span>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                {sessionId || "demo-123"}
              </code>
              <Button variant="outline" size="sm" onClick={copySessionLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Participants */}
            <div className="flex items-center gap-1 border-r pr-2 mr-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white relative ${
                    participant.isActive ? "" : "opacity-50"
                  }`}
                  style={{ backgroundColor: participant.color }}
                  title={participant.name}
                >
                  {participant.name.charAt(0).toUpperCase()}
                  {participant.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>

            {/* Communication */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMicOn(!isMicOn)}
              className={isMicOn ? "bg-success/10 border-success" : ""}
            >
              {isMicOn ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={isVideoOn ? "bg-success/10 border-success" : ""}
            >
              {isVideoOn ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </Button>

            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
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
                  {language === "python" ? "Python" : "JavaScript"} Editor
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
                  onClick={() => setCode(getDefaultCode(language))}
                  disabled={isRunning}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
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
              defaultLanguage={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: language === "python" ? 4 : 2,
                insertSpaces: true,
                wordWrap: "on",
                bracketPairColorization: { enabled: true },
                guides: {
                  indentation: true,
                  bracketPairs: true,
                },
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
                  Click "Run Code" to execute your {language} code. Output will
                  appear here.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Collaboration Tools */}
        <div className="w-80 border-l bg-muted/30">
          <Tabs defaultValue="participants" className="h-full">
            <TabsList className="grid w-full grid-cols-3 m-4">
              <TabsTrigger value="participants">Team</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="px-4 pb-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participants</CardTitle>
                  <CardDescription>
                    {participants.filter((p) => p.isActive).length} of{" "}
                    {participants.length} active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-background"
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
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {participant.isActive ? "Active" : "Away"}
                            {participant.cursor &&
                              ` • Line ${participant.cursor.line}`}
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
                  Share the session ID to invite more collaborators
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent
              value="chat"
              className="px-4 pb-4 flex flex-col h-full"
            >
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Team Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-64 mb-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{msg.sender}</span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-sm border rounded-md"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                    <select
                      value={language}
                      className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
                      disabled
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                    </select>
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

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Session Settings
                    </Button>
                    <Button variant="destructive" size="sm" className="w-full">
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
