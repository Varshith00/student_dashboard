import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Laptop, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (userType: 'student' | 'professor', email: string, password: string) => {
    setLoading(true);
    
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (userType === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/professor/dashboard');
    }
    
    setLoading(false);
  };

  const LoginForm = ({ userType }: { userType: 'student' | 'professor' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin(userType, email, password);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor={`${userType}-email`}>Email</Label>
          <Input
            id={`${userType}-email`}
            type="email"
            placeholder={userType === 'student' ? 'student@university.edu' : 'professor@university.edu'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${userType}-password`}>Password</Label>
          <div className="relative">
            <Input
              id={`${userType}-password`}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : `Sign in as ${userType === 'student' ? 'Student' : 'Professor'}`}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="p-0 h-auto">
            Contact your institution
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
          <h2 className="text-2xl font-semibold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground">Choose your account type to sign in</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Access your learning dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <Laptop className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="professor" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Professor
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="student" className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <Laptop className="w-12 h-12 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Student Portal</h3>
                  <p className="text-sm text-muted-foreground">
                    Access your coding practice, progress tracking, and mock interviews
                  </p>
                </div>
                <LoginForm userType="student" />
              </TabsContent>
              
              <TabsContent value="professor" className="space-y-4">
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <GraduationCap className="w-12 h-12 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold">Professor Portal</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor student progress and access class analytics
                  </p>
                </div>
                <LoginForm userType="professor" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/">
            <Button variant="link">← Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
