import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Message } from "@/lib/ai/types";
import { StreamCallbacks } from "@/lib/config/openai-client";
interface OpenAIRequest {
  systemPrompt: string;
  messages: Message[];
  options?: {
    temperature?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    topP?: number;
    stop?: string[] | null;
    parseResponse?: boolean;
    prediction?: {
      type: "content";
      content: string;
    };
  };
}

interface OpenAIResponse<T> {
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
}

interface OpenAIStreamingRequest extends OpenAIRequest {
  callbacks: StreamCallbacks;
  abortSignal?: AbortSignal;
}

export const openaiApi = createApi({
  reducerPath: "openaiApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT!,
    prepareHeaders: (headers) => {
      headers.set("api-key", process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY!);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    completion: builder.mutation<OpenAIResponse<unknown>, OpenAIRequest>({
      query: ({ systemPrompt, messages, options = {} }) => ({
        url: "",
        method: "POST",
        body: {
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...messages,
          ],
          temperature: options.temperature ?? 0.7,
          frequency_penalty: options.frequencyPenalty ?? 0,
          presence_penalty: options.presencePenalty ?? 0,
          top_p: options.topP ?? 0.95,
          stop: options.stop ?? null,
          prediction: options.prediction,
        },
      }),
      transformResponse: (response: { choices: Array<{ message: { content: string } }>; usage?: { completion_tokens_details?: { accepted_prediction_tokens: number; rejected_prediction_tokens: number } } }, _meta, arg): OpenAIResponse<unknown> => {
        const responseContent = response.choices[0].message.content;

        if (arg.options?.parseResponse === false) {
          return {
            success: true,
            data: responseContent,
            rawContent: responseContent,
            usage: response.usage,
          };
        }

        try {
          const parsedData = JSON.parse(responseContent);
          return {
            success: true,
            data: parsedData,
            rawContent: responseContent,
            usage: response.usage,
          };
        } catch {
          return {
            success: false,
            error: "Failed to parse AI response as JSON",
            rawContent: responseContent,
            usage: response.usage,
          };
        }
      },
    }),

    streamingCompletion: builder.mutation<
      OpenAIResponse<string>,
      OpenAIStreamingRequest
    >({
      queryFn: async ({
        systemPrompt,
        messages,
        options = {},
        callbacks,
        abortSignal,
      }) => {
        let accumulatedContent = "";
        let isFirstToken = true;

        // Add a throttled token processing utility
        const processTokensWithThrottle = (
          tokens: string,
          onToken: (token: string, isFirst: boolean) => void,
          isFirst: boolean,
          bufferRate: number = 15
        ) => {
          if (tokens.length <= 3) {
            onToken(tokens, isFirst);
            return;
          }

          let currentPosition = 0;
          const processNextChunk = () => {
            if (currentPosition >= tokens.length) return;

            const end = Math.min(currentPosition + bufferRate, tokens.length);
            const chunk = tokens.substring(currentPosition, end);

            onToken(chunk, isFirst && currentPosition === 0);
            currentPosition = end;

            if (currentPosition < tokens.length) {
              const typingDelay = Math.floor(Math.random() * 125) + 125;
              setTimeout(processNextChunk, typingDelay);
            }
          };

          processNextChunk();
        };

        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT!,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "api-key": process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY!,
              },
              body: JSON.stringify({
                messages: [
                  {
                    role: "system",
                    content: systemPrompt,
                  },
                  ...messages,
                ],
                temperature: options.temperature ?? 0.7,
                frequency_penalty: options.frequencyPenalty ?? 0,
                presence_penalty: options.presencePenalty ?? 0,
                top_p: options.topP ?? 0.95,
                stop: options.stop ?? null,
                stream: true,
                prediction: options.prediction,
              }),
              signal: abortSignal,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            callbacks.onError?.(
              `API Error: ${response.status} - ${errorText || "Unknown error"}`
            );
            return {
              error: {
                status: response.status,
                data: errorText,
              },
            };
          }

          if (!response.body) {
            callbacks.onError?.("API Error: Response body is null");
            return {
              error: {
                status: 500,
                data: "Response body is null",
              },
            };
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");

          // Process the stream
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            callbacks.onChunk?.(chunk, isFirstToken);

            // Process SSE format (data: {...}\n\n)
            const lines = chunk
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.replace(/^data: /, "").trim());

            for (const line of lines) {
              // Skip "[DONE]" message
              if (line === "[DONE]" || !line) continue;

              try {
                const json = JSON.parse(line);
                const contentDelta = json.choices[0]?.delta?.content || "";

                if (contentDelta) {
                  accumulatedContent += contentDelta;
                  // Use the throttled token processing instead of direct callback
                  processTokensWithThrottle(
                    contentDelta,
                    callbacks.onToken || (() => {}),
                    isFirstToken
                  );
                  isFirstToken = false;
                }
              } catch (error) {
                console.warn("Error parsing SSE JSON:", line, error);
              }
            }
          }

          // Call complete callback with the full response
          callbacks.onComplete?.(accumulatedContent);

          return {
            data: {
              success: true,
              data: accumulatedContent,
              rawContent: accumulatedContent,
              usage: {
                completion_tokens_details: {
                  accepted_prediction_tokens: 0,
                  rejected_prediction_tokens: 0,
                },
              },
            },
          };
        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError") {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Request cancelled",
              },
            };
          }

          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          callbacks.onError?.(errorMessage);

          return {
            error: {
              status: "CUSTOM_ERROR",
              error: errorMessage,
            },
          };
        }
      },
    }),
  }),
});

export const { useCompletionMutation, useStreamingCompletionMutation } =
  openaiApi;
