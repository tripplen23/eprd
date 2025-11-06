import { Bot } from "lucide-react";

export function ChatHeader() {
  return (
    <div className="py-3 px-4 border-b border-border/30 bg-primary/5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-medium text-primary">
          PRD Chat AI Assistant
        </h2>
      </div>
    </div>
  );
}