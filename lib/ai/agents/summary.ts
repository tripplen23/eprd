import { callOpenAI } from "@/lib/config/openai-client";
import { Message } from "@/lib/ai/types";

export const summarySystemPrompt = `
You are a conversation summarizer. Summarize the conversation while following these rules:
1. Focus on maintaining the context specific to this section of the documentation
2. If there's technical information, preserve the key details without summarization
3. If there's a previous summary, combine it with the new message, prioritizing new information
4. Keep the summary concise but maintain all important technical context
5. Format your response as:
  [summarized previous context if any]
  Latest update: [key points from current message]
`;

// --- Summarize a single message ---
export const getSummary = async (
  role: "system" | "user" | "assistant",
  currentMessage: string,
  previousSummary?: string
): Promise<string> => {
  const messageToSummarize = previousSummary
    ? `Previous summary: ${previousSummary}\nNew message: ${currentMessage}`
    : currentMessage;

  const response = await callOpenAI<string>(
    summarySystemPrompt,
    [
      {
        role: "user",
        content: `Please summarize this ${role} message following the rules exactly: ${messageToSummarize}`,
      },
    ],
    {
      logLabel: "Summary Generation",
      maxTokens: 2000,
      temperature: 0.3,
      parseResponse: false,
    }
  );

  if (response.success && response.data) {
    const summary = response.data as string;

    if (!summary.includes("Latest update:")) {
      const prefix = previousSummary ? `${previousSummary}\n` : "";
      return `${prefix}Latest update: ${summary.trim()}`;
    }

    return summary;
  }

  // Fallback if API call fails
  const fallbackPrefix = previousSummary ? `${previousSummary}\n` : "";
  return `${fallbackPrefix}Latest update: ${currentMessage}`;
};