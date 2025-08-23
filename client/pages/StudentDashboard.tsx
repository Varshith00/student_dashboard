import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { problems } from "@/data/problems";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not logged in or not a student
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'student')) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

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

  if (!user || user.role !== 'student') {
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
            variant={activeTab === 'coding' ? 'default' : 'outline'}
            onClick={() => setActiveTab('coding')}
            className="whitespace-nowrap"
          >
            <Code className="w-4 h-4 mr-2" />
            Coding Practice
          </Button>
          <Button
            variant={activeTab === 'interviews' ? 'default' : 'outline'}
            onClick={() => setActiveTab('interviews')}
            className="whitespace-nowrap"
          >
            <Brain className="w-4 h-4 mr-2" />
            Mock Interviews
          </Button>
          <Button
            variant={activeTab === 'progress' ? 'default' : 'outline'}
            onClick={() => setActiveTab('progress')}
            className="whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </Button>
        </div>

        {activeTab === 'overview' && (
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
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">47</div>
                    <div className="text-sm text-muted-foreground">Problems Solved</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">12</div>
                    <div className="text-sm text-muted-foreground">Mock Interviews</div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-3xl font-bold text-success mb-2">85%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      onClick={() => setActiveTab('coding')}
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
                  <CardDescription>
                    Join collaborative sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Find Partners
                  </Button>
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
                    <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
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
                <CardDescription>Your latest progress and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div className="flex-1">
                      <p className="font-medium">Completed "Binary Search Tree" problem</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Brain className="w-6 h-6 text-accent" />
                    <div className="flex-1">
                      <p className="font-medium">Mock interview: Technical Round</p>
                      <p className="text-sm text-muted-foreground">Yesterday</p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">Excellent</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Trophy className="w-6 h-6 text-warning" />
                    <div className="flex-1">
                      <p className="font-medium">Achieved "Problem Solver" badge</p>
                      <p className="text-sm text-muted-foreground">3 days ago</p>
                    </div>
                    <Badge variant="outline">New</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'coding' && (
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
                        case 'Easy': return 'bg-success text-success-foreground';
                        case 'Medium': return 'bg-warning text-warning-foreground';
                        case 'Hard': return 'bg-destructive text-destructive-foreground';
                        default: return 'bg-secondary text-secondary-foreground';
                      }
                    };

                    const getIconColor = () => {
                      switch (problem.difficulty) {
                        case 'Easy': return 'text-success';
                        case 'Medium': return 'text-warning';
                        case 'Hard': return 'text-destructive';
                        default: return 'text-primary';
                      }
                    };

                    return (
                      <div key={problem.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 bg-${problem.difficulty === 'Easy' ? 'success' : problem.difficulty === 'Medium' ? 'warning' : 'destructive'}/10 rounded-lg flex items-center justify-center`}>
                            <Target className={`w-6 h-6 ${getIconColor()}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{problem.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {problem.tags.join(', ')}
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

        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-accent" />
                  AI-Powered Mock Interviews
                </CardTitle>
                <CardDescription>
                  Practice technical and behavioral interviews with AI that mimics real company processes
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
                      <Link to="/student/interview/technical" className="w-full">
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
                      <Link to="/student/interview/behavioral" className="w-full">
                        <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
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
                      <h4 className="font-medium text-foreground mb-1">Technical Interview:</h4>
                      <ul className="space-y-1">
                        <li>• Real-time problem solving</li>
                        <li>• Code explanation and optimization</li>
                        <li>• System design discussions</li>
                        <li>• Follow-up questions based on your answers</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Behavioral Interview:</h4>
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

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-success" />
                  Your Progress Analytics
                </CardTitle>
                <CardDescription>
                  Detailed insights into your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Skill Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Python Programming</span>
                          <span className="text-sm text-muted-foreground">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Data Structures</span>
                          <span className="text-sm text-muted-foreground">72%</span>
                        </div>
                        <Progress value={72} className="h-2" />
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
                          <span className="text-sm">Interview Skills</span>
                          <span className="text-sm text-muted-foreground">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Weekly Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <span>Study Time</span>
                        </div>
                        <span className="font-semibold">12.5 hours</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span>Problems Solved</span>
                        </div>
                        <span className="font-semibold">8</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Brain className="w-5 h-5 text-accent" />
                          <span>Interviews</span>
                        </div>
                        <span className="font-semibold">3</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5 text-warning" />
                          <span>Achievements</span>
                        </div>
                        <span className="font-semibold">2</span>
                      </div>
                    </div>
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
