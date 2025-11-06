import { useAppSelector } from "@/lib/store/hooks";
import { selectors } from "../slice";

export function useChatState() {
  const messages = useAppSelector(selectors.selectMessages);
  const isLoading = useAppSelector(selectors.selectIsLoading);
  const isStreaming = useAppSelector(selectors.selectIsStreaming);
  const streamingContent = useAppSelector(selectors.selectStreamingContent);
  const isThinking = useAppSelector(selectors.selectIsThinking);
  const thinkingFlow = useAppSelector(selectors.selectThinkingFlow);

  return {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    isThinking,
    thinkingFlow,
  };
}
