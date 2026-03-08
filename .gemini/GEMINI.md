# Project Phoenix - Gemini CLI Assistant

- All Python code must follow PEP 8 style.  
- Use 4 spaces for indentation.  
- The user is building a data pipeline; prefer functional programming paradigms.

# Project Context: University Database

You have access to a local SQLite database named `university.db` via the `UniversityDB` MCP server.

## Available Tools
- **query_data(sql)**: Executes raw SQL queries against the university database.
  - *Usage*: Use this for SELECT, INSERT, or UPDATE operations.
  - *Warning*: This tool is for trusted environments only.

## Instructions
1. Always check the schema before running complex joins.
2. If a query fails, explain the error to the user.
3. For all data requests, use the `query_data` tool provided by the `UniversityDB` server.