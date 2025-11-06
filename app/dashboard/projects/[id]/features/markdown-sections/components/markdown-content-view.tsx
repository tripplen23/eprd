import React, { useRef, useEffect, useState } from "react";

interface MarkdownContentViewProps {
  sidebar: React.ReactNode;
  markdownContent: React.ReactNode;
  isProcessing: boolean;
  contentContainerId: string;
  activeSection?: string;
}

export const MarkdownContentView: React.FC<MarkdownContentViewProps> =
  React.memo(
    ({
      sidebar,
      markdownContent,
      isProcessing,
      contentContainerId,
      activeSection,
    }) => {
      const contentRef = useRef<HTMLDivElement>(null);
      const scrollPositionRef = useRef<number>(0);
      const [scrollAfterProcessing, setScrollAfterProcessing] = useState(false);

      // Save scroll position before processing starts
      useEffect(() => {
        if (isProcessing && contentRef.current) {
          scrollPositionRef.current = contentRef.current.scrollTop;
        }
      }, [isProcessing]);

      // Restore scroll position after processing ends
      useEffect(() => {
        if (!isProcessing && contentRef.current) {
          contentRef.current.scrollTop = scrollPositionRef.current;
        }
      }, [isProcessing, markdownContent]);

      useEffect(() => {
        if (isProcessing && !scrollAfterProcessing) {
          setScrollAfterProcessing(true);
        }
      }, [isProcessing, scrollAfterProcessing]);

      // Effect to handle scrolling to active section after processing
      useEffect(() => {
        if (
          !isProcessing &&
          activeSection &&
          contentRef.current &&
          scrollAfterProcessing
        ) {
          const sectionElement = document.getElementById(activeSection);
          if (sectionElement) {
            setTimeout(() => {
              sectionElement.scrollIntoView({
                behavior: "auto",
                block: "start",
              });
            }, 1500);
            setScrollAfterProcessing(false);
          }
        }
      }, [isProcessing, activeSection, scrollAfterProcessing, markdownContent]);

      return (
        <div className="flex h-full">
          {sidebar}
          <div className="flex-1 overflow-hidden bg-white dark:bg-transparent">
            <div
              ref={contentRef}
              id={contentContainerId}
              className={`p-6 overflow-y-auto h-full transition-all duration-300 ease-out
          ${isProcessing ? "markdown-processing" : ""}`}
            >
              {markdownContent}
            </div>
          </div>
        </div>
      );
    }
  );

MarkdownContentView.displayName = "MarkdownContentView";