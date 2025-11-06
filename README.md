# PRD Chat AI - Agentic AI System for Product Requirements Document Generation

An intelligent, agentic AI system designed to assist product managers, developers, and stakeholders in creating comprehensive Product Requirements Documents (PRDs) through natural conversation.

## 🚀 Live Demo

Try the live demo: [https://eprd-5blkxtoxf-binh-nguyens-projects-10752964.vercel.app/](https://eprd-5blkxtoxf-binh-nguyens-projects-10752964.vercel.app/)

## 🎯 Overview

PRD Chat AI is an advanced conversational AI system that helps you build professional PRDs by:

- **Intelligent Conversation**: Chat naturally about your product ideas and requirements
- **Multi-Agent Architecture**: Specialized AI agents work together to analyze, structure, and generate PRD sections
- **Real-time Updates**: Watch your PRD sections update dynamically as you provide information
- **Structured Output**: Automatically organizes information into standard PRD sections:
  - Project Overview
  - Problem Statement
  - Scope (In-Scope & Out-of-Scope)
  - User Stories
  - Use Cases
  - Business Process Flows (with Mermaid diagrams)
  - Data Model (with ERD diagrams)
  - Interactive Prototypes (HTML/CSS/JS)
- **Diff View**: Review and approve changes before they're applied to your document
- **Checkpoint System**: Save and restore previous versions of your PRD

## 🏗️ Architecture

The system uses a sophisticated multi-agent orchestration pattern:

1. **Router Agent**: Determines if user input is PRD-related
2. **Section Agent**: Identifies which PRD sections need updates
3. **Conversation Agent**: Maintains natural dialogue and provides guidance
4. **Markdown Agents**: Specialized agents for each PRD section
5. **Orchestrator**: Coordinates all agents and manages the workflow

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **State Management**: Redux Toolkit
- **AI Integration**: Azure OpenAI (GPT-4)
- **Markdown Rendering**: React Markdown with Mermaid support
- **UI Components**: Radix UI + Custom Components
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ or higher
- pnpm (recommended) or npm
- Azure OpenAI API access

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-companion
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your Azure OpenAI credentials:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT="your-endpoint"
   NEXT_PUBLIC_AZURE_OPENAI_KEY="your-api-key"
   NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT="your-deployment-name"
   NEXT_PUBLIC_AZURE_OPENAI_API_VERSION="2025-01-01-preview"
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Start a Conversation**: Begin by describing your product idea or requirements
2. **Provide Details**: Answer the AI's questions to fill in PRD sections
3. **Review Updates**: Check the real-time updates in the PRD sections panel
4. **Approve Changes**: Use the diff view to review and approve section updates
5. **Create Checkpoints**: Save important versions of your PRD
6. **Export**: Copy or export your completed PRD

## 🎨 Features

### Intelligent Section Updates
- AI automatically determines which sections need updates based on your conversation
- Provides information quality ratings for each section
- Suggests next steps to complete your PRD

### Interactive Prototypes
- Generate working HTML/CSS/JS prototypes directly in your PRD
- Supports Chart.js for data visualizations
- Dark mode compatible designs

### Diagram Generation
- Automatic Mermaid diagram generation for:
  - Business process flows
  - Data models and ERD diagrams
  - User journey maps

### Diff Management
- Review changes before applying them
- Accept or reject individual section updates
- Maintain document integrity

## 🏗️ Project Structure

```
web-companion/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Main dashboard
│   │   └── projects/[id]/      # Project-specific pages
│   │       └── features/       # Feature modules
│   │           ├── chat/       # Chat interface
│   │           ├── markdown-sections/  # PRD sections
│   │           └── diff/       # Diff viewer
│   └── api/                    # API routes
├── lib/                        # Core libraries
│   ├── ai/                     # AI agents and orchestration
│   │   ├── agents/            # Individual AI agents
│   │   ├── flow/              # Orchestration logic
│   │   └── prompts/           # AI prompts
│   ├── store/                 # Redux store
│   └── config/                # Configuration
├── components/                # Reusable UI components
└── public/                    # Static assets
```

## 🔧 Development

### Build for production
```bash
pnpm build
```

### Run production build
```bash
pnpm start
```

### Lint code
```bash
pnpm lint
```

## 🚢 Deployment

The application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Diagrams with [Mermaid](https://mermaid.js.org/)

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Note**: This is an AI-powered tool. Always review and validate the generated content before using it in production environments.
