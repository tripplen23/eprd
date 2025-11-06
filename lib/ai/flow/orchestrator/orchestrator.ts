import { Message } from "@/lib/ai/types";
import { routeRequest } from "@/lib/ai/agents/router";
import { getSectionsToUpdate } from "@/lib/ai/agents/section";
import { getConversationResponse } from "@/lib/ai/agents/conversation/conversation";
import { getMarkdownResponseForSection } from "@/lib/ai/agents/markdown/markdown";
import { getSummary } from "@/lib/ai/agents/summary";
import { getOptimalDocumentContext } from "@/lib/ai/flow/orchestrator/document-context";
import { sectionHistories, PRD_SECTION_ORDER } from "@/lib/ai/const";
import { OrchestratorResponse } from "@/lib/ai/types";
import { detectSectionTransition, getSectionTitle } from "./helpers";
import { StreamCallbacks } from "@/lib/config/openai-client";
import { showSectionDiffs } from "@/app/dashboard/projects/[id]/features/diff/utils";

let conversationChatSummary = "";

// New type for streaming options
type StreamingOptions = {
  conversationCallbacks?: StreamCallbacks;
  sectionCallbacks?: Record<string, StreamCallbacks>;
  abortSignal?: AbortSignal;
  loggingCallback?: (logEntry: string) => void;
};

/**
 * Main function to process user requests through the agent architecture with streaming support
 * @param messages - User messages to process
 * @param streamingOptions - Optional streaming callbacks for real-time updates
 * @returns Response with user-facing message and any section updates
 */
