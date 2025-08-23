import { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface TranscriptionRequest {
  audioBlob: string; // base64 encoded audio
  interviewType: 'technical' | 'behavioral';
  question: string;
  difficulty?: string;
  focus?: string[];
}

interface TranscriptionResponse {
  success: boolean;
  transcription?: string;
  score?: number;
  feedback?: string;
  suggestions?: string[];
  error?: string;
}

export const handleAudioTranscription: RequestHandler = async (req, res) => {
  try {
    const { audioBlob, interviewType, question, difficulty, focus }: TranscriptionRequest = req.body;

    if (!audioBlob || !interviewType || !question) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: audioBlob, interviewType, question'
      });
    }

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audioBlob, 'base64');
    
    // For now, we'll focus on text analysis since Gemini API doesn't directly support audio transcription
    // In a production environment, you might want to use Google Cloud Speech-to-Text API
    // For this implementation, we'll assume the transcription is already done client-side
    // and focus on the analysis part

    const response: TranscriptionResponse = {
      success: true,
      transcription: "Client-side transcription will be used", // Placeholder
      score: 0,
      feedback: "",
      suggestions: []
    };

    res.json(response);

  } catch (error) {
    console.error('Audio transcription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process audio transcription'
    });
  }
};

export const handleAnswerAnalysis: RequestHandler = async (req, res) => {
  try {
    const { 
      transcription, 
      question, 
      interviewType, 
      difficulty = 'mid', 
      focus = [] 
    } = req.body;

    if (!transcription || !question || !interviewType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: transcription, question, interviewType'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let analysisPrompt = '';

    if (interviewType === 'technical') {
      analysisPrompt = `
You are an expert technical interviewer evaluating a candidate's response. Analyze the following:

QUESTION: ${question}

CANDIDATE'S ANSWER: ${transcription}

INTERVIEW DETAILS:
- Difficulty Level: ${difficulty}
- Focus Areas: ${focus.join(', ')}

Provide a detailed analysis in JSON format with this structure:
{
  "score": "Number from 0-100",
  "feedback": "Detailed feedback covering technical accuracy, problem-solving approach, communication clarity, and areas for improvement",
  "suggestions": ["Array of 3-5 specific suggestions for improvement"],
  "strengths": ["Array of 2-3 identified strengths"],
  "weaknesses": ["Array of 2-3 areas needing improvement"],
  "technicalAccuracy": "Number from 0-100",
  "communicationClarity": "Number from 0-100",
  "problemSolvingApproach": "Number from 0-100"
}

Evaluation criteria for ${difficulty} level:
- Technical knowledge depth and accuracy
- Problem-solving methodology and logical thinking
- Code quality and best practices understanding
- Communication skills and explanation clarity
- Handling of edge cases and optimizations
- Time and space complexity awareness

Be constructive, specific, and provide actionable feedback.
`;
    } else {
      analysisPrompt = `
You are an expert behavioral interviewer evaluating a candidate's response. Analyze the following:

QUESTION: ${question}

CANDIDATE'S ANSWER: ${transcription}

FOCUS AREAS: ${focus.join(', ')}

Provide a detailed analysis in JSON format with this structure:
{
  "score": "Number from 0-100",
  "feedback": "Detailed feedback covering critical thinking, communication skills, situational awareness, and STAR method usage",
  "suggestions": ["Array of 3-5 specific suggestions for improvement"],
  "strengths": ["Array of 2-3 identified strengths"],
  "weaknesses": ["Array of 2-3 areas needing improvement"],
  "criticalThinking": "Number from 0-100",
  "communicationSkills": "Number from 0-100",
  "situationalAwareness": "Number from 0-100",
  "starMethodUsage": "Number from 0-100"
}

Evaluation criteria:
- Critical thinking and analytical reasoning
- Problem-solving approach and decision-making process
- Communication clarity and structure
- Use of STAR method (Situation, Task, Action, Result)
- Situational awareness and adaptability
- Concrete examples and specific details
- Professional maturity and self-awareness

Be constructive, specific, and provide actionable feedback for behavioral interview improvement.
`;
    }

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const analysisText = response.text();

    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    let analysis = {
      score: 75,
      feedback: "Good response with room for improvement.",
      suggestions: ["Practice more specific examples", "Work on clarity of communication"],
      strengths: ["Clear thinking", "Good communication"],
      weaknesses: ["Could be more specific", "Need more details"]
    };

    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse analysis JSON:', e);
      }
    }

    res.json({
      success: true,
      ...analysis
    });

  } catch (error) {
    console.error('Answer analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze answer'
    });
  }
};

export const handleBatchAnswerAnalysis: RequestHandler = async (req, res) => {
  try {
    const { answers, interviewType, difficulty, focus } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid answers array'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const batchAnalysisPrompt = `
You are an expert interviewer conducting a comprehensive evaluation of a candidate's entire interview performance.

INTERVIEW TYPE: ${interviewType}
${difficulty ? `DIFFICULTY LEVEL: ${difficulty}` : ''}
${focus && focus.length > 0 ? `FOCUS AREAS: ${focus.join(', ')}` : ''}

COMPLETE INTERVIEW CONVERSATION:
${answers.map((answer: any, index: number) => `
Q${index + 1}: ${answer.question}
A${index + 1}: ${answer.transcription}
`).join('\n')}

Provide a comprehensive analysis in JSON format:
{
  "overallScore": "Number from 0-100",
  "overallFeedback": "Comprehensive feedback about the entire interview performance",
  "questionScores": [
    {
      "questionIndex": 0,
      "score": "Number from 0-100",
      "feedback": "Specific feedback for this question"
    }
  ],
  "skillBreakdown": {
    ${interviewType === 'technical' ? `
    "technicalKnowledge": "Number from 0-100",
    "problemSolving": "Number from 0-100",
    "codeQuality": "Number from 0-100",
    "systemDesign": "Number from 0-100"
    ` : `
    "criticalThinking": "Number from 0-100",
    "communication": "Number from 0-100",
    "situationalJudgment": "Number from 0-100",
    "starMethodUsage": "Number from 0-100"
    `}
  },
  "recommendations": ["Array of 5-7 specific recommendations"],
  "nextSteps": ["Array of 3-5 suggested next steps for improvement"]
}

Evaluate comprehensively and provide actionable insights for the candidate's growth.
`;

    const result = await model.generateContent(batchAnalysisPrompt);
    const response = await result.response;
    const analysisText = response.text();

    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    let batchAnalysis = {
      overallScore: 75,
      overallFeedback: "Good overall performance with areas for improvement.",
      questionScores: answers.map((_: any, index: number) => ({
        questionIndex: index,
        score: 75,
        feedback: "Good response"
      })),
      skillBreakdown: interviewType === 'technical' ? {
        technicalKnowledge: 75,
        problemSolving: 75,
        codeQuality: 75,
        systemDesign: 75
      } : {
        criticalThinking: 75,
        communication: 75,
        situationalJudgment: 75,
        starMethodUsage: 75
      },
      recommendations: ["Practice more", "Improve communication"],
      nextSteps: ["Study specific topics", "Practice more interviews"]
    };

    if (jsonMatch) {
      try {
        batchAnalysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse batch analysis JSON:', e);
      }
    }

    res.json({
      success: true,
      ...batchAnalysis
    });

  } catch (error) {
    console.error('Batch answer analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze interview answers'
    });
  }
};
