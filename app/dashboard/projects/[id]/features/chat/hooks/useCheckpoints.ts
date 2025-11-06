import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import { v4 as uuidv4 } from 'uuid';
import { Checkpoint, actions as checkpointsActions } from '@/lib/store/features/checkpoints/slice';
import { actions as chatActions } from '../slice';
import { actions as diffActions, selectors as diffSelectors } from '@/app/dashboard/projects/[id]/features/diff/slice';
import {
    actions as markdownActions,
    selectors as markdownSelectors,
} from '@/app/dashboard/projects/[id]/features/markdown-sections/slice';
import { SectionDiff } from '../../diff/types';
import { useChatState } from './useChatState';
import { SectionHistory } from '@/lib/ai/types';

// Type for checkpoint validation result
type ValidationResult = {
    isValid: boolean;
    error?: string;
};

export function useCheckpoints() {
    const dispatch = useAppDispatch();
    const { messages } = useChatState();
    const markdownState = useAppSelector(markdownSelectors.selectMarkdownState);
    const diffState = useAppSelector(diffSelectors.selectDiffState);
    const restoredCheckpoint = useAppSelector((state: RootState) => state.checkpoints.restoredCheckpoint);
    const checkpoints = useAppSelector((state: RootState) => state.checkpoints.checkpoints);

    // Validate checkpoint data
    const validateCheckpoint = useCallback((checkpoint: Checkpoint): ValidationResult => {
        try {
            if (!checkpoint.id || !checkpoint.timestamp) {
                return {
                    isValid: false,
                    error: 'Missing required checkpoint metadata',
                };
            }

            if (!checkpoint.chatState?.messages) {
                return { isValid: false, error: 'Missing chat state data' };
            }

            if (!checkpoint.markdownState?.sections) {
                return { isValid: false, error: 'Missing markdown state data' };
            }

            if (!checkpoint.diffState) {
                return { isValid: false, error: 'Missing diff state data' };
            }

            return { isValid: true };
        } catch (error) {
            return { isValid: false, error: `Validation error: ${error}` };
        }
    }, []);

    const handleCreateCheckpoint = useCallback(() => {
        try {
            const checkpoint = {
                id: uuidv4(),
                timestamp: Date.now(),
                chatState: {
                    messages: messages,
                    isLoading: false,
                    isStreaming: false,
                    streamingContent: '',
                    isThinking: false,
                    thinkingFlow: '',
                },
                markdownState: {
                    sections: markdownState.sections,
                    sectionHistory: markdownState.sectionHistory,
                    pendingChanges: markdownState.pendingChanges || {},
                    previousContent: markdownState.previousContent || {},
                },
                diffState: {
                    pendingDiffs: diffState.pendingDiffs,
                    showDiff: diffState.showDiff,
                    pendingChanges: diffState.pendingChanges,
                    previousContent: diffState.previousContent,
                },
            };

            const validation = validateCheckpoint(checkpoint);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            dispatch(checkpointsActions.createCheckpoint(checkpoint));
            return { success: true };
        } catch (error) {
            console.error('Failed to create checkpoint:', error);
            return { success: false, error };
        }
    }, [dispatch, messages, markdownState, diffState, validateCheckpoint]);

    const handleRestoreCheckpoint = useCallback(
        (checkpoint: Checkpoint) => {
            try {
                const validation = validateCheckpoint(checkpoint);
                if (!validation.isValid) {
                    throw new Error(validation.error);
                }

                const currentState = {
                    chatState: {
                        messages: restoredCheckpoint.checkpoint
                            ? restoredCheckpoint.previousState!.chatState.messages
                            : messages,
                        isLoading: false,
                        isStreaming: false,
                        streamingContent: '',
                        isThinking: false,
                        thinkingFlow: '',
                    },
                    markdownState: {
                        sections: restoredCheckpoint.checkpoint
                            ? restoredCheckpoint.previousState!.markdownState.sections
                            : markdownState.sections,
                        sectionHistory: restoredCheckpoint.checkpoint
                            ? restoredCheckpoint.previousState!.markdownState.sectionHistory
                            : markdownState.sectionHistory,
                        pendingChanges: restoredCheckpoint.checkpoint
                            ? restoredCheckpoint.previousState!.markdownState.pendingChanges
                            : markdownState.pendingChanges || {},
                        previousContent: restoredCheckpoint.checkpoint
                            ? restoredCheckpoint.previousState!.markdownState.previousContent
                            : markdownState.previousContent || {},
                    },
                    diffState: {
                        pendingDiffs: restoredCheckpoint.checkpoint
                            ? restoredCheckpoint.previousState!.diffState.pendingDiffs
                            : diffState.pendingDiffs,
                        showDiff: restoredCheckpoint.checkpoint
                            ? restoredCheckpoint.previousState!.diffState.showDiff
                            : diffState.showDiff,
                        pendingChanges: restoredCheckpoint.checkpoint
                            ? restoredCheckpoint.previousState!.diffState.pendingChanges
                            : diffState.pendingChanges,
                        previousContent: restoredCheckpoint.checkpoint
                            ? restoredCheckpoint.previousState!.diffState.previousContent
                            : diffState.previousContent,
                    },
                };

                // Clear any existing restored checkpoint first
                if (restoredCheckpoint.checkpoint) {
                    dispatch(checkpointsActions.clearRestoredCheckpoint());
                }

                // Store current state and restore the checkpoint
                dispatch(
                    checkpointsActions.restoreCheckpoint({
                        checkpoint,
                        previousState: {
                            chatState: currentState.chatState,
                            markdownState: {
                                sections: currentState.markdownState.sections,
                                sectionHistory: currentState.markdownState.sectionHistory,
                                pendingChanges: currentState.markdownState.pendingChanges,
                                previousContent: currentState.markdownState.previousContent,
                            },
                            diffState: {
                                pendingDiffs: currentState.diffState.pendingDiffs,
                                showDiff: currentState.diffState.showDiff,
                                pendingChanges: currentState.diffState.pendingChanges,
                                previousContent: currentState.diffState.previousContent,
                            },
                        },
                    })
                );

                // Restore states
                dispatch(chatActions.setMessages(messages));
                dispatch(markdownActions.setSections(checkpoint.markdownState.sections));
                Object.entries(checkpoint.markdownState.sectionHistory).forEach(([sectionId, history]) => {
                    dispatch(
                        markdownActions.updateSectionHistory({
                            sectionId,
                            history: history as SectionHistory,
                        })
                    );
                });

                // Restore diff state
                dispatch(diffActions.toggleDiffView(checkpoint.diffState.showDiff));
                dispatch(diffActions.clearPendingDiffs());
                const diffsArray = Object.values(checkpoint.diffState.pendingDiffs);
                dispatch(diffActions.addPendingDiffs(diffsArray as SectionDiff[]));

                // Restore pending changes and previous content
                Object.entries(checkpoint.diffState.pendingChanges).forEach(([sectionId, content]) => {
                    dispatch(
                        diffActions.addPendingChange({
                            sectionId,
                            content: content as string,
                        })
                    );
                });

                Object.entries(checkpoint.diffState.previousContent).forEach(([sectionId, content]) => {
                    dispatch(
                        diffActions.storePreviousContent({
                            sectionId,
                            content: content as string,
                        })
                    );
                });

                return { success: true };
            } catch (error) {
                console.error('Failed to restore checkpoint:', error);
                return { success: false, error };
            }
        },
        [dispatch, messages, markdownState, diffState, restoredCheckpoint, validateCheckpoint]
    );

    const handleUndoRestore = useCallback(() => {
        try {
            if (!restoredCheckpoint.previousState) {
                throw new Error('No previous state to restore');
            }

            dispatch(chatActions.setMessages(restoredCheckpoint.previousState.chatState.messages));
            dispatch(markdownActions.setSections(restoredCheckpoint.previousState.markdownState.sections));

            Object.entries(restoredCheckpoint.previousState.markdownState.sectionHistory || {}).forEach(
                ([sectionId, history]) => {
                    dispatch(
                        markdownActions.updateSectionHistory({
                            sectionId,
                            history: history as SectionHistory,
                        })
                    );
                }
            );

            const previousDiffArray = Object.values(restoredCheckpoint.previousState.diffState.pendingDiffs);
            const previousShowDiff = restoredCheckpoint.previousState.diffState.showDiff;

            if (previousDiffArray.length > 0) {
                dispatch(diffActions.clearPendingDiffs());
                dispatch(diffActions.addPendingDiffs(previousDiffArray as SectionDiff[]));
            } else {
                dispatch(diffActions.toggleDiffView(previousShowDiff));
            }

            Object.entries(restoredCheckpoint.previousState.diffState.pendingChanges || {}).forEach(
                ([sectionId, content]) => {
                    dispatch(
                        diffActions.addPendingChange({
                            sectionId,
                            content: content as string,
                        })
                    );
                }
            );

            Object.entries(restoredCheckpoint.previousState.diffState.previousContent || {}).forEach(
                ([sectionId, content]) => {
                    dispatch(
                        diffActions.storePreviousContent({
                            sectionId,
                            content: content as string,
                        })
                    );
                }
            );

            dispatch(checkpointsActions.clearRestoredCheckpoint());
            return { success: true };
        } catch (error) {
            console.error('Failed to undo checkpoint restore:', error);
            return { success: false, error };
        }
    }, [dispatch, restoredCheckpoint]);

    const hasCheckpoint = useCallback(
        (index: number): boolean => {
            return checkpoints.some((cp) => cp.chatState.messages.length === index);
        },
        [checkpoints]
    );

    const isRestoredCheckpoint = useCallback(
        (index: number): boolean => {
            return Boolean(
                restoredCheckpoint.checkpoint && restoredCheckpoint.checkpoint.chatState.messages.length === index
            );
        },
        [restoredCheckpoint]
    );

    const isAfterRestored = useCallback(
        (index: number): boolean => {
            return Boolean(
                restoredCheckpoint.checkpoint && index >= restoredCheckpoint.checkpoint.chatState.messages.length
            );
        },
        [restoredCheckpoint]
    );

    const handleRestoreCheckpointByIndex = useCallback(
        (index: number) => {
            try {
                const checkpoint = checkpoints.find((cp) => cp.chatState.messages.length === index);
                if (!checkpoint) {
                    throw new Error(`No checkpoint found at index ${index}`);
                }
                return handleRestoreCheckpoint(checkpoint);
            } catch (error) {
                console.error('Failed to restore checkpoint by index:', error);
                return { success: false, error };
            }
        },
        [checkpoints, handleRestoreCheckpoint]
    );

    return {
        checkpoints,
        restoredCheckpoint,
        handleCreateCheckpoint,
        handleRestoreCheckpoint,
        handleUndoRestore,
        hasCheckpoint,
        isRestoredCheckpoint,
        isAfterRestored,
        handleRestoreCheckpointByIndex,
    };
}
