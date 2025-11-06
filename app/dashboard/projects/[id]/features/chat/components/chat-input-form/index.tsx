import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "./chat-input";
import {
  SendHorizontalIcon,
  ImageIcon,
  FileIcon,
  XIcon,
  StopCircleIcon,
} from "lucide-react";
import { fileToBase64 } from "@/lib/utils/file-to-base64";
import { FileWithBase64 } from "@/app/dashboard/projects/[id]/features/chat/types";

interface ChatInputFormProps {
  onSendMessage: (message: string, files?: FileWithBase64[]) => void;
  onCancelStream: () => void;
  isStreaming: boolean;
  isThinking: boolean;
}

export function ChatInputForm({
  onSendMessage,
  onCancelStream,
  isStreaming,
  isThinking,
}: ChatInputFormProps) {
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileWithBase64[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput || selectedFiles.length > 0) {
      onSendMessage(trimmedInput, selectedFiles);
      setInput("");
      setSelectedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmedInput = input.trim();
      if (trimmedInput || selectedFiles.length > 0) {
        onSendMessage(trimmedInput, selectedFiles);
        setInput("");
        setSelectedFiles([]);
      }
    }
  };

  const handleFileSelect = async (files: FileList) => {
    const processedFiles: FileWithBase64[] = [];

    for (const file of Array.from(files)) {
      try {
        const base64 = await fileToBase64(file);
        processedFiles.push({ file, base64 });
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error);
      }
    }

    setSelectedFiles((prev) => [...prev, ...processedFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border/30 bg-card/50 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-2 p-4">
        {selectedFiles.length > 0 && (
          <div className="flex gap-2 flex-wrap p-2 bg-background/30 rounded-lg border border-border/30 mb-1">
            {selectedFiles.map((fileData, index) => (
              <div
                key={index}
                className="bg-primary/10 pl-3 pr-2 py-1 rounded-full text-xs font-medium border border-primary/20 flex items-center gap-2 group hover:bg-primary/20 transition-colors"
              >
                {fileData.file.type.startsWith("image/") ? (
                  <ImageIcon className="h-3 w-3 text-primary/70" />
                ) : (
                  <FileIcon className="h-3 w-3 text-primary/70" />
                )}
                <span className="truncate max-w-[120px]">
                  {fileData.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="rounded-full p-1 hover:bg-primary/30 text-primary/50 hover:text-primary transition-colors"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {(isStreaming || isThinking) && (
          <Button
            type="button"
            onClick={onCancelStream}
            size="sm"
            variant="outline"
            className="mr-auto mb-2 text-xs flex items-center gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <StopCircleIcon className="h-3.5 w-3.5" />
            <span>Cancel Generation</span>
          </Button>
        )}

        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 relative">
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message or drop files..."
              className="bg-background/50 text-foreground focus-within:shadow-glow transition-shadow duration-300"
              onFileSelect={handleFileSelect}
              disabled={isStreaming || isThinking}
            />
            {input.trim() === "" && selectedFiles.length === 0 && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                Enter
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="shrink-0 h-[50px] bg-primary hover:bg-primary/90 shadow-glow transition-all duration-300 hover:shadow-glow-intense"
            disabled={
              (input.trim() === "" && selectedFiles.length === 0) ||
              isStreaming ||
              isThinking
            }
          >
            <SendHorizontalIcon className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </form>
  );
}
