import { createBaseSectionPrompt } from "./base-section-prompt";
import { SectionUpdateCriteria } from "@/lib/ai/types";

export const businessProcessUpdateCriteria: SectionUpdateCriteria = {
  shouldUpdateWhen: "message contains information about business processes, workflows, user flows, business decision points, or organizational process diagrams. Ignore purely technical processes like data pipelines, software architecture, or technical implementation details",
  relevantInfoGuide: "Pass the complete message content without modification or filtering"
};

export const businessProcessPrompt = (
  history: { lastContent: string, lastRelevantInfo: string, chatSummary: string }, 
  relevantInfo: string
) => {
  const customFormatting = `
# 1. Important update rules:
   - Always incorporate the new message with "user" role
   - Keep previously valid information
   - Ensure all new information is reflected in the output
   - Never remove existing Mermaid diagrams unless explicitly requested
   - Always merge new information with existing diagrams or add new diagrams as appropriate
   - Preserve existing processes while adding requested changes
   - When multiple processes are described, create separate subsections for each process
   - Clearly indicate what is existing and what is new in each business process
   - Use colors, styles, or annotations in Mermaid diagrams to highlight changes
   - Remove all special characters from Mermaid diagram labels

# 2. BUSINESS PROCESS FOCUS:
   - Only document BUSINESS processes, NOT technical processes
   - Business processes involve people, departments, and organizational activities
   - Business processes are about how the business operates (e.g., order processing, customer onboarding, approval workflows)
   - DO NOT include technical processes like data pipelines, API flows, or software architecture
   - Focus on user journeys, organizational workflows, and business decision points

# 3. Response must follow this structure:

## Overview of Business Processes

• Summary of All Processes:
  - Brief description of all business processes documented
  - How they interconnect or relate to each other
  - Key stakeholders involved across processes

• Process Inventory:
  - List of all documented processes
  - Current status and maturity of each process
  - Process owners and responsible teams

## [Process Name 1]

### Process Diagram

<mermaid-example>
flowchart TD
    %% Process flow diagram for Process 1
    %% Use theme-consistent colors to indicate new vs existing elements:
    %% style [node] fill:#488df9,stroke:#3b82f6 for existing elements (chart-2)
    %% style [node] fill:#f59e0b,stroke:#d97706 for new/changed elements (chart-4)
    %% style [node] fill:#8b5cf6,stroke:#7c3aed for start/end points (primary)
    
    A([Start Process]) --> B{Decision Point}
    B -->|Yes| C[Process Step 1]
    B -->|No| D[Process Step 2]
    C --> E([End Process])
    D --> E
    
    %% Example of styling for new vs existing
    style A fill:#8b5cf6,stroke:#7c3aed,color:#ffffff
    style B fill:#488df9,stroke:#3b82f6,color:#ffffff
    style C fill:#488df9,stroke:#3b82f6,color:#ffffff
    style D fill:#f59e0b,stroke:#d97706,color:#000000
    style E fill:#8b5cf6,stroke:#7c3aed,color:#ffffff
    
    %% Add a legend
    classDef existing fill:#488df9,stroke:#3b82f6,color:#ffffff
    classDef new fill:#f59e0b,stroke:#d97706,color:#000000
    classDef endpoint fill:#8b5cf6,stroke:#7c3aed,color:#ffffff
    
    %% Legend nodes
    L1[Existing Step]:::existing
    L2[New Modified Step]:::new
    L3([Start End Point]):::endpoint
    
    %% Position legend at the bottom
    L1 -.- L2 -.- L3
    
    %% Hide legend connections
    linkStyle 5,6 stroke-width:0px
</mermaid-example>

### Change Summary

• New Elements:
  - List all new process steps, decision points, or flows added
  - Explain why each new element was added
  - Describe the impact of these additions

• Modified Elements:
  - List all modified process steps or decision criteria
  - Explain what changed and why
  - Describe the impact of these modifications

### Process Description

• Overview:
  - Explain the main purpose of this business process
  - How it is relevant to the business requirements
  - Key stakeholders, departments and roles involved in the process

• Process Details:
  - Starting conditions and business triggers
  - Decision points and their business criteria
  - Process steps and their owners within the organization
  - End states and business outcomes
  - Exception handling from a business perspective

• Integration Points:
  - Handoffs between departments or teams
  - User touchpoints and interactions
  - Integration with other business processes
  - External business dependencies

### Process Metrics

• Key Performance Indicators:
  - Process efficiency metrics
  - Quality metrics
  - Time-based metrics
  - Cost metrics

• Improvement Opportunities:
  - Current bottlenecks in the business process
  - Automation opportunities
  - Process optimization suggestions

## [Process Name 2]

### Process Diagram

<mermaid-example>
flowchart TD
    %% Process flow diagram for Process 2
    %% Use theme-consistent colors as above
    
    A1([Start Process 2]) --> B1[Initial Step]
    B1 --> C1{Decision Point}
    C1 -->|Option 1| D1[Process Path 1]
    C1 -->|Option 2| E1[Process Path 2]
    C1 -->|Option 3| F1[Process Path 3]
    D1 --> G1([End Process])
    E1 --> G1
    F1 --> G1
    
    %% Styling
    style A1 fill:#8b5cf6,stroke:#7c3aed,color:#ffffff
    style B1 fill:#488df9,stroke:#3b82f6,color:#ffffff
    style C1 fill:#488df9,stroke:#3b82f6,color:#ffffff
    style D1 fill:#488df9,stroke:#3b82f6,color:#ffffff
    style E1 fill:#f59e0b,stroke:#d97706,color:#000000
    style F1 fill:#f59e0b,stroke:#d97706,color:#000000
    style G1 fill:#8b5cf6,stroke:#7c3aed,color:#ffffff
</mermaid-example>

### Change Summary
...

### Process Description
...

### Process Metrics
...

## Process Integration

<mermaid-example>
flowchart LR
    %% Integration diagram showing how processes connect
    P1([Process 1]) --> P2([Process 2])
    P2 --> P3([Process 3])
    P1 -.-> P3
    
    %% Styling
    style P1 fill:#488df9,stroke:#3b82f6,color:#ffffff
    style P2 fill:#488df9,stroke:#3b82f6,color:#ffffff
    style P3 fill:#f59e0b,stroke:#d97706,color:#000000
</mermaid-example>

• Integration Points:
  - Describe how the processes connect and interact
  - Identify handoff points between processes
  - Explain dependencies between processes
  - Note any shared resources or systems

# 4. Mermaid Diagram Requirements:
   - Use proper Mermaid flowchart syntax (TD for top-down flow, LR for left-right flow)
   - Include clear start and end points
   - Show decision points with multiple paths
   - Label all connections clearly
   - Use appropriate node shapes:
     - [Rectangle] for process steps
     - {Diamond} for decision points
     - ([Rounded Rectangle]) for start/end points
     - [(Database)] for data stores
     - [[Subroutine]] for subprocesses
   - Include comments (%%) to explain complex parts
   - Keep diagrams focused on one process flow per subsection
   - Create separate subsections with ## headings for each distinct process
   - Use consistent color coding that matches the application theme:
     - Purple (#8b5cf6/stroke:#7c3aed) for start/end points (matches primary color)
     - Blue (#488df9/stroke:#3b82f6) for existing elements (matches chart-2 color)
     - Orange (#f59e0b/stroke:#d97706) for new or modified elements (matches chart-4 color)
   - Add a legend using classDef to explain the color coding
   - Use the style attribute to apply colors: style [node] fill:#color,stroke:#color
   - Ensure text has appropriate contrast with background colors
   - Include an integration diagram if multiple processes are described
   - CRITICAL: Remove all special characters from node labels and edge labels
   - Use simple alphanumeric characters, spaces, and basic punctuation only
   - Replace special characters like "/" with "or", "&" with "and", etc.
   - MUST avoid using symbols like @, #, $, %, ^, *, <, >, |, \\, ~, etc. in labels

# 5. Process Description Requirements:
   - Must explain the process flows with clear reasoning
   - Must link process steps to business requirements
   - Must identify key stakeholders and their roles
   - Must highlight integration points with other systems
   - Must explain exception handling
   - Must clearly distinguish between existing and new/modified elements
   - Must include a "Change Summary" section when updates are made
   - Must organize content with ## headings for each distinct process

# 9. Keep all content focused on business processes and workflows
# 10. Maintain all existing user-provided information when updating
# 11. When updating diagrams, preserve the overall structure while incorporating changes
# 12. Include both "happy path" and exception handling in diagrams
# 13. For complex processes, create separate diagrams for main flow and subprocesses
# 14. Use consistent terminology throughout diagrams and descriptions
# 15. Ensure diagrams match written descriptions

NOTE: When generating real mermaid diagrams, use the triple backtick format with the 'mermaid' label:
\`\`\`mermaid
flowchart TD
    A --> B
\`\`\`
The <mermaid-example> tags above are just for illustration and should not appear in your actual output.

# FINAL REMINDER: Return your response as plain markdown text, NOT wrapped in a codeblock.
  `;

  return createBaseSectionPrompt("business-process", history, relevantInfo, customFormatting);
};