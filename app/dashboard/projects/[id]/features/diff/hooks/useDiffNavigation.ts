import { useState, useEffect, useCallback, RefObject, useRef } from "react";
import { SectionDiff } from "../types";

interface UseDiffNavigationProps {
  containerRef: RefObject<HTMLDivElement>;
  pendingDiffs: SectionDiff[];
}

export function useDiffNavigation({
  containerRef,
  pendingDiffs,
}: UseDiffNavigationProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [lockScrollTracking, setLockScrollTracking] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer to track visible sections
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!containerRef.current || pendingDiffs.length === 0) {
      if (activeSectionId !== "") {
        setActiveSectionId("");
      }
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (lockScrollTracking) return;

        // Get all entries that are either intersecting or were recently intersecting
        const relevantEntries = entries.filter(
          (entry) => entry.isIntersecting || entry.intersectionRatio > 0
        );

        if (relevantEntries.length > 0) {
          // Sort by their position from top to bottom
          const sortedEntries = relevantEntries.sort((a, b) => {
            const rectA = a.boundingClientRect;
            const rectB = b.boundingClientRect;

            // If element is fully visible, prioritize it
            if (a.isIntersecting !== b.isIntersecting) {
              return a.isIntersecting ? -1 : 1;
            }

            // Otherwise sort by vertical position
            return rectA.y - rectB.y;
          });

          // Extract sectionId from the element id (remove 'diff-' prefix)
          const topSectionId = sortedEntries[0].target.id.replace("diff-", "");

          if (topSectionId !== activeSectionId) {
            setActiveSectionId(topSectionId);
          }
        }
      },
      {
        root: containerRef.current,
        // Use multiple thresholds for better detection
        threshold: [0, 0.1, 0.2, 0.3],
        // Adjust the rootMargin to create a larger detection area
        rootMargin: "-5% 0px -75% 0px",
      }
    );

    // Observe all diff section elements
    pendingDiffs.forEach((diff) => {
      const element = document.getElementById(`diff-${diff.sectionId}`);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pendingDiffs, containerRef, activeSectionId, lockScrollTracking]);

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      setActiveSectionId(sectionId);
      setLockScrollTracking(true);

      const targetElement = document.getElementById(`diff-${sectionId}`);
      if (!targetElement) return;

      const contentContainer = containerRef.current;
      if (!contentContainer) return;

      contentContainer.scrollTo({
        top: Math.max(0, targetElement.offsetTop - 20),
        behavior: "smooth",
      });

      // Visual feedback
      targetElement.style.transition = "background-color 0.5s ease-in-out";
      targetElement.style.backgroundColor = "rgba(var(--primary-rgb), 0.15)";
      setTimeout(() => {
        if (targetElement) {
          targetElement.style.backgroundColor = "";
        }
      }, 900);

      // Reset scroll lock when user manually scrolls
      const handleUserScroll = () => {
        setLockScrollTracking(false);
        contentContainer.removeEventListener("wheel", handleUserScroll);
        contentContainer.removeEventListener("touchmove", handleUserScroll);
        contentContainer.removeEventListener("keydown", handleUserScroll);
      };

      contentContainer.addEventListener("wheel", handleUserScroll, {
        once: true,
      });
      contentContainer.addEventListener("touchmove", handleUserScroll, {
        once: true,
      });
      contentContainer.addEventListener("keydown", handleUserScroll, {
        once: true,
      });
    },
    [containerRef]
  );

  return { activeSectionId, handleSectionClick };
}