export const processUserRequest = async (
  messages: Message[],
  streamingOptions?: StreamingOptions
): Promise<OrchestratorResponse> => {
  console.group("Orchestrator: processUserRequest");

  const messagesList = messages.map((message) => message.content);

  console.log("Messages:", messagesList);

  // Start
  const startTime = performance.now();
  let stepStartTime = startTime;

  // Helper to emit logs both to console and UI
  const emitLog = (message: string) => {
    console.log(message);
    if (streamingOptions?.loggingCallback) {
      streamingOptions.loggingCallback(message);
    }
  };

  try {
    // Step 1: Use Router to determine if PRD related
    emitLog("🧭 Step 1: Routing message...");
    stepStartTime = performance.now();
    const { is_prd_section_related } = await routeRequest(messages);
    emitLog(`📝 Is PRD related: ${is_prd_section_related}`);

    // Generate document context *before* branching, now reading from Redux store via the updated function
    emitLog("📄 Generating document context...");
    stepStartTime = performance.now();
    const documentContext = getOptimalDocumentContext();
    emitLog("📄 Document context generated");

    if (is_prd_section_related) {
      // Step 2: Use Section Agent to identify sections to update -> Currently set all sections updated later!
      emitLog("🔍 Step 2: Identifying sections to update...");
      stepStartTime = performance.now();
      const { sectionsToUpdate } = await getSectionsToUpdate(messages);
      const sectionsToUpdateList = Object.keys(sectionsToUpdate).filter(
        (key) => sectionsToUpdate[key].shouldUpdate
      );
      emitLog(`📝 Sections to update: ${JSON.stringify(sectionsToUpdateList)}`);

      // Step 3: Update identified sections with streaming support
      emitLog("✏️ Step 3: Updating sections...");
      stepStartTime = performance.now();
      const sectionUpdatesPromises = Object.entries(sectionsToUpdate)
        .filter(([_, info]) => info.shouldUpdate)
        .map(async ([sectionId, info]) => {
          emitLog(`Starting update for section: ${sectionId}`);

          // Enhanced relevantInfo with additional context
          let enhancedRelevantInfo = info.relevantInfo;

          const newSummary = await getSummary(
            "system",
            enhancedRelevantInfo,
            sectionHistories[sectionId].chatSummary
          );
          emitLog(`Summary for ${sectionId}`);

          const content = await getMarkdownResponseForSection(
            sectionId,
            enhancedRelevantInfo,
            {
              ...sectionHistories[sectionId],
              chatSummary: newSummary,
            }
          );

          emitLog(`Markdown for ${sectionId}`);

          emitLog(`Completed update for section ${sectionId}`);

          return {
            sectionId,
            content,
            relevantInfo: enhancedRelevantInfo,
            chatSummary: newSummary,
          };
        });

      const sectionUpdates = await Promise.all(sectionUpdatesPromises);
      emitLog(`📝 All section updates completed `);

      // Show diffs instead of immediately updating sections
      const hasDiffs = showSectionDiffs(
        sectionUpdates.map((update) => ({
          sectionId: update.sectionId,
          content: update.content,
        }))
      );

      // Only update section histories if changes were immediately applied (no diffs)
      if (!hasDiffs) {
        // Step 4: Update section histories
        emitLog("💾 Step 4: Updating section histories...");
        stepStartTime = performance.now();
        sectionUpdates.forEach((update) => {
          sectionHistories[update.sectionId] = {
            lastContent: update.content,
            lastRelevantInfo: update.relevantInfo,
            chatSummary: update.chatSummary,
          };
        });
        emitLog("📝 Section histories updated");
      }

      // Helper function to extract incomplete next steps items
      const extractNextStepsItems = (nextStepsText: string): string[] => {
        // Find items that don't have a checkmark
        const incompleteItems = nextStepsText
          .split("\n")
          .filter(
            (line) =>
              line.trim() && !line.includes("✓") && !line.includes("Next Steps")
          )
          .map((line) => line.replace(/^[\s•-]*/, "").trim());

        return incompleteItems;
      };

      // Step 5: Generate Update Summary (using sectionUpdates)
      emitLog("📄 Step 5: Generating update summary...");
      stepStartTime = performance.now();
      // Create more specific update summary with section status for the conversation agent
      const updateSummary =
        sectionUpdates.length > 0
          ? `Sections updated:
          ${sectionUpdates
            .map((update) => {
              // For each section, get specific about what information was added
              // const infoSummary = summarizeRelevantInfo(update.relevantInfo);
              const infoSummary = update.relevantInfo;

              // Pull rating from updated content if available
              const ratingMatch = update.content.match(
                /⭐ Provided Information Rating: ([★☆]+)/
              );
              const rating = ratingMatch ? ratingMatch[1] : "N/A";

              // Extract next steps if available
              const nextStepsMatch = update.content.match(
                /📈 Next Steps:[\s\S]+?(?=💎|$)/
              );
              const nextSteps = nextStepsMatch
                ? extractNextStepsItems(nextStepsMatch[0])
                : [];

              return `- ${getSectionTitle(
                update.sectionId
              )}: Added info about "${infoSummary}"
              Current Rating: ${rating}
              Top Missing Items: ${nextSteps.slice(0, 2).join(", ")}`;
            })
            .join("\n\n")}`
          : "I analyzed your message but didn't find specific PRD content to update.";

      const fullUpdateSummary = updateSummary;

      // Function to extract rating from section content
      function getSectionRating(content: string): string {
        const ratingMatch = content.match(
          /⭐ Provided Information Rating: ([★☆]+)/
        );
        return ratingMatch ? ratingMatch[1] : "★☆☆☆☆";
      }

      // Step 6: Get response from Conversation Agent with streaming if available
      emitLog("🗣️ Step 6: Getting conversation response...");
      stepStartTime = performance.now();

      const conversationStreamOptions = streamingOptions?.conversationCallbacks
        ? {
            callbacks: streamingOptions.conversationCallbacks,
            abortSignal: streamingOptions.abortSignal,
          }
        : undefined;

      const { response, updatedChatSummary } = await getConversationResponse(
        messages,
        documentContext,
        conversationChatSummary,
        fullUpdateSummary,
        conversationStreamOptions
      );

      // Update the global conversation summary
      conversationChatSummary = updatedChatSummary;

      const lastMessageContent =
        typeof messages[messages.length - 1].content === "string"
          ? messages[messages.length - 1].content
          : JSON.stringify(messages[messages.length - 1].content);

      let transitionSection: string | null = null;

      // Check for transition requests
      const transitionRequest = detectSectionTransition(lastMessageContent);

      if (transitionRequest) {
        emitLog(`Detected transition request to: ${transitionRequest}`);

        if (transitionRequest === "next") {
          // Find the current section focus based on document completeness
          const sectionCompleteness = PRD_SECTION_ORDER.map((sectionId) => {
            const rating = getSectionRating(
              sectionHistories[sectionId]?.lastContent || ""
            );
            return { sectionId, rating };
          });

          // Sort by ascending completeness and order in the PRD
          sectionCompleteness.sort((a, b) => {
            // If ratings differ, prioritize less complete sections
            if (a.rating !== b.rating) {
              return a.rating.length - b.rating.length;
            }
            // Otherwise, follow the PRD order
            return (
              PRD_SECTION_ORDER.indexOf(a.sectionId) -
              PRD_SECTION_ORDER.indexOf(b.sectionId)
            );
          });

          // Select the least complete section
          const nextSectionId = sectionCompleteness[0].sectionId;
          emitLog(`Selected next section: ${nextSectionId}`);

          // Force an update flag for this section
          transitionSection = nextSectionId;
        } else {
          // Direct transition to a specific section
          transitionSection = transitionRequest;
        }
      }

      return {
        response,
        sectionUpdates,
      };
    } else {
      // If not PRD related, just get a regular conversation response with streaming if available
      emitLog("💬 Not PRD related, getting simple conversation response...");
      stepStartTime = performance.now();

      const conversationStreamOptions = streamingOptions?.conversationCallbacks
        ? {
            callbacks: streamingOptions.conversationCallbacks,
            abortSignal: streamingOptions.abortSignal,
          }
        : undefined;

      const { response, updatedChatSummary } = await getConversationResponse(
        messages,
        documentContext,
        conversationChatSummary,
        "",
        conversationStreamOptions
      );

      // Update global summary even for non-PRD messages
      conversationChatSummary = updatedChatSummary;

      return {
        response,
        sectionUpdates: [],
      };
    }
  } catch (error) {
    console.error("Orchestrator Error:", error);
    if (streamingOptions?.loggingCallback) {
      streamingOptions.loggingCallback(`❌ Error: ${error}`);
    }
    const totalTime = performance.now() - startTime;
    emitLog(`🕒 Total processing time (with error): ${totalTime.toFixed(2)}ms`);

    return {
      response:
        "I'm sorry, I encountered an error processing your request. Please try again.",
      sectionUpdates: [],
    };
  } finally {
    console.groupEnd();
  }
};
