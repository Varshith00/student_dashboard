import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// User interface matching auth.ts
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'professor';
  professorId?: string; // For students - which professor they're mapped to
  createdAt: string;
}

const USERS_FILE = join(process.cwd(), 'server/data/users.json');

// Helper functions for user data
const loadUsers = (): User[] => {
  try {
    if (!existsSync(USERS_FILE)) {
      return [];
    }
    const data = readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

// In-memory storage for demo (in production, use a proper database)
interface Assignment {
  id: string;
  professorId: string;
  studentId: string;
  problemId: string;
  assignedDate: string;
  dueDate?: string;
  status: "assigned" | "in_progress" | "completed" | "overdue";
  score?: number;
  completedDate?: string;
  attempts: number;
  timeSpent: number; // in minutes
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  totalTimeSpent: number;
  lastActive: string;
  currentAssignments: Assignment[];
  recentActivity: {
    type: "problem_started" | "problem_completed" | "interview_completed";
    problemId?: string;
    score?: number;
    timestamp: string;
  }[];
}

// Mock data storage - Add demo assignments for our demo students
const assignments: Assignment[] = [
  {
    id: "assign_1",
    professorId: "demo-professor-001",
    studentId: "17559437070308qm4bodu", // demostudent@demo.com ID
    problemId: "two-sum",
    assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    status: "assigned",
    attempts: 0,
    timeSpent: 0,
  },
  {
    id: "assign_2",
    professorId: "demo-professor-001",
    studentId: "17559437070308qm4bodu", // demostudent@demo.com ID
    problemId: "binary-search",
    assignedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
    status: "in_progress",
    attempts: 1,
    timeSpent: 30,
  },
  {
    id: "assign_3",
    professorId: "demo-professor-001",
    studentId: "17559437070308qm4bodu", // demostudent@demo.com ID
    problemId: "valid-parentheses",
    assignedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    status: "completed",
    score: 92,
    completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    attempts: 1,
    timeSpent: 25,
  },
];

const studentProfiles = [
  {
    id: "17559437070308qm4bodu", // demostudent@demo.com actual ID
    name: "Demo Student",
    email: "demostudent@demo.com",
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: "student_1",
    name: "Alex Johnson",
    email: "alex.johnson@university.edu",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "student_2",
    name: "Sarah Chen",
    email: "sarah.chen@university.edu",
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "student_3",
    name: "Michael Rodriguez",
    email: "michael.r@university.edu",
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: "student_4",
    name: "Emily Davis",
    email: "emily.davis@university.edu",
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
];

// Get all students for a professor
export const handleGetStudents: RequestHandler = async (req, res) => {
  try {
    const professor = (req as any).user;

    if (professor.role !== 'professor') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Only professors can view students."
      });
    }

    // Load all users and filter students mapped to this professor
    const allUsers = loadUsers();
    const mappedStudents = allUsers.filter(
      user => user.role === 'student' && user.professorId === professor.id
    );

    // Process each student's data
    const students = mappedStudents.map((student) => {
      const studentAssignments = assignments.filter(
        (a) => a.studentId === student.id && a.professorId === professor.id,
      );
      const completedAssignments = studentAssignments.filter(
        (a) => a.status === "completed",
      );
      const averageScore =
        completedAssignments.length > 0
          ? completedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) /
            completedAssignments.length
          : 0;
      const totalTimeSpent = studentAssignments.reduce(
        (sum, a) => sum + a.timeSpent,
        0,
      );

      // Calculate last active (for demo, using created date with some random offset)
      const lastActiveTime = new Date(student.createdAt);
      lastActiveTime.setTime(lastActiveTime.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Add random time up to 7 days

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        progress: Math.round(averageScore),
        problemsSolved: completedAssignments.length,
        totalAssignments: studentAssignments.length,
        averageScore: Math.round(averageScore),
        totalTimeSpent,
        interviewScore: Math.round(75 + Math.random() * 25), // Mock interview score
        status:
          lastActiveTime > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ? "active"
            : "inactive",
        lastActive: lastActiveTime.toLocaleDateString(),
        currentProblem: studentAssignments.find(a => a.status === 'in_progress')?.problemId ||
                      (studentAssignments.length > 0 ? "No active problem" : "Not started"),
        currentAssignments: studentAssignments.filter(
          (a) => a.status !== "completed",
        ),
        joinedAt: student.createdAt,
      };
    });

    res.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch students",
    });
  }
};

