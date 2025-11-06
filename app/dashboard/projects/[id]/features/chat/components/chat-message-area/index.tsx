import { useEffect, useRef, useMemo } from "react";
import { ChatMessageList } from "./chat-message-list";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "./chat-bubble";
import { formatDistanceToNow } from "date-fns";
import { History } from "lucide-react";
import { Message } from "@/lib/ai/types";

interface ChatMessageAreaProps {
  messages: (Message & { timestamp?: Date })[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  isThinking: boolean;
  thinkingFlow: string;
  hasCheckpoint: (index: number) => boolean;
  isRestoredCheckpoint: (index: number) => boolean;
  isAfterRestored: (index: number) => boolean;
  onRestoreCheckpoint: (index: number) => void;
  onUndoRestore: () => void;
}

export function ChatMessageArea({
  messages,
  isLoading,
  isStreaming,
  streamingContent,
  isThinking,
  thinkingFlow,
  hasCheckpoint,
  isRestoredCheckpoint,
  isAfterRestored,
  onRestoreCheckpoint,
  onUndoRestore,
}: ChatMessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isStreaming]);

  // Helper functions for message grouping
  const isNewMessageGroup = (index: number) => {
    if (index === 0) return true;
    return messages[index].role !== messages[index - 1].role;
  };

  const isLastInMessageGroup = (index: number) => {
    if (index === messages.length - 1) return true;
    return messages[index].role !== messages[index + 1].role;
  };

  const filteredMessages = useMemo(() => {
    if (!isStreaming && !isThinking) return messages;
    return messages.filter((message, index) => {
      if (index === messages.length - 1 && message.role === "assistant") {
        return false;
      }
      return true;
    });
  }, [messages, isStreaming, isThinking]);

  return (
    <div className="flex-1 min-h-0 p-3 overflow-y-auto bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-transparent dark:to-primary/5 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
      <ChatMessageList>
        {filteredMessages.map((message, index) => {
          const isFirstInGroup = isNewMessageGroup(index);
          const isLastInGroup = isLastInMessageGroup(index);
          const isUser = message.role === "user";

          return (
            <div
              key={index}
              className={`animate-in fade-in duration-300 ${
                isFirstInGroup ? "mt-0.5" : "mt-1"
              }`}
            >
              {isNewMessageGroup(index) &&
                message.role === "user" &&
                hasCheckpoint(index) && (
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={
                        isRestoredCheckpoint(index)
                          ? onUndoRestore
                          : () => onRestoreCheckpoint(index)
                      }
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md ${
                        isRestoredCheckpoint(index)
                          ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500"
                          : "bg-primary/10 hover:bg-primary/20 text-primary"
                      } transition-colors`}
                    >
                      <History className="w-3 h-3" />
                      <span>
                        {isRestoredCheckpoint(index)
                          ? "Checkpoint restored. Undo"
                          : "Restore checkpoint"}
                      </span>
                    </button>
                  </div>
                )}
              <div className={isAfterRestored(index) ? "opacity-50" : ""}>
                {isFirstInGroup && (
                  <div
                    className={`text-xs mb-0.5 text-muted-foreground ${
                      isUser ? "text-right mr-1" : "ml-1"
                    }`}
                  >
                    {isUser ? "You" : "Rubberduck AI"}
                  </div>
                )}
                <ChatBubble
                  variant={isUser ? "sent" : "received"}
                  className={`
                    ${!isFirstInGroup && !isLastInGroup ? "my-[3px]" : ""}
                    ${isFirstInGroup && !isLastInGroup ? "mb-[3px] mt-0.5" : ""}
                    ${!isFirstInGroup && isLastInGroup ? "mt-[3px] mb-0.5" : ""}
                  `}
                >
                  <div className="flex flex-col w-full">
                    <ChatBubbleMessage>
                      {typeof message.content === "string"
                        ? message.content
                        : JSON.stringify(message.content)}
                    </ChatBubbleMessage>
                    {isLastInGroup && message.timestamp && (
                      <ChatBubbleTimestamp
                        timestamp={formatDistanceToNow(message.timestamp, {
                          addSuffix: true,
                        })}
                      />
                    )}
                  </div>
                </ChatBubble>
              </div>
            </div>
          );
        })}

        {/* Unified AI Response Area - Combines Thinking, Streaming, and Final Message */}
        {(isThinking || isStreaming) && (
          <div className="animate-in fade-in duration-200 mt-2">
            <div className="text-xs mb-0.5 text-muted-foreground ml-1">
              Rubberduck AI
              {isThinking && (
                <span className="ml-2 text-amber-700 dark:text-amber-400 text-xs inline-flex items-center">
                  thinking
                  <span className="w-4 text-center">
                    <span className="typing-dots">
                      <span className="dot">.</span>
                      <span className="dot">.</span>
                      <span className="dot">.</span>
                    </span>
                  </span>
                </span>
              )}
              {!isThinking && isStreaming && (
                <span className="ml-2 text-primary text-xs inline-flex items-center">
                  responding
                  <span className="w-4 text-center">
                    <span className="typing-dots">
                      <span className="dot">.</span>
                      <span className="dot">.</span>
                      <span className="dot">.</span>
                    </span>
                  </span>
                </span>
              )}
            </div>
            <ChatBubble
              variant="received"
              className={`transition-all duration-300 ${
                isThinking
                  ? "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent"
                  : "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
              }`}
            >
              <div className="flex flex-col w-full">
                <ChatBubbleMessage>
                  {isThinking && thinkingFlow && (
                    <div className="font-mono text-xs text-amber-700 dark:text-amber-300/90 whitespace-pre-wrap thinking-content">
                      {thinkingFlow.split("\n").map((line, i) => (
                        <div
                          key={i}
                          className={`thinking-line ${
                            i === thinkingFlow.split("\n").length - 1
                              ? "latest-line"
                              : ""
                          }`}
                        >
                          {line}
                        </div>
                      ))}
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-amber-600 dark:bg-amber-400/70 thinking-cursor"></span>
                    </div>
                  )}
                  {isStreaming && streamingContent && (
                    <div
                      className={`streaming-content ${
                        isThinking
                          ? "mt-4 pt-4 border-t border-amber-500/20"
                          : ""
                      }`}
                    >
                      {streamingContent}
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary/70 streaming-cursor"></span>
                    </div>
                  )}
                </ChatBubbleMessage>
                <ChatBubbleTimestamp timestamp="Just now">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isThinking ? "bg-amber-400/70" : "bg-primary/70"
                      } pulse-glow`}
                    ></span>
                    {isThinking ? "Processing..." : "Just now"}
                  </span>
                </ChatBubbleTimestamp>
              </div>
            </ChatBubble>
          </div>
        )}

        {/* Loading Indicator - Only show when not thinking or streaming */}
        {isLoading && !isStreaming && !isThinking && (
          <div className="animate-in fade-in duration-200 mt-2">
            <div className="text-xs mb-0.5 text-muted-foreground ml-1">
              Rubberduck AI
            </div>
            <ChatBubble variant="received">
              <ChatBubbleMessage isLoading={true} />
            </ChatBubble>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ChatMessageList>
    </div>
  );
}
