import { Message } from "@/lib/ai/types";

export interface FileWithBase64 {
  file: File;
  base64: string;
}

export interface ChatState {
  messages: Array<Message>;
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  isThinking: boolean;
  thinkingFlow: string;
}