import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  MessageSquare,
  BarChart3,
  Users,
  BookOpen,
  Brain,
  Trophy,
  Clock,
  CheckCircle,
  ArrowRight,
  Laptop,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">TechPrep</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/student/login">
              <Button variant="outline">Student Login</Button>
            </Link>
            <Link to="/professor/login">
              <Button>Professor Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            Complete Learning Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            Master Tech Skills &<br />
            Launch Your Career
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Build a complete learning platform for students that combines coding
            practice, AI-powered mock interviews, progress tracking, and peer
            collaboration. Help universities prepare students for tech careers
            with one unified system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/student/login">
              <Button size="lg" className="text-lg px-8">
                Start Learning <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/professor/login">
              <Button variant="outline" size="lg" className="text-lg px-8">
                I'm a Professor <UserCheck className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">All-in-One Career Prep</h2>
            <p className="text-lg text-muted-foreground">
              Everything students need to succeed in tech careers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Code className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Coding Practice</CardTitle>
                <CardDescription>
                  Structured problems with live code execution in Python
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Interactive code editor</li>
                  <li>• Instant feedback</li>
                  <li>• Multiple difficulty levels</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Brain className="w-8 h-8 text-accent mb-2" />
                <CardTitle className="text-lg">AI Mock Interviews</CardTitle>
                <CardDescription>
                  Technical and behavioral interview simulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI-powered questions</li>
                  <li>• Real-time feedback</li>
                  <li>• Industry scenarios</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-success mb-2" />
                <CardTitle className="text-lg">Progress Tracking</CardTitle>
                <CardDescription>
                  Detailed analytics and performance insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visual dashboards</li>
                  <li>• Skill assessments</li>
                  <li>• Growth metrics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="w-8 h-8 text-warning mb-2" />
                <CardTitle className="text-lg">Peer Collaboration</CardTitle>
                <CardDescription>
                  Real-time collaboration and pair programming
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Live code sharing</li>
                  <li>• Team challenges</li>
                  <li>• Study groups</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Two Login Types Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Everyone</h2>
            <p className="text-lg text-muted-foreground">
              Separate experiences for students and professors
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="text-center">
                <Laptop className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl mb-4">For Students</CardTitle>
                <CardDescription className="text-base mb-6">
                  Track your progress, solve coding challenges, and prepare for
                  interviews
                </CardDescription>
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Personal progress dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Coding practice sessions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Mock interview preparation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Skill tracking & analytics</span>
                  </div>
                </div>
                <Link to="/student/login" className="w-full">
                  <Button className="w-full">Student Login</Button>
                </Link>
              </div>
            </Card>

            <Card className="p-8 border-2 hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="text-center">
                <GraduationCap className="w-16 h-16 text-accent mx-auto mb-4" />
                <CardTitle className="text-2xl mb-4">For Professors</CardTitle>
                <CardDescription className="text-base mb-6">
                  Monitor student progress and track class performance with
                  detailed analytics
                </CardDescription>
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Student monitoring dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Class performance analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Individual student insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Progress visualizations</span>
                  </div>
                </div>
                <Link to="/professor/login" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    Professor Login
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Coding Problems</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">1000+</div>
              <div className="text-muted-foreground">Mock Interviews</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success mb-2">50+</div>
              <div className="text-muted-foreground">Universities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-warning mb-2">95%</div>
              <div className="text-muted-foreground">Job Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>
            &copy; 2024 TechPrep. All rights reserved. Built for the future of
            tech education.
          </p>
        </div>
      </footer>
    </div>
  );
}
