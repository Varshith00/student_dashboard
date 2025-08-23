import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";
import express from "express";
import cors from "cors";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      console.log('🔧 Development mode: Creating simplified Express setup');

      // Create a simplified Express app for development without body parsing middleware
      const devApp = express();

      // Add CORS middleware
      devApp.use(cors());

      // Import and setup routes directly without the problematic middleware
      import('./server/routes/auth').then(authModule => {
        import('./server/routes/interview').then(interviewModule => {
          import('./server/routes/collaboration').then(collabModule => {
            import('./server/routes/demo').then(demoModule => {
              import('./server/routes/execute-python').then(pythonModule => {
                import('./server/routes/execute-javascript').then(jsModule => {
                  import('./server/routes/ai-questions').then(aiModule => {
                    import('./server/routes/professor').then(profModule => {
                      import('./server/routes/audio-transcription').then(audioModule => {
                        // Setup routes with manual JSON parsing
                        const setupRoute = (path: string, handler: any) => {
                          devApp.post(path, async (req, res) => {
                            try {
                              let body = '';
                              req.on('data', chunk => body += chunk.toString());
                              req.on('end', () => {
                                if (body) {
                                  try {
                                    req.body = JSON.parse(body);
                                  } catch (e) {
                                    req.body = {};
                                  }
                                }
                                handler(req, res);
                              });
                            } catch (error) {
                              res.status(500).json({ success: false, error: 'Server error' });
                            }
                          });
                        };

                        // Setup auth routes
                        setupRoute('/api/auth/register', authModule.handleRegister);
                        setupRoute('/api/auth/student-register', authModule.handleStudentRegister);
                        setupRoute('/api/auth/login', authModule.handleLogin);
                        devApp.get('/api/auth/user', authModule.authMiddleware, authModule.handleGetUser);

                        // Setup interview routes
                        setupRoute('/api/interview/technical/start', (req: any, res: any) => {
                          authModule.authMiddleware(req, res, () => {
                            interviewModule.handleStartTechnicalInterview(req, res);
                          });
                        });

                        setupRoute('/api/interview/behavioral/start', (req: any, res: any) => {
                          authModule.authMiddleware(req, res, () => {
                            interviewModule.handleStartBehavioralInterview(req, res);
                          });
                        });

                        setupRoute('/api/interview/technical/message', (req: any, res: any) => {
                          authModule.authMiddleware(req, res, () => {
                            interviewModule.handleTechnicalInterviewMessage(req, res);
                          });
                        });

                        setupRoute('/api/interview/behavioral/message', (req: any, res: any) => {
                          authModule.authMiddleware(req, res, () => {
                            interviewModule.handleBehavioralInterviewMessage(req, res);
                          });
                        });

                        // Add other essential routes
                        devApp.get('/api/ping', (req, res) => {
                          res.json({ message: process.env.PING_MESSAGE ?? 'ping' });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });

      // Add the dev app as middleware
      server.middlewares.use(devApp);
    },
  };
}
