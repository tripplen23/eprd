import { SectionUpdateCriteria } from "@/lib/ai/types";
import { createBaseSectionPrompt } from "./base-section-prompt";

export const projectOverviewUpdateCriteria: SectionUpdateCriteria = {
  shouldUpdateWhen:
    "message contains information about project details, stakeholders, goals, business context, delivery contacts, departments, team leads, or any contact information",
  relevantInfoGuide:
    "Extract information in plain text format about: project name, sponsor, stakeholders, reference numbers, goals, business context, delivery contacts (with names, titles, departments), email addresses, and team roles. Pay special attention to contact information formatted as 'Name (Title)' and email addresses. Do not include any markdown formatting in the extracted information.",
};

export const projectOverviewPrompt = (
  history: {
    lastContent: string;
    lastRelevantInfo: string;
    chatSummary: string;
  },
  relevantInfo: string
) => {
  const customFormatting = `
   This section should be structured as:
   - High-level Project Summary (key points from other subsections)
   - Project Name
   - Stakeholders
   - Project Reference (VTP Number and Link)
   - Goals and Objectives
   
   Format stakeholder information as:
   Name: [Name]
   Role: [Title/Role]
   Department: [Department]
   Organization: [Organization]
   Contact: [email/phone]
     
   IMPORTANT: When contact information is provided, immediately update the corresponding fields.
   For example, if "Delivery: John Smith (Analytics Team Lead)" is provided, replace any [PENDING]
   placeholder with this exact information. similar to project name, stakeholders, reference numbers, goals, business context, delivery contacts (with names, titles, departments, organizations), email addresses, phone numbers, and team roles.
  `;

  return createBaseSectionPrompt(
    "project-overview",
    history,
    relevantInfo,
    customFormatting
  );
};
