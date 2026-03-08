from mcp.server.fastmcp import FastMCP

# Initialize the MCP Server
mcp = FastMCP("WeatherMock")

@mcp.tool()
def get_weather(city: str) -> str:
    """
    Get the current weather for a specific city.
    Args:
        city: The name of the city (e.g., London, New York, Tokyo).
    """
    # Mock data dictionary
    mock_data = {
        "london": "Cloudy, 15°C, Humidity: 80%",
        "new york": "Sunny, 22°C, Humidity: 45%",
        "tokyo": "Rainy, 18°C, Humidity: 90%",
        "dubai": "Hot and Sunny, 38°C, Humidity: 10%"
    }
    
    city_lower = city.lower()
    return mock_data.get(city_lower, f"No mock data available for {city}. It's probably 20°C and clear.")

if __name__ == "__main__":
    mcp.run()