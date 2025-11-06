import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { actions as chatActions } from '../slice';
import { Message } from '@/lib/ai/types';
import { processUserRequest } from '@/lib/ai/flow/orchestrator/orchestrator';
import { StreamCallbacks } from '@/lib/config/openai-client';
import { actions as checkpointsActions } from '@/lib/store/features/checkpoints/slice';
import { RootState } from '@/lib/store/store';
import { FileWithBase64 } from '../types';
import { actions as markdownActions } from '@/app/dashboard/projects/[id]/features/markdown-sections/slice';

export function useChatActions() {
    const dispatch = useAppDispatch();
    const abortController = useRef<AbortController | null>(null);
    const messages = useAppSelector((state: RootState) => state.chat.messages);
    const restoredCheckpoint = useAppSelector((state: RootState) => state.checkpoints.restoredCheckpoint);

    const handleSendMessage = useCallback(
        async (message: string, files?: FileWithBase64[], onCreateCheckpoint?: () => void) => {
            if (restoredCheckpoint.checkpoint) {
                const checkpointIndex = restoredCheckpoint.checkpoint.chatState.messages.length;
                dispatch(chatActions.setMessages(messages.slice(0, checkpointIndex)));
                dispatch(checkpointsActions.clearRestoredCheckpoint());
            }

            // Call checkpoint creation if provided
            onCreateCheckpoint?.();

            // Set initial states
            dispatch(chatActions.setLoading(true));
            dispatch(chatActions.setIsThinking(true));
            dispatch(chatActions.setThinkingFlow(''));
            dispatch(chatActions.setIsStreaming(false));
            dispatch(chatActions.setStreamingContent(''));

            abortController.current = new AbortController();

            // Prepare the new user message object
            const newUserMessageContent: Array<{ type: string; [key: string]: any }> = [];

            if (message.trim()) {
                newUserMessageContent.push({
                    type: 'text',
                    text: message,
                });
            }

            if (files && files.length > 0) {
                files.forEach(({ base64 }) => {
                    newUserMessageContent.push({
                        type: 'image_url', // Should later can be attached the other types of file
                        image_url: {
                            url: base64,
                        },
                    });
                });
            }

            const newUserMessage: Message = {
                role: 'user',
                content: newUserMessageContent,
            };

            // Get the last 9 messages from the state
            const recentHistory = messages.slice(-9);

            // Combine recent history with the new message
            const apiMessages = [...recentHistory, newUserMessage];

            // Format userMessageContent for display
            const userMessageContent =
                message +
                (files && files.length > 0
                    ? `\n\nAttached files:\n${files.map((f) => `- ${f.file.name}`).join('\n')}`
                    : '');

            // Add the formatted user message to the Redux store
            dispatch(chatActions.addMessage({ role: 'user', content: userMessageContent }));

            try {
                // Process the user request and handle streaming
                const processLoggingCallback = (logEntry: string) => {
                    dispatch(chatActions.appendFormattedThinkingFlow(logEntry));
                    dispatch(chatActions.setIsThinking(true));
                };

                const conversationCallbacks: StreamCallbacks = {
                    onToken: async (token, isFirst) => {
                        if (isFirst) {
                            setTimeout(async () => {
                                dispatch(chatActions.setIsThinking(false));
                                dispatch(chatActions.setThinkingFlow(''));
                                dispatch(chatActions.setIsStreaming(true));
                            }, 500);
                        }
                        setTimeout(async () => {
                            dispatch(chatActions.appendStreamingContent(token));
                        }, 1200);
                    },
                    onComplete: (fullText) => {
                        setTimeout(async () => {
                            dispatch(chatActions.setStreamingContent(fullText));
                            dispatch(chatActions.setIsThinking(false));
                            dispatch(chatActions.setThinkingFlow(''));
                            dispatch(chatActions.setLoading(false));
                        }, 4000);
                    },
                    onError: (error) => {
                        console.error('Streaming error:', error);
                        dispatch(chatActions.setIsThinking(false));
                        dispatch(chatActions.setIsStreaming(false));
                        dispatch(chatActions.setStreamingContent(''));
                        dispatch(chatActions.setThinkingFlow(''));
                        dispatch(chatActions.setLoading(false));
                    },
                };

                const sectionCallbacks: Record<string, StreamCallbacks> = {};

                // Process the user request and handle streaming
                const { response, sectionUpdates } = await processUserRequest(apiMessages, {
                    conversationCallbacks,
                    sectionCallbacks,
                    abortSignal: abortController.current.signal,
                    loggingCallback: processLoggingCallback,
                });

                // Add the assistant's response to the Redux store
                dispatch(chatActions.addMessage({ role: 'assistant', content: response }));

                if (sectionUpdates.length > 0) {
                    sectionUpdates.forEach((update) => {
                        dispatch(
                            markdownActions.updateSection({
                                sectionId: update.sectionId,
                                content: update.content,
                            })
                        );
                    });
                }

                // Return the response and updates for any additional processing needed by the container
                return { response, sectionUpdates };
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    console.log('Request was cancelled');
                    dispatch(
                        chatActions.addMessage({
                            role: 'assistant',
                            content: 'Message generation was cancelled.',
                        })
                    );
                } else {
                    console.error('Error processing message:', error);
                    dispatch(
                        chatActions.addMessage({
                            role: 'assistant',
                            content: 'Sorry, I encountered an error processing your request. Please try again.',
                        })
                    );
                }
            } finally {
                dispatch(chatActions.setLoading(false));
                dispatch(chatActions.setIsStreaming(false));
                dispatch(chatActions.setIsThinking(false));
                dispatch(chatActions.setStreamingContent(''));
                dispatch(chatActions.setThinkingFlow(''));
                abortController.current = null;
            }
        },
        [dispatch, messages, restoredCheckpoint]
    );

    const handleCancelStream = useCallback(() => {
        if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
        }
    }, []);

    return {
        handleSendMessage,
        handleCancelStream,
    };
}
