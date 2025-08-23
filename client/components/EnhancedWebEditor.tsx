import { useState, useRef, useEffect, useCallback } from "react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authFetch } from "@/contexts/AuthContext";
import {
  SafeResizeObserver,
  createMonacoResizeObserverConfig,
  createResizeSafeContainer
} from "@/lib/resizeObserverErrorHandler";
import {
  Play,
  Square,
  RotateCcw,
  Save,
  Download,
  Upload,
  Settings,
  Code,
  Lightbulb,
  Brain,
  Sparkles,
  Terminal,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  FileText,
  Folder,
  Search,
  Replace,
  BarChart3,
  HelpCircle,
  BookOpen,
  Wand2
} from "lucide-react";

interface EnhancedWebEditorProps {
  language?: 'python' | 'javascript';
  fileName?: string;
}

interface AIError {
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

interface AICompletion {
  text: string;
  description: string;
  type: 'function' | 'variable' | 'keyword' | 'snippet';
}

export default function EnhancedWebEditor({ language = 'python', fileName }: EnhancedWebEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'python' | 'javascript'>(language);
  const [code, setCode] = useState(getDefaultCode(currentLanguage));
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(fileName || `main.${currentLanguage === 'python' ? 'py' : 'js'}`);
  
  // AI Features
  const [aiErrors, setAiErrors] = useState<AIError[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoComplete, setAutoComplete] = useState(true);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [showAISidebar, setShowAISidebar] = useState(false);
  
  // Editor features
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<'vs-dark' | 'light' | 'vs'>('vs-dark');
  const [showMinimap, setShowMinimap] = useState(false);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [autoSave, setAutoSave] = useState(true);

  function getDefaultCode(lang: 'python' | 'javascript') {
    if (lang === 'python') {
      return `"""
Enhanced Python Editor with AI Features
This editor provides:
- Real-time error detection
- AI-powered code suggestions
- Intelligent auto-completion
- Performance optimization hints
"""

import os
import sys
from typing import List, Dict, Optional

class DataProcessor:
    """
    Example class demonstrating AI-enhanced development
    """
    
    def __init__(self, data: List[Dict]):
        self.data = data
        self.processed_count = 0
    
    def process_data(self) -> List[Dict]:
        """
        Process the input data with error handling
        """
        try:
            result = []
            for item in self.data:
                if self.validate_item(item):
                    processed = self.transform_item(item)
                    result.append(processed)
                    self.processed_count += 1
            return result
        except Exception as e:
            print(f"Error processing data: {e}")
            return []
    
    def validate_item(self, item: Dict) -> bool:
        """Validate a single data item"""
        return isinstance(item, dict) and 'id' in item
    
    def transform_item(self, item: Dict) -> Dict:
        """Transform a single data item"""
        return {
            **item,
            'processed': True,
            'timestamp': os.time.time()
        }

# Example usage
if __name__ == "__main__":
    sample_data = [
        {'id': 1, 'name': 'Item 1', 'value': 100},
        {'id': 2, 'name': 'Item 2', 'value': 200},
        {'id': 3, 'name': 'Item 3', 'value': 300}
    ]
    
    processor = DataProcessor(sample_data)
    result = processor.process_data()
    
    print(f"Processed {processor.processed_count} items")
    print(f"Result: {result}")
`;
    } else {
      return `/**
 * Enhanced JavaScript Editor with AI Features
 * This editor provides:
 * - Real-time error detection
 * - AI-powered code suggestions
 * - Intelligent auto-completion
 * - Performance optimization hints
 */

class DataProcessor {
    /**
     * Example class demonstrating AI-enhanced development
     * @param {Array<Object>} data - Input data array
     */
    constructor(data) {
        this.data = data;
        this.processedCount = 0;
    }

    /**
     * Process the input data with error handling
     * @returns {Array<Object>} Processed data array
     */
    async processData() {
        try {
            const result = [];
            
            for (const item of this.data) {
                if (await this.validateItem(item)) {
                    const processed = await this.transformItem(item);
                    result.push(processed);
                    this.processedCount++;
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error processing data:', error);
            return [];
        }
    }

    /**
     * Validate a single data item
     * @param {Object} item - Data item to validate
     * @returns {Promise<boolean>} Validation result
     */
    async validateItem(item) {
        return typeof item === 'object' && 
               item !== null && 
               'id' in item;
    }

    /**
     * Transform a single data item
     * @param {Object} item - Data item to transform
     * @returns {Promise<Object>} Transformed item
     */
    async transformItem(item) {
        return {
            ...item,
            processed: true,
            timestamp: Date.now()
        };
    }
}

// Example usage
(async () => {
    const sampleData = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 }
    ];

    const processor = new DataProcessor(sampleData);
    const result = await processor.processData();

    console.log(\`Processed \${processor.processedCount} items\`);
    console.log('Result:', result);
})();
`;
    }
  }

  const analyzeCodeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const response = await authFetch('/api/ai/analyze-code', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language: currentLanguage,
          analysis_type: 'comprehensive'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAiInsights(result.analysis);
        // Simulate error detection
        setAiErrors([
          {
            line: 45,
            message: 'Potential undefined variable',
            severity: 'warning',
            suggestion: 'Consider initializing the variable before use'
          },
          {
            line: 23,
            message: 'This function could be optimized',
            severity: 'info',
            suggestion: 'Use list comprehension for better performance'
          }
        ]);
        setAiSuggestions([
          'Add type hints for better code clarity',
          'Consider using async/await for better performance',
          'Add error handling for edge cases'
        ]);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    }
    setIsAnalyzing(false);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setHasError(false);
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      const endpoint = currentLanguage === 'python' ? '/api/execute-python' : '/api/execute-javascript';
      const response = await authFetch(endpoint, {
        method: 'POST',
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

  const switchLanguage = (newLang: 'python' | 'javascript') => {
    setCurrentLanguage(newLang);
    setCode(getDefaultCode(newLang));
    setCurrentFileName(`main.${newLang === 'python' ? 'py' : 'js'}`);
    setOutput('');
    setAiErrors([]);
    setAiSuggestions([]);
    setAiInsights(null);
  };

  const saveFile = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;

    // Setup resize-safe container
    if (containerRef.current && !resizeCleanupRef.current) {
      resizeCleanupRef.current = createResizeSafeContainer(containerRef.current);

      // Listen for custom resize events
      containerRef.current.addEventListener('monaco-resize', () => {
        try {
          editor.layout();
        } catch (error) {
          console.warn('Editor layout error:', error);
        }
      });
    }

    // Manual layout trigger with debouncing
    const layoutEditor = () => {
      try {
        if (editor && typeof editor.layout === 'function') {
          // Use requestAnimationFrame to avoid ResizeObserver conflicts
          requestAnimationFrame(() => {
            editor.layout();
          });
        }
      } catch (error) {
        console.warn('Editor layout error:', error);
      }
    };

    // Setup safe resize observer for manual layout
    const resizeObserver = new SafeResizeObserver(() => {
      layoutEditor();
    }, 200);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Add AI error markers with safety
    setTimeout(() => {
      try {
        if (aiErrors.length > 0 && editor) {
          const markers = aiErrors.map(error => ({
            startLineNumber: error.line,
            endLineNumber: error.line,
            startColumn: 1,
            endColumn: 1000,
            message: error.message,
            severity: error.severity === 'error' ? 8 : error.severity === 'warning' ? 4 : 1
          }));
          editor.deltaDecorations([], markers);
        }
      } catch (error) {
        console.warn('Error setting editor markers:', error);
      }
    }, 1000);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
    };
  }, [aiErrors]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        localStorage.setItem(`code_${currentLanguage}_${currentFileName}`, code);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [code, autoSave, currentLanguage, currentFileName]);

