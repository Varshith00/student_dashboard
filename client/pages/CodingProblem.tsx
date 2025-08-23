import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CodeEditor from "@/components/CodeEditor";
import { getProblemById } from "@/data/problems";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, GraduationCap, LogOut, Home } from "lucide-react";

export default function CodingProblem() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const problem = problemId ? getProblemById(problemId) : undefined;

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The coding problem you're looking for doesn't exist.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Link to="/student/dashboard">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/student/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">TechPrep</h1>
                <p className="text-xs text-muted-foreground">Coding Practice</p>
              </div>
            </Link>
            
            <div className="h-6 w-px bg-border" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Student Portal</p>
              <p className="text-xs text-muted-foreground">Keep practicing!</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor problem={problem} />
      </div>
    </div>
  );
}
