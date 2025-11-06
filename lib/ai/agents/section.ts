import { Message } from "@/lib/ai/types";
import { PRD_SECTION_ORDER } from "@/lib/ai/const";

export type SectionAgentResponse = {
  sectionsToUpdate: Record<
    string,
    {
      shouldUpdate: boolean;
      relevantInfo: string;
    }
  >;
};

export const getSectionsToUpdate = async (
  messages: Message[]
): Promise<SectionAgentResponse> => {
  // Get the last message
  const lastMessage = messages[messages.length - 1];
  const messageContent =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

  // Create a response with all sections set to update
  const response: SectionAgentResponse = {
    sectionsToUpdate: PRD_SECTION_ORDER.reduce((acc, sectionId) => {
      acc[sectionId] = {
        shouldUpdate: true,
        relevantInfo: messageContent,
      };
      return acc;
    }, {} as Record<string, { shouldUpdate: boolean; relevantInfo: string }>),
  };

  return response;
};
