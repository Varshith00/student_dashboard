import { RequestHandler } from "express";
import { spawn } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

interface ExecutePythonRequest {
  code: string;
}

interface ExecutePythonResponse {
  success: boolean;
  output?: string;
  error?: string;
  execution_time?: number;
}

const pyRateWindowMs = 60_000;
const pyMaxPerWindow = 5;
const pyRateMap: Map<string, { count: number; windowStart: number }> =
  new Map();

export const handleExecutePython: RequestHandler = async (req, res) => {
  try {
    if (process.env.ALLOW_CODE_EXECUTION !== "true") {
      return res.status(503).json({
        success: false,
        error: "Code execution is temporarily disabled",
      } as ExecutePythonResponse);
    }

    const user = (req as any).user;
    const userKey = user?.id || req.ip;
    const now = Date.now();
    const entry = pyRateMap.get(userKey) || { count: 0, windowStart: now };
    if (now - entry.windowStart > pyRateWindowMs) {
      entry.count = 0;
      entry.windowStart = now;
    }
    entry.count += 1;
    pyRateMap.set(userKey, entry);
    if (entry.count > pyMaxPerWindow) {
      return res
        .status(429)
        .json({ success: false, error: "Rate limit exceeded" });
    }

    const { code } = req.body as ExecutePythonRequest;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        error: "Code is required and must be a string",
      } as ExecutePythonResponse);
    }

    // Basic security checks
    const forbidden = [
      "import os",
      "import subprocess",
      "import sys",
      "__import__",
      "exec(",
      "eval(",
      "open(",
      "file(",
      "input(",
      "raw_input(",
    ];

    const codeToCheck = code.toLowerCase();
    for (const forbidden_item of forbidden) {
      if (codeToCheck.includes(forbidden_item)) {
        return res.status(400).json({
          success: false,
          error: `Security violation: "${forbidden_item}" is not allowed`,
        } as ExecutePythonResponse);
      }
    }

    // Generate a random filename for the temporary Python file
    const tempId = randomBytes(16).toString("hex");
    const tempFile = join(process.cwd(), `temp_${tempId}.py`);

    try {
      // Write code to temporary file
      writeFileSync(tempFile, code, "utf8");

      const startTime = Date.now();
      let responsesSent = false;

      // Execute Python code
      const pythonProcess = spawn("python3", [tempFile], {
        timeout: 10000, // 10 second timeout
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (responsesSent) return;
        responsesSent = true;

        const executionTime = Date.now() - startTime;

        // Clean up temporary file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          console.warn("Failed to clean up temp file:", tempFile);
        }

        if (code === 0) {
          res.json({
            success: true,
            output: output.trim(),
            execution_time: executionTime,
          } as ExecutePythonResponse);
        } else {
          res.json({
            success: false,
            error: errorOutput.trim() || `Process exited with code ${code}`,
            execution_time: executionTime,
          } as ExecutePythonResponse);
        }
      });

      pythonProcess.on("error", (error) => {
        if (responsesSent) return;
        responsesSent = true;

        // Clean up temporary file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          console.warn("Failed to clean up temp file:", tempFile);
        }

        res.json({
          success: false,
          error: `Python execution failed: ${error.message}`,
        } as ExecutePythonResponse);
      });

      // Handle timeout
      setTimeout(() => {
        if (!responsesSent && !pythonProcess.killed) {
          responsesSent = true;
          pythonProcess.kill("SIGTERM");
          try {
            unlinkSync(tempFile);
          } catch (e) {
            console.warn("Failed to clean up temp file:", tempFile);
          }

          res.json({
            success: false,
            error: "Code execution timed out (10 seconds limit)",
          } as ExecutePythonResponse);
        }
      }, 10000);
    } catch (fileError) {
      // Clean up temporary file if it was created
      try {
        unlinkSync(tempFile);
      } catch (e) {
        // File might not exist, ignore
      }

      res.status(500).json({
        success: false,
        error: `Failed to create temporary file: ${fileError instanceof Error ? fileError.message : "Unknown error"}`,
      } as ExecutePythonResponse);
    }
  } catch (error) {
    console.error("Execute Python error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ExecutePythonResponse);
  }
};
