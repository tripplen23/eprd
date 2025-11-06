import { MermaidDiagram } from "./mermaid-diagram";
import { cn } from "@/lib/utils";

export function MarkdownComponents() {
  return {
    h1({ node, children, ...props }: any) {
      const domProps = { ...props };
      delete domProps.node;

      return (
        <h1
          className="text-2xl font-bold mb-4 text-primary dark:text-gradient bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary"
          {...domProps}
        >
          {children}
        </h1>
      );
    },
    h2({ node, children, ...props }: any) {
      const domProps = { ...props };
      delete domProps.node;

      return (
        <h2
          className="text-xl font-semibold mt-6 mb-3 text-primary dark:text-secondary"
          {...domProps}
        >
          {children}
        </h2>
      );
    },
    h3({ node, children, ...props }: any) {
      const domProps = { ...props };
      delete domProps.node;

      return (
        <h3
          className="text-lg font-medium mt-5 mb-2 text-primary dark:text-secondary"
          {...domProps}
        >
          {children}
        </h3>
      );
    },
    ul({ node, ordered, children, ...props }: any) {
      const domProps: any = { ...props };
      delete domProps.ordered;
      delete domProps.node;

      return (
        <ul className="list-disc pl-6 my-3 space-y-1" {...domProps}>
          {children}
        </ul>
      );
    },
    ol({ node, ordered, children, ...props }: any) {
      const domProps: any = { ...props };
      delete domProps.ordered;
      delete domProps.node;

      return (
        <ol className="list-decimal pl-6 my-3 space-y-1" {...domProps}>
          {children}
        </ol>
      );
    },
    li({ node, children, ...props }: any) {
      const domProps = { ...props };
      delete domProps.ordered;
      delete domProps.checked;
      delete domProps.index;
      delete domProps.node;
      delete domProps.spread;

      return (
        <li className="mb-1" {...domProps}>
          {children}
        </li>
      );
    },
    p({ node, children, ...props }: any) {
      const text = Array.isArray(children)
        ? children
            .map((child) => {
              if (typeof child === "object") return "";
              if (child === null || child === undefined) return "";
              return String(child);
            })
            .join("")
        : String(children || "");

      // Special styling for rating lines
      if (text.match(/[⭐★]\s*Provided Information Rating/i)) {
        // First, extract the entire rating section including the explanation
        const ratingRegex =
          /([⭐★]\s*Provided Information Rating\s*:\s*([★☆]+))([\s\S]*?)(?=\n\s*\n|$)/i;
        const ratingMatch = text.match(ratingRegex);

        const rating = ratingMatch && ratingMatch[2] ? ratingMatch[2] : "";
        const explanation =
          ratingMatch && ratingMatch[3] ? ratingMatch[3].trim() : "";

        return (
          <div
            className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border-2 border-primary/40 my-6 shadow-md"
            {...props}
          >
            <div className="font-semibold flex items-center gap-3">
              <span className="text-yellow-500 text-xl">⭐</span>
              <span className="text-primary">Provided Information Rating:</span>
              <span className="text-yellow-500 ml-1">{rating}</span>
            </div>
            {explanation && (
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                {explanation}
              </p>
            )}
          </div>
        );
      }

      // Special styling for Next Steps
      if (text.includes("📈 Next Steps:")) {
        // Extract the "Next Steps:" part and the rest of the content
        const nextStepsMatch = text.match(/📈 Next Steps:(.*)/);
        const restOfContent = nextStepsMatch ? nextStepsMatch[1] : "";

        return (
          <div className="my-6" {...props}>
            <div className="font-semibold text-primary border-b border-primary/30 pb-2 mb-3 flex items-center gap-2">
              <span className="text-xl">📈</span>
              <span>Next Steps:</span>
            </div>
            {restOfContent && (
              <p className="pl-6 text-foreground/90">{restOfContent}</p>
            )}
          </div>
        );
      }

      return (
        <p className="my-2" {...props}>
          {children}
        </p>
      );
    },
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match?.[1];

      if (!inline && language === "mermaid") {
        return <MermaidDiagram content={String(children)} />;
      }

      if (inline) {
        return (
          <code
            className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <div className="relative my-4 group">
          <div className="absolute -inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50 rounded-lg blur"></div>
          <pre className="relative p-4 bg-black/80 rounded-lg overflow-x-auto border border-primary/10">
            <code className={cn("text-sm font-mono", className)} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
    blockquote({ node, children, ...props }: any) {
      return (
        <blockquote
          className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    a({ node, children, href, ...props }: any) {
      return (
        <a
          href={href}
          className="text-primary underline underline-offset-4 hover:text-secondary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    table({ node, children, ...props }: any) {
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead({ node, children, ...props }: any) {
      const domProps = { ...props };
      delete domProps.node;

      return (
        <thead className="bg-primary/10" {...domProps}>
          {children}
        </thead>
      );
    },
    tbody({ node, children, ...props }: any) {
      const domProps = { ...props };
      delete domProps.node;

      return (
        <tbody className="divide-y divide-border/30" {...domProps}>
          {children}
        </tbody>
      );
    },
    tr({ node, children, ...props }: any) {
      const domProps = { ...props };
      delete domProps.node;

      return (
        <tr className="border-b border-border/30" {...domProps}>
          {children}
        </tr>
      );
    },
    th({ node, children, ...props }: any) {
      const domProps = { ...props };
      delete domProps.isHeader;
      delete domProps.node;

      return (
        <th
          className="px-4 py-2 text-left font-medium text-primary"
          {...domProps}
        >
          {children}
        </th>
      );
    },
    td({ node, children, ...props }: any) {
      const domProps = { ...props };
      delete domProps.node;

      return (
        <td className="px-4 py-2" {...domProps}>
          {children}
        </td>
      );
    },
  };
}
