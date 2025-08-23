import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/contexts/AuthContext";
import {
  BarChart3,
  TrendingUp,
  Brain,
  Code,
  Star,
  Target,
  Clock,
  CheckCircle,
  Trophy,
  Lightbulb,
  MessageCircle,
  Calendar,
  Award,
  ThumbsUp,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface InterviewScore {
  id: string;
  type: 'technical' | 'behavioral';
  score: number;
  date: string;
  feedback: string;
  duration: number;
  difficulty?: string;
  focus: string[];
  strengths: string[];
  improvements: string[];
}

interface StudentStats {
  totalInterviews: number;
  averageScore: number;
  technicalAverage: number;
  behavioralAverage: number;
  totalTimeSpent: number;
  problemsSolved: number;
  currentStreak: number;
  skillProgress: {
    [key: string]: number;
  };
  recentScores: number[];
  improvementTrend: 'up' | 'down' | 'stable';
}

export default function StudentAnalyticsDashboard() {
  const [scores, setScores] = useState<InterviewScore[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - in production, fetch from API
  useEffect(() => {
    const mockScores: InterviewScore[] = [
      {
        id: '1',
        type: 'technical',
        score: 85,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        feedback: 'Strong understanding of algorithms and data structures. Good problem-solving approach.',
        duration: 45,
        difficulty: 'mid',
        focus: ['algorithms', 'data-structures'],
        strengths: ['Clear thinking', 'Good communication'],
        improvements: ['Edge case handling', 'Time complexity analysis']
      },
      {
        id: '2',
        type: 'behavioral',
        score: 78,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        feedback: 'Good use of STAR method. Could provide more specific examples.',
        duration: 30,
        focus: ['critical-thinking', 'communication'],
        strengths: ['Structured responses', 'Professional demeanor'],
        improvements: ['More specific examples', 'Quantify achievements']
      },
      {
        id: '3',
        type: 'technical',
        score: 92,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        feedback: 'Excellent problem-solving skills and code quality. Very impressive performance.',
        duration: 42,
        difficulty: 'senior',
        focus: ['system-design', 'optimization'],
        strengths: ['System thinking', 'Optimization skills', 'Clean code'],
        improvements: ['Documentation', 'Testing approach']
      }
    ];

    const mockStats: StudentStats = {
      totalInterviews: 3,
      averageScore: 85,
      technicalAverage: 88.5,
      behavioralAverage: 78,
      totalTimeSpent: 117,
      problemsSolved: 47,
      currentStreak: 5,
      skillProgress: {
        'Technical Knowledge': 88,
        'Problem Solving': 85,
        'Communication': 82,
        'System Design': 75,
        'Critical Thinking': 78,
        'Code Quality': 90
      },
      recentScores: [92, 85, 78],
      improvementTrend: 'up'
    };

    setScores(mockScores);
    setStats(mockStats);
    setIsLoading(false);
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-success" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-primary';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, label: 'Excellent' };
    if (score >= 80) return { variant: 'secondary' as const, label: 'Good' };
    if (score >= 70) return { variant: 'outline' as const, label: 'Average' };
    return { variant: 'destructive' as const, label: 'Needs Improvement' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${getScoreColor(stats?.averageScore || 0)}`}>
                    {stats?.averageScore || 0}%
                  </p>
                  {stats?.improvementTrend && getTrendIcon(stats.improvementTrend)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                <p className="text-2xl font-bold">{stats?.totalInterviews || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-warning" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Time Invested</p>
                <p className="text-2xl font-bold">{Math.round((stats?.totalTimeSpent || 0) / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Interview Performance
            </CardTitle>
            <CardDescription>
              Your performance breakdown by interview type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Technical Interviews</span>
                  <span className={`text-sm font-semibold ${getScoreColor(stats?.technicalAverage || 0)}`}>
                    {stats?.technicalAverage || 0}%
                  </span>
                </div>
                <Progress value={stats?.technicalAverage || 0} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Behavioral Interviews</span>
                  <span className={`text-sm font-semibold ${getScoreColor(stats?.behavioralAverage || 0)}`}>
                    {stats?.behavioralAverage || 0}%
                  </span>
                </div>
                <Progress value={stats?.behavioralAverage || 0} className="h-3" />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Recent Scores Trend</h4>
              <div className="flex items-center gap-2">
                {stats?.recentScores?.map((score, index) => (
                  <div key={index} className="flex-1">
                    <div className={`h-2 rounded-full ${
                      score >= 90 ? 'bg-success' :
                      score >= 80 ? 'bg-primary' :
                      score >= 70 ? 'bg-warning' : 'bg-destructive'
                    }`} style={{ height: `${(score / 100) * 40 + 10}px` }} />
                    <p className="text-xs text-center mt-1">{score}%</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Skill Progress
            </CardTitle>
            <CardDescription>
              Your improvement across different skill areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.skillProgress || {}).map(([skill, progress]) => (
                <div key={skill}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{skill}</span>
                    <span className={`text-sm font-semibold ${getScoreColor(progress)}`}>
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Interview History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Recent Interview Results
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your latest interview performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scores.map((score) => {
              const scoreBadge = getScoreBadge(score.score);
              return (
                <Card key={score.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          score.type === 'technical' ? 'bg-primary/10' : 'bg-accent/10'
                        }`}>
                          {score.type === 'technical' ? (
                            <Code className="w-6 h-6 text-primary" />
                          ) : (
                            <MessageCircle className="w-6 h-6 text-accent" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold capitalize">
                              {score.type} Interview
                            </h3>
                            <Badge variant={scoreBadge.variant}>
                              {scoreBadge.label}
                            </Badge>
                            {score.difficulty && (
                              <Badge variant="outline">
                                {score.difficulty} level
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {score.feedback}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(score.date).toLocaleDateString()}</span>
                            <span>{score.duration} minutes</span>
                            <span>Focus: {score.focus.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
                          {score.score}%
                        </div>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    </div>
                    
                    {(score.strengths.length > 0 || score.improvements.length > 0) && (
                      <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4">
                        {score.strengths.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm text-success mb-2 flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              Strengths
                            </h5>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {score.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="w-1 h-1 rounded-full bg-success mt-1.5" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {score.improvements.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm text-warning mb-2 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Areas for Improvement
                            </h5>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {score.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="w-1 h-1 rounded-full bg-warning mt-1.5" />
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-warning" />
            Achievements & Milestones
          </CardTitle>
          <CardDescription>
            Your interview and learning achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-success/5 rounded-lg">
              <Star className="w-8 h-8 text-success" />
              <div>
                <p className="font-semibold">First Interview</p>
                <p className="text-sm text-muted-foreground">Completed your first mock interview</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold">Problem Solver</p>
                <p className="text-sm text-muted-foreground">Solved 50+ coding problems</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
              <Trophy className="w-8 h-8 text-accent" />
              <div>
                <p className="font-semibold">High Scorer</p>
                <p className="text-sm text-muted-foreground">Achieved 90+ score in interview</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
