import { SectionUpdateCriteria } from "@/lib/ai/types";

export const dataModelUpdateCriteria: SectionUpdateCriteria = {
  shouldUpdateWhen: "message contains information about data models, entities, attributes, relationships, database schema, data mapping, source systems, target systems, data assets, dashboards, reports, analytics, or ERD diagrams",
  relevantInfoGuide: "Pass the complete message content without modification or filtering"
};

export const dataModelPrompt = (history: { lastContent: string, lastRelevantInfo: string, chatSummary: string }, relevantInfo: string) => `
Generate content for the Data Model section. Follow these rules strictly:
1. Start with exactly this heading: # Data Model
2. Format the response with a data model diagram and appropriate descriptions

3. Consider previous content:
\`\`\`markdown
${history.lastContent}
\`\`\`

4. Create an ERD diagram with mermaid using this information: "${relevantInfo}"

5. For dashboard requirements:
   - Use a star schema with dimension tables connected to a central fact table
   - Ensure all relationships are properly shown in the diagram

6. When a source system is specified, analyze and describe source-to-target data mapping:
   - Use general knowledge about the specific system (e.g. S4/HANA, Salesforce)
   - For example, for S4/HANA, the technical table for Material Group is MARA-MATKL, should be mapped to Product Line-name.
   - If no knowledge is found, then simply acknowledge. Do not invent new name.

7. Don't wrap the entire response in a code block - only the mermaid diagram should be in a code block
`
