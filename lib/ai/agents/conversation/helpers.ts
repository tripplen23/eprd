import { Message } from "@/lib/ai/types";

// Helper function to format messages for the prompt
export const formatMessagesForPrompt = (messages: Message[]): string => {
  if (!messages || messages.length === 0) {
    return "No recent messages.";
  }
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "### **user**" : "### **assistant**";
      const content =
        typeof msg.content === "string"
          ? msg.content
          : Array.isArray(msg.content)
          ? msg.content
              .map((item) =>
                item.type === "text" ? item.text : `[${item.type}]`
              )
              .join(" ")
          : "[complex content]";
      const truncatedContent =
        content.length > 2500 ? content.substring(0, 2500) + "..." : content;
      return `${role}: ${truncatedContent}`;
    })
    .join("\n");
};