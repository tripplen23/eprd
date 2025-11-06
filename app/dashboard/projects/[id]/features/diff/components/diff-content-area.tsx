import React, { ReactNode, RefObject } from "react";

interface DiffContentAreaProps {
  containerRef: RefObject<HTMLDivElement>;
  pendingDiffCount: number;
  onRejectAll: () => void;
  onAcceptAll: () => void;
  diffPreviews: ReactNode;
}

export const DiffContentArea: React.FC<DiffContentAreaProps> = React.memo(
  ({
    containerRef,
    pendingDiffCount,
    onRejectAll,
    onAcceptAll,
    diffPreviews,
  }) => {
    return (
      <div className="flex-1 overflow-hidden">
        <div ref={containerRef} className="h-full overflow-y-auto px-6 py-4">
          <div className="mb-8 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-medium text-slate-900 dark:text-primary">
                {pendingDiffCount} Pending{" "}
                {pendingDiffCount === 1 ? "Change" : "Changes"}
              </h3>
              <div className="h-0.5 w-24 bg-gradient-to-r from-violet-500/40 to-fuchsia-500/40 dark:from-violet-500 dark:to-fuchsia-500 rounded-full"></div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onRejectAll}
                className="px-4 py-2 rounded-lg text-red-600 dark:text-red-500 bg-white dark:bg-red-500/10
                border border-red-100 dark:border-red-500/20 hover:border-red-200 dark:hover:border-red-500/30
                shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative group overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-red-50 via-white to-red-50 dark:from-red-500/10 dark:via-transparent dark:to-red-500/10 
                opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"
                ></div>
                <span className="relative z-10 font-medium">Reject All</span>
              </button>
              <button
                onClick={onAcceptAll}
                className="px-4 py-2 rounded-lg text-emerald-600 dark:text-emerald-500 bg-white dark:bg-emerald-500/10
                border border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-200 dark:hover:border-emerald-500/30
                shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative group overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-emerald-500/10 dark:via-transparent dark:to-emerald-500/10 
                opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"
                ></div>
                <span className="relative z-10 font-medium">Accept All</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">{diffPreviews}</div>
        </div>
      </div>
    );
  }
);

DiffContentArea.displayName = "DiffContentArea";