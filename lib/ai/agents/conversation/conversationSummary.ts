// Next steps:
// - Add a function to get the conversation summary from the store
// - Add a function to update the conversation summary in the store
// - Handle conversation summary in the checkpoints

import { callOpenAI } from "@/lib/config/openai-client";
import { Message } from "@/lib/ai/types";

// --- Summarize conversation history ---
const conversationSummaryPrompt = `
# Tasks:
You are an expert conversation summarizer. Your task is to create a concise summary of the provided recent chat history between a 'user' and an 'assistant'. Focus on the key topics discussed, decisions made, and information exchanged that is relevant for continuing the conversation productively, especially in the context of building a Product Requirements Document (PRD).

# Rules:
1. Be concise: Keep the summary brief, ideally under 700 words.
2. Capture Key Points: Extract the most important information, questions asked, answers given, and any agreements or disagreements.
3. Preserve Context: Ensure the summary accurately reflects the flow and main themes of the conversation segment.
4. Ignore pleasantries: Skip greetings, thanks, and other conversational filler unless they convey crucial information.
5. Focus on PRD Relevance: Prioritize details that relate to requirements, features, goals, user needs, scope, etc.
6. Output only the summary text, without any introductory phrases like "Here is the summary:".

--- CONTEXT START ---
## Recent Chat History:
{chat_history}

--- CONTEXT END ---

# Concise Summary:
`;

export const getSummaryFromConversation = async (
  messages: Message[]
): Promise<string> => {
  // Take the most recent messages
  const recentMessages = messages.slice(-messages);

  // Format them into a string similar to the old prepareChatContext
  const formattedHistory = recentMessages
    .map((msg) => {
      const role = msg.role === "user" ? "user" : "assistant";
      const content =
        typeof msg.content === "string"
          ? msg.content
          : Array.isArray(msg.content)
          ? msg.content
              .map((item) =>
                item.type === "text" ? item.text : `[${item.type}]`
              )
              .join(" ")
          : "[complex content]";

      const truncatedContent =
        content.length > 2500 ? content.substring(0, 2500) + "..." : content;

      return `${role}: ${truncatedContent}`;
    })
    .join("\n\n");

  if (!formattedHistory.trim()) {
    return "";
  }

  const prompt = conversationSummaryPrompt.replace(
    "{chat_history}",
    formattedHistory
  );

  const response = await callOpenAI<string>(prompt, [], {
    logLabel: "Conversation Summary Generation",
    maxTokens: 1000,
    temperature: 0.4,
    parseResponse: false,
  });

  if (response.success && response.data) {
    return response.data.trim();
  }

  console.error("Failed to generate conversation summary.");
  return `Summary failed. Recent history:\n${formattedHistory.substring(
    0,
    2500
  )}${formattedHistory.length > 2500 ? "..." : ""}`;
};

// --- Update overall conversation summary ---
const updateSummaryPrompt = `
# Tasks:
You are an expert conversation summarizer. Your task is to update an existing conversation summary with the latest exchange between a 'user' and an 'assistant'. Combine the previous summary with the key information from the new messages to create a concise, cumulative summary reflecting the entire conversation so far.

# Rules:
1. Integrate New Info: Seamlessly weave the key points from the latest user message and assistant response into the previous summary.
2. Maintain Conciseness: Keep the updated summary brief and focused, ideally under 500 words, removing redundancy where possible.
3. Prioritize PRD Context: Focus on information relevant to building the Product Requirements Document (PRD) - goals, requirements, decisions, user needs, etc.
4. Preserve Key Details: Don't over-summarize critical technical details or specific agreements.
5. Chronological Flow: Ensure the summary reflects the general progression of the conversation.
6. Output Only the Summary: Do not include introductory phrases like "Here is the updated summary:".

--- CONTEXT START ---

## Previous Summary:
{previous_summary}

## Latest User Message:
{user_message}

## Latest Assistant Response:
{assistant_response}

--- CONTEXT END ---

# Updated Concise Summary:
`;

export const getUpdatedConversationSummary = async (
  previousSummary: string | undefined,
  userRequest: string | Array<{ type: string; [key: string]: unknown }>,
  assistantResponse: string | Array<{ type: string; [key: string]: unknown }>
): Promise<string> => {
  // Extract text content from structured messages
  const extractTextContent = (
    content: string | Array<{ type: string; [key: string]: unknown }>
  ) => {
    if (typeof content === "string") return content;

    return content
      .map((item) => {
        if (item.type === "text") return item.text;
        if (item.type === "image_url") return `[Attached Image]`;
        return `[${item.type}]`;
      })
      .join("\n");
  };

  const userText = extractTextContent(userRequest);
  const assistantText = extractTextContent(assistantResponse);

  // Handle cases where previous summary might be empty or undefined
  const prevSummaryText = previousSummary?.trim() || "No previous summary.";

  // Prepare the prompt
  let prompt = updateSummaryPrompt
    .replace("{previous_summary}", prevSummaryText)
    .replace("{user_message}", userText)
    .replace("{assistant_response}", assistantText);

  // Basic check for overly long inputs to prevent excessive prompt length
  if (prompt.length > 8000) {
    console.warn(
      "Prompt for getUpdatedConversationSummary is very long, potentially truncating."
    );
    // Simple truncation strategy (consider more sophisticated methods if needed)
    const availableLength =
      8000 -
      (updateSummaryPrompt.length -
        "{previous_summary}{user_message}{assistant_response}".length);
    const third = Math.floor(availableLength / 3);
    prompt = updateSummaryPrompt
      .replace("{previous_summary}", prevSummaryText.slice(0, third))
      .replace("{user_message}", userText.slice(0, third))
      .replace("{assistant_response}", assistantText.slice(0, third));
  }

  const response = await callOpenAI<string>(prompt, [], {
    logLabel: "Update Conversation Summary",
    maxTokens: 1000,
    temperature: 0.3,
    parseResponse: false,
  });

  if (response.success && response.data) {
    return response.data.trim();
  }

  // Fallback: If summary update fails, try to append the latest exchange crudely
  console.error("Failed to update conversation summary.");
  const fallbackSummary = `${prevSummaryText}\n\n[Update Failed] Last Exchange:\nUser: ${userText.substring(
    0,
    200
  )}...\nAssistant: ${assistantText.substring(0, 200)}...`;
  return fallbackSummary.slice(0, 4000);
};
