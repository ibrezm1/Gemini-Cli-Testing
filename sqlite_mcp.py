
import sqlite3
import logging
from mcp.server.fastmcp import FastMCP

# Initialize the MCP Server
mcp = FastMCP("UniversityDB")

# Basic logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@mcp.tool()
def query_data(sql: str) -> str:
    """
    Execute SQL queries safely.
    
    WARNING: This tool executes raw SQL queries and is highly vulnerable to
    SQL injection attacks. It should only be used in a trusted environment
    and with sanitized inputs.
    
    Args:
        sql: The SQL query to execute.
    """
    logger.info(f"Executing SQL query: {sql}")
    conn = sqlite3.connect("university.db")
    try:
        # For SELECT queries, fetchall() is used. For other queries, this will be empty.
        result = conn.execute(sql).fetchall()
        conn.commit()
        return "\n".join(str(row) for row in result)
    except Exception as e:
        return f"Error: {str(e)}"
    finally:
        conn.close()

if __name__ == "__main__":
    mcp.run()
