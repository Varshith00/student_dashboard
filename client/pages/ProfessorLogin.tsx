import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { authFetch, useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  User,
  Lock,
  ArrowRight,
  Users,
  BarChart3,
  Calendar,
  Award,
} from "lucide-react";

export default function ProfessorLogin() {
  const navigate = useNavigate();
  const { user, login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in as professor
  useEffect(() => {
    if (user && user.role === "professor") {
      navigate("/professor/dashboard");
    } else if (user && user.role === "student") {
      navigate("/student/dashboard");
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await authFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.user.role === "professor") {
        login(data.user, data.token);
        navigate("/professor/dashboard");
      } else if (data.success && data.user.role !== "professor") {
        setError(
          "This login is for professors only. Please use the student login.",
        );
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">TechPrep</h1>
              <p className="text-sm text-muted-foreground">Professor Portal</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/student/login">
              <Button variant="outline">Student Login</Button>
            </Link>
            <Link to="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Login Form */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <Badge className="mb-4" variant="secondary">
                Professor Access
              </Badge>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-4">
                Welcome Back, Professor!
              </h1>
              <p className="text-xl text-muted-foreground">
                Monitor student progress, assign problems, and track class
                performance with comprehensive analytics.
              </p>
            </div>

            <Card className="w-full max-w-md mx-auto lg:mx-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" />
                  Professor Login
                </CardTitle>
                <CardDescription>
                  Access your teaching dashboard and manage student progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="professor@university.edu"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Need account access?{" "}
                    <Button variant="link" className="p-0 h-auto">
                      Contact IT Support
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Demo Credentials */}
            <Card className="max-w-md mx-auto lg:mx-0 bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">
                  Demo Professor Account:
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Email:</strong> professor@demo.com
                  </p>
                  <p>
                    <strong>Password:</strong> professor123
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Features */}
          <div className="space-y-6">
            <div className="grid gap-6">
              <Card className="border-2 hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Student Management
                      </h3>
                      <p className="text-muted-foreground">
                        Monitor individual student progress, track completion
                        rates, and identify students who need help.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Assignment System
                      </h3>
                      <p className="text-muted-foreground">
                        Assign coding problems to individual students or entire
                        classes with due dates and automatic tracking.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-success/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Analytics Dashboard
                      </h3>
                      <p className="text-muted-foreground">
                        Comprehensive analytics on class performance, completion
                        rates, and detailed student insights.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-warning/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Progress Monitoring
                      </h3>
                      <p className="text-muted-foreground">
                        Real-time monitoring of student interview performance
                        and coding problem completion.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
