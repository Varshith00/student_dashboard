import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Users,
  Code,
  ArrowRight,
  ArrowLeft,
  Copy,
  Share,
  Play,
  UserPlus,
  Laptop,
  Brain,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PairProgramming() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<"python" | "javascript">("python");
  const [joinSessionId, setJoinSessionId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const createNewSession = async () => {
    setIsCreating(true);
    try {
      const response = await authFetch("/api/collaboration/create", {
        method: "POST",
        body: JSON.stringify({
          language: selectedLanguage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Collaboration session created!");
        navigate(`/student/collaboration/${data.sessionId}`);
      } else {
        toast.error(data.message || "Failed to create session");
      }
    } catch (error) {
      toast.error("Failed to create collaboration session");
      console.error("Error creating session:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const joinExistingSession = async () => {
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
        toast.success("Successfully joined session!");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/student/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Pair Programming</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            Real-time Collaboration
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            Code Together, Learn Together
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start a collaborative coding session with your peers. Share code in real-time, 
            get AI-powered suggestions, and solve problems together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Create New Session */}
          <Card className="p-6 border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create New Session</CardTitle>
              <CardDescription>
                Start a new collaborative coding session and invite others to join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Choose Programming Language</Label>
                <RadioGroup
                  value={selectedLanguage}
                  onValueChange={(value) => setSelectedLanguage(value as "python" | "javascript")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="python" id="python" />
                    <Label htmlFor="python" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Python
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="javascript" id="javascript" />
                    <Label htmlFor="javascript" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        JavaScript
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Features Included</Label>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Real-time collaborative editing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-primary" />
                    <span>Live code execution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span>AI-powered code analysis and hints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share className="w-4 h-4 text-primary" />
                    <span>Easy session sharing</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={createNewSession}
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  "Creating Session..."
                ) : (
                  <>
                    Create Session <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Existing Session */}
          <Card className="p-6 border-2 hover:border-accent/50 transition-all hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Join Session</CardTitle>
              <CardDescription>
                Enter a session ID to join an existing collaborative session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="session-id" className="text-base font-semibold">
                  Session ID
                </Label>
                <Input
                  id="session-id"
                  placeholder="Enter session ID (e.g., collab_123_abc)"
                  value={joinSessionId}
                  onChange={(e) => setJoinSessionId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && joinExistingSession()}
                />
                <p className="text-sm text-muted-foreground">
                  Ask your teammate to share their session ID or link
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">What You Can Do</Label>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 text-accent" />
                    <span>View and edit code together</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span>See real-time cursors and changes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-accent" />
                    <span>Get AI assistance and suggestions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-accent" />
                    <span>Run code and see output together</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={joinExistingSession}
                disabled={isJoining || !joinSessionId.trim()}
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                size="lg"
              >
                {isJoining ? (
                  "Joining Session..."
                ) : (
                  <>
                    Join Session <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Powerful Collaboration Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for effective pair programming
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Real-time Sync</h3>
              <p className="text-sm text-muted-foreground">
                See changes instantly as your partner types
              </p>
            </Card>

            <Card className="text-center p-6">
              <Brain className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent code suggestions and analysis
              </p>
            </Card>

            <Card className="text-center p-6">
              <Code className="w-8 h-8 text-success mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Live Execution</h3>
              <p className="text-sm text-muted-foreground">
                Run Python and JavaScript code together
              </p>
            </Card>

            <Card className="text-center p-6">
              <Share className="w-8 h-8 text-warning mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Easy Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share sessions with simple links or IDs
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
