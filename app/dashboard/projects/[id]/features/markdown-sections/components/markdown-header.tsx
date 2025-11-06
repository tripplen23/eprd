import React from 'react';
import { ToggleDiffButton } from './markdown-preview/toggle-diff-button';
import { Expand } from 'lucide-react';

interface MarkdownHeaderProps {
    showDiff: boolean;
    hasPendingDiffs: boolean;
    onToggleDiffView: () => void;
    onExpandClick: () => void;
}

/**
 * Memoized header component for the Markdown section.
 * Displays the toggle button for the diff view and an expand button.
 */
export const MarkdownHeader: React.FC<MarkdownHeaderProps> = React.memo(
    ({ showDiff, hasPendingDiffs, onToggleDiffView, onExpandClick }) => {
        return (
            <div className="flex justify-between items-center p-2 pt-3 pb-1 pl-4 pr-2 border-b border-border/30">
                <ToggleDiffButton showDiff={showDiff} hasPendingDiffs={hasPendingDiffs} onToggle={onToggleDiffView} />
                <button
                    onClick={onExpandClick}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                    aria-label="Expand view"
                >
                    <Expand className="h-4 w-4" />
                </button>
            </div>
        );
    }
);

MarkdownHeader.displayName = 'MarkdownHeader';
