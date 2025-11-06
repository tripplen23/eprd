import { SectionHistories } from "@/lib/ai/types";

export const sectionHistories: SectionHistories = {
  "project-overview": {
    lastContent:
      "# Project Overview\nUnderstanding the project goals and features.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
  "problem-statement": {
    lastContent:
      "# Problem Statement\nDefining the business problem and desired outcomes.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
  scope: {
    lastContent:
      "# Scope of the Project\nDefining what is included and excluded from the project.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
  "user-stories": {
    lastContent:
      "# User Stories\nOutlining the user stories that capture required functionality.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
  "use-cases": {
    lastContent:
      "# Use Cases\nDetailed scenarios showing how users interact with the system.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
  requirements: {
    lastContent:
      "# Requirements\nSpecific functional and non-functional requirements for the system.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
  "future-considerations": {
    lastContent:
      "# Future Considerations\nPotential enhancements and future directions for the project.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
  "business-process": {
    lastContent:
      "# Business Processes\nWorkflows and process diagrams showing system interactions and data flows.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
  "data-model": {
    lastContent:
      "# Data Model\nEntity relationship diagrams and data mappings between source and target systems.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
  prototype: {
    lastContent:
      "# Prototype\nInteractive prototype demonstrating key user interfaces and interactions.",
    lastRelevantInfo: "",
    chatSummary: "",
  },
};

export const PRD_SECTION_ORDER = [
  "project-overview",
  "problem-statement",
  "scope",
  "user-stories",
  "use-cases",
  "business-process",
  "data-model",
  "prototype",
] as const;

export const PRD_SECTION_TITLES = {
  "project-overview": "Project Overview",
  "problem-statement": "Problem Statement",
  scope: "Scope of the Project",
  "user-stories": "User Stories",
  "use-cases": "Use Cases",
  "business-process": "Business Processes",
  "data-model": "Data Model",
  prototype: "Prototype",
} as const;

// Standard format for section content to ensure consistency
export interface SectionTemplate {
  title: string;
  overview: string;
  expectedContent: string[];
  ratingCriteria: string[];
}

// Document section templates for consistent structure
export const PRD_SECTION_TEMPLATES: Record<string, SectionTemplate> = {
  "project-overview": {
    title: "Project Overview",
    overview:
      "Provides a high-level description of the project, stakeholders, and objectives.",
    expectedContent: ["Project Name", "Stakeholders", "Goals", "References"],
    ratingCriteria: [
      "Contact details",
      "Measurable objectives",
      "Timeline",
      "Budget",
    ],
  },
  "problem-statement": {
    title: "Problem Statement",
    overview:
      "Describes the business problem being solved and expected outcomes.",
    expectedContent: [
      "Current State",
      "Challenges",
      "Desired State",
      "Business Impact",
    ],
    ratingCriteria: [
      "Quantifiable metrics",
      "Clear impact",
      "Timeline dependencies",
    ],
  },
  scope: {
    title: "Scope of the Project",
    overview: "Defines what is included and excluded from the project.",
    expectedContent: ["In-Scope", "Out-of-Scope", "Constraints", "Assumptions"],
    ratingCriteria: [
      "Clear boundaries",
      "Specific inclusions/exclusions",
      "Constraints",
    ],
  },
  "user-stories": {
    title: "User Stories",
    overview: "Outlines the user stories that capture required functionality.",
    expectedContent: ["Actor", "Action", "Benefit", "Acceptance Criteria"],
    ratingCriteria: ["User role clarity", "Specific actions", "Clear benefits"],
  },
  "use-cases": {
    title: "Use Cases",
    overview: "Detailed scenarios showing how users interact with the system.",
    expectedContent: ["Actor", "Preconditions", "Flow", "Postconditions"],
    ratingCriteria: ["Complete flows", "Error cases", "Alternate paths"],
  },
  "business-process": {
    title: "Business Processes",
    overview: "Documents the business processes, workflows, and organizational activities involved in the system.",
    expectedContent: [
      "Process Diagrams",
      "Process Descriptions",
      "Integration Points",
      "Process Metrics"
    ],
    ratingCriteria: [      
      "Process clarity",
      "Decision points",
      "Exception handling",
      "Process ownership",
    ]
  },
  prototype: {
    title: "Prototype",
    overview:
      "Interactive prototype demonstrating key user interfaces and interactions.",
    expectedContent: [
      "HTML Structure",
      "CSS Styling",
      "Interactive Features",
      "Design Analysis",
    ],
    ratingCriteria: [
      "Semantic HTML",
      "Accessibility",
      "Dark Theme",
      "Responsive Design",
    ],
  },
};