  // Cleanup resize observer on unmount
  useEffect(() => {
    return () => {
      if (resizeCleanupRef.current) {
        resizeCleanupRef.current();
        resizeCleanupRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Enhanced Web Editor</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI-Powered
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">File:</span>
              <input
                value={currentFileName}
                onChange={(e) => setCurrentFileName(e.target.value)}
                className="bg-muted px-2 py-1 rounded text-sm font-mono min-w-32"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={currentLanguage === 'python' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchLanguage('python')}
                className="h-7"
              >
                Python
              </Button>
              <Button
                variant={currentLanguage === 'javascript' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchLanguage('javascript')}
                className="h-7"
              >
                JavaScript
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={saveFile}>
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAISidebar(!showAISidebar)}
              className={showAISidebar ? 'bg-accent/10 border-accent' : ''}
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className={`${showAISidebar ? 'flex-1' : 'w-full'} flex flex-col`}>
          {/* Toolbar */}
          <div className="border-b p-3 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)}
                </Badge>
                {aiErrors.length > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {aiErrors.filter(e => e.severity === 'error').length} errors
                  </Badge>
                )}
                {aiErrors.filter(e => e.severity === 'warning').length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {aiErrors.filter(e => e.severity === 'warning').length} warnings
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeCodeWithAI}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <div className="w-4 h-4 animate-spin border-2 border-accent border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  AI Analyze
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCode(getDefaultCode(currentLanguage))}
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
          <div ref={containerRef} className="flex-1" style={{ width: '100%', height: '100%' }}>
            <Editor
              height="100%"
              language={currentLanguage}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme={theme}
              options={{
                ...createMonacoResizeObserverConfig(),
                minimap: { enabled: showMinimap },
                fontSize: fontSize,
                lineNumbers: 'on',
                roundedSelection: false,
                tabSize: currentLanguage === 'python' ? 4 : 2,
                insertSpaces: true,
                wordWrap: wordWrap,
                bracketPairColorization: { enabled: true },
                guides: {
                  indentation: true,
                  bracketPairs: true
                },
                suggestOnTriggerCharacters: true,
                quickSuggestions: autoComplete,
                parameterHints: { enabled: true },
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                formatOnType: true,
                formatOnPaste: true
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
                  Executing {currentLanguage} code...
                </div>
              ) : output ? (
                <pre className={`text-sm whitespace-pre-wrap font-mono ${
                  hasError ? 'text-destructive' : 'text-foreground'
                }`}>
                  {output}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Click "Run Code" to execute your {currentLanguage} code. Output will appear here.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        {showAISidebar && (
          <div className="w-80 border-l bg-muted/30">
            <Tabs defaultValue="analysis" className="h-full">
              <TabsList className="grid w-full grid-cols-3 m-4">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="suggestions">Hints</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis" className="px-4 pb-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-accent" />
                      Code Analysis
                    </CardTitle>
                    <CardDescription>
                      AI-powered insights about your code
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiInsights ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-center p-2 bg-primary/5 rounded">
                            <div className="font-bold text-primary">{aiInsights.score || 85}</div>
                            <div className="text-xs text-muted-foreground">Quality Score</div>
                          </div>
                          <div className="text-center p-2 bg-success/5 rounded">
                            <div className="font-bold text-success">{aiInsights.complexity || 'Medium'}</div>
                            <div className="text-xs text-muted-foreground">Complexity</div>
                          </div>
                        </div>
                        
                        {aiErrors.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Issues Found:</h4>
                            <div className="space-y-2">
                              {aiErrors.map((error, index) => (
                                <Alert key={index} className={
                                  error.severity === 'error' ? 'border-destructive' :
                                  error.severity === 'warning' ? 'border-warning' : 
                                  'border-primary'
                                }>
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    <strong>Line {error.line}:</strong> {error.message}
                                    {error.suggestion && (
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {error.suggestion}
                                      </div>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="font-medium mb-2">No Analysis Yet</p>
                        <p className="text-sm">Click "AI Analyze" to get insights</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="suggestions" className="px-4 pb-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-warning" />
                      AI Suggestions
                    </CardTitle>
                    <CardDescription>
                      Improve your code with AI recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiSuggestions.length > 0 ? (
                      <div className="space-y-3">
                        {aiSuggestions.map((suggestion, index) => (
                          <Alert key={index}>
                            <Wand2 className="h-4 w-4" />
                            <AlertDescription>
                              {suggestion}
                            </AlertDescription>
                          </Alert>
                        ))}
                        
                        <Button variant="outline" size="sm" className="w-full">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Get More Suggestions
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <Lightbulb className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="font-medium mb-2">No Suggestions Yet</p>
                        <p className="text-sm">Write some code to get AI suggestions</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Optimize Performance
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Zap className="w-4 h-4 mr-2" />
                      Add Error Handling
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Documentation
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Search className="w-4 h-4 mr-2" />
                      Explain Code
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="px-4 pb-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Editor Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Theme</label>
                      <select 
                        value={theme} 
                        onChange={(e) => setTheme(e.target.value as any)}
                        className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
                      >
                        <option value="vs-dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="vs">Classic</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Font Size</label>
                      <select 
                        value={fontSize} 
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
                      >
                        <option value={12}>12px</option>
                        <option value={14}>14px</option>
                        <option value={16}>16px</option>
                        <option value={18}>18px</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={showMinimap}
                          onChange={(e) => setShowMinimap(e.target.checked)}
                        />
                        <span className="text-sm">Show Minimap</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={autoComplete}
                          onChange={(e) => setAutoComplete(e.target.checked)}
                        />
                        <span className="text-sm">AI Auto-completion</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={autoSave}
                          onChange={(e) => setAutoSave(e.target.checked)}
                        />
                        <span className="text-sm">Auto Save</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={wordWrap === 'on'}
                          onChange={(e) => setWordWrap(e.target.checked ? 'on' : 'off')}
                        />
                        <span className="text-sm">Word Wrap</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
