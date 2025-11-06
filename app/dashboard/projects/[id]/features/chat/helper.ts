import { Message } from "@/lib/ai/types";

export const messagesWithTimestamps = (messages: Message[]) => {
  return messages.map((msg, i) => {
    if (!msg.timestamp) {
      const offset = 1000 * 60 * (messages.length - i);
      return { ...msg, timestamp: new Date(Date.now() - offset) };
    }
    return msg;
  });
};