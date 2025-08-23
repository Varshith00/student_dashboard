import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedWebEditor from "@/components/EnhancedWebEditor";
import CodeEditor from "@/components/CodeEditor";
import {
  Monitor,
  Code,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Maximize,
  Minimize,
  Settings
} from "lucide-react";

/**
 * Test page for verifying ResizeObserver fixes
 * This page allows testing various scenarios that commonly trigger ResizeObserver errors
 */
export default function ResizeObserverTest() {
  const [currentTest, setCurrentTest] = useState<'enhanced' | 'basic'>('enhanced');
  const [containerSize, setContainerSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSecondEditor, setShowSecondEditor] = useState(false);
  const [rapidResize, setRapidResize] = useState(false);

  const testProblem = {
    id: 'test-1',
    title: 'ResizeObserver Test Problem',
    description: 'A test problem to verify ResizeObserver error handling in Monaco Editor components.',
    difficulty: 'Easy' as const,
    starter_code: `# ResizeObserver Test Code
# This code is used to test ResizeObserver error handling

def test_resize_observer():
    """
    Test function for ResizeObserver fixes
    """
    print("Testing ResizeObserver error handling...")
    
    # Test rapid resizing
    for i in range(10):
        print(f"Resize test iteration {i + 1}")
    
    print("✅ ResizeObserver test completed successfully!")
    return True

# Run the test
if __name__ == "__main__":
    result = test_resize_observer()
    print(f"Test result: {result}")
`,
    test_cases: [
      {
        input: "test_resize_observer()",
        expected_output: "✅ ResizeObserver test completed successfully!"
      }
    ]
  };

  const containerStyles = {
    small: { width: '400px', height: '300px' },
    medium: { width: '800px', height: '500px' },
    large: { width: '1200px', height: '700px' }
  };

  const triggerRapidResize = () => {
    setRapidResize(true);
    const sizes = ['small', 'medium', 'large'] as const;
    let index = 0;
    
    const interval = setInterval(() => {
      setContainerSize(sizes[index % sizes.length]);
      index++;
      
      if (index >= 10) {
        clearInterval(interval);
        setRapidResize(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">ResizeObserver Test Page</h1>
                  <p className="text-muted-foreground">
                    Test and verify ResizeObserver error handling fixes for Monaco Editor
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Testing Mode
            </Badge>
          </div>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Test Controls
            </CardTitle>
            <CardDescription>
              Use these controls to test various ResizeObserver scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Editor Type Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Editor Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={currentTest === 'enhanced' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTest('enhanced')}
                  >
                    Enhanced Editor
                  </Button>
                  <Button
                    variant={currentTest === 'basic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTest('basic')}
                  >
                    Basic Editor
                  </Button>
                </div>
              </div>

              {/* Container Size */}
              <div>
                <label className="text-sm font-medium mb-2 block">Container Size</label>
                <div className="flex gap-1">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={containerSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setContainerSize(size)}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Test Actions */}
              <div>
                <label className="text-sm font-medium mb-2 block">Test Actions</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    {isCollapsed ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
                    {isCollapsed ? 'Expand' : 'Collapse'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerRapidResize}
                    disabled={rapidResize}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {rapidResize ? 'Testing...' : 'Rapid Resize'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showSecondEditor}
                    onChange={(e) => setShowSecondEditor(e.target.checked)}
                  />
                  <span className="text-sm">Show Second Editor (Multi-editor test)</span>
                </label>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Current Size:</strong> {containerSize} ({containerStyles[containerSize].width} × {containerStyles[containerSize].height})</p>
                <p><strong>Status:</strong> {rapidResize ? 'Rapid resizing active' : 'Ready for testing'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              ResizeObserver Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">Global error handling active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">Safe ResizeObserver implemented</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">Debounced resize events</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Test Area */}
        <div className="space-y-4">
          {!isCollapsed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Primary Editor Test
                </CardTitle>
                <CardDescription>
                  Testing {currentTest === 'enhanced' ? 'Enhanced Web Editor' : 'Basic Code Editor'} 
                  with ResizeObserver error handling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  style={{
                    ...containerStyles[containerSize],
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {currentTest === 'enhanced' ? (
                    <EnhancedWebEditor language="python" fileName="test.py" />
                  ) : (
                    <CodeEditor problem={testProblem} />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {showSecondEditor && !isCollapsed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Secondary Editor Test
                </CardTitle>
                <CardDescription>
                  Testing multiple Monaco Editor instances simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  style={{
                    ...containerStyles[containerSize],
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {currentTest === 'basic' ? (
                    <EnhancedWebEditor language="javascript" fileName="test.js" />
                  ) : (
                    <CodeEditor problem={testProblem} />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>1. Container Resizing:</strong> Use the size buttons to test how the editor handles container size changes.
              </div>
              <div>
                <strong>2. Rapid Resize Test:</strong> Click "Rapid Resize" to test the debouncing and error handling during rapid size changes.
              </div>
              <div>
                <strong>3. Multi-Editor Test:</strong> Enable "Show Second Editor" to test multiple Monaco instances.
              </div>
              <div>
                <strong>4. Collapse/Expand:</strong> Test how the editor handles visibility changes.
              </div>
              <div>
                <strong>5. Console Check:</strong> Open browser console to verify no ResizeObserver errors are logged.
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded">
                <strong>Expected Result:</strong> No "ResizeObserver loop limit exceeded" errors should appear in the console,
                and the editor should resize smoothly without layout issues.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
