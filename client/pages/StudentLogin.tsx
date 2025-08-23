import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Laptop, Eye, EyeOff, UserPlus, CheckCircle, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProfessorInfo {
  id: string;
  name: string;
  email: string;
}

export default function StudentLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [professorEmail, setProfessorEmail] = useState("");
  const [professorInfo, setProfessorInfo] = useState<ProfessorInfo | null>(null);
  const [isProfessorVerified, setIsProfessorVerified] = useState(false);
  const [isVerifyingProfessor, setIsVerifyingProfessor] = useState(false);
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/professor/dashboard');
      }
    }
  }, [user, isLoading, navigate]);

  const verifyProfessor = async () => {
    if (!professorId.trim()) {
      setError('Please enter a professor ID');
      return;
    }

    setIsVerifyingProfessor(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/professor/${professorId}`);
      const data = await response.json();

      if (data.success && data.professor) {
        setProfessorInfo(data.professor);
        setIsProfessorVerified(true);
        setError(null);
      } else {
        setError(data.message || 'Professor not found');
        setProfessorInfo(null);
        setIsProfessorVerified(false);
      }
    } catch (error) {
      setError('Failed to verify professor ID');
      setProfessorInfo(null);
      setIsProfessorVerified(false);
    } finally {
      setIsVerifyingProfessor(false);
    }
  };

  const handleAuth = async (email: string, password: string, name?: string) => {
    setError(null);

    try {
      let result;
      if (isRegistering) {
        if (!name) {
          setError('Name is required for registration');
          return;
        }
        if (!isProfessorVerified) {
          setError('Please verify your professor ID first');
          return;
        }
        
        // Use student registration endpoint
        const response = await fetch('/api/auth/student-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            password, 
            name, 
            professorId 
          }),
        });

        const data = await response.json();
        if (data.success) {
          localStorage.setItem("authToken", data.token);
          result = { success: true };
        } else {
          result = { success: false, message: data.message };
        }
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        // Navigation will be handled by the useEffect above
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  };

  const AuthForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (isRegistering && password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (isRegistering && password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      handleAuth(email, password, isRegistering ? name : undefined);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegistering && (
          <>
            {/* Professor ID Section */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <Label className="text-base font-semibold">Professor Information</Label>
              <div className="space-y-2">
                <Label htmlFor="professor-id">Professor ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="professor-id"
                    type="text"
                    placeholder="Enter your professor's ID"
                    value={professorId}
                    onChange={(e) => {
                      setProfessorId(e.target.value);
                      setIsProfessorVerified(false);
                      setProfessorInfo(null);
                    }}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={verifyProfessor}
                    disabled={isVerifyingProfessor || !professorId.trim()}
                  >
                    {isVerifyingProfessor ? (
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {isProfessorVerified && professorInfo && (
                  <div className="flex items-center gap-2 p-2 bg-success/10 border border-success/20 rounded">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <div className="text-sm">
                      <span className="font-medium text-success">Professor found: </span>
                      <span>{professorInfo.name} ({professorInfo.email})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-name">Full Name</Label>
              <Input
                id="student-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="student-email">Email</Label>
          <Input
            id="student-email"
            type="email"
            placeholder="student@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-password">Password</Label>
          <div className="relative">
            <Input
              id="student-password"
              type={showPassword ? "text" : "password"}
              placeholder={isRegistering ? "Create a password (min 6 characters)" : "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isRegistering && (
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || (isRegistering && !isProfessorVerified)}
        >
          {isLoading ? (
            isRegistering ? "Creating account..." : "Signing in..."
          ) : (
            isRegistering
              ? "Create Student Account"
              : "Sign in as Student"
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setProfessorId('');
              setProfessorInfo(null);
              setIsProfessorVerified(false);
            }}
          >
            {isRegistering ? "Sign in here" : "Create account"}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">TechPrep</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-foreground">Student Portal</h2>
          <p className="text-muted-foreground">
            {isRegistering 
              ? "Join your professor's class and start learning" 
              : "Sign in to access your learning dashboard"
            }
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              {isRegistering ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Join Your Professor's Class
                </>
              ) : (
                <>
                  <Laptop className="w-5 h-5" />
                  Sign In
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center">
              {isRegistering
                ? "Enter your professor's ID to get started"
                : "Access your coding practice and progress tracking"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 bg-primary/5 rounded-lg mb-6">
              <Laptop className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Student Portal</h3>
              <p className="text-sm text-muted-foreground">
                {isRegistering
                  ? "Get mapped to your professor and start practicing coding problems"
                  : "Access your coding practice, progress tracking, and collaboration tools"
                }
              </p>
            </div>
            
            <AuthForm />

            {isRegistering && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Need Help?</h4>
                <p className="text-xs text-muted-foreground">
                  Ask your professor for their Professor ID. This ID is needed to join their class and access assignments.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <Link to="/">
            <Button variant="link">← Back to Home</Button>
          </Link>
          <div className="text-sm text-muted-foreground">
            Are you a professor?{" "}
            <Link to="/professor/login" className="text-primary hover:underline">
              Professor Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
