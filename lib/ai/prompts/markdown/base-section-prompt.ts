import { PRD_SECTION_TEMPLATES } from "@/lib/ai/const";

/**
 * Creates a base prompt shared across all section generators
 * Ensures consistency in formatting and structure
 */
export const createBaseSectionPrompt = (
  sectionId: string,
  history: {
    lastContent: string;
    lastRelevantInfo: string;
    chatSummary: string;
  },
  relevantInfo: string,
  customFormatting: string = ""
) => {
  const template = PRD_SECTION_TEMPLATES[sectionId];

  if (!template) {
    throw new Error(`No template found for section: ${sectionId}`);
  }

  return `
Generate content for the ${template.title} section. Follow these rules strictly:
1. Start with exactly this heading: # ${template.title}
2. There should be no other headings in the response. Not even lower level headings.
3. Do not wrap your response in markdown code blocks - return plain markdown text

4. Consider previous content:
\`\`\`markdown
${history.lastContent}
\`\`\`

5. CRITICAL UPDATE RULES:
   - When a URL is provided, include it EXACTLY as written with proper markdown formatting
   - When user states "no [something]" (e.g., "no VTP"), update to show "[Something]: N/A" 
   - Never lose or omit previously included information unless explicitly replaced
   - Always preserve URLs exactly as provided (don't modify them)
   - If information exists in previous content and is not explicitly changed, preserve it
   - When a task is completed (marked with ✓), REMOVE it from Next Steps

6. ${template.overview}
   Include these details:
   ${template.expectedContent.map((item) => `- ${item}`).join("\n   ")}

7. Structure the # ${template.title} section in this format:
   [Section content with clear organization:
    - One main point per paragraph
    - Bullet points for lists
    - Metrics and numbers on separate lines]
    - ⭐ Provided Information Rating and 📈 Next Steps must be normal text without highlighting, being bold or being a subheading.
   
   ${customFormatting}
   
   ⭐ Provided Information Rating: [Score]/★★★★★
   [Brief explanation of section completeness and quality based on provided information. In addition, check for:
     ${template.ratingCriteria
       .map((item) => `- Check for ${item}`)
       .join("\n     ")}]
   
   📈 Next Steps:
   [For each missing item:
     - IMPORTANT: Mark with "✓" if requirement is NOW met based on new information
     - If not met, keep the existing next step in the same order
     - When a Next Step is marked complete, REMOVE it entirely from the list
     - Renumber remaining steps in sequence starting from 1
     - Never add back removed steps once they've been completed]

8. Use this rating scale:
    ★☆☆☆☆: Information missing or lacks basic details
    ★★☆☆☆: Basic information provided but missing specific details
    ★★★☆☆: Good detail level but missing some important elements
    ★★★★☆: Comprehensive with most details, needs minor additions
    ★★★★★: Exceptional detail meeting ALL requirements:
      - All Next Steps items have been completed and removed
      - OR there are no Next Steps items listed
    Note: Rating MUST increase when Next Steps are completed

9. Next steps should be specific and actionable:
     - Must be derived from missing rating requirements
     - Should request specific information (metrics, details, etc.)
     - Must be clear enough that satisfying it would be unambiguous
     - Should focus on the most important missing elements first

10. WHEN BLANK FIELDS EXIST: Use ONLY "[PENDING]" (not "[Pending Details]" or "[PENDING Email], or [PENDING Title],... or similar ") for consistency
11. REMOVAL OF COMPLETED ITEMS IS MANDATORY - do not keep completed items in the list
`;
};