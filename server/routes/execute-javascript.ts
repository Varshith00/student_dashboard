import { RequestHandler } from "express";
import { spawn } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

interface ExecuteJavaScriptRequest {
  code: string;
}

interface ExecuteJavaScriptResponse {
  success: boolean;
  output?: string;
  error?: string;
  execution_time?: number;
}

export const handleExecuteJavaScript: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body as ExecuteJavaScriptRequest;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code is required and must be a string'
      } as ExecuteJavaScriptResponse);
    }

    // Basic security checks for Node.js
    const forbidden = [
      'require("fs")',
      'require("child_process")',
      'require("os")',
      'require("path")',
      'require("net")',
      'require("http")',
      'require("https")',
      'require("crypto")',
      'require("cluster")',
      'process.exit',
      'process.kill',
      'process.env',
      'global.',
      '__dirname',
      '__filename',
      'eval(',
      'Function(',
      'setTimeout(',
      'setInterval(',
      'setImmediate(',
    ];

    const codeToCheck = code.toLowerCase().replace(/\s/g, '');
    for (const forbidden_item of forbidden) {
      if (codeToCheck.includes(forbidden_item.toLowerCase().replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          error: `Security violation: "${forbidden_item}" is not allowed`
        } as ExecuteJavaScriptResponse);
      }
    }

    // Generate a random filename for the temporary JavaScript file
    const tempId = randomBytes(16).toString('hex');
    const tempFile = join(process.cwd(), `temp_${tempId}.js`);

    try {
      // Write code to temporary file
      writeFileSync(tempFile, code, 'utf8');

      const startTime = Date.now();
      let responsesSent = false;

      // Execute JavaScript code with Node.js
      const nodeProcess = spawn('node', [tempFile], {
        timeout: 10000, // 10 second timeout
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      nodeProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      nodeProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      nodeProcess.on('close', (code) => {
        if (responsesSent) return;
        responsesSent = true;

        const executionTime = Date.now() - startTime;

        // Clean up temporary file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          console.warn('Failed to clean up temp file:', tempFile);
        }

        if (code === 0) {
          res.json({
            success: true,
            output: output.trim(),
            execution_time: executionTime
          } as ExecuteJavaScriptResponse);
        } else {
          res.json({
            success: false,
            error: errorOutput.trim() || `Process exited with code ${code}`,
            execution_time: executionTime
          } as ExecuteJavaScriptResponse);
        }
      });

      nodeProcess.on('error', (error) => {
        if (responsesSent) return;
        responsesSent = true;

        // Clean up temporary file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          console.warn('Failed to clean up temp file:', tempFile);
        }

        res.json({
          success: false,
          error: `JavaScript execution failed: ${error.message}`
        } as ExecuteJavaScriptResponse);
      });

      // Handle timeout
      setTimeout(() => {
        if (!responsesSent && !nodeProcess.killed) {
          responsesSent = true;
          nodeProcess.kill('SIGTERM');
          try {
            unlinkSync(tempFile);
          } catch (e) {
            console.warn('Failed to clean up temp file:', tempFile);
          }

          res.json({
            success: false,
            error: 'Code execution timed out (10 seconds limit)'
          } as ExecuteJavaScriptResponse);
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
        error: `Failed to create temporary file: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`
      } as ExecuteJavaScriptResponse);
    }

  } catch (error) {
    console.error('Execute JavaScript error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ExecuteJavaScriptResponse);
  }
};
