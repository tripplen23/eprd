// Store the diff related state

import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { SectionDiff, DiffState } from "./types";

const initialState: DiffState = {
  pendingDiffs: {},
  showDiff: false,
  pendingChanges: {},
  previousContent: {},
};

export const diffSlice = createSlice({
  name: "diff",
  initialState,
  reducers: {
    // Toggle diff view on/off
    toggleDiffView: (state, action: PayloadAction<boolean | undefined>) => {
      state.showDiff =
        action.payload !== undefined ? action.payload : !state.showDiff;
    },

    // Add a new section diff to be viewed
    addPendingDiff: (state, action: PayloadAction<SectionDiff>) => {
      const { sectionId } = action.payload;
      state.pendingDiffs[sectionId] = action.payload;
    },

    // Add multiple section diffs at once
    addPendingDiffs: (state, action: PayloadAction<SectionDiff[]>) => {
      action.payload.forEach((diff) => {
        state.pendingDiffs[diff.sectionId] = diff;
      });
    },

    // Remove a specific section diff (after accept/reject)
    removePendingDiff: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      delete state.pendingDiffs[sectionId];

      // If no more pending diffs, hide the diff view
      if (Object.keys(state.pendingDiffs).length === 0) {
        state.showDiff = false;
      }
    },

    // Clear all pending diffs
    clearPendingDiffs: (state) => {
      state.pendingDiffs = {};
      state.showDiff = false;
    },

    // Store previous content for a section
    storePreviousContent: (
      state,
      action: PayloadAction<{ sectionId: string; content: string }>
    ) => {
      const { sectionId, content } = action.payload;
      state.previousContent[sectionId] = content;
    },

    // Add pending change to be reviewed
    addPendingChange: (
      state,
      action: PayloadAction<{ sectionId: string; content: string }>
    ) => {
      const { sectionId, content } = action.payload;
      state.pendingChanges[sectionId] = content;
    },

    // When changes are applied, clear pending change
    removePendingChange: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      delete state.pendingChanges[sectionId];
    },

    // Clear all pending changes
    clearPendingChanges: (state) => {
      state.pendingChanges = {};
    },

    // Remove all previous content records
    clearPreviousContent: (state) => {
      state.previousContent = {};
    },
  },

  selectors: {
    selectShowDiff: (state) => state.showDiff,
    selectPendingDiffs: (state) => state.pendingDiffs,
    selectPreviousContent: (state) => state.previousContent,
    selectPendingChanges: (state) => state.pendingChanges,
    selectHasPendingDiffs: (state) =>
      Object.keys(state.pendingDiffs).length > 0,
    // For createSelector, it needs the slice state as input
    selectPendingDiffsArray: createSelector(
      // Input selector(s) - select the part of the state needed
      (state: DiffState) => state.pendingDiffs,
      // Output selector - compute the derived data
      (pendingDiffs) => Object.values(pendingDiffs)
    ),
    selectDiffState: createSelector(
      (state: DiffState) => state,
      (state) => state
    ),
  },
});

export const { actions, reducer, selectors } = diffSlice;
