import { createBaseSectionPrompt } from "./base-section-prompt";
import { SectionUpdateCriteria } from "@/lib/ai/types";

export const userStoriesUpdateCriteria: SectionUpdateCriteria = {
  shouldUpdateWhen:
    "message contains information about user stories, user roles, user actions, user goals, acceptance criteria, or user requirements",
  relevantInfoGuide:
    "Extract information in plain text format about: user roles/types, actions users want to perform, benefits users expect, acceptance criteria details, priorities, and epics. Pay special attention to any 'As a [role], I want to [action] so that [benefit]' format statements.",
};

export const userStoriesPrompt = (
  history: {
    lastContent: string;
    lastRelevantInfo: string;
    chatSummary: string;
  },
  relevantInfo: string
) => {
  const customFormatting = `
   This section should be structured as:
   - User Story Overview (brief explanation of the user story approach)
   - Primary User Stories (list of the most important user stories)
   - Secondary User Stories (list of less critical but valuable stories)
   - Acceptance Criteria (criteria for each story to be considered complete)
   
   Format user stories as:
   ### User Story [Number]
   **As a** [user type/role]
   **I want to** [action/feature]
   **So that** [benefit/value]
   
   **Acceptance Criteria:**
   • [Criterion 1]
   • [Criterion 2]
   • [Criterion 3]
  `;

  return createBaseSectionPrompt(
    "user-stories",
    history,
    relevantInfo,
    customFormatting
  );
};
