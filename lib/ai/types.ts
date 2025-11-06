export type RouterResponse = {
  is_prd_section_related: boolean;
};

export type ConversationAgentResponse = {
  response: string;
  updatedChatSummary: string;
};

export type OrchestratorResponse = {
  response: string;
  sectionUpdates: Array<{
    sectionId: string;
    content: string;
    relevantInfo: string;
    chatSummary: string;
  }>;
};

// For document context generation
export type DocumentSectionInfo = {
  id: string;
  title: string;
  content: string;
  priority: number;
};

export type Message = {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; [key: string]: unknown }>;
  timestamp?: Date;
};

export interface SectionHistory {
  lastContent?: string;
  lastUpdate?: number;
  lastRelevantInfo: string;
  chatSummary: string;
}

export type SectionHistories = {
  [key: string]: SectionHistory;
};

// Add type for section info from analysis
export type SectionUpdateInfo = {
  shouldUpdate: boolean;
  relevantInfo: string;
};

export type AnalysisResponse = {
  response: string;
  sectionsToUpdate: {
    [key: string]: SectionUpdateInfo;
  };
};

export type SectionUpdateCriteria = {
  shouldUpdateWhen: string;
  relevantInfoGuide: string;
};