// Assign a problem to a student
export const handleAssignProblem: RequestHandler = async (req, res) => {
  try {
    const professor = (req as any).user;
    const { studentId, problemId, dueDate } = req.body;

    if (!studentId || !problemId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: studentId, problemId",
      });
    }

    const assignmentId = `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newAssignment: Assignment = {
      id: assignmentId,
      professorId: professor.id,
      studentId,
      problemId,
      assignedDate: new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      status: "assigned",
      attempts: 0,
      timeSpent: 0,
    };

    assignments.push(newAssignment);

    res.json({
      success: true,
      assignment: newAssignment,
      message: "Problem assigned successfully",
    });
  } catch (error) {
    console.error("Assign problem error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to assign problem",
    });
  }
};

// Assign problem to multiple students
export const handleBulkAssignProblem: RequestHandler = async (req, res) => {
  try {
    const professor = (req as any).user;
    const { studentIds, problemId, dueDate } = req.body;

    if (
      !studentIds ||
      !Array.isArray(studentIds) ||
      studentIds.length === 0 ||
      !problemId
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: studentIds (array), problemId",
      });
    }

    const newAssignments: Assignment[] = [];

    for (const studentId of studentIds) {
      const assignmentId = `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newAssignment: Assignment = {
        id: assignmentId,
        professorId: professor.id,
        studentId,
        problemId,
        assignedDate: new Date().toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        status: "assigned",
        attempts: 0,
        timeSpent: 0,
      };

      assignments.push(newAssignment);
      newAssignments.push(newAssignment);
    }

    res.json({
      success: true,
      assignments: newAssignments,
      message: `Problem assigned to ${studentIds.length} students successfully`,
    });
  } catch (error) {
    console.error("Bulk assign problem error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to assign problem to students",
    });
  }
};

// Get assignments for a professor
export const handleGetAssignments: RequestHandler = async (req, res) => {
  try {
    const professor = (req as any).user;

    if (professor.role !== 'professor') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Only professors can view assignments."
      });
    }

    const professorAssignments = assignments.filter(
      (a) => a.professorId === professor.id,
    );

    // Load all users to get student names
    const allUsers = loadUsers();

    // Enrich assignments with student info
    const enrichedAssignments = professorAssignments.map((assignment) => {
      const student = allUsers.find(
        (user) => user.id === assignment.studentId && user.role === 'student',
      );
      return {
        ...assignment,
        studentName: student?.name || "Unknown Student",
        studentEmail: student?.email || "Unknown Email",
      };
    });

    res.json({
      success: true,
      assignments: enrichedAssignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch assignments",
    });
  }
};

// Get detailed analytics for professor's class
export const handleGetClassAnalytics: RequestHandler = async (req, res) => {
  try {
    const professor = (req as any).user;

    if (professor.role !== 'professor') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Only professors can view analytics."
      });
    }

    // Get students mapped to this professor
    const allUsers = loadUsers();
    const mappedStudents = allUsers.filter(
      user => user.role === 'student' && user.professorId === professor.id
    );

    const professorAssignments = assignments.filter(
      (a) => a.professorId === professor.id,
    );

    const completedAssignments = professorAssignments.filter(
      (a) => a.status === "completed",
    );

    const analytics = {
      totalStudents: mappedStudents.length,
      totalAssignments: professorAssignments.length,
      completedAssignments: completedAssignments.length,
      inProgressAssignments: professorAssignments.filter(
        (a) => a.status === "in_progress",
      ).length,
      overdueAssignments: professorAssignments.filter(
        (a) =>
          a.status !== "completed" &&
          a.dueDate &&
          new Date(a.dueDate) < new Date(),
      ).length,
      averageScore: completedAssignments.length > 0
        ? completedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssignments.length
        : 0,
      totalTimeSpent: professorAssignments.reduce(
        (sum, a) => sum + a.timeSpent,
        0,
      ),
      studentProgress: mappedStudents.map((student) => {
        const studentAssignments = professorAssignments.filter(
          (a) => a.studentId === student.id,
        );
        const studentCompletedAssignments = studentAssignments.filter(
          (a) => a.status === "completed",
        );

        return {
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          totalAssignments: studentAssignments.length,
          completedAssignments: studentCompletedAssignments.length,
          averageScore:
            studentCompletedAssignments.length > 0
              ? studentCompletedAssignments.reduce(
                  (sum, a) => sum + (a.score || 0),
                  0,
                ) / studentCompletedAssignments.length
              : 0,
          totalTimeSpent: studentAssignments.reduce(
            (sum, a) => sum + a.timeSpent,
            0,
          ),
          lastActive: student.createdAt, // Using creation date for demo
        };
      }),
      problemStats: {},
    };

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get class analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch class analytics",
    });
  }
};

