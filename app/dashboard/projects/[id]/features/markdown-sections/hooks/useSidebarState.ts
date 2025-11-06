import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the state of the sidebar (collapsed or expanded).
 *
 * @param initialCollapsed - Optional initial state for the sidebar (default: false).
 * @returns An object containing:
 *  - `isSidebarCollapsed`: Boolean indicating if the sidebar is currently collapsed.
 *  - `toggleSidebar`: A memoized callback function to toggle the sidebar state.
 */
export function useSidebarState(initialCollapsed = false) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(initialCollapsed);

    // Memoized callback to toggle the sidebar state
    const toggleSidebar = useCallback(() => {
        setIsSidebarCollapsed((prev) => !prev);
    }, []);

    return { isSidebarCollapsed, toggleSidebar };
}
