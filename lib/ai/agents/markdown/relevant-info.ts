import { SectionHistory } from "@/lib/ai/types";

/**
 * Detects if the content contains project overview information
 */
export const containsOverviewInfo = (content: string): boolean => {
  return (
    /\b(deliver|contact|stakeholder|department|team lead|analytics|business|project name|project reference|goal|objectives)\b/i.test(
      content
    ) || /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i.test(content)
  );
};

/**
 * Detects if the content contains metrics or performance data
 */
export const containsMetrics = (content: string): boolean => {
  return (
    /\b\d+(\.\d+)?%\b/.test(content) ||
    /\b(average|current|expected|increase|revenue|engagement|session)\b.*\b\d+\b/i.test(
      content
    )
  );
};

/**
 * Detects if the content contains UI components (HTML, CSS, JS)
 */
export const containsUIComponents = (content: string): boolean => {
  return (
    /<[^>]+>/.test(content) || // HTML tags
    /\{[^}]*\}/.test(content) || // CSS blocks
    /function\s+\w+\s*\([^)]*\)/.test(content) // JS functions
  );
};

/**
 * Detects if the content contains business process information
 */
export const containsProcessInfo = (content: string): boolean => {
  return (
    /\b(workflow|process flow|flowchart|decision point|process step)\b/i.test(
      content
    ) || /\b(mermaid|diagram|flow)\b/i.test(content)
  );
};

/**
 * Detects if the content contains data model information
 */
export const containsDataModelInfo = (content: string): boolean => {
  return (
    /\b(entity|attribute|relationship|schema|database|table|column|key|ERD|mapping)\b/i.test(
      content
    ) ||
    /\b(source system|target system|data flow|transformation)\b/i.test(content)
  );
};

/**
 * Extracts completed items from the Next Steps section for the given section
 * !Note: the current "✓" is still not stored stably, sometime it's checked, and after being asked another question, it's unchecked. This cause information leakage.
 */
export const extractCompletedItems = (content: string): string[] => {
  const nextStepsRegex = /📈 Next Steps:([\s\S]+?)(?=💎|$)/;
  const nextStepsMatch = content.match(nextStepsRegex);

  if (!nextStepsMatch) return [];

  return (nextStepsMatch[1].match(/.*✓.*/g) || []).map((item) => item.trim());
};

/**
 * Counts pending placeholders in content - to check which placeholders need to be updated inside the section
 */
export const countPendingPlaceholders = (content: string): number => {
  return (content.match(/\[PENDING\]/g) || []).length;
};

/**
 * Enhances the relevant info with section-specific instructions
 */
export const enhanceRelevantInfo = (
  section: string,
  relevantInfo: string,
  history: SectionHistory
): string => {
  let enhancedInfo = relevantInfo;

  // Add section-specific emphasis based on content
  if (section === "project-overview" && containsOverviewInfo(relevantInfo)) {
    enhancedInfo +=
      "\n\nCRITICAL: This message contains project overview information that MUST be used to update any [PENDING] placeholders. Preserve exact names, titles, and contact details as provided. Format exactly according to the template provided.";
  }

  if (section === "problem-statement" && containsMetrics(relevantInfo)) {
    enhancedInfo +=
      "\n\nCRITICAL: This message contains specific metrics that MUST be precisely reflected in the metrics section. Use the exact numbers, percentages and timeframes as provided. Format exactly according to the metrics template.";
  }

  if (section === "prototype" && containsUIComponents(relevantInfo)) {
    enhancedInfo +=
      "\n\nCRITICAL: This message contains UI component code that MUST be integrated into the prototype. Preserve exact HTML structure, CSS styles, and JavaScript functionality. Ensure all components follow accessibility guidelines and dark theme compatibility.";
  }

  if (section === "business-process" && containsProcessInfo(relevantInfo)) {
    enhancedInfo +=
      "\n\nCRITICAL: This message contains business process information that MUST be reflected in the Mermaid diagrams. Update or create diagrams that accurately represent the workflows, decision points, and process steps described. Ensure diagram syntax is valid and matches the written descriptions. If multiple processes are described, create separate diagrams for each process.";
  }

  if (section === "data-model" && containsDataModelInfo(relevantInfo)) {
    enhancedInfo +=
      "\n\nCRITICAL: This message contains data model information that MUST be reflected in the ERD diagrams. Update or create diagrams that accurately represent the entities, attributes, and relationships described. Ensure diagram syntax is valid and matches the written description. If source-to-target mappings are described, include appropriate mapping diagrams and tables.";
  }

  // Add instructions for completed items if they exist (Will add more for the other sections)
  if (history.lastContent) {
    const completedItems = extractCompletedItems(history.lastContent);

    if (completedItems.length > 0) {
      enhancedInfo += `\n\nIMPORTANT: Remove these completed items from Next Steps and their corresponding Examples:\n${completedItems.join(
        "\n"
      )}`;
    }

    // Add instructions for pending placeholders if needed
    if (section === "project-overview") {
      const pendingCount = countPendingPlaceholders(history.lastContent);
      if (pendingCount > 0 && containsOverviewInfo(relevantInfo)) {
        enhancedInfo +=
          "\n\nHIGH PRIORITY: There are [PENDING] placeholders in the project overview information that should be replaced with the specific details provided in this message.";
      }
    }
  }

  return enhancedInfo;
};

