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
import { authFetch } from "@/contexts/AuthContext";
import AssignProblemModal from "@/components/AssignProblemModal";
import {
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Brain,
  Code,
  CheckCircle,
  AlertCircle,
  LogOut,
  GraduationCap,
  Filter,
  Search,
  Eye,
  Download,
  Plus,
  Calendar,
  Trash2,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Data fetching functions
  const fetchStudents = async () => {
    try {
      const response = await authFetch("/api/professor/students");
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await authFetch("/api/professor/assignments");
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await authFetch("/api/professor/analytics");
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const loadAllData = async () => {
    setIsLoadingData(true);
    await Promise.all([fetchStudents(), fetchAssignments(), fetchAnalytics()]);
    setIsLoadingData(false);
  };

  // Redirect if not logged in or not a professor
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "professor")) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Load data when component mounts and user is authenticated
  useEffect(() => {
    if (user && user.role === "professor") {
      loadAllData();
    }
  }, [user]);

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

  if (!user || user.role !== "professor") {
    return null;
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TechPrep</h1>
              <p className="text-sm text-muted-foreground">Professor Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{user.name}</Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === "students" ? "default" : "outline"}
            onClick={() => setActiveTab("students")}
            className="whitespace-nowrap"
          >
            <Users className="w-4 h-4 mr-2" />
            Students
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "outline"}
            onClick={() => setActiveTab("analytics")}
            className="whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "assignments" ? "default" : "outline"}
            onClick={() => setActiveTab("assignments")}
            className="whitespace-nowrap"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Assignments
          </Button>
          <Button
            variant={activeTab === "problems" ? "default" : "outline"}
            onClick={() => setActiveTab("problems")}
            className="whitespace-nowrap"
          >
            <Code className="w-4 h-4 mr-2" />
            Problem Tracking
          </Button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Class Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-accent" />
                  Class Overview - CS 301
                </CardTitle>
                <CardDescription>
                  Monitor your students' progress and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {analytics?.totalStudents || students.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Students
                    </div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-3xl font-bold text-success mb-2">
                      {students.filter((s) => s.status === "active").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Students
                    </div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {Math.round(analytics?.averageScore || 0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Score
                    </div>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-lg">
                    <div className="text-3xl font-bold text-warning mb-2">
                      {analytics?.completedAssignments || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed Assignments
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Student Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Student Activity</CardTitle>
                <CardDescription>
                  Latest progress and achievements from your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Michael Rodriguez completed "Graph Algorithms"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        30 minutes ago • Score: 94%
                      </p>
                    </div>
                    <Badge className="bg-success text-success-foreground">
                      Excellent
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Code className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Alex Johnson started "Binary Search Tree"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        2 hours ago • In Progress
                      </p>
                    </div>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Brain className="w-6 h-6 text-accent" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Sarah Chen completed mock interview
                      </p>
                      <p className="text-sm text-muted-foreground">
                        1 day ago • Technical Interview
                      </p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">
                      Good
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-warning" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Emily Davis needs help with "Dynamic Programming"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        3 hours ago • Attempted 3 times
                      </p>
                    </div>
                    <Badge variant="outline">Needs Help</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setActiveTab("students")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    View All Students
                  </CardTitle>
                  <CardDescription>Monitor individual progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Student List
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setActiveTab("analytics")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    Class Analytics
                  </CardTitle>
                  <CardDescription>
                    Detailed performance insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="w-5 h-5 text-success" />
                    Export Report
                  </CardTitle>
                  <CardDescription>
                    Download class progress report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Student Management
                </CardTitle>
                <CardDescription>
                  Monitor individual student progress and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Student List */}
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <Card
                      key={student.id}
                      className="border-2 hover:border-primary/50 transition-colors"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-primary">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {student.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {student.email}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge
                                  variant={
                                    student.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {student.status === "active"
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Last active: {student.lastActive}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <div className="text-2xl font-bold text-primary">
                                {student.progress}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Progress
                              </div>
                              <Progress
                                value={student.progress}
                                className="w-20 h-2 mt-1"
                              />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-accent">
                                {student.problemsSolved}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Problems Solved
                              </div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-success">
                                {student.interviewScore}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Interview Score
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Currently working on:{" "}
                              </span>
                              <span className="font-medium">
                                {student.currentProblem}
                              </span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Students
                      </p>
                      <p className="text-2xl font-bold">{students.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-accent" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Active Assignments
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          assignments.filter((a) => a.status !== "completed")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-success" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {assignments.length > 0
                          ? Math.round(
                              (assignments.filter(
                                (a) => a.status === "completed",
                              ).length /
                                assignments.length) *
                                100,
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-warning" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Avg. Time Spent
                      </p>
                      <p className="text-2xl font-bold">
                        {assignments.length > 0
                          ? Math.round(
                              assignments.reduce(
                                (sum, a) => sum + a.timeSpent,
                                0,
                              ) / assignments.length,
                            )
                          : 0}
                        min
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Class Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-success" />
                  Class Performance Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive insights into your class performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">
                      Student Progress Distribution
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        const excellent = students.filter(
                          (s) => s.progress >= 90,
                        ).length;
                        const good = students.filter(
                          (s) => s.progress >= 80 && s.progress < 90,
                        ).length;
                        const average = students.filter(
                          (s) => s.progress >= 70 && s.progress < 80,
                        ).length;
                        const needsHelp = students.filter(
                          (s) => s.progress < 70,
                        ).length;

                        return (
                          <>
                            <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-success rounded-full"></div>
                                <span>Excellent (90-100%)</span>
                              </div>
                              <span className="font-semibold">
                                {excellent} students
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <span>Good (80-89%)</span>
                              </div>
                              <span className="font-semibold">
                                {good} students
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-warning rounded-full"></div>
                                <span>Average (70-79%)</span>
                              </div>
                              <span className="font-semibold">
                                {average} students
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                                <span>Needs Help (&lt;70%)</span>
                              </div>
                              <span className="font-semibold">
                                {needsHelp} students
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">
                      Assignment Status Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span>Completed</span>
                        </div>
                        <span className="font-semibold">
                          {
                            assignments.filter((a) => a.status === "completed")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <span>In Progress</span>
                        </div>
                        <span className="font-semibold">
                          {
                            assignments.filter(
                              (a) => a.status === "in_progress",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-warning" />
                          <span>Assigned</span>
                        </div>
                        <span className="font-semibold">
                          {
                            assignments.filter((a) => a.status === "assigned")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                          <span>Overdue</span>
                        </div>
                        <span className="font-semibold">
                          {
                            assignments.filter(
                              (a) =>
                                a.status !== "completed" &&
                                a.dueDate &&
                                new Date(a.dueDate) < new Date(),
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Student Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
                <CardDescription>
                  Students with highest completion rates and scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students
                    .sort((a, b) => b.progress - a.progress)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="font-bold text-lg">
                              {student.progress}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Progress
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg">
                              {student.problemsSolved}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Solved
                            </p>
                          </div>
                          <Badge
                            variant={
                              student.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest student submissions and completions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments
                    .filter((a) => a.status === "completed")
                    .sort(
                      (a, b) =>
                        new Date(b.completedDate || "").getTime() -
                        new Date(a.completedDate || "").getTime(),
                    )
                    .slice(0, 6)
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                      >
                        <CheckCircle className="w-6 h-6 text-success" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {assignment.studentName} completed "
                            {assignment.problemId
                              .split("-")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")}
                            "
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.completedDate &&
                              new Date(
                                assignment.completedDate,
                              ).toLocaleDateString()}{" "}
                            • Score: {assignment.score}% • Time:{" "}
                            {assignment.timeSpent}min
                          </p>
                        </div>
                        <Badge variant="default">
                          {assignment.score && assignment.score >= 90
                            ? "Excellent"
                            : assignment.score && assignment.score >= 80
                              ? "Good"
                              : assignment.score && assignment.score >= 70
                                ? "Average"
                                : "Needs Review"}
                        </Badge>
                      </div>
                    ))}
                  {assignments.filter((a) => a.status === "completed")
                    .length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No completed assignments yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-primary" />
                      Assignment Management
                    </CardTitle>
                    <CardDescription>
                      Create and manage coding problem assignments for your
                      students
                    </CardDescription>
                  </div>
                  <AssignProblemModal
                    students={students}
                    onAssignmentCreated={loadAllData}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {/* Assignment Statistics */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {assignments.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Assignments
                    </div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      {
                        assignments.filter((a) => a.status === "completed")
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed
                    </div>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-lg">
                    <div className="text-2xl font-bold text-warning">
                      {
                        assignments.filter((a) => a.status === "in_progress")
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      In Progress
                    </div>
                  </div>
                  <div className="text-center p-4 bg-destructive/5 rounded-lg">
                    <div className="text-2xl font-bold text-destructive">
                      {
                        assignments.filter(
                          (a) =>
                            a.status !== "completed" &&
                            a.dueDate &&
                            new Date(a.dueDate) < new Date(),
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Overdue</div>
                  </div>
                </div>

                {/* Assignment List */}
                <div className="space-y-4">
                  {assignments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No assignments created yet.</p>
                      <p className="text-sm">
                        Create your first assignment to get started!
                      </p>
                    </div>
                  ) : (
                    assignments.map((assignment) => (
                      <Card key={assignment.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Code className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {assignment.problemId
                                    .split("-")
                                    .map(
                                      (word: string) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1),
                                    )
                                    .join(" ")}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Assigned to: {assignment.studentName}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <span>
                                    Assigned:{" "}
                                    {new Date(
                                      assignment.assignedDate,
                                    ).toLocaleDateString()}
                                  </span>
                                  {assignment.dueDate && (
                                    <span>
                                      Due:{" "}
                                      {new Date(
                                        assignment.dueDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span>Attempts: {assignment.attempts}</span>
                                  <span>Time: {assignment.timeSpent}min</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                {assignment.status === "completed" &&
                                  assignment.score && (
                                    <>
                                      <div className="text-lg font-bold text-success">
                                        {assignment.score}%
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Score
                                      </div>
                                    </>
                                  )}
                              </div>
                              <Badge
                                variant={
                                  assignment.status === "completed"
                                    ? "default"
                                    : assignment.status === "in_progress"
                                      ? "secondary"
                                      : assignment.dueDate &&
                                          new Date(assignment.dueDate) <
                                            new Date()
                                        ? "destructive"
                                        : "outline"
                                }
                              >
                                {assignment.status === "completed"
                                  ? "Completed"
                                  : assignment.status === "in_progress"
                                    ? "In Progress"
                                    : assignment.dueDate &&
                                        new Date(assignment.dueDate) <
                                          new Date()
                                      ? "Overdue"
                                      : "Assigned"}
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "problems" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-6 h-6 text-primary" />
                  Problem Tracking
                </CardTitle>
                <CardDescription>
                  Monitor which problems students are working on and their
                  progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Binary Search Tree</h3>
                        <p className="text-sm text-muted-foreground">
                          Tree data structures and traversal
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-xs text-muted-foreground">
                        Students Working
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">8</div>
                      <div className="text-xs text-muted-foreground">
                        Completed
                      </div>
                    </div>
                    <Badge variant="secondary">Medium</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Dynamic Programming</h3>
                        <p className="text-sm text-muted-foreground">
                          Advanced optimization techniques
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">5</div>
                      <div className="text-xs text-muted-foreground">
                        Students Working
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">2</div>
                      <div className="text-xs text-muted-foreground">
                        Completed
                      </div>
                    </div>
                    <Badge className="bg-destructive text-destructive-foreground">
                      Hard
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Two Sum Problem</h3>
                        <p className="text-sm text-muted-foreground">
                          Array manipulation and hash maps
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">3</div>
                      <div className="text-xs text-muted-foreground">
                        Students Working
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">21</div>
                      <div className="text-xs text-muted-foreground">
                        Completed
                      </div>
                    </div>
                    <Badge variant="outline">Easy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
