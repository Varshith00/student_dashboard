import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Send, MessageCircle, Users } from "lucide-react";
import { authFetch } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { ChatMessage, TypingIndicator, Participant } from "@shared/api";

interface ChatInterfaceProps {
  sessionId: string;
  participantId: string;
  participant: Participant;
  messages: ChatMessage[];
  typingUsers: TypingIndicator[];
  onSendMessage: (message: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

export default function ChatInterface({
  sessionId,
  participantId,
  participant,
  messages,
  typingUsers,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || disabled) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        onTypingStop();
      }

      // Send via API as backup (Socket.io handles real-time)
      const response = await authFetch("/api/collaboration/message", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          participantId,
          message: messageContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Also send via socket for immediate feedback
      onSendMessage(messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      // Restore message on error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Handle typing indicators
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      onTypingStart();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (e.target.value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingStop();
      }, 2000); // Stop typing indicator after 2 seconds of inactivity
    } else if (isTyping) {
      setIsTyping(false);
      onTypingStop();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isMyMessage = (message: ChatMessage) => {
    return message.participantId === participantId;
  };

  const renderTypingIndicator = () => {
    const typingNames = typingUsers
      .filter((user) => user.isTyping && user.participantId !== participantId)
      .map((user) => user.participantName);

    if (typingNames.length === 0) return null;

    const text =
      typingNames.length === 1
        ? `${typingNames[0]} is typing...`
        : typingNames.length === 2
          ? `${typingNames[0]} and ${typingNames[1]} are typing...`
          : `${typingNames.slice(0, -1).join(", ")} and ${typingNames[typingNames.length - 1]} are typing...`;

    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
        </div>
        <span className="italic">{text}</span>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          Chat
          <Badge variant="outline" className="ml-auto">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start a conversation with your team!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isMe = isMyMessage(message);
                const showName =
                  index === 0 ||
                  messages[index - 1].participantId !== message.participantId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                      } rounded-lg px-3 py-2`}
                    >
                      {showName && !isMe && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {message.participantName}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 opacity-70 ${
                          isMe ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {renderTypingIndicator()}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Message Input */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                disabled ? "You can only view messages" : "Type a message..."
              }
              disabled={disabled || isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending || disabled}
              size="sm"
              className="px-3"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {disabled && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              You have read-only access to this session
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
