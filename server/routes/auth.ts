import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'professor';
  professorId?: string; // For students - which professor they're mapped to
  createdAt: string;
}

interface AuthRequest {
  email: string;
  password: string;
  name?: string;
  role?: 'student' | 'professor';
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

const USERS_FILE = join(process.cwd(), 'server/data/users.json');

// Helper functions
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

const saveUsers = (users: User[]) => {
  try {
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
    throw new Error('Failed to save user data');
  }
};

const findUserByEmail = (email: string): User | undefined => {
  const users = loadUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Registration handler
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, role = 'student' } = req.body as AuthRequest;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      } as AuthResponse);
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      } as AuthResponse);
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      } as AuthResponse);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString()
    };

    // Save user
    const users = loadUsers();
    users.push(newUser);
    saveUsers(users);

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    } as AuthResponse);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    } as AuthResponse);
  }
};

// Login handler
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as AuthRequest;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      } as AuthResponse);
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as AuthResponse);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as AuthResponse);
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    } as AuthResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    } as AuthResponse);
  }
};

// Get current user handler
export const handleGetUser: RequestHandler = (req, res) => {
  try {
    // User info is attached by the auth middleware
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to verify JWT token
export const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Find user and attach to request
    const user = findUserByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    (req as any).user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};