/**
 * Update placeholder fields in the sections
 */
export const updatePlaceholdersInContent = (
  content: string,
  relevantInfo: string
): string => {
  let updatedContent = content;

  // Project Overview
  if (relevantInfo.match(/project name/i)) {
    const nameMatch = relevantInfo.match(/project name:?\s*([^\n.]+)/i);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      updatedContent = updatedContent.replace(/Project Name: PENDING/, `Project Name: ${name}`);
    }
  }
  // Try to update Delivery information
  if (relevantInfo.match(/delivery:.*?\(.*?\)/i)) {
    const deliveryMatch = relevantInfo.match(
      /delivery:\s*([^(]+)\s*\(([^)]+)\)/i
    );
    if (deliveryMatch) {
      const name = deliveryMatch[1].trim();
      const title = deliveryMatch[2].trim();
      updatedContent = updatedContent.replace(
        /• Delivery:\s*\[PENDING\]/,
        `• Delivery: ${name} (${title})`
      );
    }
  }
  // Try to update Contact information
  if (relevantInfo.match(/contact:.*?@/i)) {
    const emailMatch = relevantInfo.match(
      /contact:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
    );
    if (emailMatch) {
      const email = emailMatch[1].trim();
      updatedContent = updatedContent.replace(
        /Contact:\s*\[PENDING\]/,
        `Contact: ${email}`
      );
    }
  }
  // Try to update Department information
  if (relevantInfo.match(/department/i)) {
    const deptMatch =
      relevantInfo.match(/department:?\s*([^\n.]+)/i) ||
      relevantInfo.match(/([^\n.]+)\s*department/i);
    if (deptMatch) {
      const dept = deptMatch[1].trim();
      updatedContent = updatedContent.replace(
        /\[Department\/Organization: PENDING\]/,
        `${dept}`
      );
    }
  }

  // Problem Statement (Add more)
  if (relevantInfo.match(/metrics/i)) {
    const metricsMatch = relevantInfo.match(/metrics:?\s*([^\n.]+)/i);
    if (metricsMatch) {
      const metrics = metricsMatch[1].trim();
      updatedContent = updatedContent.replace(/Metrics: PENDING/, `Metrics: ${metrics}`);
    }
  }

  // Add scope, user stories, use cases, etc later

  // Prototype (Add more) -> Should move to another agent
  if (relevantInfo.match(/ui components/i)) {
    const componentsMatch = relevantInfo.match(/ui components:?\s*([^\n.]+)/i);
    if (componentsMatch) {
      const components = componentsMatch[1].trim();
      updatedContent = updatedContent.replace(/UI Components: PENDING/, `UI Components: ${components}`);
    }
  }

  // Business Process (Add more) -> Should move to another agent
  if (relevantInfo.match(/business process/i)) {
    const processMatch = relevantInfo.match(/business process:?\s*([^\n.]+)/i);
    if (processMatch) {
      const process = processMatch[1].trim();
      updatedContent = updatedContent.replace(/Business Process: PENDING/, `Business Process: ${process}`);
    }
  }

  // Data Model (Add more) -> Should move to another agent
  if (relevantInfo.match(/data model/i)) {
    const modelMatch = relevantInfo.match(/data model:?\s*([^\n.]+)/i);
    if (modelMatch) {
      const model = modelMatch[1].trim();
      updatedContent = updatedContent.replace(/Data Model: PENDING/, `Data Model: ${model}`);
    }
  }


  return updatedContent;
};

/**
 * Verifies that completed items have been properly removed from the Next Steps
 */
export const verifyCompletedItemsRemoval = (
  oldContent: string,
  newContent: string
): string[] => {
  const nextStepsRegex = /📈 Next Steps:([\s\S]+?)(?=💎|$)/;
  const oldNextStepsMatch = oldContent.match(nextStepsRegex);
  const newNextStepsMatch = newContent.match(nextStepsRegex);
  
  if (!oldNextStepsMatch || !newNextStepsMatch) return [];
  
  const oldCompletedItems = (oldNextStepsMatch[1].match(/.*✓.*/g) || []).map(
    (item) => item.trim()
  );

  // Check if old completed items still exist in new content
  return oldCompletedItems.filter((item) => newNextStepsMatch[1].includes(item));
};