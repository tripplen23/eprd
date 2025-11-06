import { createBaseSectionPrompt } from "./base-section-prompt";
import { SectionUpdateCriteria } from "@/lib/ai/types";

export const scopeUpdateCriteria: SectionUpdateCriteria = {
  shouldUpdateWhen:
    "message contains information about project scope, boundaries, inclusions, exclusions, constraints, assumptions, limitations, phasing, timeline, team size, resource allocation, integration platforms, or technical requirements",
  relevantInfoGuide:
    "Extract information in plain text format about: what is in scope, what is out of scope, project constraints, assumptions, dependencies, timeline for project delivery, team composition and size, resource allocation, integration platforms, technical requirements, and phasing of the project. Look for specific features, functionality, timeline information (e.g., '6 months'), team details (e.g., '5 developers'), integration details, and limitations mentioned.",
};

export const scopePrompt = (
  history: {
    lastContent: string;
    lastRelevantInfo: string;
    chatSummary: string;
  },
  relevantInfo: string
) => {
  const customFormatting = `
   This section should be structured as:
   - Project Boundaries (clear definition of overall boundaries)
   - In Scope (bulleted list of features/functions included)
   - Out of Scope (bulleted list of features/functions excluded)
   - Constraints and Assumptions (technical, business, time, resources)
   - Timeline and Resources (delivery timeline, team size and composition)
   - Integration Requirements (platforms, technical requirements)
   - Dependencies (connections to other projects or systems)
   
   Format scope items as bulleted lists:
   • [Category]: [Specific item]

   Format timeline and resources as:
   • Timeline: [specific timeframe, e.g., "6 months from kickoff"]
   • Team Composition: [team size and roles, e.g., "5 developers, 2 project managers"]
   • Integration Platforms: [list of platforms, e.g., "eCommerce site, CRM"]
   • Technical Requirements: [specific requirements, e.g., "RAG and KAG knowledge"]
   
   IMPORTANT: When specific timeline or team information is provided, immediately update the corresponding fields.
   For example, if "Timeline: 6 months" is provided, this exact information must be reflected in the Timeline field.
   Never generalize specific numbers - use the exact values provided.
  `;

  return createBaseSectionPrompt(
    "scope",
    history,
    relevantInfo,
    customFormatting
  );
};
