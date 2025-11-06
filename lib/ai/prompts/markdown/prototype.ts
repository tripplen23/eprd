import { SectionUpdateCriteria } from "@/lib/ai/types";

export const prototypeUpdateCriteria: SectionUpdateCriteria = {
  shouldUpdateWhen: "message contains information about Prototype, UI requirements, user interactions, design preferences, user flows, or technical constraints",
  relevantInfoGuide: "Pass the complete message content without modification or filtering"
};

export const prototypePrompt = (history: { lastContent: string, lastRelevantInfo: string, chatSummary: string }, relevantInfo: string) => `
Generate content for the Prototype section. Follow these rules strictly:
1. Start with exactly this heading: # Prototype
2. There should be no other headings in the response. Not even lower level headings.
3. Format the response exactly as shown below

4. Consider previous content:
\`\`\`markdown
${history.lastContent}
\`\`\`

5. Important update rules:
   - Always incorporate the new message with "user" role
   - Keep previously valid information
   - Ensure all new information is reflected in the output
   - Never remove existing elements from the HTML structure
   - Always merge new information with existing elements or add new elements as appropriate
   - Preserve existing functionality while adding requested changes

6. Response must follow this exact structure:

Interactive Prototype:

\`\`\`html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Prototype</title>
    <!-- If the user requests a dashboard or any charting capability, include Chart.js -->
    <!-- <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> -->
    <style>
        /* CSS Variables for Theme */
        :root {
            --background: oklch(1 0 0);
            --foreground: oklch(0.145 0 0);
            --card: oklch(1 0 0);
            --card-foreground: oklch(0.145 0 0);
            --popover: oklch(1 0 0);
            --popover-foreground: oklch(0.145 0 0);
            --primary: oklch(0.6 0.25 280);
            --primary-foreground: oklch(0.985 0 0);
            --secondary: oklch(0.8 0.15 300);
            --secondary-foreground: oklch(0.205 0 0);
            --muted: oklch(0.97 0 0);
            --muted-foreground: oklch(0.556 0 0);
            --accent: oklch(0.97 0 0);
            --accent-foreground: oklch(0.205 0 0);
            --destructive: oklch(0.577 0.245 27.325);
            --destructive-foreground: oklch(0.577 0.245 27.325);
            --border: oklch(0.922 0 0);
            --input: oklch(0.922 0 0);
            --ring: oklch(0.87 0 0);
            --radius: 0.625rem;
            --gradient-start: #805af5;
            --gradient-end: #cd99ff;
        }

        .dark {
            --background: oklch(0.145 0 0);
            --foreground: oklch(0.985 0 0);
            --card: oklch(0.161 0.003 283.231);
            --card-foreground: oklch(0.985 0 0);
            --popover: oklch(0.145 0 0);
            --popover-foreground: oklch(0.985 0 0);
            --primary: oklch(0.6 0.25 280);
            --primary-foreground: oklch(0.985 0 0);
            --secondary: oklch(0.8 0.15 300);
            --secondary-foreground: oklch(0.985 0 0);
            --muted: oklch(0.269 0 0);
            --muted-foreground: oklch(0.708 0 0);
            --accent: oklch(0.269 0 0);
            --accent-foreground: oklch(0.985 0 0);
            --destructive: oklch(0.396 0.141 25.723);
            --destructive-foreground: oklch(0.985 0 0);
            --border: oklch(0.269 0 0);
            --input: oklch(0.269 0 0);
            --ring: oklch(0.439 0 0);
        }

        /* Base styles */
        html {
            box-sizing: border-box;
            font-size: 16px;
        }

        *, *:before, *:after {
            box-sizing: inherit;
        }

        body {
            background-color: var(--background);
            color: var(--foreground);
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            line-height: 1.5;
            margin: 0;
            min-height: 100vh;
        }

        /* Layout styles */
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        .card {
            max-width: 600px;
            margin: 1rem;
            background-color: var(--card);
            color: var(--card-foreground);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 1.5rem;
        }

        .button {
            display: inline-block;
            background-color: var(--primary);
            color: var(--primary-foreground);
            border: 1px solid transparent;
            border-radius: var(--radius);
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .button:hover {
            opacity: 0.9;
        }

        .button:focus-visible {
            outline: 2px solid var(--ring);
            outline-offset: 2px;
        }

        .input {
            max-width: 100%;
            background-color: var(--input);
            color: var(--foreground);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 0.5rem;
            width: 100%;
        }

        .input:focus {
            outline: 2px solid var(--ring);
            outline-offset: 2px;
        }

        /* Gradient border utility */
        .border-gradient {
            border-image: linear-gradient(
                to right,
                var(--gradient-start),
                var(--gradient-end)
            ) 1;
        }

        /* Shadow with glow effect */
        .shadow-glow {
            box-shadow: 0 4px 20px -2px rgba(128, 90, 245, 0.15),
            0 0 0 1px rgba(128, 90, 245, 0.05);
        }

        /* Scrollbar styling - exactly matching globals.css */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--muted);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
            background: color-mix(in oklch, var(--primary), transparent 70%);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: color-mix(in oklch, var(--primary), transparent 50%);
            border-radius: 4px;
        }

        /* Text utility classes for contrast */
        .text-primary {
            color: var(--primary-foreground);
        }

        .text-muted {
            color: var(--muted-foreground);
        }
    </style>
</head>
<body>
    <!-- 
    Semantic HTML structure with:
    - Proper ARIA attributes
    - Meaningful section organization
    - Clear component hierarchy
    -->

    <script>
        // All JavaScript must be embedded here
        // Include:
        // - Event handlers
        // - Interactive features
        // - Form validation
        // - State management
        // - Error handling
        
        // --- Chart.js Specific Instructions (If charting is requested) ---
        // 1. GUARD INITIALIZATION: Ensure chart initialization runs ONLY ONCE per canvas.
        //    Use a flag or check if a chart instance already exists for the canvas ID.
        //    Example:
        //    let myChartInstance = null;
        //    function initializeChart() {
        //      const canvas = document.getElementById('myChartCanvas');
        //      if (canvas && !myChartInstance) {
        //        // Check if instance exists before creating
        //        if (Chart.getChart(canvas)) { // Use Chart.js's own check
        //            Chart.getChart(canvas).destroy(); // Destroy existing if found unexpectedly
        //        }
        //        try {
        //          myChartInstance = new Chart(canvas, { /* config */ });
        //        } catch (e) { console.error('Chart init error:', e); }
        //      }
        //    }
        //    // Call initializeChart() appropriately (e.g., on DOMContentLoaded or specific event)
        
        // 2. DESTROY PREVIOUS INSTANCE: Before creating a NEW chart on the SAME canvas,
        //    ALWAYS destroy the previous instance if it exists.
        //    Example:
        //    const canvas = document.getElementById('myChartCanvas');
        //    if (canvas) {
        //        const existingChart = Chart.getChart(canvas);
        //        if (existingChart) {
        //            existingChart.destroy();
        //        }
        //        // Now create the new chart...
        //        try {
        //           new Chart(canvas, { /* new config */ });
        //        } catch (e) { console.error('Chart creation error:', e); }
        //    }

        // 3. ERROR HANDLING: Wrap chart initialization and update logic in try...catch blocks.

        // 4. ACCESSIBILITY & THEME:
        //    - Ensure all chart text has high contrast with backgrounds.
        //    - Configure Chart.js options for theme colors (WCAG compliant).
        //    - Set legend text color appropriately for dark/light mode (e.g., white in dark).
        //    - Example dark mode config snippet:
        //      options: { plugins: { legend: { labels: { color: 'white' } } } }
        // --- End Chart.js Specific Instructions ---

    </script>
</body>
</html>
\`\`\`

Design Analysis:

• Purpose:
  - Explain the main goals of the interface
  - How it addresses user needs
  - Key features and their benefits

• UX Decisions:
  - Layout strategy and why it works
  - Navigation patterns chosen
  - Interaction design choices
  - Accessibility considerations

• Technical Choices:
  - Dark theme implementation using CSS variables
  - Color contrast compliance for accessibility
  - Consistent visual hierarchy in dark mode
  - Theme-aware component styling
  - Mobile-first implementation details

7. HTML Requirements:
   - Must be completely self-contained (all CSS/JS embedded)
   - Must use semantic HTML5 elements
   - Must include ARIA attributes
   - Must be responsive
   - Must handle errors gracefully
   - Must work without external dependencies
   - Must use dark theme CSS variables
   - Must maintain WCAG contrast ratios in dark mode
   - Must handle both light/dark theme gracefully
   - When dashboard functionality is requested, use Chart.js for all data visualizations
   - Ensure all chart text and data elements maintain high contrast ratios for readability
   - Set Chart.js legend text color to white in dark mode for better visibility

8. Design Analysis Requirements:
   - Must explain UX decisions with clear reasoning
   - Must link features to user requirements
   - Must justify technical choices
   - Must highlight accessibility features
   - Must explain responsive behavior

9. Keep all content focused on implementation and user experience
10. Maintain all existing user-provided information when updating
11. Ensure all interactive elements are fully functional
12. Include error states and loading states where appropriate
13. When updating the prototype, never remove existing elements
14. Always merge new information with existing elements or add new elements as appropriate
15. Preserve existing functionality while incorporating requested changes`;
