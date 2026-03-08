# Kill any existing Chrome processes to ensure a clean start
Write-Host "Closing any existing Chrome processes..."
Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force

# Define the path to Chrome
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# Define the arguments
# Using a minimal set of arguments for testing.
$arguments = "--remote-debugging-port=9222 --user-data-dir=c:\temp\chrome-data --no-first-run --no-default-browser-check"

# Start the process
Write-Host "Starting Chrome with remote debugging (minimal arguments)..."
Start-Process -FilePath $chromePath -ArgumentList $arguments

# Wait and verify
Write-Host "Waiting 5 seconds for Chrome to initialize..."
Start-Sleep -Seconds 5

Write-Host "Checking for listener on port 9222..."
$connection = Get-NetTCPConnection -LocalPort 9222 -State Listen -ErrorAction SilentlyContinue

if ($connection) {
    Write-Host "Success! Chrome is listening on port 9222." -ForegroundColor Green
    Write-Host "Process ID: $($connection.OwningProcess)"
} else {
    Write-Host "Error: Chrome is not listening on port 9222." -ForegroundColor Red
}
