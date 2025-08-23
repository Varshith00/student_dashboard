import { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GenerateQuestionRequest {
  difficulty?: "Easy" | "Medium" | "Hard";
  topic?: string;
  language?: string;
}

interface GeneratedQuestion {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  starter_code: string;
  test_cases: Array<{
    input: string;
    expected_output: string;
  }>;
  tags: string[];
  hints: string[];
}

interface GenerateQuestionResponse {
  success: boolean;
  question?: GeneratedQuestion;
  error?: string;
}

export const handleGenerateQuestion: RequestHandler = async (req, res) => {
  try {
    const {
      difficulty = "Medium",
      topic = "algorithms",
      language = "Python",
    } = req.body as GenerateQuestionRequest;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Generate a unique coding problem for a learning platform with the following requirements:

- Difficulty: ${difficulty}
- Topic: ${topic}
- Programming Language: ${language}
- Target: University-level computer science students

Please provide a JSON response with this exact structure:
{
  "title": "Problem Title",
  "description": "Detailed problem description explaining what needs to be solved",
  "difficulty": "${difficulty}",
  "starter_code": "Complete ${language} starter code with function signature, docstring, and example usage",
  "test_cases": [
    {
      "input": "example input description",
      "expected_output": "expected output description"
    }
  ],
  "tags": ["relevant", "programming", "concepts"],
  "hints": ["helpful hint 1", "helpful hint 2", "helpful hint 3"]
}

Requirements:
1. Make the problem unique and educational
2. Include proper function signature with docstring
3. Provide 3-5 test cases with clear input/output
4. Add 3 progressive hints (easy to harder)
5. Ensure the problem is appropriate for ${difficulty} level
6. Focus on ${topic} concepts
7. Include example test code in starter_code
8. Make sure the JSON is valid and properly formatted

Generate a completely new problem - don't use common problems like Two Sum or Fibonacci.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract valid JSON from AI response");
    }

    const questionData = JSON.parse(jsonMatch[0]) as GeneratedQuestion;

    // Validate the response structure
    if (
      !questionData.title ||
      !questionData.description ||
      !questionData.starter_code
    ) {
      throw new Error("Invalid question structure received from AI");
    }

    res.json({
      success: true,
      question: questionData,
    } as GenerateQuestionResponse);
  } catch (error) {
    console.error("Generate question error:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate question",
    } as GenerateQuestionResponse);
  }
};

export const handleAnalyzeCode: RequestHandler = async (req, res) => {
  try {
    const { code, problem_description } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        error: "Code is required",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Analyze this Python code solution and provide detailed feedback:

Problem Context: ${problem_description || "General code analysis"}

Code to analyze:
\`\`\`python
${code}
\`\`\`

Please provide a JSON response with this structure:
{
  "feedback": {
    "correctness": "Assessment of code correctness (0-10 score)",
    "efficiency": "Time and space complexity analysis",
    "style": "Code style and readability feedback",
    "bugs": "Any bugs or issues found",
    "suggestions": "Specific improvement suggestions"
  },
  "score": "Overall score from 0-100",
  "hints": ["helpful hints for improvement"],
  "alternative_approaches": ["different ways to solve this problem"],
  "explanation": "Step-by-step explanation of what the code does"
}

Be constructive and educational in your feedback.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract valid JSON from AI response");
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      analysis: analysisData,
    });
  } catch (error) {
    console.error("Code analysis error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze code",
    });
  }
};

export const handleGetHint: RequestHandler = async (req, res) => {
  try {
    const { code, problem_description, hint_level = 1 } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const hintPrompts = {
      1: "Give a gentle nudge in the right direction without revealing the solution",
      2: "Provide a more specific hint about the algorithm or approach to use",
      3: "Give a detailed explanation of the solution strategy",
    };

    const prompt = `
The student is working on this problem:
${problem_description}

Their current code attempt:
\`\`\`python
${code || "No code written yet"}
\`\`\`

Hint level requested: ${hint_level} (${hintPrompts[hint_level as keyof typeof hintPrompts]})

Provide a helpful hint as a JSON response:
{
  "hint": "Your helpful hint here",
  "explanation": "Brief explanation of why this hint is useful",
  "next_step": "What the student should try next"
}

Make the hint appropriate for the requested level and educational.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract valid JSON from AI response");
    }

    const hintData = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      hint: hintData,
    });
  } catch (error) {
    console.error("Get hint error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate hint",
    });
  }
};
