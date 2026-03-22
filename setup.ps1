# Define error handling
$ErrorActionPreference = "Stop"

Write-Host "Setting up Python virtual environment..."
python -m venv venv

Write-Host "Activating virtual environment..."
# Check if Activate.ps1 exists before dot-sourcing
if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    . ".\.venv\Scripts\Activate.ps1"
} else {
    Write-Warning "Could not find Activate.ps1. Assuming Python is already configured or virtual environment failed to build."
}

Write-Host "Installing Python dependencies from requirements.txt..."
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt
} else {
    Write-Warning "requirements.txt not found!"
}

Write-Host "Installing npm dependencies..."
if (Test-Path "package.json") {
    npm install @modelcontextprotocol/sdk node-powershell zod
} else {
    Write-Warning "package.json not found... running npm install anyway"
    npm install @modelcontextprotocol/sdk node-powershell zod
}

Write-Host "Setup complete!"
