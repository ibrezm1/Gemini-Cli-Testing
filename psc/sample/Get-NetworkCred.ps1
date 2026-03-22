<#
.SYNOPSIS
Securely prompts for or validates simulated API credentials.
.DESCRIPTION
This script is an example of an interactive or authentication-based command.
It pops up a window for the user to enter credentials and then mocks authentication.
When run via MCP, the interaction will happen on the host machine.
#>
# 1. Securely prompt for credentials
# This pops up a standard Windows/macOS PowerShell auth dialog or inline prompt
$credential = Get-Credential -Message "Please enter your simulated API credentials"

# 2. Extract the username
$username = $credential.UserName

# 3. Extract the plain-text password from the SecureString
# Note: You often need to do this when constructing Basic Auth headers or JSON payloads for APIs
$plainPassword = $credential.GetNetworkCredential().Password

Write-Host "`nAttempting to authenticate $username..." -ForegroundColor Cyan
Start-Sleep -Seconds 1 # Simulating network latency

# 4. Simulate the authentication logic against a mock backend
if ($username -eq "admin" -and $plainPassword -eq "hunter2") {
    Write-Host "[200 OK] Authentication Successful! Token granted." -ForegroundColor Green
    
    # Simulate generating a bearer token
    $mockToken = [guid]::NewGuid().ToString()
    Write-Host "Your session token: $mockToken" -ForegroundColor DarkGray
} 
else {
    Write-Host "[401 Unauthorized] Authentication Failed. Invalid username or password." -ForegroundColor Red
}

# 5. Clean up the variable holding the plain-text password
$plainPassword = $null
