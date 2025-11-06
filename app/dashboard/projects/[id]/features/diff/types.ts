export interface SectionDiff {
  sectionId: string;
  title: string;
  oldContent: string;
  newContent: string;
}
export interface DiffState {
  pendingDiffs: Record<string, SectionDiff>;
  showDiff: boolean;
  pendingChanges: Record<string, string>;
  previousContent: Record<string, string>;
}
