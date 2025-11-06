import { PRD_SECTION_TITLES } from "@/lib/ai/const";

// Helper to detect transition requests in messages
export const detectSectionTransition = (
  message: string | Array<{ type: string; [key: string]: any }>
): string | null => {
  // If message is not a string, convert it to a string representation
  const messageText =
    typeof message === "string" ? message : JSON.stringify(message);

  const transitionPhrases = [
    {
      section: "project-overview",
      phrases: [
        "start with project overview",
        "begin with overview",
        "let's talk about project overview",
      ],
    },
    {
      section: "problem-statement",
      phrases: [
        "move to problem statement",
        "let's discuss the problem",
        "tell me about the problem statement",
      ],
    },
    {
      section: "scope",
      phrases: [
        "let's talk about scope",
        "define the scope",
        "move to scope section",
        "what's in scope",
      ],
    },
    {
      section: "user-stories",
      phrases: [
        "let's discuss user stories",
        "talk about user stories",
        "what are the user stories",
      ],
    },
    {
      section: "use-cases",
      phrases: [
        "move to use cases",
        "what are the use cases",
        "let's talk about use cases",
      ],
    },
    {
      section: "business-process",
      phrases: [
        "let's discuss business processes",
        "talk about the workflows",
        "show me the process flows",
        "create flowcharts",
        "describe the business processes",
      ],
    },
    {
      section: "prototype",
      phrases: [
        "let's see the prototype",
        "show me the prototype",
        "move to prototype",
        "discuss the interface",
        "talk about the design",
      ],
    },
    {
      section: "data-model",
      phrases: [
        "let's discuss data model",
        "talk about the entities",
        "show me the ERD",
        "create a data model",
        "describe the database schema",
        "map the data sources",
      ],
    },
    // Additional sections can be added here
  ];

  for (const { section, phrases } of transitionPhrases) {
    if (phrases.some((phrase) => messageText.toLowerCase().includes(phrase))) {
      return section;
    }
  }

  // Check for generic transitions
  if (
    /\b(next section|move on|proceed|continue|go ahead)\b/i.test(messageText)
  ) {
    return "next"; // Special value indicating to move to the next logical section
  }

  return null;
};

// Helper function to get a human-readable section title
export const getSectionTitle = (sectionId: string): string => {
  return (
    PRD_SECTION_TITLES[sectionId as keyof typeof PRD_SECTION_TITLES] ||
    sectionId
  );
};
