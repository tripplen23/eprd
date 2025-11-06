import { useMemo } from "react";
import {
  TableOfContentsBase,
  TOCSection,
} from "@/components/ui/table-of-contents";

interface TableOfContentsDiffProps {
  sections: TOCSection[];
  pendingSections: string[];
  isCollapsed?: boolean;
  onToggle?: () => void;
  onSectionClick: (sectionId: string) => void;
  onReturnToNormalView: () => void;
  activeSection?: string;
}

export function TableOfContentsDiff({
  sections,
  pendingSections,
  isCollapsed = false,
  onToggle,
  onSectionClick,
  onReturnToNormalView,
  activeSection = "",
}: TableOfContentsDiffProps) {
  const renderExtraContent = useMemo(() => {
    return () => {
      return pendingSections.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 px-2">
          No pending changes to display.
          <button
            onClick={onReturnToNormalView}
            className="block mt-2 text-primary hover:underline"
          >
            Return to normal view
          </button>
        </div>
      ) : null;
    };
  }, [pendingSections.length, onReturnToNormalView]);

  return (
    <TableOfContentsBase
      sections={sections}
      pendingSections={pendingSections}
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      onSectionClick={onSectionClick}
      activeSection={activeSection}
      headerTitle="PENDING CHANGES"
      headerColor="text-red-700 dark:text-amber-400"
      dividerColor="via-amber-400/30"
      displayMode="pending"
      renderExtraContent={renderExtraContent}
    />
  );
}