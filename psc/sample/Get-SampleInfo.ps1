<#
.SYNOPSIS
Fetches sample information. This description will become the MCP tool's description!

.DESCRIPTION
This is an example of an MCP tool definition written in PowerShell.
Just drop scripts like this in the "psc" folder. The MCP server automatically parses them.
Any prompts for UI or external credentials will appear in the Windows UI, so make sure they are handled gracefully or pre-authenticated.

.PARAMETER Name
The name of the user or item to lookup. This becomes a String parameter in MCP.

.PARAMETER Age
An optional number parameter. Becomes a Number in MCP.

.PARAMETER ForceUpdate
A switch parameter. Becomes a Boolean in MCP. 
#>
param (
    [Parameter(Mandatory=$true)]
    [string]$Name,

    [int]$Age = 25,

    [switch]$ForceUpdate
)

Write-Host "Sample Script Executed!"
Write-Host "Name: $Name"
Write-Host "Age: $Age"
Write-Host "ForceUpdate: $ForceUpdate"

# Example of an authentication warning note:
# If you run Connect-AzAccount here, it might pop up a GUI or write a device auth code to the output.
# The `psc-server.js` will catch 'auth' or 'credential' strings in exceptions and suggest checking the host machine.

return $true
