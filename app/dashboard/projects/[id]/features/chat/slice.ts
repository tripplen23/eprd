import { Message } from "@/lib/ai/types";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatState } from "./types";

const initialState: ChatState = {
  messages: [
    {
      role: "assistant",
      content: `Hi there! It looks like we're starting fresh with a new Product Requirement Document (PRD). Would you like to begin by focusing on:\n1. Describing a prototype or solution idea you have in mind?\n2. Exploring a business process that needs improvement?\n\nLet me know what works best for you, or feel free to share any existing documentation or ideas you already have!`,
    },
  ],
  isLoading: false,
  isStreaming: false,
  streamingContent: "",
  isThinking: false,
  thinkingFlow: "",
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setIsStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },
    setStreamingContent: (state, action: PayloadAction<string>) => {
      state.streamingContent = action.payload;
    },
    appendStreamingContent: (state, action: PayloadAction<string>) => {
      state.streamingContent += action.payload;
    },
    setIsThinking: (state, action: PayloadAction<boolean>) => {
      state.isThinking = action.payload;
    },
    setThinkingFlow: (state, action: PayloadAction<string>) => {
      state.thinkingFlow = action.payload;
    },
    appendThinkingFlow: (state, action: PayloadAction<string>) => {
      state.thinkingFlow += action.payload;
    },
    appendFormattedThinkingFlow: (state, action: PayloadAction<string>) => {
      const logEntry = action.payload;
      let formattedEntry = logEntry;

      // Highlight important information with color markers
      if (logEntry.includes("Error:")) {
        formattedEntry = `❌ ${logEntry}`;
      } else if (
        logEntry.includes("Completed") ||
        logEntry.includes("Success")
      ) {
        formattedEntry = `✅ ${logEntry}`;
      } else if (logEntry.includes("Step") || logEntry.includes("Processing")) {
        formattedEntry = `🔄 ${logEntry}`;
      }

      state.thinkingFlow = state.thinkingFlow
        ? `${state.thinkingFlow}\n${formattedEntry}`
        : formattedEntry;
    },
  },
  selectors: {
    selectMessages: (state) => state.messages,
    selectIsLoading: (state) => state.isLoading,
    selectIsStreaming: (state) => state.isStreaming,
    selectStreamingContent: (state) => state.streamingContent,
    selectIsThinking: (state) => state.isThinking,
    selectThinkingFlow: (state) => state.thinkingFlow,
    selectMessagesArray: createSelector(
      (state: ChatState) => state.messages,
      (messages) => Object.values(messages)
    ),
  },
});

export const { actions, reducer, selectors } = chatSlice;
