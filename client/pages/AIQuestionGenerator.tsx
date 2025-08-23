import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authFetch } from "@/contexts/AuthContext";
import {
  Sparkles,
  Brain,
  Code,
  ArrowLeft,
  Copy,
  Download,
  RefreshCw,
  GraduationCap,
  LogOut
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface GeneratedQuestion {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starter_code: string;
  test_cases: Array<{
    input: string;
    expected_output: string;
  }>;
  tags: string[];
  hints: string[];
}

export default function AIQuestionGenerator() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [topic, setTopic] = useState('algorithms');
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const topics = [
    'algorithms',
    'data-structures',
    'arrays',
    'strings',
    'trees',
    'graphs',
    'dynamic-programming',
    'recursion',
    'sorting',
    'searching',
    'hash-tables',
    'linked-lists',
    'stacks-queues',
    'greedy-algorithms',
    'bit-manipulation',
    'math',
    'custom'
  ];

  const generateQuestion = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const topicToUse = topic === 'custom' ? customTopic : topic;

      const response = await authFetch('/api/ai/generate-question', {
        method: 'POST',
        body: JSON.stringify({
          difficulty,
          topic: topicToUse,
          language: 'Python'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedQuestion(result.question);
      } else {
        setError(result.error || 'Failed to generate question');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    }
    
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/student/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TechPrep</h1>
                <p className="text-sm text-muted-foreground">AI Question Generator</p>
              </div>
            </Link>
            
            <div className="h-6 w-px bg-border" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              AI Question Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate unlimited unique coding problems powered by Gemini AI. Perfect for practice, assignments, and assessments.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Generation Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-accent" />
                  Generate New Question
                </CardTitle>
                <CardDescription>
                  Customize the parameters to generate a unique coding problem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy - Beginner friendly</SelectItem>
                      <SelectItem value="Medium">Medium - Intermediate level</SelectItem>
                      <SelectItem value="Hard">Hard - Advanced concepts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic/Category</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="algorithms">Algorithms</SelectItem>
                      <SelectItem value="data-structures">Data Structures</SelectItem>
                      <SelectItem value="arrays">Arrays</SelectItem>
                      <SelectItem value="strings">Strings</SelectItem>
                      <SelectItem value="trees">Trees</SelectItem>
                      <SelectItem value="graphs">Graphs</SelectItem>
                      <SelectItem value="dynamic-programming">Dynamic Programming</SelectItem>
                      <SelectItem value="recursion">Recursion</SelectItem>
                      <SelectItem value="sorting">Sorting</SelectItem>
                      <SelectItem value="searching">Searching</SelectItem>
                      <SelectItem value="hash-tables">Hash Tables</SelectItem>
                      <SelectItem value="linked-lists">Linked Lists</SelectItem>
                      <SelectItem value="stacks-queues">Stacks & Queues</SelectItem>
                      <SelectItem value="greedy-algorithms">Greedy Algorithms</SelectItem>
                      <SelectItem value="bit-manipulation">Bit Manipulation</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="custom">Custom Topic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {topic === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="customTopic">Custom Topic</Label>
                    <Input
                      id="customTopic"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g., machine learning, web scraping, etc."
                    />
                  </div>
                )}

                <Button
                  onClick={generateQuestion}
                  disabled={isGenerating || (topic === 'custom' && !customTopic.trim())}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Question...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Question
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Question Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-6 h-6 text-primary" />
                  Generated Question
                </CardTitle>
                <CardDescription>
                  Your AI-generated coding problem will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedQuestion ? (
                  <div className="space-y-6">
                    {/* Question Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{generatedQuestion.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(generatedQuestion.difficulty)}>
                            {generatedQuestion.difficulty}
                          </Badge>
                          {generatedQuestion.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(generatedQuestion, null, 2))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {generatedQuestion.description}
                      </p>
                    </div>

                    {/* Test Cases */}
                    <div>
                      <h4 className="font-semibold mb-2">Test Cases</h4>
                      <div className="space-y-2">
                        {generatedQuestion.test_cases?.map((testCase, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                            <div className="mb-1">
                              <strong>Input:</strong> {testCase.input}
                            </div>
                            <div>
                              <strong>Output:</strong> {testCase.expected_output}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hints */}
                    {generatedQuestion.hints && generatedQuestion.hints.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Hints</h4>
                        <div className="space-y-1">
                          {generatedQuestion.hints.map((hint, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {index + 1}. {hint}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Starter Code */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Starter Code</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generatedQuestion.starter_code)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Code
                        </Button>
                      </div>
                      <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                        <code>{generatedQuestion.starter_code}</code>
                      </pre>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={generateQuestion} variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate Another
                      </Button>
                      <Button 
                        onClick={() => {
                          const dataStr = JSON.stringify(generatedQuestion, null, 2);
                          const dataBlob = new Blob([dataStr], {type: 'application/json'});
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${generatedQuestion.title.toLowerCase().replace(/\s+/g, '-')}.json`;
                          link.click();
                        }}
                        variant="outline" 
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="font-semibold mb-2">Ready to Generate</h3>
                    <p className="text-muted-foreground text-sm">
                      Configure your preferences and click "Generate Question" to create a unique coding problem using AI.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
