// TODO: Handle diff-related operations
import { store } from '@/lib/store/store';
import {
    actions as markdownActions,
    selectors as markdownSelectors,
} from '@/app/dashboard/projects/[id]/features/markdown-sections/slice';
import { actions as diffActions, selectors as diffSelectors } from '@/app/dashboard/projects/[id]/features/diff/slice';
import { MarkdownState } from '@/app/dashboard/projects/[id]/features/markdown-sections/types';
import { DiffState, SectionDiff } from '@/app/dashboard/projects/[id]/features/diff/types';

const prepareSectionDiffs = (
    sectionUpdates: Array<{
        sectionId: string;
        content: string;
    }>
): SectionDiff[] => {
    const state = store.getState();
    const currentSections = markdownSelectors.selectSections(state as { markdown: MarkdownState });
    const pendingChanges = diffSelectors.selectPendingChanges(state as { diff: DiffState });
    const previousContent = diffSelectors.selectPreviousContent(state as { diff: DiffState });

    return sectionUpdates
        .map((update) => {
            const section = currentSections.find((s) => s.id === update.sectionId);
            if (!section) return null;

            let baseContent: string;
            let hasExistingChange = false;

            // Check if there's a pending change for this section
            if (pendingChanges[update.sectionId]) {
                baseContent = pendingChanges[update.sectionId];
                hasExistingChange = true;
            } else {
                baseContent = section.content;
            }

            // Only create a diff if the content has actually changed from the base content
            if (baseContent === update.content) return null;

            // For the oldContent, use the previously stored content if available,
            // otherwise use the current section content
            const oldContent =
                hasExistingChange && previousContent[update.sectionId]
                    ? previousContent[update.sectionId]
                    : section.content;

            return {
                sectionId: update.sectionId,
                title: section.title,
                oldContent: oldContent,
                newContent: update.content,
            };
        })
        .filter((diff): diff is SectionDiff => diff !== null);
};

/**
 * Show diffs for section updates
 */
export const showSectionDiffs = (
    sectionUpdates: Array<{
        sectionId: string;
        content: string;
    }>
) => {
    const diffs = prepareSectionDiffs(sectionUpdates);

    if (diffs.length === 0) return false;

    // Get current state to check for existing pending changes
    const state = store.getState() as { diff: DiffState };
    const existingPreviousContent = diffSelectors.selectPreviousContent(state);

    // Add pending diffs to the store
    store.dispatch(diffActions.addPendingDiffs(diffs));

    // Store previous content and add pending changes
    diffs.forEach((diff) => {
        // Only store previous content if we don't already have a record
        // This ensures we keep the original content before any changes
        if (!existingPreviousContent[diff.sectionId]) {
            store.dispatch(
                diffActions.storePreviousContent({
                    sectionId: diff.sectionId,
                    content: diff.oldContent,
                })
            );
        }

        // Always update the pending change to the latest version
        store.dispatch(
            diffActions.addPendingChange({
                sectionId: diff.sectionId,
                content: diff.newContent,
            })
        );
    });

    return true;
};

// UI actions

/**
 * Accept a specific section diff
 */
export const acceptSectionDiff = (sectionId: string) => {
    // Get the pending change content
    const state = store.getState();
    const pendingContent = state.diff.pendingChanges[sectionId];

    if (pendingContent) {
        // Update the section in the markdown slice
        store.dispatch(
            markdownActions.updateSection({
                sectionId,
                content: pendingContent,
            })
        );

        // Clean up the diff state
        store.dispatch(diffActions.removePendingChange(sectionId));
        store.dispatch(diffActions.removePendingDiff(sectionId));
    }
};

/**
 * Reject a specific section diff
 */
export const rejectSectionDiff = (sectionId: string) => {
    // Get the previous content
    const state = store.getState();
    const previousContent = state.diff.previousContent[sectionId];

    if (previousContent) {
        store.dispatch(
            markdownActions.updateSection({
                sectionId,
                content: previousContent,
            })
        );

        // Clean up the diff state
        store.dispatch(diffActions.removePendingChange(sectionId));
        store.dispatch(diffActions.removePendingDiff(sectionId));
    }
};

/**
 * Accept all pending diffs
 */
export const acceptAllDiffs = () => {
    const state = store.getState();
    const pendingChanges = state.diff.pendingChanges;

    // Apply all pending changes to the markdown sections
    Object.entries(pendingChanges).forEach(([sectionId, content]) => {
        store.dispatch(
            markdownActions.updateSection({
                sectionId,
                content,
            })
        );
    });

    // Clean up all diff state
    store.dispatch(diffActions.clearPendingChanges());
    store.dispatch(diffActions.clearPreviousContent());
    store.dispatch(diffActions.clearPendingDiffs());
};

/**
 * Reject all pending diffs
 */
export const rejectAllDiffs = () => {
    const state = store.getState();
    const pendingDiffsMap = state.diff.pendingDiffs;
    const previousContentMap = state.diff.previousContent;

    // Restore only the sections that are currently pending
    Object.keys(pendingDiffsMap).forEach((sectionId) => {
        const originalContent = previousContentMap[sectionId];
        if (originalContent !== undefined) {
            store.dispatch(
                markdownActions.updateSection({
                    sectionId,
                    content: originalContent,
                })
            );
        }
    });

    // Clean up all diff state after processing all pending rejections
    store.dispatch(diffActions.clearPendingChanges());
    store.dispatch(diffActions.clearPreviousContent());
    store.dispatch(diffActions.clearPendingDiffs());
};
