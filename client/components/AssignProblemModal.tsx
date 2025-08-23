import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { authFetch } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Code,
  Users,
  Calendar,
  Plus,
  Target,
  CheckCircle,
  X,
  Send,
} from "lucide-react";
import { problems } from "@/data/problems";

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  problemsSolved: number;
  status: "active" | "inactive";
}

interface AssignProblemModalProps {
  students: Student[];
  onAssignmentCreated: () => void;
}

export default function AssignProblemModal({
  students,
  onAssignmentCreated,
}: AssignProblemModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStep, setCurrentStep] = useState<
    "problem" | "students" | "details"
  >("problem");

  const filteredProblems = problems.filter(
    (problem) =>
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedProblemData = problems.find((p) => p.id === selectedProblem);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  const handleAssignProblem = async () => {
    if (!selectedProblem || selectedStudents.length === 0) return;

    setIsAssigning(true);

    try {
      const endpoint =
        selectedStudents.length === 1
          ? "/api/professor/assign-problem"
          : "/api/professor/bulk-assign-problem";

      const body =
        selectedStudents.length === 1
          ? {
              studentId: selectedStudents[0],
              problemId: selectedProblem,
              dueDate: dueDate || undefined,
            }
          : {
              studentIds: selectedStudents,
              problemId: selectedProblem,
              dueDate: dueDate || undefined,
            };

      const response = await authFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        onAssignmentCreated();
        setIsOpen(false);
        resetForm();
      } else {
        console.error("Failed to assign problem:", data.error);
      }
    } catch (error) {
      console.error("Assignment error:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const resetForm = () => {
    setSelectedProblem("");
    setSelectedStudents([]);
    setDueDate("");
    setSearchQuery("");
    setCurrentStep("problem");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success text-success-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "Hard":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStepColor = (step: string) => {
    if (step === "problem" && selectedProblem) return "text-success";
    if (step === "students" && selectedStudents.length > 0)
      return "text-success";
    if (step === "details") return "text-muted-foreground";
    return "text-muted-foreground";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Assign Problem
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-6xl h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Assign Coding Problem
          </DialogTitle>
          <DialogDescription>
            Assign coding problems to your students with optional due dates
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${selectedProblem ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
            >
              1
            </div>
            <span className={`text-sm font-medium ${getStepColor("problem")}`}>
              Select Problem
            </span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${selectedStudents.length > 0 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
            >
              2
            </div>
            <span className={`text-sm font-medium ${getStepColor("students")}`}>
              Select Students
            </span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Confirm & Assign
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Problem Selection */}
            <Card className={selectedProblem ? "border-success" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  1. Select Problem
                  {selectedProblem && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  Choose a coding problem to assign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Input
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                  />
                </div>

                <ScrollArea className="h-48">
                  <div className="space-y-2 pr-2">
                    {filteredProblems.map((problem) => (
                      <div
                        key={problem.id}
                        className={`p-2 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedProblem === problem.id
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() => setSelectedProblem(problem.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{problem.title}</h4>
                          <Badge
                            className={`text-xs ${getDifficultyColor(problem.difficulty)}`}
                          >
                            {problem.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {problem.tags.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedProblemData && (
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">
                      Selected: {selectedProblemData.title}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Difficulty: {selectedProblemData.difficulty} • Tags:{" "}
                      {selectedProblemData.tags.join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Selection */}
            <Card className={selectedStudents.length > 0 ? "border-success" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  2. Select Students
                  {selectedStudents.length > 0 && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  Choose students to assign this problem to
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedStudents.length === filteredStudents.length &&
                      filteredStudents.length > 0
                    }
                    onCheckedChange={handleSelectAllStudents}
                  />
                  <Label className="text-sm">
                    Select All Students ({filteredStudents.length})
                  </Label>
                </div>

                <ScrollArea className="h-48">
                  <div className="space-y-2 pr-2">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`p-2 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedStudents.includes(student.id)
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() => handleStudentToggle(student.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() =>
                              handleStudentToggle(student.id)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">{student.name}</h4>
                              <Badge
                                variant={
                                  student.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs ml-2"
                              >
                                {student.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {student.email}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>Progress: {student.progress}%</span>
                              <span>Solved: {student.problemsSolved}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedStudents.length > 0 && (
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium mb-1">
                      Selected: {selectedStudents.length} student
                      {selectedStudents.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedStudents.slice(0, 3).map((studentId) => {
                        const student = students.find((s) => s.id === studentId);
                        return (
                          <Badge
                            key={studentId}
                            variant="secondary"
                            className="text-xs"
                          >
                            {student?.name}
                          </Badge>
                        );
                      })}
                      {selectedStudents.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{selectedStudents.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assignment Details */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-success" />
                3. Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate" className="text-sm">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="h-8"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <Label className="text-sm text-muted-foreground mb-2">
                    Assignment Summary
                  </Label>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Problem:</strong>{" "}
                      {selectedProblemData?.title || "None selected"}
                    </p>
                    <p>
                      <strong>Students:</strong> {selectedStudents.length}{" "}
                      selected
                    </p>
                    <p>
                      <strong>Due:</strong>{" "}
                      {dueDate
                        ? new Date(dueDate).toLocaleDateString()
                        : "No due date"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignProblem}
            disabled={
              !selectedProblem || selectedStudents.length === 0 || isAssigning
            }
          >
            {isAssigning ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Assigning...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Assign Problem
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
