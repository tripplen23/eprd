import { createBaseSectionPrompt } from "./base-section-prompt";
import { SectionUpdateCriteria } from "@/lib/ai/types";

export const useCasesUpdateCriteria: SectionUpdateCriteria = {
  shouldUpdateWhen:
    "message contains information about use cases, user interactions, workflows, system responses, scenarios, preconditions, postconditions, or step-by-step flows",
  relevantInfoGuide:
    "Extract information in plain text format about: actors/user roles, preconditions, main flows, alternative flows, exception flows, postconditions, and business rules. Pay special attention to any sequential steps, conditions, or outcomes mentioned.",
};

export const useCasesPrompt = (
  history: {
    lastContent: string;
    lastRelevantInfo: string;
    chatSummary: string;
  },
  relevantInfo: string
) => {
  const customFormatting = `
   This section should be structured as:
   - Use Case Overview (brief explanation of the use case approach)
   - List of Use Cases (with detailed information for each)
   
   Format each use case as:
   ### Use Case [Number]: [Title]
   **Actor:** [Primary user or system]
   **Description:** [Brief description]
   
   **Preconditions:**
   • [Precondition 1]
   • [Precondition 2]
   
   **Main Flow:**
   1. [Step 1]
   2. [Step 2]
   3. [Step 3]
   
   **Alternative Flows:**
   * [Alternative 1]
   * [Alternative 2]
   
   **Postconditions:**
   • [Postcondition 1]
   • [Postcondition 2]
  `;

  return createBaseSectionPrompt(
    "use-cases",
    history,
    relevantInfo,
    customFormatting
  );
};
