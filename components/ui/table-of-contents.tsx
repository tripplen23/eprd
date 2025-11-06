import { useEffect, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { UnfoldHorizontal, FoldHorizontal } from "lucide-react";

export interface TOCSection {
  id: string;
  title: string;
  completionStatus?: "not-started" | "in-progress" | "complete";
}

export interface TableOfContentsBaseProps {
  sections: TOCSection[];
  pendingSections?: string[];
  isCollapsed?: boolean;
  onToggle?: () => void;
  onSectionClick: (sectionId: string) => void;
  activeSection?: string;
  headerTitle: string;
  headerColor?: string;
  dividerColor?: string;
  displayMode?: "all" | "pending";
  renderExtraContent?: () => ReactNode;
}

export function TableOfContentsBase({
  sections,
  pendingSections = [],
  isCollapsed = false,
  onToggle,
  onSectionClick,
  activeSection = "",
  headerTitle,
  headerColor = "text-primary dark:text-primary/90",
  dividerColor = "via-primary/30",
  displayMode = "all",
  renderExtraContent,
}: TableOfContentsBaseProps) {
  const [headerVisible, setHeaderVisible] = useState(!isCollapsed);

  useEffect(() => {
    if (isCollapsed) {
      setHeaderVisible(false);
    } else {
      const timer = setTimeout(() => {
        setHeaderVisible(true);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      onSectionClick(sectionId);
    },
    [onSectionClick]
  );

  // Filter sections based on displayMode
  const filteredSections =
    displayMode === "pending"
      ? sections.filter((section) => pendingSections.includes(section.id))
      : sections;

  return (
    <div className="h-full flex flex-col relative">
      {/* Header and Toggle Button */}
      <div
        className={`flex items-center justify-between ${
          !isCollapsed ? "mb-4" : "mb-0"
        }`}
      >
        {!isCollapsed && (
          <h4
            className={cn(
              `font-semibold text-sm tracking-wider uppercase ${headerColor}
              transition-all duration-100 ease-out`,
              headerVisible
                ? "opacity-100"
                : "opacity-60 transform translate-y-3"
            )}
          >
            {headerTitle}
          </h4>
        )}
        <button
          onClick={onToggle}
          className={cn(
            `p-1.5 rounded-md hover:bg-primary/15 active:bg-primary/25 text-primary
            hover:text-primary/90 active:scale-95 transition-all duration-75`,
            isCollapsed ? "ml-auto mr-auto" : "ml-auto"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <UnfoldHorizontal className="w-4 h-4" />
          ) : (
            <FoldHorizontal className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Divider */}
      {!isCollapsed && (
        <div
          className={cn(
            `h-px bg-gradient-to-r from-transparent ${dividerColor} to-transparent
            transition-opacity duration-100 ease-out mb-4`,
            headerVisible ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Section List Area */}
      <div
        className={cn(
          "transition-all duration-120 ease-out overflow-hidden will-change-transform",
          isCollapsed ? "opacity-0 max-h-0" : "opacity-100 max-h-full flex-1"
        )}
      >
        <nav className="w-full overflow-y-auto h-full">
          {renderExtraContent && renderExtraContent()}
          <ul className="space-y-1.5 text-sm">
            {filteredSections.map((section) => {
              const isActive = activeSection === section.id;
              const isPending = pendingSections.includes(section.id);

              const buttonClasses = cn(
                "text-left w-full flex-1 transition-all py-1.5 px-2 rounded-md relative group",
                isActive &&
                  isPending &&
                  "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium shadow-sm",
                isActive &&
                  !isPending &&
                  "bg-primary/15 text-primary font-medium",
                !isActive &&
                  isPending &&
                  "text-amber-700 dark:text-amber-400 font-medium hover:bg-amber-50 dark:hover:bg-amber-500/10",
                !isActive &&
                  !isPending &&
                  section.completionStatus === "complete" &&
                  "text-green-600 dark:text-green-500",
                !isActive &&
                  !isPending &&
                  section.completionStatus !== "complete" &&
                  "text-muted-foreground hover:text-primary/90"
              );

              const textClasses = cn(
                "relative z-10 pl-1 flex items-center",
                isActive && isPending && "text-amber-700 dark:text-amber-400"
              );

              return (
                <li
                  key={section.id}
                  className="flex items-center will-change-transform"
                >
                  <button
                    onClick={() => handleSectionClick(section.id)}
                    className={buttonClasses}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3/4 rounded-r-md",
                          isPending
                            ? "bg-amber-500 dark:bg-amber-400 shadow-sm"
                            : "bg-primary"
                        )}
                      />
                    )}
                    {/* Pending indicator (only if not active) */}
                    {!isActive && isPending && (
                      <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3/4 bg-amber-500 dark:bg-amber-400 rounded-r-md shadow-sm" />
                    )}

                    {/* Section Title and Pending Dot */}
                    <span className={textClasses}>
                      {section.title}
                      {isPending && (
                        <span className="ml-1.5 text-amber-500 dark:text-amber-400 animate-pulse">
                          ●
                        </span>
                      )}
                    </span>

                    {/* Hover background effect */}
                    <div className="absolute left-0 top-0 w-0 h-full bg-primary/5 group-hover:w-full transition-all duration-75 rounded-md" />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
