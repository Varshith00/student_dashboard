import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authFetch } from "@/contexts/AuthContext";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Brain,
  TrendingUp,
} from "lucide-react";

interface VideoInterviewInterfaceProps {
  question: string;
  onAnswerSubmit: (transcribedText: string, analysis?: any) => void;
  isLoading?: boolean;
  disabled?: boolean;
  interviewType: "technical" | "behavioral";
  difficulty?: string;
  focus?: string[];
}

export default function VideoInterviewInterface({
  question,
  onAnswerSubmit,
  isLoading = false,
  disabled = false,
  interviewType,
  difficulty,
  focus = [],
}: VideoInterviewInterfaceProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [mediaError, setMediaError] = useState<string>("");
  const [isRetryingMedia, setIsRetryingMedia] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize video stream
  useEffect(() => {
    const initializeVideo = async () => {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMediaError(
            "Camera/microphone access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.",
          );
          return;
        }

        // Check if we're running on HTTP (not HTTPS)
        if (location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          setMediaError(
            "Camera/microphone access requires HTTPS. This demo may not work on HTTP connections. Please note: In a production environment, ensure your site is served over HTTPS.",
          );
          // Continue anyway for localhost development
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
          },
        });

        streamRef.current = stream;
        setHasMediaPermission(true);
        setMediaError("");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure video plays
          videoRef.current.play().catch((e) => {
            console.log("Video autoplay prevented:", e);
            // Try to play again after user interaction
            videoRef.current?.addEventListener('click', () => {
              videoRef.current?.play();
            }, { once: true });
          });
        }
      } catch (error: any) {
        console.error("Error accessing camera/microphone:", error);
        let errorMessage = "Unable to access camera/microphone. ";
        let suggestion = "";

        switch (error.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
            errorMessage +=
              "Camera and microphone permissions were denied.";
            suggestion = "Please click the camera icon in your browser's address bar and allow permissions, then refresh the page.";
            break;
          case "NotFoundError":
          case "DevicesNotFoundError":
            errorMessage +=
              "No camera or microphone found.";
            suggestion = "Please connect a camera and microphone to your device and refresh the page.";
            break;
          case "NotSupportedError":
            errorMessage +=
              "Camera/microphone access is not supported in this browser.";
            suggestion = "Please use a modern browser like Chrome, Firefox, or Safari.";
            break;
          case "NotReadableError":
          case "TrackStartError":
            errorMessage +=
              "Camera/microphone is already in use by another application.";
            suggestion = "Please close other applications that might be using your camera/microphone and refresh the page.";
            break;
          case "OverconstrainedError":
            errorMessage +=
              "Your camera/microphone doesn't support the required settings.";
            suggestion = "Your device may not support the video/audio quality requirements.";
            break;
          default:
            errorMessage += "An unexpected error occurred.";
            suggestion = "Please check your device settings, ensure your camera and microphone are working, and try again.";
        }

        if (suggestion) {
          errorMessage += " " + suggestion;
        }

        setMediaError(errorMessage);
        setHasMediaPermission(false);
      }
    };

    // Add a small delay to ensure component is mounted
    const timer = setTimeout(initializeVideo, 100);

    return () => {
      clearTimeout(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        try {
          const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();

          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = "en-US";
          recognitionRef.current.maxAlternatives = 1;

          recognitionRef.current.onresult = (event) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            if (finalTranscript) {
              setTranscribedText((prev) => {
                const newText = prev + finalTranscript + " ";
                return newText;
              });
            }
          };

          recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);

            // Handle specific errors
            switch (event.error) {
              case 'not-allowed':
                console.warn('Speech recognition permission denied');
                break;
              case 'no-speech':
                console.warn('No speech detected');
                break;
              case 'audio-capture':
                console.warn('Audio capture failed');
                break;
              case 'network':
                console.warn('Network error for speech recognition');
                break;
              default:
                console.warn('Speech recognition error:', event.error);
            }
          };

          recognitionRef.current.onend = () => {
            // Auto-restart if still recording and not paused
            if (isRecording && !isPaused && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.warn('Failed to restart speech recognition:', error);
              }
            }
          };

          recognitionRef.current.onstart = () => {
            console.log('Speech recognition started');
          };

        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
        }
      } else {
        console.warn('Speech recognition not supported in this browser');
      }
    };

    initializeSpeechRecognition();
  }, [isRecording, isPaused]);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        setMediaError("No media stream available. Please ensure camera and microphone permissions are granted.");
        return;
      }

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        setMediaError("Recording is not supported in this browser. Please use a modern browser.");
        return;
      }

      // Try different audio formats for compatibility
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "";
          }
        }
      }

      // Start MediaRecorder for audio backup
      mediaRecorderRef.current = new MediaRecorder(streamRef.current,
        mimeType ? { mimeType } : undefined
      );

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setMediaError("Recording error occurred. Please try again.");
      };

      mediaRecorderRef.current.start(100);

      // Start speech recognition if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.warn("Speech recognition could not start:", error);
          // Continue without speech recognition
        }
      }

      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setTranscribedText("");
    } catch (error) {
      console.error("Error starting recording:", error);
      setMediaError("Failed to start recording. Please check your microphone permissions and try again.");
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsPaused(!isPaused);

      if (!isPaused) {
        // Pausing - stop recognition
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.pause();
        }
      } else {
        // Resuming - restart recognition
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
        if (mediaRecorderRef.current?.state === "paused") {
          mediaRecorderRef.current.resume();
        }
      }
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsRecording(false);
    setIsPaused(false);
  };

  const resetRecording = () => {
    stopRecording();
    setRecordingTime(0);
    setTranscribedText("");
  };

  const submitAnswer = async () => {
    if (!transcribedText.trim()) return;

    setIsAnalyzing(true);

    try {
      // Call AI analysis API
      const response = await authFetch("/api/audio/analyze-answer", {
        method: "POST",
        body: JSON.stringify({
          transcription: transcribedText.trim(),
          question: question,
          interviewType: interviewType,
          difficulty: difficulty,
          focus: focus,
        }),
      });

      const analysisData = await response.json();

      if (analysisData.success) {
        setAnalysisResult(analysisData);
        onAnswerSubmit(transcribedText.trim(), analysisData);
      } else {
        // Fallback to basic submission without analysis
        onAnswerSubmit(transcribedText.trim());
      }
    } catch (error) {
      console.error("Analysis error:", error);
      // Fallback to basic submission without analysis
      onAnswerSubmit(transcribedText.trim());
    } finally {
      setIsAnalyzing(false);
      resetRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const retryMediaAccess = async () => {
    setIsRetryingMedia(true);
    setMediaError("");

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Try again with reduced constraints if the first attempt failed
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      setHasMediaPermission(true);
      setMediaError("");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }
    } catch (error: any) {
      console.error("Retry error:", error);
      setMediaError("Still unable to access camera/microphone. You can continue with text-only mode by switching to Chat view.");
      setHasMediaPermission(false);
    } finally {
      setIsRetryingMedia(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Display */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3">Interview Question:</h3>
          <p className="text-foreground leading-relaxed">{question}</p>
        </CardContent>
      </Card>

      {/* Video Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Video Feed */}
        <Card>
          <CardContent className="p-4">
            <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
              {isVideoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <VideoOff className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              {/* Media Error Overlay */}
              {mediaError && (
                <div className="absolute inset-0 bg-muted/90 flex items-center justify-center p-4">
                  <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <VideoOff className="w-8 h-8 text-warning" />
                    </div>
                    <h4 className="font-semibold mb-2 text-foreground">Camera/Microphone Access Issue</h4>
                    <p className="text-sm text-muted-foreground mb-4">{mediaError}</p>
                    <div className="space-y-2">
                      <Button
                        onClick={retryMediaAccess}
                        disabled={isRetryingMedia}
                        size="sm"
                        className="w-full"
                      >
                        {isRetryingMedia ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                            Retrying...
                          </>
                        ) : (
                          'Try Again'
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        You can also continue with Chat mode instead of Video mode
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${isPaused ? "bg-warning animate-pulse" : "bg-destructive animate-pulse"}`}
                  />
                  <Badge variant={isPaused ? "secondary" : "destructive"}>
                    {isPaused ? "PAUSED" : "RECORDING"}{" "}
                    {formatTime(recordingTime)}
                  </Badge>
                </div>
              )}

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2 bg-background/90 backdrop-blur rounded-full p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleVideo}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    {isVideoEnabled ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <VideoOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudio}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    {isAudioEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recording Controls & Transcription */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Recording Controls */}
            <div className="space-y-3">
              <h4 className="font-semibold">Recording Controls</h4>
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={disabled || isLoading || !hasMediaPermission}
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {hasMediaPermission ? "Start Recording Answer" : "Camera/Mic Not Ready"}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={pauseRecording}
                      variant="outline"
                      disabled={disabled}
                      size="sm"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      disabled={disabled}
                      size="sm"
                    >
                      <MicOff className="w-4 h-4 mr-1" />
                      Stop
                    </Button>
                    <Button
                      onClick={resetRecording}
                      variant="outline"
                      disabled={disabled}
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Live Transcription */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Live Transcription</h4>
                {isTranscribing && (
                  <Badge variant="secondary">
                    <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-1" />
                    Processing...
                  </Badge>
                )}
              </div>
              <div className="min-h-[120px] p-3 bg-muted rounded-lg relative">
                {transcribedText ? (
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed">{transcribedText}</p>
                    {!hasMediaPermission && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newText = prompt("Edit your answer:", transcribedText);
                          if (newText !== null) {
                            setTranscribedText(newText);
                          }
                        }}
                      >
                        Edit Text
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground italic">
                      {isRecording
                        ? "Start speaking... Your answer will appear here in real-time."
                        : hasMediaPermission
                        ? "Click 'Start Recording Answer' and begin speaking your response."
                        : "You can type your answer manually using the button below."}
                    </p>
                    {!hasMediaPermission && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const answer = prompt("Type your answer:", "");
                          if (answer) {
                            setTranscribedText(answer);
                          }
                        }}
                      >
                        Type Answer Manually
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={submitAnswer}
              disabled={
                !transcribedText.trim() ||
                disabled ||
                isLoading ||
                isRecording ||
                isAnalyzing
              }
              className="w-full"
              size="lg"
            >
              {isLoading || isAnalyzing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  {isAnalyzing
                    ? "Analyzing with AI..."
                    : "Processing Answer..."}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer for AI Analysis
                </>
              )}
            </Button>

            {!hasMediaPermission && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  💡 Tip: You can type your answer manually in the transcription box above if camera/microphone access isn't available
                </p>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <Card className="mt-4 border-accent/20 bg-accent/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-accent" />
                    <h5 className="font-semibold">AI Analysis Results</h5>
                    <Badge variant="secondary" className="ml-auto">
                      Score: {analysisResult.score}/100
                    </Badge>
                  </div>

                  {analysisResult.feedback && (
                    <div className="space-y-2">
                      <h6 className="font-medium text-sm">Feedback:</h6>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysisResult.feedback}
                      </p>
                    </div>
                  )}

                  {analysisResult.suggestions &&
                    analysisResult.suggestions.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <h6 className="font-medium text-sm">
                          Suggestions for Improvement:
                        </h6>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {analysisResult.suggestions.map(
                            (suggestion: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <TrendingUp className="w-3 h-3 mt-0.5 text-accent" />
                                {suggestion}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {analysisResult.strengths &&
                    analysisResult.strengths.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <h6 className="font-medium text-sm text-success">
                          Strengths:
                        </h6>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {analysisResult.strengths.map(
                            (strength: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="w-1 h-1 rounded-full bg-success mt-2" />
                                {strength}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-semibold mb-2">🎥 Video Guidelines</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Position yourself clearly in frame</li>
                <li>• Ensure good lighting</li>
                <li>• Look at the camera when speaking</li>
                <li>• Video is for your reflection only</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">🎙️ Audio Tips</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Speak clearly and at normal pace</li>
                <li>• Minimize background noise</li>
                <li>• Use a quiet environment</li>
                <li>• Audio is converted to text for analysis</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">📝 Answer Strategy</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Think before you start recording</li>
                <li>• Structure your response clearly</li>
                <li>• Explain your thought process</li>
                <li>• You can pause and resume recording</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
