import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import CodingProblem from "./pages/CodingProblem";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/professor/dashboard" element={<ProfessorDashboard />} />

          {/* Placeholder routes for future features */}
          <Route
            path="/student/coding/:problemId"
            element={
              <Placeholder
                title="Coding Environment"
                description="Interactive coding environment with live execution coming soon."
                feature="a full-featured code editor with Python execution"
              />
            }
          />
          <Route
            path="/student/interview"
            element={
              <Placeholder
                title="AI Mock Interviews"
                description="AI-powered interview simulation coming soon."
                feature="realistic interview practice with AI"
              />
            }
          />
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
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
