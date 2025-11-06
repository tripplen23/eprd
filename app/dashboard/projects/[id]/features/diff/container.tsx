import { useAppSelector } from '@/lib/store/hooks';
import { selectors } from '@/app/dashboard/projects/[id]/features/diff/slice';
import {
    acceptSectionDiff,
    rejectSectionDiff,
    acceptAllDiffs,
    rejectAllDiffs,
} from '@/app/dashboard/projects/[id]/features/diff/utils';
import { useMemo, useCallback, useRef } from 'react';

// Import Custom Hooks
import { useDiffNavigation } from './hooks';

// Import Components
import { TOCSection } from '@/components/ui/table-of-contents';
import { TableOfContentsDiff } from './components/table-of-contents';
import { MarkdownPreviewDiff } from './components/markdown-preview-diff';
import { DiffContentArea } from './components/diff-content-area';
import { CanvasSidebar } from '@/components/ui/canvas-sidebar';

interface DiffViewContainerProps {
    sections: TOCSection[];
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    onReturnToNormalView: () => void;
    showSidebar?: boolean;
}

export function DiffViewContainer({
    sections,
    isSidebarCollapsed,
    onToggleSidebar,
    onReturnToNormalView,
    showSidebar = true,
}: DiffViewContainerProps) {
    const pendingDiffs = useAppSelector(selectors.selectPendingDiffsArray);
    const containerRef = useRef<HTMLDivElement>(null);
    const { activeSectionId, handleSectionClick: scrollToSection } = useDiffNavigation({
        containerRef,
        pendingDiffs,
    });

    // Get array of section IDs with pending changes
    const sectionsWithPendingChanges = useMemo(() => pendingDiffs.map((diff) => diff.sectionId), [pendingDiffs]);

    const handleAcceptSection = useCallback((sectionId: string) => {
        acceptSectionDiff(sectionId);
    }, []);

    const handleRejectSection = useCallback((sectionId: string) => {
        rejectSectionDiff(sectionId);
    }, []);

    const diffPreviews = useMemo(() => {
        return pendingDiffs.map((diff) => (
            <div id={`diff-${diff.sectionId}`} key={diff.sectionId}>
                <MarkdownPreviewDiff
                    sectionId={diff.sectionId}
                    title={diff.title}
                    oldContent={diff.oldContent}
                    newContent={diff.newContent}
                    onAccept={handleAcceptSection}
                    onReject={handleRejectSection}
                />
            </div>
        ));
    }, [pendingDiffs, handleAcceptSection, handleRejectSection]);

    // Memoize the table of contents component
    const tableOfContentsComponent = useMemo(
        () => (
            <TableOfContentsDiff
                sections={sections}
                pendingSections={sectionsWithPendingChanges}
                isCollapsed={isSidebarCollapsed}
                onToggle={onToggleSidebar}
                onSectionClick={scrollToSection}
                onReturnToNormalView={onReturnToNormalView}
                activeSection={activeSectionId}
            />
        ),
        [
            sections,
            sectionsWithPendingChanges,
            isSidebarCollapsed,
            onToggleSidebar,
            scrollToSection,
            onReturnToNormalView,
            activeSectionId,
        ]
    );

    return (
        <div className="flex h-full">
            {showSidebar && <CanvasSidebar isCollapsed={isSidebarCollapsed}>{tableOfContentsComponent}</CanvasSidebar>}
            <DiffContentArea
                containerRef={containerRef}
                pendingDiffCount={pendingDiffs.length}
                onRejectAll={rejectAllDiffs}
                onAcceptAll={acceptAllDiffs}
                diffPreviews={diffPreviews}
            />
        </div>
    );
}
