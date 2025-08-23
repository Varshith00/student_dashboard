import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { authFetch } from "@/contexts/AuthContext";
import {
  Brain,
  Send,
  ArrowLeft,
  GraduationCap,
  LogOut,
  Clock,
  User,
  Bot,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Video,
  MessageSquare,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "interviewer";
  content: string;
  timestamp: string; // ISO string from server
  type?: "question" | "follow-up" | "evaluation" | "final";
}

interface QuestionFeedback {
  question: string;
  answer: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface InterviewSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: "active" | "completed";
  difficulty: "junior" | "mid" | "senior";
  focus: string[];
  questionFeedback?: QuestionFeedback[];
  overallFeedback?: string;
  messages: Message[];
}

export default function TechnicalInterview() {
  const navigate = useNavigate();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [interviewMode, setInterviewMode] = useState<"chat" | "video">("chat");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [session?.messages]);

  const startInterview = async (
    difficulty: "junior" | "mid" | "senior",
    focus: string[],
  ) => {
    setIsStarting(true);

    try {
      const response = await authFetch("/api/interview/technical/start", {
        method: "POST",
        body: JSON.stringify({ difficulty, focus }),
      });

      // Check if response is ok before trying to read body
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clone the response to avoid body stream already read error
      const responseClone = response.clone();
      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        // Try to get response text for debugging
        try {
          const text = await responseClone.text();
          console.error("Response text:", text);
        } catch (textError) {
          console.error("Failed to read response text:", textError);
        }
        throw new Error("Invalid JSON response from server");
      }

      if (data.success) {
        // Convert string dates to Date objects
        const sessionWithDates = {
          ...data.session,
          startTime: new Date(data.session.startTime),
          endTime: data.session.endTime ? new Date(data.session.endTime) : undefined
        };
        setSession(sessionWithDates);
        // Extract the initial question for video mode
        if (data.session.messages && data.session.messages.length > 0) {
          const initialQuestion = data.session.messages[0].content;
          setCurrentQuestion(initialQuestion);
          setAwaitingAnswer(true);
        }
      } else {
        console.error("Failed to start interview:", data.error);
        throw new Error(data.error || "Failed to start interview");
      }
    } catch (error) {
      console.error("Interview start error:", error);
      // You might want to show an error message to the user here
    }

    setIsStarting(false);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !session || isLoading) return;
    await sendMessageInternal(currentMessage);
    setCurrentMessage("");
  };

  const sendMessageInternal = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setSession((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, userMessage],
          }
        : null,
    );

    setIsLoading(true);
    setAwaitingAnswer(false);

    try {
      const response = await authFetch("/api/interview/technical/message", {
        method: "POST",
        body: JSON.stringify({
          sessionId: session!.id,
          message: message,
          messageHistory: session!.messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "interviewer",
          content: data.response,
          timestamp: new Date().toISOString(),
          type: data.type,
        };

        setSession((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, botMessage],
                ...(data.sessionUpdate && {
                  ...data.sessionUpdate,
                  startTime: data.sessionUpdate.startTime ? new Date(data.sessionUpdate.startTime) : prev.startTime,
                  endTime: data.sessionUpdate.endTime ? new Date(data.sessionUpdate.endTime) : prev.endTime
                }),
              }
            : null,
        );

        // Update current question for video mode
        setCurrentQuestion(data.response);
        setAwaitingAnswer(true);
      }
    } catch (error) {
      console.error("Message send error:", error);
    }

    setIsLoading(false);
  };

  const endInterview = async () => {
    if (!session) return;

    setIsLoading(true);

    try {
      const response = await authFetch("/api/interview/technical/end", {
        method: "POST",
        body: JSON.stringify({
          sessionId: session.id,
          messageHistory: session.messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                status: "completed",
                endTime: new Date(),
                questionFeedback: data.questionFeedback,
                overallFeedback: data.overallFeedback,
              }
            : null,
        );

        // Show results for a moment, then redirect
        setTimeout(() => {
          navigate("/student/dashboard");
        }, 3000);
      }
    } catch (error) {
      console.error("End interview error:", error);
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    navigate("/");
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/student/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    TechPrep
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Technical Interview
                  </p>
                </div>
              </Link>

              <div className="h-6 w-px bg-border" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                AI Interviewer
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Setup */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Brain className="w-8 h-8 text-primary" />
                  Technical Interview Setup
                </CardTitle>
                <CardDescription>
                  Prepare for real technical interviews with our AI interviewer
                  that simulates mid-tier company processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card
                    className="cursor-pointer border-2 hover:border-primary/50 transition-colors"
                    onClick={() =>
                      startInterview("junior", [
                        "algorithms",
                        "data-structures",
                        "problem-solving",
                      ])
                    }
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">Junior Level</CardTitle>
                      <CardDescription>0-2 years experience</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• Basic algorithms</li>
                        <li>• Data structures</li>
                        <li>• Problem solving</li>
                        <li>• Code implementation</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer border-2 hover:border-primary/50 transition-colors"
                    onClick={() =>
                      startInterview("mid", [
                        "system-design",
                        "algorithms",
                        "optimization",
                        "debugging",
                      ])
                    }
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">Mid Level</CardTitle>
                      <CardDescription>2-5 years experience</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• System design basics</li>
                        <li>• Algorithm optimization</li>
                        <li>• Debugging skills</li>
                        <li>• Code architecture</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer border-2 hover:border-primary/50 transition-colors"
                    onClick={() =>
                      startInterview("senior", [
                        "system-design",
                        "scalability",
                        "leadership",
                        "architecture",
                      ])
                    }
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">Senior Level</CardTitle>
                      <CardDescription>5+ years experience</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• Complex system design</li>
                        <li>• Scalability planning</li>
                        <li>• Technical leadership</li>
                        <li>• Architecture decisions</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    The interview will last 30-45 minutes and include live
                    coding, problem-solving, and technical discussion.
                  </p>
                  <Badge variant="outline" className="mb-4">
                    Click on your experience level to begin
                  </Badge>
                </div>

                {isStarting && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-primary">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      Setting up your interview...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-2 lg:py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Technical Interview
                </h1>
                <p className="text-xs text-muted-foreground">
                  {session.difficulty.charAt(0).toUpperCase() +
                    session.difficulty.slice(1)}{" "}
                  Level
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs"
              >
                <Clock className="w-3 h-3" />
                {session.status === "active" ? "In Progress" : "Completed"}
              </Badge>
              {session.status === "completed" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </Badge>
              )}
              {session.status === "active" && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-xs px-2"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Chat Interview</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {session.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={endInterview}
                disabled={isLoading}
                className="text-xs px-2 sm:px-3"
              >
                <span className="hidden sm:inline">End Interview</span>
                <span className="sm:hidden">End</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/student/dashboard")}
              className="text-xs px-2 sm:px-3"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Interview Interface */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {(interviewMode === "chat" || session.status === "completed") && (
              <>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {session.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${
                            message.role === "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent text-accent-foreground"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div
                            className={`rounded-lg p-3 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p className="text-xs opacity-70 mt-2">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full"></div>
                            <span className="text-sm">
                              Interviewer is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                {session.status === "active" && interviewMode === "chat" && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex gap-2">
                      <Input
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="Type your response..."
                        onKeyPress={(e) =>
                          e.key === "Enter" && !e.shiftKey && sendMessage()
                        }
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={isLoading || !currentMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Results */}
            {session.status === "completed" && (
              <>
                <Separator className="my-4" />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      Interview Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold mb-2">Interview Summary</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default">
                            {session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)} Level
                          </Badge>
                          <Badge variant="outline">
                            {session.questionFeedback?.length || 0} Questions
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Duration</h4>
                        <p className="text-muted-foreground">
                          {session.endTime &&
                            Math.round(
                              (session.endTime.getTime() -
                                session.startTime.getTime()) /
                                60000,
                            )}{" "}
                          minutes
                        </p>
                      </div>
                    </div>

                    {/* Question-by-Question Feedback */}
                    {session.questionFeedback && session.questionFeedback.length > 0 && (
                      <div className="space-y-4 mb-6">
                        <h4 className="font-semibold">Question Feedback</h4>
                        {session.questionFeedback.map((qa, index) => (
                          <Card key={index} className="border-l-4 border-l-primary">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">
                                Question {index + 1}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {qa.question}
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <h5 className="font-medium text-sm mb-1">Your Answer:</h5>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                  {qa.answer}
                                </p>
                              </div>

                              <div>
                                <h5 className="font-medium text-sm mb-2">Feedback:</h5>
                                <p className="text-sm">{qa.feedback}</p>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                {qa.strengths && qa.strengths.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm mb-2 text-success">
                                      Strengths:
                                    </h5>
                                    <ul className="text-sm space-y-1">
                                      {qa.strengths.map((strength, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <CheckCircle className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                                          {strength}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {qa.improvements && qa.improvements.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm mb-2 text-warning">
                                      Areas for Improvement:
                                    </h5>
                                    <ul className="text-sm space-y-1">
                                      {qa.improvements.map((improvement, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <AlertCircle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                                          {improvement}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Overall Feedback */}
                    {session.overallFeedback && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">Overall Assessment</h4>
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <p className="text-sm">{session.overallFeedback}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => navigate("/student/dashboard")}>
                        Back to Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                      >
                        Start New Interview
                      </Button>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-sm text-muted-foreground">
                        You will be automatically redirected to the dashboard in
                        a few seconds...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
