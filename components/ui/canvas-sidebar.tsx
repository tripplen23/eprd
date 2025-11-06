import React from "react";

interface CanvasSidebarProps {
  isCollapsed: boolean;
  children: React.ReactNode;
}

export const CanvasSidebar: React.FC<CanvasSidebarProps> = React.memo(
  ({ isCollapsed, children }) => {
    return (
      <div
        className={`sidebar-container h-full overflow-hidden border-r border-gray-200 dark:border-primary/10
      transition-all duration-75 ease-out relative bg-white dark:bg-transparent
      ${isCollapsed ? "w-12 px-1" : "w-60 pr-4 pl-6"}`}
      >
        <div className="py-6 h-full flex flex-col">{children}</div>

        {!isCollapsed && (
          <div className="absolute inset-0 pointer-events-none sidebar-glow opacity-0 animate-fadeIn"></div>
        )}
      </div>
    );
  }
);

CanvasSidebar.displayName = "CanvasSidebar";