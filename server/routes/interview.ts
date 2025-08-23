import { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface InterviewSession {
  id: string;
  userId: string;
  type: 'technical' | 'behavioral';
  difficulty: 'junior' | 'mid' | 'senior';
  focus: string[];
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed';
  messages: Message[];
  score?: number;
  feedback?: string;
}

interface Message {
  id: string;
  role: 'user' | 'interviewer';
  content: string;
  timestamp: string;
  type?: 'question' | 'follow-up' | 'evaluation' | 'final';
}

// In-memory storage for demo (in production, use a proper database)
const activeSessions: Map<string, InterviewSession> = new Map();

// Technical Interview Handlers
export const handleStartTechnicalInterview: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { difficulty = 'mid', focus = ['algorithms', 'data-structures'] } = req.body;

    const sessionId = `tech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate initial interview question
    const prompt = `
You are a technical interviewer at a mid-tier technology company conducting a ${difficulty}-level technical interview.

Interview Focus Areas: ${focus.join(', ')}
Candidate Experience Level: ${difficulty}

Start the interview with a casual "hey" greeting and first technical question. Your role is to:
1. Ask progressively challenging technical questions
2. Probe deeper based on candidate responses
3. Test problem-solving approach, not just correct answers
4. Maintain a friendly but professional tone
5. Focus on thought process and communication

Begin the interview now with just "hey" as your greeting and your first technical question. Keep it conversational and engaging.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const initialMessage = response.text();

    const initialBotMessage: Message = {
      id: '1',
      role: 'interviewer',
      content: initialMessage,
      timestamp: new Date().toISOString(),
      type: 'question'
    };

    const session: InterviewSession = {
      id: sessionId,
      userId: user.id,
      type: 'technical',
      difficulty,
      focus,
      startTime: new Date().toISOString(),
      status: 'active',
      messages: [initialBotMessage]
    };

    activeSessions.set(sessionId, session);

    res.json({
      success: true,
      session: {
        id: session.id,
        difficulty: session.difficulty,
        focus: session.focus,
        startTime: session.startTime,
        status: session.status,
        messages: session.messages
      }
    });

  } catch (error) {
    console.error('Start technical interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start technical interview'
    });
  }
};

export const handleTechnicalInterviewMessage: RequestHandler = async (req, res) => {
  try {
    const { sessionId, message, messageHistory = [] } = req.body;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation context
    const conversationHistory = messageHistory.map((msg: Message) => 
      `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
    ).join('\n\n');

    const prompt = `
You are continuing a ${session.difficulty}-level technical interview. The conversation so far:

${conversationHistory}

Candidate: ${message}

As the interviewer, respond appropriately:
1. If the answer is good, acknowledge it and ask a follow-up or new question
2. If the answer needs improvement, gently probe deeper or guide them
3. Ask clarifying questions about their thought process
4. Gradually increase difficulty if they're doing well
5. Keep the conversation natural and engaging
6. Focus on problem-solving approach, not just correctness

Interview Focus: ${session.focus.join(', ')}

Provide your next response as the interviewer:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const interviewerResponse = response.text();

    // Determine response type based on content
    let responseType: 'question' | 'follow-up' | 'evaluation' = 'follow-up';
    if (interviewerResponse.includes('?')) {
      responseType = 'question';
    }

    res.json({
      success: true,
      response: interviewerResponse,
      type: responseType
    });

  } catch (error) {
    console.error('Technical interview message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process interview message'
    });
  }
};

