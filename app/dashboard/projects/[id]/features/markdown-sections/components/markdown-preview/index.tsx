import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MarkdownComponents } from "./markdown-components";
import LoadingDots from "@/components/ui/loading-dots";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  isSection?: boolean;
  sectionId?: string;
  isFirst?: boolean;
  isProcessing?: boolean;
}

export function MarkdownPreview({
  content,
  className,
  isSection = false,
  sectionId,
  isFirst = false,
  isProcessing = false,
}: MarkdownPreviewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderedContent = useMemo(() => {
    let processedContent = content;
    const match = content.match(/```html([\s\S]*)```/);
    if (match) {
      processedContent = content.replace(
        /```html([\s\S]*)```/,
        `<iframe width="100%" height="600" src="data:text/html;charset=utf-8,${encodeURIComponent(
          match[1]
        )}"/>`
      );
    }

    const components = MarkdownComponents();

    return (
      <div
        className={cn(
          "prose prose-invert max-w-none transition-all duration-300",
          className,
          isProcessing && "markdown-content-processing"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeStringify]}
          components={components}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  }, [content, className, isProcessing]);

  if (!isMounted) {
    return <LoadingDots />;
  }

  if (isSection && sectionId) {
    return (
      <div
        id={sectionId}
        className={`mb-12 ${isFirst ? "mt-0" : ""} ${
          isProcessing ? "section-processing" : ""
        }`}
      >
        {renderedContent}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent my-8" />
      </div>
    );
  }

  return renderedContent;
}
