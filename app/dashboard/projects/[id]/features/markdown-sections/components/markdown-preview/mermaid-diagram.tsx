import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  content: string;
}

export function MermaidDiagram({ content }: MermaidDiagramProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  // Create a unique ID for this diagram instance
  const diagramId = useRef(
    `mermaid-diagram-${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    // Set up the isMounted ref for cleanup
    isMounted.current = true;

    const renderDiagram = async () => {
      if (!containerRef.current || !isMounted.current) return;

      try {
        // Initialize mermaid with specific configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          maxTextSize: 99999999,
          logLevel: "error",
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            diagramPadding: 8,
            nodeSpacing: 50,
            rankSpacing: 50,
            useMaxWidth: true,
          },
          sequence: {
            diagramMarginX: 50,
            diagramMarginY: 10,
            actorMargin: 50,
            width: 150,
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
            useMaxWidth: true,
          },
        });

        // Render the diagram with unique ID
        const { svg } = await mermaid.render(diagramId.current, content.trim());

        // Only update state if component is still mounted
        if (isMounted.current) {
          setSvgContent(svg);
        }
      } catch (err: unknown) {
        if (isMounted.current) {
          console.error("Mermaid error:", err);
        }
      }
    };

    // Debounce rendering to avoid conflicts
    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 50);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      isMounted.current = false;
    };
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