// Get student details
export const handleGetStudentDetails: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    const professor = (req as any).user;

    const student = studentProfiles.find((s) => s.id === studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    const studentAssignments = assignments.filter(
      (a) => a.studentId === studentId && a.professorId === professor.id,
    );

    const completedAssignments = studentAssignments.filter(
      (a) => a.status === "completed",
    );
    const inProgressAssignments = studentAssignments.filter(
      (a) => a.status === "in_progress",
    );
    const overdueAssignments = studentAssignments.filter(
      (a) =>
        a.status !== "completed" &&
        a.dueDate &&
        new Date(a.dueDate) < new Date(),
    );

    const averageScore =
      completedAssignments.length > 0
        ? completedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) /
          completedAssignments.length
        : 0;

    const totalTimeSpent = studentAssignments.reduce(
      (sum, a) => sum + a.timeSpent,
      0,
    );

    const studentDetails = {
      ...student,
      assignments: studentAssignments,
      stats: {
        totalAssignments: studentAssignments.length,
        completedAssignments: completedAssignments.length,
        inProgressAssignments: inProgressAssignments.length,
        overdueAssignments: overdueAssignments.length,
        averageScore: Math.round(averageScore),
        totalTimeSpent,
        completionRate:
          studentAssignments.length > 0
            ? Math.round(
                (completedAssignments.length / studentAssignments.length) * 100,
              )
            : 0,
      },
    };

    res.json({
      success: true,
      student: studentDetails,
    });
  } catch (error) {
    console.error("Get student details error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch student details",
    });
  }
};

// Update assignment status (when student works on problems)
export const handleUpdateAssignmentProgress: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { assignmentId } = req.params;
    const { status, score, timeSpent } = req.body;

    const assignmentIndex = assignments.findIndex((a) => a.id === assignmentId);
    if (assignmentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    const assignment = assignments[assignmentIndex];

    // Update assignment
    if (status) assignment.status = status;
    if (score !== undefined) assignment.score = score;
    if (timeSpent !== undefined) assignment.timeSpent += timeSpent;
    if (status === "completed")
      assignment.completedDate = new Date().toISOString();

    assignment.attempts += 1;

    assignments[assignmentIndex] = assignment;

    res.json({
      success: true,
      assignment,
      message: "Assignment progress updated",
    });
  } catch (error) {
    console.error("Update assignment progress error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update assignment progress",
    });
  }
};

// Delete assignment
export const handleDeleteAssignment: RequestHandler = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const professor = (req as any).user;

    const assignmentIndex = assignments.findIndex(
      (a) => a.id === assignmentId && a.professorId === professor.id,
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    assignments.splice(assignmentIndex, 1);

    res.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete assignment",
    });
  }
};

// Get assignments for a student
export const handleGetStudentAssignments: RequestHandler = async (req, res) => {
  try {
    const student = (req as any).user;

    if (student.role !== "student") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Only students can view their assignments.",
      });
    }

    // Find assignments for this student
    const studentAssignments = assignments.filter(
      (a) => a.studentId === student.id,
    );

    // Enrich assignments with professor info
    const enrichedAssignments = studentAssignments.map((assignment) => {
      // In a real app, you'd fetch professor details from the database
      const professor = {
        id: assignment.professorId,
        name: assignment.professorId === "prof_1" ? "Dr. Smith" : "Dr. Johnson",
        email:
          assignment.professorId === "prof_1"
            ? "dr.smith@university.edu"
            : "dr.johnson@university.edu",
      };

      return {
        ...assignment,
        professorName: professor.name,
        professorEmail: professor.email,
        isOverdue:
          assignment.dueDate &&
          new Date(assignment.dueDate) < new Date() &&
          assignment.status !== "completed",
      };
    });

    // Sort by assigned date (newest first)
    enrichedAssignments.sort(
      (a, b) =>
        new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime(),
    );

    res.json({
      success: true,
      assignments: enrichedAssignments,
      summary: {
        total: enrichedAssignments.length,
        pending: enrichedAssignments.filter((a) => a.status === "assigned")
          .length,
        inProgress: enrichedAssignments.filter(
          (a) => a.status === "in_progress",
        ).length,
        completed: enrichedAssignments.filter((a) => a.status === "completed")
          .length,
        overdue: enrichedAssignments.filter((a) => a.isOverdue).length,
      },
    });
  } catch (error) {
    console.error("Get student assignments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch assignments",
    });
  }
};
