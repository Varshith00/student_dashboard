import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StudentAnalyticsDashboard from "@/components/StudentAnalyticsDashboard";
import {
  Code,
  Brain,
  Trophy,
  Clock,
  Target,
  BookOpen,
  BarChart3,
  Calendar,
  CheckCircle,
  Play,
  Users,
  LogOut,
  GraduationCap,
  TrendingUp,
  Users2,
  Monitor,
  Sparkles,
  Award,
  AlertCircle,
  User,
  FileText,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, authFetch } from "@/contexts/AuthContext";
import { problems } from "@/data/problems";

interface Assignment {
  id: string;
  professorId: string;
  professorName: string;
  professorEmail: string;
  problemId: string;
  assignedDate: string;
  dueDate?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  score?: number;
  completedDate?: string;
  attempts: number;
  timeSpent: number;
  isOverdue?: boolean;
}

interface AssignmentSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentSummary, setAssignmentSummary] = useState<AssignmentSummary>({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  // Redirect if not logged in or not a student
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Fetch assignments when user is available
  useEffect(() => {
    if (user && user.role === "student") {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const response = await authFetch('/api/student/assignments');
      const data = await response.json();

      if (data.success) {
        setAssignments(data.assignments || []);
        setAssignmentSummary(data.summary || { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
      } else {
        console.error('Failed to fetch assignments:', data.error);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const getProblemByIdFromList = (problemId: string) => {
    return problems.find(p => p.id === problemId) || {
      id: problemId,
      title: problemId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      difficulty: 'Medium' as const,
      tags: ['Unknown'],
      description: 'Problem description not available',
      examples: [],
      constraints: [],
      starter_code: { python: '', javascript: '' },
      solution: { python: '', javascript: '' },
      test_cases: []
    };
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const getStatusColor = (status: string, isOverdue?: boolean) => {
    if (isOverdue) return 'destructive';
    switch (status) {
      case 'assigned': return 'secondary';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string, isOverdue?: boolean) => {
    if (isOverdue) return 'Overdue';
    switch (status) {
      case 'assigned': return 'New';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || user.role !== "student") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TechPrep</h1>
              <p className="text-sm text-muted-foreground">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Welcome back, {user.name}!</Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-6 lg:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3"
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Home</span>
          </Button>
          <Button
            variant={activeTab === "coding" ? "default" : "outline"}
            onClick={() => setActiveTab("coding")}
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3"
            size="sm"
          >
            <Code className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Coding Practice</span>
            <span className="sm:hidden">Code</span>
          </Button>
          <Button
            variant={activeTab === "interviews" ? "default" : "outline"}
            onClick={() => setActiveTab("interviews")}
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3"
            size="sm"
          >
            <Brain className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Mock Interviews</span>
            <span className="sm:hidden">Interview</span>
          </Button>
          <Button
            variant={activeTab === "progress" ? "default" : "outline"}
            onClick={() => setActiveTab("progress")}
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3"
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-1 sm:mr-2" />
            Progress
          </Button>
          <Button
            variant={activeTab === "pair-programming" ? "default" : "outline"}
            onClick={() => setActiveTab("pair-programming")}
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3"
            size="sm"
          >
            <Users2 className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Pair Programming</span>
            <span className="sm:hidden">Pair</span>
          </Button>
          <Button
            variant={activeTab === "assignments" ? "default" : "outline"}
            onClick={() => setActiveTab("assignments")}
            className="whitespace-nowrap relative text-xs sm:text-sm px-2 sm:px-3"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Assignments</span>
            <span className="sm:hidden">Tasks</span>
            {assignmentSummary.pending + assignmentSummary.overdue > 0 && (
              <Badge className="ml-1 h-4 w-4 p-0 text-xs sm:h-5 sm:w-5" variant="destructive">
                {assignmentSummary.pending + assignmentSummary.overdue}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "web-editor" ? "default" : "outline"}
            onClick={() => setActiveTab("web-editor")}
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3"
            size="sm"
          >
            <Monitor className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Web Editor</span>
            <span className="sm:hidden">Editor</span>
          </Button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-accent" />
                  Your Learning Journey
                </CardTitle>
                <CardDescription>
                  Track your progress and continue your tech career preparation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">
                      47
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Problems Solved
                    </div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">
                      12
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Mock Interviews
                    </div>
                  </div>
                  <div className="text-center p-4 bg-warning/10 rounded-lg">
                    <div className="text-3xl font-bold text-warning mb-2">
                      {assignmentSummary.pending + assignmentSummary.inProgress}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pending Assignments
                    </div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-3xl font-bold text-success mb-2">
                      85%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Success Rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="w-5 h-5 text-primary" />
                    Start Coding
                  </CardTitle>
                  <CardDescription>
                    Continue your Python practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link to="/student/coding/two-sum" className="w-full">
                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Solve Two Sum
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("coding")}
                    >
                      View All Problems
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-accent" />
                    Mock Interview
                  </CardTitle>
                  <CardDescription>
                    Practice with AI interviewer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link to="/student/interview/technical" className="w-full">
                      <Button variant="outline" className="w-full">
                        <Brain className="w-4 h-4 mr-2" />
                        Technical Interview
                      </Button>
                    </Link>
                    <Link to="/student/interview/behavioral" className="w-full">
                      <Button variant="outline" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Behavioral Interview
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-warning" />
                    Peer Study
                  </CardTitle>
                  <CardDescription>Join collaborative sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Find Partners
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-warning/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-warning" />
                    Assignments
                    {assignmentSummary.pending + assignmentSummary.overdue > 0 && (
                      <Badge className="ml-1" variant="destructive">
                        {assignmentSummary.pending + assignmentSummary.overdue}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Problems assigned by professors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                      onClick={() => setActiveTab("assignments")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Assignments ({assignmentSummary.total})
                    </Button>
                    {assignmentSummary.overdue > 0 && (
                      <div className="text-xs text-destructive font-medium text-center">
                        {assignmentSummary.overdue} overdue assignment{assignmentSummary.overdue !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-accent/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-accent" />
                    AI Generator
                  </CardTitle>
                  <CardDescription>
                    Create custom problems with AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/ai/question-generator" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Questions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest progress and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Completed "Binary Search Tree" problem
                      </p>
                      <p className="text-sm text-muted-foreground">
                        2 hours ago
                      </p>
                    </div>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Brain className="w-6 h-6 text-accent" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Mock interview: Technical Round
                      </p>
                      <p className="text-sm text-muted-foreground">Yesterday</p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">
                      Excellent
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Trophy className="w-6 h-6 text-warning" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Achieved "Problem Solver" badge
                      </p>
                      <p className="text-sm text-muted-foreground">
                        3 days ago
                      </p>
                    </div>
                    <Badge variant="outline">New</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "coding" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-6 h-6 text-primary" />
                  Python Coding Practice
                </CardTitle>
                <CardDescription>
                  Solve problems and improve your programming skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {problems.map((problem) => {
                    const getDifficultyColor = () => {
                      switch (problem.difficulty) {
                        case "Easy":
                          return "bg-success text-success-foreground";
                        case "Medium":
                          return "bg-warning text-warning-foreground";
                        case "Hard":
                          return "bg-destructive text-destructive-foreground";
                        default:
                          return "bg-secondary text-secondary-foreground";
                      }
                    };

                    const getIconColor = () => {
                      switch (problem.difficulty) {
                        case "Easy":
                          return "text-success";
                        case "Medium":
                          return "text-warning";
                        case "Hard":
                          return "text-destructive";
                        default:
                          return "text-primary";
                      }
                    };

                    return (
                      <div
                        key={problem.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 bg-${problem.difficulty === "Easy" ? "success" : problem.difficulty === "Medium" ? "warning" : "destructive"}/10 rounded-lg flex items-center justify-center`}
                          >
                            <Target className={`w-6 h-6 ${getIconColor()}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{problem.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {problem.tags.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getDifficultyColor()}>
                            {problem.difficulty}
                          </Badge>
                          <Link to={`/student/coding/${problem.id}`}>
                            <Button>
                              <Play className="w-4 h-4 mr-2" />
                              Solve
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "interviews" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-accent" />
                  AI-Powered Mock Interviews
                </CardTitle>
                <CardDescription>
                  Practice technical and behavioral interviews with AI that
                  mimics real company processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Technical Interview
                      </CardTitle>
                      <CardDescription>
                        Live coding challenges and system design
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Duration:</span>
                          <span>30-45 minutes</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Levels:</span>
                          <span>Junior, Mid, Senior</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Focus:</span>
                          <span>Algorithms, Problem Solving</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Format:</span>
                          <span>Interactive Chat</span>
                        </div>
                      </div>
                      <Link
                        to="/student/interview/technical"
                        className="w-full"
                      >
                        <Button className="w-full">
                          <Brain className="w-4 h-4 mr-2" />
                          Start Technical Interview
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-accent" />
                        Behavioral Interview
                      </CardTitle>
                      <CardDescription>
                        Critical thinking and aptitude questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Duration:</span>
                          <span>20-30 minutes</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Focus:</span>
                          <span>Critical Thinking, Aptitude</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Method:</span>
                          <span>STAR Framework</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Type:</span>
                          <span>Scenario-based Questions</span>
                        </div>
                      </div>
                      <Link
                        to="/student/interview/behavioral"
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Start Behavioral Interview
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    What to Expect
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Technical Interview:
                      </h4>
                      <ul className="space-y-1">
                        <li>• Real-time problem solving</li>
                        <li>• Code explanation and optimization</li>
                        <li>• System design discussions</li>
                        <li>• Follow-up questions based on your answers</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Behavioral Interview:
                      </h4>
                      <ul className="space-y-1">
                        <li>• Situational and analytical questions</li>
                        <li>• Critical thinking puzzles</li>
                        <li>• Communication and reasoning assessment</li>
                        <li>• Real-world scenario challenges</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "progress" && <StudentAnalyticsDashboard />}

        {activeTab === "pair-programming" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="w-6 h-6 text-primary" />
                  Collaborative Programming
                </CardTitle>
                <CardDescription>
                  Code together in real-time with peers and mentors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Play className="w-5 h-5 text-success" />
                        Start New Session
                      </CardTitle>
                      <CardDescription>
                        Create a new collaborative coding session
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Real-time sync:</span>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Voice chat:</span>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Code sharing:</span>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Multiple cursors:</span>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                      </div>
                      <Link to="/student/collaboration/new" className="w-full">
                        <Button className="w-full">
                          <Users2 className="w-4 h-4 mr-2" />
                          Create Session
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-accent" />
                        Join Session
                      </CardTitle>
                      <CardDescription>
                        Enter a session ID to join ongoing collaboration
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <input
                          type="text"
                          placeholder="Enter session ID..."
                          className="w-full px-3 py-2 border rounded-md"
                        />
                        <div className="text-sm text-muted-foreground">
                          <p>• Get the session ID from your collaborator</p>
                          <p>• Session supports up to 4 participants</p>
                          <p>• Works with Python and JavaScript</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Join Session
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Recent Sessions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Binary Tree Problems</p>
                          <p className="text-sm text-muted-foreground">
                            With Sarah, Mike • 2 hours ago
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Play className="w-3 h-3 mr-1" />
                        Rejoin
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                          <Users2 className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">Algorithm Study Group</p>
                          <p className="text-sm text-muted-foreground">
                            With Alex, Emma, Jake • Yesterday
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Ended</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-6">
            {/* Assignment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  My Assignments
                </CardTitle>
                <CardDescription>
                  Problems assigned by your professors with due dates and progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {assignmentSummary.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-foreground mb-1">
                      {assignmentSummary.pending}
                    </div>
                    <div className="text-sm text-muted-foreground">New</div>
                  </div>
                  <div className="text-center p-4 bg-warning/20 rounded-lg">
                    <div className="text-2xl font-bold text-warning mb-1">
                      {assignmentSummary.inProgress}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center p-4 bg-success/20 rounded-lg">
                    <div className="text-2xl font-bold text-success mb-1">
                      {assignmentSummary.completed}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-destructive/20 rounded-lg">
                    <div className="text-2xl font-bold text-destructive mb-1">
                      {assignmentSummary.overdue}
                    </div>
                    <div className="text-sm text-muted-foreground">Overdue</div>
                  </div>
                </div>

                {assignmentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading assignments...</p>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
                    <p className="text-muted-foreground">
                      Your professors haven't assigned any problems yet. Check back later!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const problem = getProblemByIdFromList(assignment.problemId);
                      const getDifficultyColor = () => {
                        switch (problem.difficulty) {
                          case "Easy":
                            return "text-success";
                          case "Medium":
                            return "text-warning";
                          case "Hard":
                            return "text-destructive";
                          default:
                            return "text-muted-foreground";
                        }
                      };

                      return (
                        <Card key={assignment.id} className={`border ${assignment.isOverdue ? 'border-destructive/50' : 'border-border'} hover:border-primary/50 transition-colors`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Target className={`w-6 h-6 ${getDifficultyColor()}`} />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{problem.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <User className="w-4 h-4" />
                                      <span>Assigned by {assignment.professorName}</span>
                                      <span>•</span>
                                      <Clock className="w-4 h-4" />
                                      <span>Assigned {new Date(assignment.assignedDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Difficulty:</span>
                                    <Badge variant="outline" className={getDifficultyColor()}>
                                      {problem.difficulty}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Attempts:</span>
                                    <span className="font-medium">{assignment.attempts}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Time spent:</span>
                                    <span className="font-medium">{assignment.timeSpent}m</span>
                                  </div>
                                  {assignment.score && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">Score:</span>
                                      <span className="font-medium text-success">{assignment.score}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <Badge variant={getStatusColor(assignment.status, assignment.isOverdue)}>
                                  {assignment.isOverdue && <AlertCircle className="w-3 h-3 mr-1" />}
                                  {getStatusText(assignment.status, assignment.isOverdue)}
                                </Badge>

                                {assignment.dueDate && (
                                  <div className={`text-sm ${
                                    assignment.isOverdue
                                      ? 'text-destructive font-medium'
                                      : 'text-muted-foreground'
                                  }`}>
                                    {formatDueDate(assignment.dueDate)}
                                  </div>
                                )}

                                <Link to={`/student/coding/${assignment.problemId}`}>
                                  <Button size="sm" className="mt-2">
                                    {assignment.status === 'completed' ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Review
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" />
                                        {assignment.status === 'assigned' ? 'Start' : 'Continue'}
                                      </>
                                    )}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "web-editor" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-6 h-6 text-accent" />
                  Advanced Web Editor
                </CardTitle>
                <CardDescription>
                  Full-featured editor with AI suggestions, multi-language
                  support, and error highlighting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <Card className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="w-5 h-5 text-primary" />
                        Python Editor
                      </CardTitle>
                      <CardDescription>
                        Enhanced Python development environment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>AI code suggestions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Real-time error detection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Syntax highlighting</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Auto-completion</span>
                        </div>
                      </div>
                      <Link to="/student/editor/python" className="w-full">
                        <Button className="w-full">
                          <Code className="w-4 h-4 mr-2" />
                          Open Python Editor
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-warning/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="w-5 h-5 text-warning" />
                        JavaScript Editor
                      </CardTitle>
                      <CardDescription>
                        Modern JavaScript development tools
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>ES6+ support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>JSX highlighting</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>TypeScript support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Node.js runtime</span>
                        </div>
                      </div>
                      <Link to="/student/editor/javascript" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Open JS Editor
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent" />
                        AI Features
                      </CardTitle>
                      <CardDescription>
                        Intelligent coding assistance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-accent" />
                          <span>Smart code completion</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-accent" />
                          <span>Error explanations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-accent" />
                          <span>Code optimization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-accent" />
                          <span>Performance tips</span>
                        </div>
                      </div>
                      <Button variant="secondary" className="w-full">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Recent Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Code className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                sorting_algorithms.py
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Modified 2 hours ago
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Open
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                              <Code className="w-4 h-4 text-warning" />
                            </div>
                            <div>
                              <p className="font-medium">todo_app.js</p>
                              <p className="text-sm text-muted-foreground">
                                Modified yesterday
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Open
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-accent" />
                        Templates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Python Data Structures
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          JavaScript Functions
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Algorithm Template
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          React Component
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
