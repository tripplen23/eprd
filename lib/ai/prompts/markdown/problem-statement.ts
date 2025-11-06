import { createBaseSectionPrompt } from "./base-section-prompt";
import { SectionUpdateCriteria } from "@/lib/ai/types";

export const problemStatementUpdateCriteria: SectionUpdateCriteria = {
  shouldUpdateWhen:
    "message contains information about business problems, challenges, current state, desired outcomes, business impact, metrics, engagement rates, performance statistics, revenue data, growth projections, expected improvements, or specific legal or technical issues",
  relevantInfoGuide:
    "Extract information in plain text format about: current business situation, specific challenges/problems, desired future state, business impact, quantitative metrics (engagement rates, revenue figures, growth projections), legal context, and technology limitations. Pay special attention to percentages, dollar amounts, timelines, and exact numbers. Extract exact metric values maintaining precision (e.g., '50% per session' or '20% within 8 months').",
};

export const problemStatementPrompt = (
  history: {
    lastContent: string;
    lastRelevantInfo: string;
    chatSummary: string;
  },
  relevantInfo: string
) => {
  const customFormatting = `
   This section should be structured as:
   - Current State (clear description of the present situation)
   - Key Challenges (specific problems being addressed)
   - Desired Future State (clear description of target outcome)
   - Business Impact (quantifiable effects of the problem and solution)
   
   Format metrics as:
   • Current Performance: [specific measured value]
   • Expected Improvement: [specific target value]
   • Business Cost of Problem: $[amount]/[time period]
   • Expected ROI: [percentage or value]
   
   IMPORTANT: When specific metrics or performance data are provided, immediately update the corresponding fields.
   For example, if "Average user engagement rate is 50% per session" is provided, this exact information must be reflected
   in the Current Performance metric. Never generalize specific numbers - use the exact values provided.
  `;

  return createBaseSectionPrompt(
    "problem-statement",
    history,
    relevantInfo,
    customFormatting
  );
};
