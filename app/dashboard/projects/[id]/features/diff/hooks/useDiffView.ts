import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import {
  selectors,
  actions,
} from "@/app/dashboard/projects/[id]/features/diff/slice";

/**
 * Custom hook to manage the diff view state and related actions.
 * It interacts with the Redux store to get diff status and dispatch actions.
 *
 * @returns An object containing:
 *  - `showDiff`: Boolean indicating if the diff view is currently active.
 *  - `pendingDiffs`: Array of pending diff objects.
 *  - `hasPendingDiffs`: Boolean indicating if there are any pending diffs.
 *  - `handleToggleDiffView`: Memoized callback to toggle the diff view on/off.
 *  - `handleReturnToNormalView`: Memoized callback to specifically turn off the diff view.
 */
export function useDiffView() {
  const dispatch = useAppDispatch();
  const showDiff = useAppSelector(selectors.selectShowDiff);
  const pendingDiffs = useAppSelector(selectors.selectPendingDiffsArray);
  const hasPendingDiffs = useAppSelector(selectors.selectHasPendingDiffs);

  // Toggle diff view handler
  const handleToggleDiffView = useCallback(() => {
    dispatch(actions.toggleDiffView());
  }, [dispatch]);

  // Return to normal view handler (explicitly sets showDiff to false)
  const handleReturnToNormalView = useCallback(() => {
    dispatch(actions.toggleDiffView(false));
  }, [dispatch]);

  return {
    showDiff,
    pendingDiffs,
    hasPendingDiffs,
    handleToggleDiffView,
    handleReturnToNormalView,
  };
}
