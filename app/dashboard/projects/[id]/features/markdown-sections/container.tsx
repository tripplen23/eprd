import { useAppSelector } from '@/lib/store/hooks';
import { useMemo, useState, memo } from 'react';
import { DiffViewContainer } from '@/app/dashboard/projects/[id]/features/diff/container';
import { TableOfContentsBase } from '@/components/ui/table-of-contents';
import { getSectionCompletionStatus } from './utils/getSectionCompletionStatus';

// Import Custom Hooks
import { useSidebarState, useSectionNavigation } from './hooks';
import { useDiffView } from '@/app/dashboard/projects/[id]/features/diff/hooks/useDiffView';

// Import Components
import { MarkdownPreview } from './components/markdown-preview/index';
import { MarkdownHeader } from './components/markdown-header';
import { CanvasSidebar } from '@/components/ui/canvas-sidebar';
import { MarkdownContentView } from './components/markdown-content-view';
import { Modal } from '@/components/ui/modal';
import { ToggleDiffButton } from './components/markdown-preview/toggle-diff-button';

// Define ID for the content container
const CONTENT_CONTAINER_ID = 'markdown-content';

// Define the component implementation
function MarkdownSectionsContainerComponent() {
    // --- State from Redux ---
    const markdownSections = useAppSelector((state) => state.markdown.sections);
    const isStreaming = useAppSelector((state) => state.chat.isStreaming);
    const isThinking = useAppSelector((state) => state.chat.isThinking);
    const isProcessing = isStreaming || isThinking;

    // --- Local State ---
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Custom Hooks ---
    const { isSidebarCollapsed, toggleSidebar } = useSidebarState();
    const { showDiff, pendingDiffs, hasPendingDiffs, handleToggleDiffView, handleReturnToNormalView } = useDiffView();

    const { activeSectionId, handleSectionClick } = useSectionNavigation({
        markdownSections,
        showDiff,
    });

    // --- Derived State & Memoized Values ---

    // Calculate section statuses
    const sectionsWithStatus = useMemo(
        () =>
            markdownSections.map((section) => ({
                id: section.id,
                title: section.title,
                completionStatus: getSectionCompletionStatus(section),
            })),
        [markdownSections]
    );

    // Memoize the main markdown content rendering
    const mainMarkdownNormalView = useMemo(() => {
        return markdownSections.map((section, index) => (
            <MarkdownPreview
                key={section.id}
                content={section.content}
                isSection={true}
                sectionId={section.id}
                isFirst={index === 0}
                isProcessing={isProcessing}
            />
        ));
    }, [markdownSections, isProcessing]);

    // Memoize the content specifically for the modal
    const modalMarkdownNormalView = useMemo(() => {
        return (
            <div className="prose dark:prose-invert max-w-none">
                {markdownSections.map((section) => (
                    <div key={section.id} className="mb-8 last:mb-0">
                        <MarkdownPreview content={section.content} isSection={false} isProcessing={false} />
                    </div>
                ))}
            </div>
        );
    }, [markdownSections]);

    // Memoize the Table of Contents component
    const tableOfContentsComponent = useMemo(
        () => (
            <TableOfContentsBase
                sections={sectionsWithStatus}
                pendingSections={pendingDiffs.map((diff) => diff.sectionId)}
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
                onSectionClick={handleSectionClick}
                activeSection={activeSectionId}
                headerTitle="PRD SECTIONS"
                displayMode="all"
            />
        ),
        [sectionsWithStatus, pendingDiffs, isSidebarCollapsed, toggleSidebar, handleSectionClick, activeSectionId]
    );

    // Memoize the markdown diff view
    const mainMarkdownDiffView = useMemo(
        () => (
            <DiffViewContainer
                sections={sectionsWithStatus}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={toggleSidebar}
                onReturnToNormalView={handleReturnToNormalView}
            />
        ),
        [sectionsWithStatus, isSidebarCollapsed, toggleSidebar, handleReturnToNormalView]
    );

    // Memoize the markdown diff view specifically for the modal
    const modalMarkdownDiffView = useMemo(
        () => (
            <DiffViewContainer
                sections={sectionsWithStatus}
                isSidebarCollapsed={true}
                onToggleSidebar={() => {}}
                onReturnToNormalView={handleReturnToNormalView}
                showSidebar={false}
            />
        ),
        [sectionsWithStatus, handleReturnToNormalView]
    );

    // Memoize the ToggleDiffButton for the Modal header
    const modalToggleButton = useMemo(
        () => (
            <ToggleDiffButton showDiff={showDiff} hasPendingDiffs={hasPendingDiffs} onToggle={handleToggleDiffView} />
        ),
        [showDiff, hasPendingDiffs, handleToggleDiffView]
    );

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // --- Render Logic ---
    return (
        <div className="flex h-full flex-col">
            {/* Use MarkdownHeader component */}
            <MarkdownHeader
                showDiff={showDiff}
                hasPendingDiffs={hasPendingDiffs}
                onToggleDiffView={handleToggleDiffView}
                onExpandClick={handleOpenModal}
            />
            <div className="flex-1 overflow-hidden">
                {showDiff ? (
                    mainMarkdownDiffView
                ) : (
                    /* Use MarkdownContentView and MarkdownSidebar components */
                    <MarkdownContentView
                        contentContainerId={CONTENT_CONTAINER_ID}
                        isProcessing={isProcessing}
                        markdownContent={mainMarkdownNormalView}
                        activeSection={activeSectionId}
                        sidebar={
                            <CanvasSidebar isCollapsed={isSidebarCollapsed}>{tableOfContentsComponent}</CanvasSidebar>
                        }
                    />
                )}
            </div>

            {/* Render Modal Conditionally */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalToggleButton}>
                {showDiff ? modalMarkdownDiffView : modalMarkdownNormalView}
            </Modal>
        </div>
    );
}

export const MarkdownSectionsContainer = memo(MarkdownSectionsContainerComponent);