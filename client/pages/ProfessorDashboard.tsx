import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Edit
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Data fetching functions
  const fetchStudents = async () => {
    try {
      const response = await authFetch('/api/professor/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await authFetch('/api/professor/assignments');
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await authFetch('/api/professor/analytics');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const loadAllData = async () => {
    setIsLoadingData(true);
    await Promise.all([fetchStudents(), fetchAssignments(), fetchAnalytics()]);
    setIsLoadingData(false);
  };

  // Redirect if not logged in or not a professor
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'professor')) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Load data when component mounts and user is authenticated
  useEffect(() => {
    if (user && user.role === 'professor') {
      loadAllData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || user.role !== 'professor') {
    return null;
  }

  // Mock student data
  const students = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.johnson@university.edu",
      progress: 85,
      problemsSolved: 47,
      lastActive: "2 hours ago",
      currentProblem: "Binary Search Tree",
      interviewScore: 88,
      status: "active"
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah.chen@university.edu",
      progress: 72,
      problemsSolved: 32,
      lastActive: "1 day ago",
      currentProblem: "Dynamic Programming",
      interviewScore: 76,
      status: "inactive"
    },
    {
      id: 3,
      name: "Michael Rodriguez",
      email: "michael.r@university.edu",
      progress: 91,
      problemsSolved: 63,
      lastActive: "30 minutes ago",
      currentProblem: "Graph Algorithms",
      interviewScore: 94,
      status: "active"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@university.edu",
      progress: 68,
      problemsSolved: 28,
      lastActive: "3 hours ago",
      currentProblem: "Array Manipulation",
      interviewScore: 71,
      status: "active"
    }
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
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
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'students' ? 'default' : 'outline'}
            onClick={() => setActiveTab('students')}
            className="whitespace-nowrap"
          >
            <Users className="w-4 h-4 mr-2" />
            Students
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            className="whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={activeTab === 'assignments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('assignments')}
            className="whitespace-nowrap"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Assignments
          </Button>
          <Button
            variant={activeTab === 'problems' ? 'default' : 'outline'}
            onClick={() => setActiveTab('problems')}
            className="whitespace-nowrap"
          >
            <Code className="w-4 h-4 mr-2" />
            Problem Tracking
          </Button>
        </div>

        {activeTab === 'overview' && (
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
                    <div className="text-3xl font-bold text-primary mb-2">24</div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-3xl font-bold text-success mb-2">18</div>
                    <div className="text-sm text-muted-foreground">Active This Week</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">78%</div>
                    <div className="text-sm text-muted-foreground">Average Progress</div>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-lg">
                    <div className="text-3xl font-bold text-warning mb-2">156</div>
                    <div className="text-sm text-muted-foreground">Problems Solved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Student Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Student Activity</CardTitle>
                <CardDescription>Latest progress and achievements from your students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div className="flex-1">
                      <p className="font-medium">Michael Rodriguez completed "Graph Algorithms"</p>
                      <p className="text-sm text-muted-foreground">30 minutes ago • Score: 94%</p>
                    </div>
                    <Badge className="bg-success text-success-foreground">Excellent</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Code className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Alex Johnson started "Binary Search Tree"</p>
                      <p className="text-sm text-muted-foreground">2 hours ago • In Progress</p>
                    </div>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Brain className="w-6 h-6 text-accent" />
                    <div className="flex-1">
                      <p className="font-medium">Sarah Chen completed mock interview</p>
                      <p className="text-sm text-muted-foreground">1 day ago • Technical Interview</p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">Good</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-warning" />
                    <div className="flex-1">
                      <p className="font-medium">Emily Davis needs help with "Dynamic Programming"</p>
                      <p className="text-sm text-muted-foreground">3 hours ago • Attempted 3 times</p>
                    </div>
                    <Badge variant="outline">Needs Help</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('students')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    View All Students
                  </CardTitle>
                  <CardDescription>
                    Monitor individual progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Student List
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('analytics')}>
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

        {activeTab === 'students' && (
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
                    <Card key={student.id} className="border-2 hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-primary">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{student.name}</h3>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                  {student.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Last active: {student.lastActive}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <div className="text-2xl font-bold text-primary">{student.progress}%</div>
                              <div className="text-xs text-muted-foreground">Progress</div>
                              <Progress value={student.progress} className="w-20 h-2 mt-1" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-accent">{student.problemsSolved}</div>
                              <div className="text-xs text-muted-foreground">Problems Solved</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-success">{student.interviewScore}%</div>
                              <div className="text-xs text-muted-foreground">Interview Score</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm text-muted-foreground">Currently working on: </span>
                              <span className="font-medium">{student.currentProblem}</span>
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

        {activeTab === 'analytics' && (
          <div className="space-y-6">
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
                    <h3 className="font-semibold mb-3">Overall Class Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Python Programming</span>
                          <span className="text-sm text-muted-foreground">82%</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Data Structures</span>
                          <span className="text-sm text-muted-foreground">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Algorithms</span>
                          <span className="text-sm text-muted-foreground">68%</span>
                        </div>
                        <Progress value={68} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Interview Readiness</span>
                          <span className="text-sm text-muted-foreground">71%</span>
                        </div>
                        <Progress value={71} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Performance Distribution</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-success rounded-full"></div>
                          <span>Excellent (90-100%)</span>
                        </div>
                        <span className="font-semibold">6 students</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          <span>Good (80-89%)</span>
                        </div>
                        <span className="font-semibold">8 students</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-warning rounded-full"></div>
                          <span>Average (70-79%)</span>
                        </div>
                        <span className="font-semibold">7 students</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-destructive rounded-full"></div>
                          <span>Needs Help (&lt;70%)</span>
                        </div>
                        <span className="font-semibold">3 students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-6 h-6 text-primary" />
                  Problem Tracking
                </CardTitle>
                <CardDescription>
                  Monitor which problems students are working on and their progress
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
                        <p className="text-sm text-muted-foreground">Tree data structures and traversal</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-xs text-muted-foreground">Students Working</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">8</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
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
                        <p className="text-sm text-muted-foreground">Advanced optimization techniques</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">5</div>
                      <div className="text-xs text-muted-foreground">Students Working</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">2</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <Badge className="bg-destructive text-destructive-foreground">Hard</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Two Sum Problem</h3>
                        <p className="text-sm text-muted-foreground">Array manipulation and hash maps</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">3</div>
                      <div className="text-xs text-muted-foreground">Students Working</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">21</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
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
