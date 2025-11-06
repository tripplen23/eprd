import { configureStore } from '@reduxjs/toolkit';

// API
import { openaiApi } from '@/lib/store/features/api/openaiApi';

// Features
import { reducer as chatReducer } from '@/app/dashboard/projects/[id]/features/chat/slice';
import { reducer as markdownReducer } from '@/app/dashboard/projects/[id]/features/markdown-sections/slice';
import { reducer as checkpointsReducer } from '@/lib/store/features/checkpoints/slice';
import { reducer as diffReducer } from '@/app/dashboard/projects/[id]/features/diff/slice';

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        markdown: markdownReducer,
        checkpoints: checkpointsReducer,
        diff: diffReducer,
        [openaiApi.reducerPath]: openaiApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(openaiApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
