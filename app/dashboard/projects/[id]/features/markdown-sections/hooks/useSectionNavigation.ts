import { useState, useEffect, useRef, useCallback } from 'react';
import { MarkdownSection } from '../types';

interface UseSectionNavigationProps {
    markdownSections: MarkdownSection[];
    showDiff: boolean;
}

interface UseSectionNavigationReturn {
    activeSectionId: string;
    lockScrollTracking: boolean;
    handleSectionClick: (sectionId: string) => void;
    setLockScrollTracking: (value: boolean) => void;
}

// Threshold for the number of visible entries to determine the active section.
// Adjust this value based on screen size or user preference.
const VISIBLE_ENTRIES_THRESHOLD = 8; // Default value, can be parameterized if needed

export function useSectionNavigation({
    markdownSections,
    showDiff,
}: UseSectionNavigationProps): UseSectionNavigationReturn {
    const [activeSectionId, setActiveSectionId] = useState<string>('');
    const [isDiffView, setIsDiffView] = useState(false);
    const [lockScrollTracking, setLockScrollTracking] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Set up intersection observer to track visible sections
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (lockScrollTracking) return;

                const visibleEntries = entries.filter((entry) => entry.isIntersecting);

                if (visibleEntries.length > VISIBLE_ENTRIES_THRESHOLD) {
                    const sortedEntries = visibleEntries.sort(
                        (a, b) => a.boundingClientRect.y - b.boundingClientRect.y
                    );
                    const topSectionId = sortedEntries[0].target.id;

                    if (topSectionId !== activeSectionId) {
                        setActiveSectionId(topSectionId);
                    }
                }
            },
            {
                root: document.getElementById('markdown-content'),
                threshold: 0.1,
                rootMargin: '-10px 0px -70% 0px',
            }
        );

        // Observe all section elements
        markdownSections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                observerRef.current?.observe(element);
            }
        });

        // Clean up observer on component unmount
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [markdownSections, activeSectionId, lockScrollTracking]);

    // Add scroll event listener as a fallback
    useEffect(() => {
        const contentContainer = document.getElementById('markdown-content');
        if (!contentContainer) return;

        const handleScroll = () => {
            if (lockScrollTracking) return;

            const sections = markdownSections
                .map((section) => ({
                    id: section.id,
                    element: document.getElementById(section.id),
                }))
                .filter((item) => item.element !== null);

            if (sections.length === 0) return;

            const containerRect = contentContainer.getBoundingClientRect();
            const containerTop = containerRect.top;
            const viewportHeight = containerRect.height;
            const triggerPoint = containerTop + viewportHeight * 0.1;

            let closestSection = sections[0];
            let closestDistance = Infinity;

            sections.forEach((section) => {
                if (!section.element) return;

                const rect = section.element.getBoundingClientRect();
                const distance = Math.abs(rect.top - triggerPoint);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestSection = section;
                }
            });

            if (closestSection.id !== activeSectionId) {
                setActiveSectionId(closestSection.id);
            }
        };

        contentContainer.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            contentContainer.removeEventListener('scroll', handleScroll);
        };
    }, [markdownSections, activeSectionId, lockScrollTracking]);

    // Update tracking state whenever view changes
    useEffect(() => {
        // If we're in diff view, set the flag
        if (showDiff) {
            setIsDiffView(true);
            setLockScrollTracking(false);
        }
    }, [showDiff]);

    // Reinitialize intersection observer when switching from diff view to normal view
    useEffect(() => {
        if (isDiffView && !showDiff) {
            setIsDiffView(false);

            const timer = setTimeout(() => {
                if (!lockScrollTracking) {
                    if (observerRef.current) {
                        observerRef.current.disconnect();
                    }

                    observerRef.current = new IntersectionObserver(
                        (entries) => {
                            if (lockScrollTracking) return;

                            const visibleEntries = entries.filter((entry) => entry.isIntersecting);
                            if (visibleEntries.length > 8) {
                                const sortedEntries = visibleEntries.sort(
                                    (a, b) => a.boundingClientRect.y - b.boundingClientRect.y
                                );

                                const topSectionId = sortedEntries[0].target.id;

                                if (topSectionId !== activeSectionId) {
                                    setActiveSectionId(topSectionId);
                                }
                            }
                        },
                        {
                            root: document.getElementById('markdown-content'),
                            threshold: 0.1,
                            rootMargin: '-10px 0px -70% 0px',
                        }
                    );

                    markdownSections.forEach((section) => {
                        const element = document.getElementById(section.id);
                        if (element) {
                            observerRef.current?.observe(element);
                        }
                    });

                    // Trigger initial scroll check
                    const contentContainer = document.getElementById('markdown-content');
                    if (contentContainer) {
                        const handleInitialScroll = () => {
                            // Find which section is currently most visible
                            const sections = markdownSections
                                .map((section) => ({
                                    id: section.id,
                                    element: document.getElementById(section.id),
                                }))
                                .filter((item) => item.element !== null);

                            if (sections.length === 0) return;

                            // Get container dimensions
                            const containerRect = contentContainer.getBoundingClientRect();
                            const containerTop = containerRect.top;
                            const viewportHeight = containerRect.height;
                            const triggerPoint = containerTop + viewportHeight * 0.1;

                            // Find the section that's closest to the trigger point
                            let closestSection = sections[0];
                            let closestDistance = Infinity;

                            sections.forEach((section) => {
                                if (!section.element) return;

                                const rect = section.element.getBoundingClientRect();
                                const distance = Math.abs(rect.top - triggerPoint);

                                if (distance < closestDistance) {
                                    closestDistance = distance;
                                    closestSection = section;
                                }
                            });

                            // Update active section
                            setActiveSectionId(closestSection.id);
                        };

                        handleInitialScroll();
                    }
                }
            }, 5);

            return () => clearTimeout(timer);
        }
    }, [showDiff, isDiffView, markdownSections, activeSectionId, lockScrollTracking]);

    // Re-initialize the observer when the content changes
    useEffect(() => {
        // Small delay to ensure DOM elements are rendered
        const timer = setTimeout(() => {
            // Clean up previous observer
            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            // Re-observe all section elements
            markdownSections.forEach((section) => {
                const element = document.getElementById(section.id);
                if (element && observerRef.current) {
                    observerRef.current.observe(element);
                }
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [markdownSections]);

    // Handle click on section in table of contents
    const handleSectionClick = useCallback((sectionId: string) => {
        setActiveSectionId(sectionId);
        setLockScrollTracking(true);

        const targetElement = document.getElementById(sectionId);
        if (!targetElement) return;

        const contentContainer = document.getElementById('markdown-content');
        if (!contentContainer) return;

        contentContainer.scrollTo({
            top: Math.max(0, targetElement.offsetTop - 50),
            behavior: 'smooth',
        });

        targetElement.style.transition = 'background-color 0.5s ease-in-out';
        targetElement.style.backgroundColor = 'rgba(var(--primary-rgb), 0.15)';
        setTimeout(() => {
            targetElement.style.backgroundColor = '';
        }, 900);

        const handleUserScroll = () => {
            setLockScrollTracking(false);
            contentContainer.removeEventListener('wheel', handleUserScroll);
            contentContainer.removeEventListener('touchmove', handleUserScroll);
            contentContainer.removeEventListener('keydown', handleUserScroll);
        };

        // Add listeners for various scroll-initiating events
        contentContainer.addEventListener('wheel', handleUserScroll, {
            once: true,
        });
        contentContainer.addEventListener('touchmove', handleUserScroll, {
            once: true,
        });
        contentContainer.addEventListener('keydown', handleUserScroll, {
            once: true,
        });
    }, []);

    return {
        activeSectionId,
        lockScrollTracking,
        handleSectionClick,
        setLockScrollTracking,
    };
}
