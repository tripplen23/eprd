import { SectionHistory } from "@/lib/ai/types";

export type MarkdownSection = {
  id: string;
  title: string;
  content: string;
};

export interface MarkdownState {
  sections: MarkdownSection[];
  sectionHistory: Record<string, SectionHistory>;
  pendingChanges: Record<string, string>;
  previousContent: Record<string, string>;
}
