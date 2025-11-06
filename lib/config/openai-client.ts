import { Message } from "@/lib/ai/types";
import { store } from "@/lib/store/store";
import { openaiApi } from "@/lib/store/features/api/openaiApi";

// Generic response type for OpenAI calls
export type OpenAIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  rawContent?: string;
  usage?: {
    completion_tokens_details?: {
      accepted_prediction_tokens: number;
      rejected_prediction_tokens: number;
    };
  };
};

// Type for straming callbacks
export type StreamCallbacks = {
  onToken?: (token: string, isFirst: boolean) => void;
  onChunk?: (chunk: string, isFirst: boolean) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
};

/**
 * Makes a request to the OpenAI API with the specified messages and parameters
 * @param systemPrompt - The system prompt to use
 * @param messages - User messages to include
 * @param options - Additional options for the API call
 * @returns Parsed response or error information
 */
export async function callOpenAI<T>(
  systemPrompt: string,
  messages: Message[],
  options: {
    logLabel?: string;
    maxTokens?: number;
    temperature?: number;
    parseResponse?: boolean;
    frequencyPenalty?: number;
    presencePenalty?: number;
    topP?: number;
    stop?: string[] | null;
    prediction?: {
      type: "content";
      content: string;
    };
  } = {}
): Promise<OpenAIResponse<T>> {
  console.groupCollapsed(options.logLabel ?? "OpenAI API Call");
  try {
    console.log("🤖 System Prompt:", systemPrompt);
    console.log("👤 User Messages:", messages);
    if (options.prediction) {
      console.log("🔮 Predicted Output:", options.prediction.content);
    }

    const result = await store.dispatch(
      openaiApi.endpoints.completion.initiate({
        systemPrompt,
        messages,
        options: {
          temperature: options.temperature,
          frequencyPenalty: options.frequencyPenalty,
          presencePenalty: options.presencePenalty,
          topP: options.topP,
          stop: options.stop,
          parseResponse: options.parseResponse,
          prediction: options.prediction,
        },
      })
    );

    // Use type assertion to handle the error property safely
    if ("error" in result) {
      const errorMessage =
        typeof (result as any).error === "string"
          ? (result as any).error
          : JSON.stringify((result as any).error);
      throw new Error(errorMessage);
    }

    console.log("📝 AI Response:", result.data?.rawContent);
    if (result.data?.usage?.completion_tokens_details) {
      console.log("🎯 Prediction Stats:", {
        accepted: result.data.usage.completion_tokens_details.accepted_prediction_tokens,
        rejected: result.data.usage.completion_tokens_details.rejected_prediction_tokens,
      });
    }
    return result.data as OpenAIResponse<T>;
  } catch (error: any) {
    console.error(`${options.logLabel ?? "OpenAI API Call"} Error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  } finally {
    console.groupEnd();
  }
}

/**
 * Makes a streaming request to the OpenAI API and provides token-by-token updates
 * @param systemPrompt - The system prompt to use
 * @param messages - User messages to include
 * @param callbacks - Callback functions for streaming events
 * @param options - Additional options for the API call
 * @returns Promise that resolves when streaming completes
 */
export async function streamOpenAI(
  systemPrompt: string,
  messages: Message[],
  callbacks: StreamCallbacks,
  options: {
    logLabel?: string;
    temperature?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    topP?: number;
    stop?: string[] | null;
    abortSignal?: AbortSignal;
    prediction?: {
      type: "content";
      content: string;
    };
  } = {}
): Promise<OpenAIResponse<string>> {
  console.groupCollapsed(options.logLabel ?? "OpenAI Streaming Call");
  try {
    console.log("🤖 System Prompt:", systemPrompt);
    console.log("👤 User Messages:", messages);
    if (options.prediction) {
      console.log("🔮 Predicted Output:", options.prediction.content);
    }

    const result = await store.dispatch(
      openaiApi.endpoints.streamingCompletion.initiate({
        systemPrompt,
        messages,
        options: {
          temperature: options.temperature,
          frequencyPenalty: options.frequencyPenalty,
          presencePenalty: options.presencePenalty,
          topP: options.topP,
          stop: options.stop,
          prediction: options.prediction,
        },
        callbacks,
        abortSignal: options.abortSignal,
      })
    );

    if ("error" in result) {
      const errorMessage =
        typeof (result as any).error === "string"
          ? (result as any).error
          : JSON.stringify((result as any).error);
      throw new Error(errorMessage);
    }

    console.log("📝 Streaming Complete:", result.data?.rawContent);
    if (result.data?.usage?.completion_tokens_details) {
      console.log("🎯 Prediction Stats:", {
        accepted: result.data.usage.completion_tokens_details.accepted_prediction_tokens,
        rejected: result.data.usage.completion_tokens_details.rejected_prediction_tokens,
      });
    }
    return result.data as OpenAIResponse<string>;
  } catch (error: any) {
    console.error(
      `${options.logLabel ?? "OpenAI Streaming Call"} Error:`,
      error
    );
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  } finally {
    console.groupEnd();
  }
}
