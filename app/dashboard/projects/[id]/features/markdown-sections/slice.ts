import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PRD_SECTION_ORDER, PRD_SECTION_TITLES } from "@/lib/ai/const";
import { SectionHistory } from "@/lib/ai/types";
import { MarkdownSection, MarkdownState } from "./types";

const initialState: MarkdownState = {
  sections: PRD_SECTION_ORDER.map((sectionId) => ({
    id: sectionId,
    title: PRD_SECTION_TITLES[sectionId as keyof typeof PRD_SECTION_TITLES],
    content: `# ${
      PRD_SECTION_TITLES[sectionId as keyof typeof PRD_SECTION_TITLES]
    }\nThis section will be populated as you provide information.`,
  })),
  sectionHistory: {},
  pendingChanges: {},
  previousContent: {},
};

export const markdownSlice = createSlice({
  name: "markdown",
  initialState,
  reducers: {
    updateSection: (
      state,
      action: PayloadAction<{ sectionId: string; content: string }>
    ) => {
      const { sectionId, content } = action.payload;
      const section = state.sections.find((s) => s.id === sectionId);
      if (section) {
        section.content = content;
      }
    },
    setSections: (state, action: PayloadAction<MarkdownSection[]>) => {
      state.sections = action.payload;
    },
    updateSectionHistory: (
      state,
      action: PayloadAction<{ sectionId: string; history: SectionHistory }>
    ) => {
      const { sectionId, history } = action.payload;
      state.sectionHistory[sectionId] = history;
    },
  },
  selectors: {
    selectSections: (state) => state.sections,
    selectSectionById: (state, sectionId: string) =>
      state.sections.find((s) => s.id === sectionId),
    selectPendingChanges: (state) => state.pendingChanges,
    selectHasPendingChanges: (state) =>
      Object.keys(state.pendingChanges).length > 0,
    selectMarkdownState: createSelector(
      (state: MarkdownState) => state,
      (state) => state
    ),
  },
});

export const { actions, reducer, selectors } = markdownSlice;
