import { PRD_SECTION_ORDER } from "@/lib/ai/const";
import { store } from "@/lib/store/store";

/**
 * Generates a complete document context from the current Redux state
 * @returns A formatted string containing the complete document from Redux state
 */
export const generateFullDocumentContextFromStore = (): string => {
  // Get current sections from Redux store
  const currentSections = store.getState().markdown.sections;

  // Create a map for quick lookup
  const sectionContentMap = currentSections.reduce((acc, section) => {
    acc[section.id] = section.content;
    return acc;
  }, {} as Record<string, string>);

  // Create an array to hold each section's content in the correct order
  const sections: string[] = [];

  // Add each section in the defined order using the content from the store
  PRD_SECTION_ORDER.forEach((sectionId) => {
    if (sectionContentMap[sectionId]) {
      sections.push(sectionContentMap[sectionId]);
    }
  });

  // Join all sections with double line breaks for clear separation
  return sections.join("\n\n");
};

/**
 * Removes `html` and `mermaid` code blocks from a given text
 * @param text - The text to clean
 * @returns The cleaned text with `html` and `mermaid` code blocks removed
 */
export const removeHtmlAndMermaidCodeBlocks = (text: string): string => {
  return text
    .replace(/```html[\s\S]*?```/g, "")
    .replace(/```mermaid[\s\S]*?```/g, "");
};

/**
 * Get optimal document context from the current Redux store state
 * @returns A formatted string containing the complete document without `html` and `mermaid` code blocks
 */
export const getOptimalDocumentContext = (): string => {
  // Call the new function that reads from the store
  const fullDocument = generateFullDocumentContextFromStore();
  const cleanedDocument = removeHtmlAndMermaidCodeBlocks(fullDocument);
  return cleanedDocument;
};