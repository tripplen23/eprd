import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Paperclip } from "lucide-react";

interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onFileSelect?: (files: FileList) => void;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, onFileSelect, ...props }, ref) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && onFileSelect) {
        onFileSelect(e.target.files);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && onFileSelect) {
        onFileSelect(files);
      }
    };

    const adjustHeight = (target: HTMLTextAreaElement) => {
      target.style.height = "auto";
      target.style.height = `${target.scrollHeight}px`;
    };

    React.useEffect(() => {
      // Reset height when value is empty
      if (!props.value && textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }, [props.value]);

    return (
      <div
        className={cn(
          "relative rounded-md",
          isDragging && "ring-2 ring-primary"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          ref={(element) => {
            // Handle both refs
            textareaRef.current = element;
            if (typeof ref === 'function') {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            adjustHeight(target);
          }}
          autoComplete="off"
          name="message"
          className={cn(
            "max-h-72 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-auto resize-y bg-card caret-secondary text-primary-foreground pr-12",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-full"
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 rounded-md flex items-center justify-center pointer-events-none">
            <span className="text-sm text-primary-foreground">
              Drop files here
            </span>
          </div>
        )}
      </div>
    );
  }
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