export const handleEndTechnicalInterview: RequestHandler = async (req, res) => {
  try {
    const { sessionId, messageHistory = [] } = req.body;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate evaluation
    const conversationHistory = messageHistory.map((msg: Message) => 
      `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
    ).join('\n\n');

    const evaluationPrompt = `
Evaluate this ${session.difficulty}-level technical interview:

${conversationHistory}

Provide a JSON response with this structure:
{
  "score": "Number from 0-100",
  "feedback": "Detailed feedback covering: technical knowledge, problem-solving approach, communication skills, areas for improvement, and specific strengths. Be constructive and encouraging."
}

Evaluation criteria for ${session.difficulty} level:
- Technical knowledge depth
- Problem-solving approach
- Code quality and structure
- Communication and explanation skills
- Handling of follow-up questions
- Time management

Be fair but honest in your assessment. Provide actionable feedback.
`;

    const result = await model.generateContent(evaluationPrompt);
    const response = await result.response;
    const evaluationText = response.text();

    // Extract JSON from response
    const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
    let score = 75;
    let feedback = "Good technical interview performance with room for improvement.";
    
    if (jsonMatch) {
      try {
        const evaluation = JSON.parse(jsonMatch[0]);
        score = parseInt(evaluation.score) || 75;
        feedback = evaluation.feedback || feedback;
      } catch (e) {
        console.warn('Failed to parse evaluation JSON:', e);
      }
    }

    // Update session
    session.status = 'completed';
    session.endTime = new Date().toISOString();
    session.score = score;
    session.feedback = feedback;

    activeSessions.set(sessionId, session);

    res.json({
      success: true,
      score,
      feedback
    });

  } catch (error) {
    console.error('End technical interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end interview'
    });
  }
};

// Behavioral Interview Handlers
export const handleStartBehavioralInterview: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { focus = ['critical-thinking', 'problem-solving'] } = req.body;

    const sessionId = `behav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are conducting a behavioral interview focused on critical thinking and aptitude assessment. 

Focus Areas: ${focus.join(', ')}

Start with a professional greeting and your first behavioral question. Your questions should:
1. Focus on critical thinking and problem-solving scenarios
2. Include aptitude-based situational questions
3. Test decision-making abilities
4. Assess communication and reasoning skills
5. Use the STAR method (Situation, Task, Action, Result) when appropriate

Begin the interview with a greeting and first behavioral/aptitude question.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const initialMessage = response.text();

    const initialBotMessage: Message = {
      id: '1',
      role: 'interviewer',
      content: initialMessage,
      timestamp: new Date().toISOString(),
      type: 'question'
    };

    const session: InterviewSession = {
      id: sessionId,
      userId: user.id,
      type: 'behavioral',
      difficulty: 'mid', // Behavioral interviews don't really have difficulty levels
      focus,
      startTime: new Date().toISOString(),
      status: 'active',
      messages: [initialBotMessage]
    };

    activeSessions.set(sessionId, session);

    res.json({
      success: true,
      session: {
        id: session.id,
        type: session.type,
        focus: session.focus,
        startTime: session.startTime,
        status: session.status,
        messages: session.messages
      }
    });

  } catch (error) {
    console.error('Start behavioral interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start behavioral interview'
    });
  }
};

export const handleBehavioralInterviewMessage: RequestHandler = async (req, res) => {
  try {
    const { sessionId, message, messageHistory = [] } = req.body;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const conversationHistory = messageHistory.map((msg: Message) => 
      `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
    ).join('\n\n');

    const prompt = `
You are continuing a behavioral interview focused on critical thinking and aptitude. The conversation so far:

${conversationHistory}

Candidate: ${message}

As the interviewer, respond appropriately:
1. If they gave a good STAR response, acknowledge and ask a follow-up
2. If the answer lacks detail, probe deeper into their thought process
3. Ask about specific decisions and reasoning
4. Focus on critical thinking, problem-solving, and aptitude
5. Keep questions practical and scenario-based
6. Test their ability to analyze situations and make decisions

Focus Areas: ${session.focus.join(', ')}

Provide your next response as the behavioral interviewer:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const interviewerResponse = response.text();

    let responseType: 'question' | 'follow-up' | 'evaluation' = 'follow-up';
    if (interviewerResponse.includes('?')) {
      responseType = 'question';
    }

    res.json({
      success: true,
      response: interviewerResponse,
      type: responseType
    });

  } catch (error) {
    console.error('Behavioral interview message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process interview message'
    });
  }
};

export const handleEndBehavioralInterview: RequestHandler = async (req, res) => {
  try {
    const { sessionId, messageHistory = [] } = req.body;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const conversationHistory = messageHistory.map((msg: Message) => 
      `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
    ).join('\n\n');

    const evaluationPrompt = `
Evaluate this behavioral interview focused on critical thinking and aptitude:

${conversationHistory}

Provide a JSON response with this structure:
{
  "score": "Number from 0-100",
  "feedback": "Detailed feedback covering: critical thinking skills, problem-solving approach, communication clarity, decision-making process, situational awareness, and areas for improvement. Be constructive and specific."
}

Evaluation criteria:
- Critical thinking and analytical skills
- Problem-solving methodology
- Communication clarity and structure
- Decision-making process and reasoning
- Situational awareness and adaptability
- Use of examples and concrete details (STAR method)

Provide actionable feedback to help them improve.
`;

    const result = await model.generateContent(evaluationPrompt);
    const response = await result.response;
    const evaluationText = response.text();

    const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
    let score = 75;
    let feedback = "Good behavioral interview performance with solid critical thinking skills.";
    
    if (jsonMatch) {
      try {
        const evaluation = JSON.parse(jsonMatch[0]);
        score = parseInt(evaluation.score) || 75;
        feedback = evaluation.feedback || feedback;
      } catch (e) {
        console.warn('Failed to parse evaluation JSON:', e);
      }
    }

    session.status = 'completed';
    session.endTime = new Date().toISOString();
    session.score = score;
    session.feedback = feedback;

    activeSessions.set(sessionId, session);

    res.json({
      success: true,
      score,
      feedback
    });

  } catch (error) {
    console.error('End behavioral interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end interview'
    });
  }
};
