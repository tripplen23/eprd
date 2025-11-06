import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState } from '@/app/dashboard/projects/[id]/features/chat/types';
import { MarkdownState } from '@/app/dashboard/projects/[id]/features/markdown-sections/types';
import { DiffState } from '@/app/dashboard/projects/[id]/features/diff/types';

export interface Checkpoint {
    id: string;
    timestamp: number;
    chatState: ChatState;
    markdownState: MarkdownState;
    diffState: DiffState;
}

export interface CheckpointsState {
    checkpoints: Checkpoint[];
    restoredCheckpoint: {
        checkpoint: Checkpoint | null;
        previousState: {
            chatState: ChatState;
            markdownState: MarkdownState;
            diffState: DiffState;
        } | null;
    };
}

const initialState: CheckpointsState = {
    checkpoints: [],
    restoredCheckpoint: {
        checkpoint: null,
        previousState: null,
    },
};

export const checkpointsSlice = createSlice({
    name: 'checkpoints',
    initialState,
    reducers: {
        createCheckpoint: (state, action: PayloadAction<Checkpoint>) => {
            // Remove checkpoints that have the same number of messages
            state.checkpoints = state.checkpoints.filter(
                (cp) => cp.chatState.messages.length !== action.payload.chatState.messages.length
            );
            state.checkpoints.push(action.payload);
        },
        removeCheckpoint: (state, action: PayloadAction<string>) => {
            state.checkpoints = state.checkpoints.filter((cp) => cp.id !== action.payload);
        },
        clearCheckpoints: (state) => {
            state.checkpoints = [];
        },
        restoreCheckpoint: (
            state,
            action: PayloadAction<{
                checkpoint: Checkpoint;
                previousState: {
                    chatState: ChatState;
                    markdownState: MarkdownState;
                    diffState: DiffState;
                };
            }>
        ) => {
            state.restoredCheckpoint = action.payload;
        },
        clearRestoredCheckpoint: (state) => {
            state.restoredCheckpoint = { checkpoint: null, previousState: null };
        },
    },
});

export const { actions, reducer } = checkpointsSlice;
