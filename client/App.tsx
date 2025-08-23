import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { initializeResizeObserverErrorHandling } from "@/lib/resizeObserverErrorHandler";
import Index from "./pages/Index";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import CodingProblem from "./pages/CodingProblem";
import AIQuestionGenerator from "./pages/AIQuestionGenerator";
import TechnicalInterview from "./pages/TechnicalInterview";
import BehavioralInterview from "./pages/BehavioralInterview";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import CollaborationPage from "./pages/CollaborationPage";
import WebEditorPage from "./pages/WebEditorPage";
import ResizeObserverTest from "./pages/ResizeObserverTest";

const queryClient = new QueryClient();

// Initialize ResizeObserver error handling
initializeResizeObserverErrorHandling();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route
              path="/professor/dashboard"
              element={<ProfessorDashboard />}
            />

            {/* Coding practice with real Python editor */}
            <Route
              path="/student/coding/:problemId"
              element={<CodingProblem />}
            />

            {/* AI Question Generator */}
            <Route
              path="/ai/question-generator"
              element={<AIQuestionGenerator />}
            />

            {/* Interview routes */}
            <Route
              path="/student/interview/technical"
              element={<TechnicalInterview />}
            />
            <Route
              path="/student/interview/behavioral"
              element={<BehavioralInterview />}
            />

            {/* Collaborative Programming routes */}
            <Route
              path="/student/collaboration/new"
              element={<CollaborationPage />}
            />
            <Route
              path="/student/collaboration/:sessionId"
              element={<CollaborationPage />}
            />

            {/* Enhanced Web Editor routes */}
            <Route
              path="/student/editor/:language"
              element={<WebEditorPage />}
            />

            {/* ResizeObserver Test Route */}
            <Route
              path="/test/resize-observer"
              element={<ResizeObserverTest />}
            />

            {/* Placeholder routes for future features */}
            <Route
              path="/student/collaboration"
              element={
                <Placeholder
                  title="Peer Collaboration"
                  description="Real-time collaborative coding sessions coming soon."
                  feature="pair programming and study groups"
                />
              }
            />
            <Route
              path="/professor/reports"
              element={
                <Placeholder
                  title="Detailed Reports"
                  description="Comprehensive student progress reports coming soon."
                  feature="detailed analytics and exportable reports"
                />
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
