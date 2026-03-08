# Gemini CLI: Power User Cheat Sheet

### 🚀 Essential Commands
- `/copy` (Fast Copy): Copy the last AI response/code to clipboard.
- `/restore` (Undo): Revert file changes and conversation to the last checkpoint.
- `/compress`: Summarize chat history to free up context window.
- `/stats`: View token usage and caching status.
- `/chat save/resume <tag>`: Save or pick up a conversation session.
- `/tools`: List all available tools and custom commands.
- `/quit`: Exit the CLI.

### 🧠 Context & Reference
- `@path/to/file`: Reference a file or directory for explicit context.
- `@path/to/image`: Multimodal support for screenshots, diagrams, and OCR.
- `GEMINI.md`: Project-specific instructions loaded automatically from `.gemini/`.
- `/memory add "fact"`: Save persistent facts to the project memory.
- Customize the `$PATH` (and Tool Availability) for Stability
- `/compress` Long Conversations to Stay Within Context

### ⚡ Speed & Automation
- `!command`: Shell passthrough. Use `!` for persistent shell mode.
- `Ctrl+Y` (YOLO Mode): Toggle auto-approval for all tool actions.
- `Ctrl+C`: Single tap to cancel/abort; double tap to quit.
- `gemini -p "prompt"`: Headless mode for one-shot scripts and CI.

### 🛠️ Advanced Customization
- `/ide install`: Connect to VS Code for native side-by-side diffing.
- `/mcp`: Manage Model Context Protocol servers (Docs, Figma, DBs).
- `gemini extensions install <URL>`: Add plug-and-play tools (GCP, Snyk, etc.).
- `/settings`: Interactive UI to customize themes, Vim mode, and more.
- `.gemini/commands/`: Define custom slash commands using TOML templates.

### 🐕 Just for Fun
- `/corgi`: Toggles a corgi animation across your terminal.
