import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Users,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { Participant, VoiceState } from "@shared/api";
import { Socket } from "socket.io-client";

interface VoiceChatProps {
  sessionId: string;
  participantId: string;
  participant: Participant;
  participants: Participant[];
  socket: Socket | null;
  disabled?: boolean;
}

interface PeerConnection {
  participantId: string;
  participantName: string;
  connection: RTCPeerConnection;
  audioElement?: HTMLAudioElement;
}

export default function VoiceChat({
  sessionId,
  participantId,
  participant,
  participants,
  socket,
  disabled = false,
}: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<"good" | "poor" | "disconnected">("disconnected");

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const audioContainerRef = useRef<HTMLDivElement>(null);

  // WebRTC configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Get local media stream
  const getLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      
      setHasPermission(true);
      setError(null);
      return stream;
    } catch (err: any) {
      console.error("Error getting user media:", err);
      setHasPermission(false);
      
      if (err.name === "NotAllowedError") {
        setError("Microphone permission denied. Please allow microphone access and try again.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone and try again.");
      } else {
        setError(`Microphone error: ${err.message}`);
      }
      
      return null;
    }
  }, []);

  // Create peer connection for a participant
  const createPeerConnection = useCallback((targetParticipantId: string, targetParticipantName: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(rtcConfig);
    
    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log(`Received remote track from ${targetParticipantName}`);
      const [remoteStream] = event.streams;
      
      // Create audio element for remote stream
      const audioElement = document.createElement("audio");
      audioElement.srcObject = remoteStream;
      audioElement.autoplay = true;
      audioElement.muted = isDeafened;
      audioElement.volume = isDeafened ? 0 : 1;
      
      // Add to container
      if (audioContainerRef.current) {
        audioContainerRef.current.appendChild(audioElement);
      }
      
      // Update peer connection reference
      const peerConn = peerConnectionsRef.current.get(targetParticipantId);
      if (peerConn) {
        peerConn.audioElement = audioElement;
        peerConnectionsRef.current.set(targetParticipantId, peerConn);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("voice-ice-candidate", {
          sessionId,
          participantId: targetParticipantId,
          candidate: {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
          },
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${targetParticipantName}:`, pc.connectionState);
      
      if (pc.connectionState === "connected") {
        setConnectionQuality("good");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setConnectionQuality("poor");
      }
    };

    return pc;
  }, [sessionId, socket, isDeafened]);

  // Start voice call
  const startVoiceCall = useCallback(async () => {
    if (!socket || isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Get local media stream
      const stream = await getLocalStream();
      if (!stream) {
        setIsConnecting(false);
        return;
      }

      localStreamRef.current = stream;

      // Create peer connections for each active participant (except self)
      const activeParticipants = participants.filter(
        (p) => p.isActive && p.id !== participantId
      );

      for (const targetParticipant of activeParticipants) {
        const pc = createPeerConnection(targetParticipant.id, targetParticipant.name);
        
        peerConnectionsRef.current.set(targetParticipant.id, {
          participantId: targetParticipant.id,
          participantName: targetParticipant.name,
          connection: pc,
        });

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("voice-offer", {
          sessionId,
          participantId: targetParticipant.id,
          offer: {
            type: offer.type,
            sdp: offer.sdp,
          },
        });
      }

      setIsConnected(true);
      setConnectionQuality("good");
      
      // Emit voice state change
      socket.emit("voice-state-change", {
        sessionId,
        participantId,
        state: "connected",
      });

      toast.success("Voice chat connected!");
    } catch (err: any) {
      console.error("Error starting voice call:", err);
      setError(`Failed to start voice call: ${err.message}`);
      toast.error("Failed to start voice call");
    } finally {
      setIsConnecting(false);
    }
  }, [socket, isConnecting, isConnected, getLocalStream, participants, participantId, sessionId, createPeerConnection]);

  // Stop voice call
  const stopVoiceCall = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((peerConn) => {
      peerConn.connection.close();
      if (peerConn.audioElement) {
        peerConn.audioElement.remove();
      }
    });
    peerConnectionsRef.current.clear();

    // Clear audio container
    if (audioContainerRef.current) {
      audioContainerRef.current.innerHTML = "";
    }

    setIsConnected(false);
    setConnectionQuality("disconnected");

    // Emit voice state change
    if (socket) {
      socket.emit("voice-state-change", {
        sessionId,
        participantId,
        state: "disconnected",
      });
    }

    toast.success("Voice chat disconnected");
  }, [socket, sessionId, participantId]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;

    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = isMuted;
    });

    setIsMuted(!isMuted);

    // Emit voice state change
    if (socket) {
      socket.emit("voice-state-change", {
        sessionId,
        participantId,
        state: isMuted ? "unmuted" : "muted",
      });
    }

    toast.success(isMuted ? "Microphone unmuted" : "Microphone muted");
  }, [isMuted, socket, sessionId, participantId]);

  // Toggle deafen
  const toggleDeafen = useCallback(() => {
    const newDeafenState = !isDeafened;
    setIsDeafened(newDeafenState);

    // Update all remote audio elements
    peerConnectionsRef.current.forEach((peerConn) => {
      if (peerConn.audioElement) {
        peerConn.audioElement.muted = newDeafenState;
        peerConn.audioElement.volume = newDeafenState ? 0 : 1;
      }
    });

    toast.success(newDeafenState ? "Audio deafened" : "Audio undeafened");
  }, [isDeafened]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleVoiceOffer = async (data: any) => {
      const { offer, participantId: offerParticipantId } = data;
      
      // Find participant
      const targetParticipant = participants.find((p) => p.id === offerParticipantId);
      if (!targetParticipant) return;

      try {
        // Create peer connection if not exists
        let peerConn = peerConnectionsRef.current.get(offerParticipantId);
        if (!peerConn) {
          const pc = createPeerConnection(offerParticipantId, targetParticipant.name);
          peerConn = {
            participantId: offerParticipantId,
            participantName: targetParticipant.name,
            connection: pc,
          };
          peerConnectionsRef.current.set(offerParticipantId, peerConn);
        }

        // Set remote description
        await peerConn.connection.setRemoteDescription(new RTCSessionDescription(offer));

        // Create and send answer
        const answer = await peerConn.connection.createAnswer();
        await peerConn.connection.setLocalDescription(answer);

        socket.emit("voice-answer", {
          sessionId,
          participantId: offerParticipantId,
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        });
      } catch (err) {
        console.error("Error handling voice offer:", err);
      }
    };

    const handleVoiceAnswer = async (data: any) => {
      const { answer, participantId: answerParticipantId } = data;
      
      const peerConn = peerConnectionsRef.current.get(answerParticipantId);
      if (!peerConn) return;

      try {
        await peerConn.connection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("Error handling voice answer:", err);
      }
    };

    const handleVoiceIceCandidate = async (data: any) => {
      const { candidate, participantId: candidateParticipantId } = data;
      
      const peerConn = peerConnectionsRef.current.get(candidateParticipantId);
      if (!peerConn) return;

      try {
        await peerConn.connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error handling ICE candidate:", err);
      }
    };

    const handleVoiceStateChange = (data: any) => {
      const { participantId: stateParticipantId, state } = data;
      console.log(`Voice state change: ${stateParticipantId} is now ${state}`);
      // Could update UI to show participant voice states
    };

    socket.on("voice-offer", handleVoiceOffer);
    socket.on("voice-answer", handleVoiceAnswer);
    socket.on("voice-ice-candidate", handleVoiceIceCandidate);
    socket.on("voice-state-change", handleVoiceStateChange);

    return () => {
      socket.off("voice-offer", handleVoiceOffer);
      socket.off("voice-answer", handleVoiceAnswer);
      socket.off("voice-ice-candidate", handleVoiceIceCandidate);
      socket.off("voice-state-change", handleVoiceStateChange);
    };
  }, [socket, sessionId, participants, createPeerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceCall();
    };
  }, [stopVoiceCall]);

  // Check microphone permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Check if already have permission
          const permissions = await navigator.permissions.query({ name: "microphone" as PermissionName });
          setHasPermission(permissions.state === "granted");
        } else {
          setHasPermission(false);
          setError("WebRTC not supported in this browser");
        }
      } catch (err) {
        console.error("Error checking microphone permission:", err);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case "good": return <Wifi className="w-4 h-4 text-success" />;
      case "poor": return <WifiOff className="w-4 h-4 text-warning" />;
      default: return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getConnectionBadge = () => {
    if (isConnecting) return <Badge variant="outline">Connecting...</Badge>;
    if (isConnected) return <Badge variant="default">Connected</Badge>;
    return <Badge variant="secondary">Disconnected</Badge>;
  };

  const activeVoiceParticipants = participants.filter(
    (p) => p.isActive && p.id !== participantId && p.voiceState?.isConnected
  );

  if (disabled) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="w-5 h-5" />
            Voice Chat
            <Badge variant="secondary" className="ml-auto">Disabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Voice chat is not available with read-only access.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Phone className="w-5 h-5" />
          Voice Chat
          <div className="ml-auto flex items-center gap-2">
            {getConnectionIcon()}
            {getConnectionBadge()}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasPermission === false && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Microphone permission is required for voice chat. Please enable microphone access in your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Voice Controls */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={startVoiceCall}
                disabled={isConnecting || hasPermission === false || !socket}
                className="flex-1"
                variant="default"
              >
                <Phone className="w-4 h-4 mr-2" />
                {isConnecting ? "Connecting..." : "Join Voice"}
              </Button>
            ) : (
              <Button
                onClick={stopVoiceCall}
                variant="destructive"
                className="flex-1"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                Leave Voice
              </Button>
            )}
          </div>

          {isConnected && (
            <div className="flex gap-2">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                className="flex-1"
              >
                {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                onClick={toggleDeafen}
                variant={isDeafened ? "destructive" : "outline"}
                size="sm"
                className="flex-1"
              >
                {isDeafened ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                {isDeafened ? "Undeafen" : "Deafen"}
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Participants List */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Users className="w-4 h-4" />
            Voice Participants ({activeVoiceParticipants.length + (isConnected ? 1 : 0)})
          </div>
          
          <div className="space-y-2">
            {/* Current user */}
            {isConnected && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ backgroundColor: participant.color }}
                >
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm flex-1">{participant.name} (You)</span>
                <div className="flex items-center gap-1">
                  {isMuted ? <MicOff className="w-3 h-3 text-destructive" /> : <Mic className="w-3 h-3 text-success" />}
                  {isDeafened && <VolumeX className="w-3 h-3 text-destructive" />}
                </div>
              </div>
            )}

            {/* Other participants */}
            {activeVoiceParticipants.map((p) => (
              <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm flex-1">{p.name}</span>
                <div className="flex items-center gap-1">
                  {p.voiceState?.isMuted ? (
                    <MicOff className="w-3 h-3 text-destructive" />
                  ) : (
                    <Mic className="w-3 h-3 text-success" />
                  )}
                </div>
              </div>
            ))}

            {activeVoiceParticipants.length === 0 && !isConnected && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No one is in voice chat yet.
              </p>
            )}
          </div>
        </div>

        {/* Hidden audio container for remote streams */}
        <div ref={audioContainerRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
