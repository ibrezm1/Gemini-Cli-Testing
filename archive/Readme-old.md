# Gemini CLI: Pro-Tips & Tricks

This guide summarizes the essential "tricks" for getting the most out of **Gemini CLI**, an agentic AI assistant for your terminal.

---

### 🚀 Core Workflow & Context
*   **Persistent Context (`GEMINI.md`)**: Create a `.gemini/GEMINI.md` file to store project-specific rules, styles, and architecture. Gemini loads this automatically so you don't have to repeat yourself.
*   **Explicit Context with `@`**: Attach files, directories, or images directly to your prompt (e.g., `Explain this: @src/app.py`). It ensures the AI sees the exact source of truth.
*   **Session Management**: Use `/chat save <tag>` and `/chat resume <tag>` to pause and pick up complex debugging sessions later.
*   **Conversation Compression**: Run `/compress` to have the AI summarize a long chat history, freeing up context window space while retaining key facts.

### 🛠️ Customization & Extensibility
*   **Custom Slash Commands**: Define your own shortcuts (like `/test:gen`) in TOML files under `.gemini/commands/` to create reusable prompt templates.
*   **Modular Extensions**: Use `gemini extensions install <URL>` to add specialized tools for cloud services (GCP, AWS), security (Snyk), or databases.
*   **MCP Servers**: Connect Model Context Protocol (MCP) servers to let Gemini interface with proprietary databases, Figma designs, or Google Workspace (Docs/Sheets). [MCP](https://geminicli.com/docs/tools/mcp-server/)
*   **`settings.json`**: Tailor your experience (themes, Vim mode, auto-approval) by editing the global or project-specific configuration file.

### 💻 Terminal & System Power
*   **Shell Passthrough (`!`)**: Execute any terminal command without leaving the prompt by prefixing it with `!` (e.g., `!git status`).
*   **Global Tool Access**: Remember that Gemini can use *any* CLI tool in your `$PATH` (like `ffmpeg`, `docker`, or `grep`) to fulfill a request.
*   **On-the-Fly Scripting**: Ask Gemini to write and run its own Python or Node.js scripts to perform complex data transformations or file cleanups.
*   **AI Housekeeping**: Enlist Gemini to organize messy folders, rename images based on content, or identify junk files for deletion.

### ⚡ Speed & Efficiency
*   **YOLO Mode**: Use `--yolo` or `Ctrl+Y` to skip confirmation prompts for tool actions (YOLO mode enabled (all actions auto-approved)). Use with caution! ( gemini --yolo | gemini -y)
*   **Headless Mode**: Use `gemini -p "prompt"` for one-shot answers or pipe terminal output directly into it for AI analysis.
```
export GEMINI_SYSTEM_MD="/path/to/custom_system.md"
gemini -p "Perform task X with high caution"
```
Example: Let's say you want a daily summary of a news website. You could have a script:
```
gemini -p "Web-fetch \"https://news.site/top-stories\" and extract the headlines, then write them to headlines.txt"
```
*   **Fast Copy (`/copy`)**: Instantly copy the AI's last code block or response to your clipboard without manual selection.
*   **Token Caching**: Use API Key/Vertex auth to benefit from automatic context caching, which reduces cost and latency for repetitive prompts.

### 🎨 Visuals & Integrations
*   **Multimodal Vision**: Reference screenshots or diagrams (`@error.png`) for visual debugging, OCR, or UI feedback.
*   **VS Code Integration**: Connect to VS Code via `/ide install` for native side-by-side diffing and automatic sharing of your open file context.
*   **GitHub Actions**: Automate repo maintenance by deploying Gemini CLI to triage issues or review pull requests autonomously.

---

### 🐕 Just for Fun
*   **Corgi Mode**: Run `/corgi` to see an ASCII corgi run across your terminal!

> For more details, refer to the full [README.md](README.md) or run `/help` inside the CLI.
