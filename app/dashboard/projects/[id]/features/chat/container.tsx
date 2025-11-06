"use client";

import { memo } from "react";
import { FileWithBase64 } from "./types";
import { messagesWithTimestamps } from "./helper";

// Import Custom Hooks
import { useChatState, useChatActions, useCheckpoints } from "./hooks";

// Import Components
import { ChatInputForm } from "./components/chat-input-form";
import { ChatMessageArea } from "./components/chat-message-area";
import { ChatHeader } from "./components/chat-header";

// Define the component implementation
function ChatContainerComponent() {
  const {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    isThinking,
    thinkingFlow,
  } = useChatState();
  const { handleSendMessage, handleCancelStream } = useChatActions();
  const {
    handleCreateCheckpoint,
    handleRestoreCheckpointByIndex,
    handleUndoRestore,
    hasCheckpoint,
    isRestoredCheckpoint,
    isAfterRestored,
  } = useCheckpoints();

  const handleMessageSubmit = async (
    message: string,
    files?: FileWithBase64[]
  ) => {
    await handleSendMessage(message, files, handleCreateCheckpoint);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <ChatMessageArea
        messages={messagesWithTimestamps(messages)}
        isLoading={isLoading}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        isThinking={isThinking}
        thinkingFlow={thinkingFlow}
        hasCheckpoint={hasCheckpoint}
        isRestoredCheckpoint={isRestoredCheckpoint}
        isAfterRestored={isAfterRestored}
        onRestoreCheckpoint={handleRestoreCheckpointByIndex}
        onUndoRestore={handleUndoRestore}
      />
      <ChatInputForm
        onSendMessage={handleMessageSubmit}
        onCancelStream={handleCancelStream}
        isStreaming={isStreaming}
        isThinking={isThinking}
      />
    </div>
  );
}

// Wrap the component with React.memo
export const ChatContainer = memo(ChatContainerComponent);
