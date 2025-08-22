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
              <TabsList className="grid w-full grid-cols-2 m-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
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
                  disabled={isRunning}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={runCode}
                  disabled={isRunning}
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
