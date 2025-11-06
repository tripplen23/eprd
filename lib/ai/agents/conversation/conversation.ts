import { Message } from "@/lib/ai/types";
import { streamOpenAI, StreamCallbacks } from "@/lib/config/openai-client";
import {
  getSummaryFromConversation,
  getUpdatedConversationSummary,
} from "@/lib/ai/agents/conversation/conversationSummary";
import { conversationAgentPrompt } from "@/lib/ai/prompts/conversation/conversation";
import { ConversationAgentResponse } from "@/lib/ai/types";

export const getConversationResponse = async (
  messages: Message[],
  documentContext: string,
  previousChatSummary: string = "",
  updateSummary: string = "",
  streamOptions?: {
    callbacks: StreamCallbacks;
    abortSignal?: AbortSignal;
  }
): Promise<ConversationAgentResponse> => {
  if (!documentContext.trim()) {
    documentContext = "No PRD document has been created yet.";
  }

  // Generate a summary of the recent chat context
  const recentChatSummary = await getSummaryFromConversation(messages);

  const combinedContext = previousChatSummary
    ? `Previous conversation summary: ${previousChatSummary}\n\nSummary of recent messages:\n${recentChatSummary}`
    : `Summary of recent messages:\n${recentChatSummary}`;

  // Get the prompt with document context, update summary and chat context
  const prompt = conversationAgentPrompt(
    messages,
    documentContext,
    combinedContext,
    updateSummary
  );

  // Get the most recent user message
  const lastUserMessage =
    messages.length > 0 ? [messages[messages.length - 1]] : [];

  let responseText = "";

  if (streamOptions) {
    const streamResponse = await streamOpenAI(
      prompt,
      lastUserMessage,
      {
        onToken: (token, isFirst) => {
          responseText += token;
          streamOptions.callbacks.onToken?.(token, isFirst);
        },
        onComplete: (fullText) => {
          responseText = fullText;
          streamOptions.callbacks.onComplete?.(fullText);
        },
        onError: streamOptions.callbacks.onError,
        onChunk: streamOptions.callbacks.onChunk,
      },
      {
        logLabel: "Conversation Agent Streaming",
        temperature: 0.8,
        abortSignal: streamOptions.abortSignal,
      }
    );

    if (!streamResponse.success) {
      return {
        response:
          "I'm having trouble generating a response right now. Could you try again?",
        updatedChatSummary: previousChatSummary,
      };
    }
  }

  // Generate or update the chat summary
  const latestMessage = messages[messages.length - 1]?.content || "";
  const userRequest = latestMessage;

  // Use the new function to update the summary including the assistant's response
  const updatedChatSummary = await getUpdatedConversationSummary(
    previousChatSummary,
    userRequest,
    responseText
  );

  console.log("Updated chat summary:", updatedChatSummary);

  return {
    response: responseText,
    updatedChatSummary,
  };
};