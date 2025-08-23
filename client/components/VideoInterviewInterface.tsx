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
  TrendingUp
} from "lucide-react";

interface VideoInterviewInterfaceProps {
  question: string;
  onAnswerSubmit: (transcribedText: string, analysis?: any) => void;
  isLoading?: boolean;
  disabled?: boolean;
  interviewType: 'technical' | 'behavioral';
  difficulty?: string;
  focus?: string[];
}

export default function VideoInterviewInterface({ 
  question, 
  onAnswerSubmit, 
  isLoading = false,
  disabled = false 
}: VideoInterviewInterfaceProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  
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
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera/microphone:", error);
      }
    };

    initializeVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscribedText(prev => {
          const newText = prev + finalTranscript;
          return newText;
        });
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
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
      if (!streamRef.current) return;

      // Start MediaRecorder for audio backup
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(100);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setTranscribedText("");
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsPaused(!isPaused);
      
      if (!isPaused) {
        // Pausing - stop recognition
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.pause();
        }
      } else {
        // Resuming - restart recognition
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
        if (mediaRecorderRef.current?.state === 'paused') {
          mediaRecorderRef.current.resume();
        }
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
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

  const submitAnswer = () => {
    if (transcribedText.trim()) {
      onAnswerSubmit(transcribedText.trim());
      resetRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-warning animate-pulse' : 'bg-destructive animate-pulse'}`} />
                  <Badge variant={isPaused ? "secondary" : "destructive"}>
                    {isPaused ? 'PAUSED' : 'RECORDING'} {formatTime(recordingTime)}
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
                    {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudio}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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
                    disabled={disabled || isLoading}
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording Answer
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={pauseRecording} 
                      variant="outline"
                      disabled={disabled}
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </Button>
                    <Button 
                      onClick={stopRecording} 
                      variant="destructive"
                      disabled={disabled}
                    >
                      <MicOff className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={resetRecording} 
                      variant="outline"
                      disabled={disabled}
                    >
                      <RotateCcw className="w-4 h-4" />
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
              <div className="min-h-[120px] p-3 bg-muted rounded-lg">
                {transcribedText ? (
                  <p className="text-sm leading-relaxed">{transcribedText}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {isRecording 
                      ? "Start speaking... Your answer will appear here in real-time."
                      : "Click 'Start Recording Answer' and begin speaking your response."}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={submitAnswer}
              disabled={!transcribedText.trim() || disabled || isLoading || isRecording}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Processing Answer...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer for Analysis
                </>
              )}
            </Button>
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
