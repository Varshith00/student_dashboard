import { useState, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Terminal,
  Code,
  Lightbulb,
  Brain,
  Sparkles,
  HelpCircle,
  BarChart3
} from "lucide-react";

interface CodeEditorProps {
  problem?: {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    starter_code?: string;
    test_cases?: Array<{
      input: string;
      expected_output: string;
    }>;
  };
}

export default function CodeEditor({ problem }: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState(problem?.starter_code || `# Welcome to Python Practice!
# Write your code below and click Run to execute

def solution():
    # Your solution here
    print("Hello, TechPrep!")
    return "Success"

# Test your function
result = solution()
print(f"Result: {result}")
`);
  
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  // AI Features State
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setHasError(false);
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/execute-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (result.success) {
        setOutput(result.output || 'Code executed successfully (no output)');
        setHasError(false);
      } else {
        setOutput(result.error || 'An error occurred');
        setHasError(true);
      }
    } catch (error) {
      setOutput(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setHasError(true);
      setExecutionTime(Date.now() - startTime);
    }

    setIsRunning(false);
  };

  const resetCode = () => {
    if (problem?.starter_code) {
      setCode(problem.starter_code);
    } else {
      setCode(`# Welcome to Python Practice!
# Write your code below and click Run to execute

def solution():
    # Your solution here
    print("Hello, TechPrep!")
    return "Success"

# Test your function
result = solution()
print(f"Result: {result}")
`);
    }
    setOutput('');
    setHasError(false);
    setExecutionTime(null);
    setAiHint(null);
    setAiAnalysis(null);
  };

  const getAIHint = async () => {
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/ai/get-hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          problem_description: problem?.description || 'General coding practice',
          hint_level: hintLevel
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAiHint(result.hint);
        setShowAIPanel(true);
      } else {
        setOutput(`AI Hint Error: ${result.error}`);
        setHasError(true);
      }
    } catch (error) {
      setOutput(`AI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setHasError(true);
    }
    setIsLoadingAI(false);
  };

  const analyzeCode = async () => {
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/ai/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          problem_description: problem?.description || 'General code analysis'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAiAnalysis(result.analysis);
        setShowAIPanel(true);
      } else {
        setOutput(`AI Analysis Error: ${result.error}`);
        setHasError(true);
      }
    } catch (error) {
      setOutput(`AI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setHasError(true);
    }
    setIsLoadingAI(false);
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Problem Header */}
      {problem && (
        <div className="border-b bg-background/95 backdrop-blur p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <p className="text-muted-foreground">{problem.description}</p>
              </div>
            </div>
            <Badge className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Problem Description Panel */}
        {problem && (
          <div className="w-1/3 border-r bg-muted/30 overflow-y-auto">
            <Tabs defaultValue="description" className="h-full">
              <TabsList className="grid w-full grid-cols-3 m-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  AI Help
                  {(aiHint || aiAnalysis) && (
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="px-4 pb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Problem Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {problem.description}
                    </p>
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <h4 className="font-semibold mb-2">Requirements:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Implement the solution function</li>
                        <li>• Test your code with the provided examples</li>
                        <li>• Handle edge cases appropriately</li>
                        <li>• Use efficient algorithms when possible</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="examples" className="px-4 pb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="w-5 h-5" />
                      Test Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {problem.test_cases?.map((testCase, index) => (
                      <div key={index} className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Input:</span>
                            <code className="ml-2 bg-background px-2 py-1 rounded">
                              {testCase.input}
                            </code>
                          </div>
                          <div>
                            <span className="font-medium">Expected Output:</span>
                            <code className="ml-2 bg-background px-2 py-1 rounded">
                              {testCase.expected_output}
                            </code>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No test cases provided.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="px-4 pb-4 space-y-4">
                {/* AI Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      AI Assistant
                    </CardTitle>
                    <CardDescription>
                      Get intelligent help with your coding practice
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={getAIHint}
                          disabled={isLoadingAI}
                          className="flex-1"
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Get Hint (Level {hintLevel})
                        </Button>
                        <select
                          value={hintLevel}
                          onChange={(e) => setHintLevel(Number(e.target.value))}
                          className="px-2 py-1 text-sm border rounded"
                        >
                          <option value={1}>Easy</option>
                          <option value={2}>Medium</option>
                          <option value={3}>Detailed</option>
                        </select>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={analyzeCode}
                        disabled={isLoadingAI || !code.trim()}
                        className="w-full"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analyze My Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Hint */}
                {aiHint && (
                  <Card className="border-accent/50 bg-accent/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-accent">
                        <Lightbulb className="w-5 h-5" />
                        AI Hint
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Alert>
                          <HelpCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Hint:</strong> {aiHint.hint}
                          </AlertDescription>
                        </Alert>
                        {aiHint.explanation && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Why this helps:</strong> {aiHint.explanation}
                          </p>
                        )}
                        {aiHint.next_step && (
                          <p className="text-sm text-accent">
                            <strong>Next step:</strong> {aiHint.next_step}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Analysis */}
                {aiAnalysis && (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Brain className="w-5 h-5" />
                        Code Analysis
                      </CardTitle>
                      <CardDescription>
                        AI-powered feedback on your solution
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {aiAnalysis.score && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Overall Score:</span>
                            <Badge variant="secondary">{aiAnalysis.score}/100</Badge>
                          </div>
                        )}

                        {aiAnalysis.feedback && (
                          <div className="space-y-2">
                            {aiAnalysis.feedback.correctness && (
                              <div className="text-sm">
                                <strong>Correctness:</strong> {aiAnalysis.feedback.correctness}
                              </div>
                            )}
                            {aiAnalysis.feedback.efficiency && (
                              <div className="text-sm">
                                <strong>Efficiency:</strong> {aiAnalysis.feedback.efficiency}
                              </div>
                            )}
                            {aiAnalysis.feedback.style && (
                              <div className="text-sm">
                                <strong>Style:</strong> {aiAnalysis.feedback.style}
                              </div>
                            )}
                            {aiAnalysis.feedback.suggestions && (
                              <div className="text-sm">
                                <strong>Suggestions:</strong> {aiAnalysis.feedback.suggestions}
                              </div>
                            )}
                          </div>
                        )}

                        {aiAnalysis.explanation && (
                          <Alert>
                            <AlertDescription>
                              <strong>Code Explanation:</strong> {aiAnalysis.explanation}
                            </AlertDescription>
                          </Alert>
                        )}

                        {aiAnalysis.alternative_approaches && aiAnalysis.alternative_approaches.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Alternative Approaches:</h4>
                            <ul className="text-sm space-y-1">
                              {aiAnalysis.alternative_approaches.map((approach: string, index: number) => (
                                <li key={index} className="text-muted-foreground">• {approach}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!aiHint && !aiAnalysis && (
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="font-medium mb-2">AI Assistant Ready</p>
                        <p className="text-sm">
                          Click "Get Hint" for guidance or "Analyze My Code" for detailed feedback
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Code Editor Panel */}
        <div className={`${problem ? 'w-2/3' : 'w-full'} flex flex-col`}>
          {/* Toolbar */}
          <div className="border-b p-3 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                <span className="font-semibold">Python Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCode}
                  disabled={isRunning || isLoadingAI}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>

                {/* AI Features */}
                <div className="flex items-center gap-1 border-l pl-2 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getAIHint}
                    disabled={isRunning || isLoadingAI}
                    className="text-accent hover:text-accent"
                  >
                    {isLoadingAI ? (
                      <div className="w-4 h-4 animate-spin border-2 border-accent border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Lightbulb className="w-4 h-4 mr-2" />
                    )}
                    AI Hint
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeCode}
                    disabled={isRunning || isLoadingAI || !code.trim()}
                    className="text-primary hover:text-primary"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIPanel(!showAIPanel)}
                    className={showAIPanel ? "bg-accent/10" : ""}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Panel
                  </Button>
                </div>

                <Button
                  onClick={runCode}
                  disabled={isRunning || isLoadingAI}
                  size="sm"
                  className="bg-success hover:bg-success/90"
                >
                  {isRunning ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                  wordWrap: 'on',
                  bracketPairColorization: { enabled: true },
                  guides: {
                    indentation: true,
                    bracketPairs: true
                  }
                }}
              />
            </div>

            {/* Output Panel */}
            <div className="h-48 border-t bg-background">
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span className="font-semibold">Output</span>
                  {executionTime !== null && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {executionTime}ms
                    </Badge>
                  )}
                </div>
                {output && (
                  <div className="flex items-center gap-1">
                    {hasError ? (
                      <XCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                    <span className={`text-sm ${hasError ? 'text-destructive' : 'text-success'}`}>
                      {hasError ? 'Error' : 'Success'}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 h-full overflow-y-auto">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    Executing code...
                  </div>
                ) : output ? (
                  <pre className={`text-sm whitespace-pre-wrap font-mono ${
                    hasError ? 'text-destructive' : 'text-foreground'
                  }`}>
                    {output}
                  </pre>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Click "Run Code" to execute your Python code. Output will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
