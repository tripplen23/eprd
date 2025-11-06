interface ToggleDiffButtonProps {
  showDiff: boolean;
  hasPendingDiffs: boolean;
  onToggle: () => void;
}

export function ToggleDiffButton({
  showDiff,
  hasPendingDiffs,
  onToggle,
}: ToggleDiffButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={!hasPendingDiffs && !showDiff}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors 
        ${
          showDiff
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted/50 text-muted-foreground hover:bg-muted"
        }
        ${!hasPendingDiffs && !showDiff ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1.5 h-4 w-4"
      >
        {showDiff ? (
          <>
            <path d="M18 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" />
            <path d="m8 14 4-4 4 4" />
          </>
        ) : (
          <>
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9-9v18" />
          </>
        )}
      </svg>
      {showDiff ? "Normal View" : "View Changes"}
      {hasPendingDiffs && !showDiff && (
        <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      )}
    </button>
  );
}
