import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { PowerShell } from 'node-powershell';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Shared Helpers ---
const log = (message) => {
  console.error(`[PowerShell MCP] ${message}`);
};

/**
 * Create and configure a PowerShell instance
 */
function createPowerShellInstance() {
  return new PowerShell({
    executableOptions: {
      '-ExecutionPolicy': 'Bypass',
      '-NoProfile': true,
    }
  });
}

/**
 * Execute a PowerShell command safely and catch auth-related hangs/errors
 */
async function executePowerShellCommand(command, workingDirectory = null) {
  const ps = createPowerShellInstance();
  
  try {
    if (workingDirectory) {
      await ps.invoke(`Set-Location -Path "${workingDirectory}"`);
    }
    
    // Auth warning context if scripts use credentials
    const result = await ps.invoke(command);
    return {
      success: true,
      output: result.raw || 'Command executed successfully with no output.',
      workingDirectory: workingDirectory || 'Default'
    };
  } catch (error) {
    const errorMsg = error.message.toLowerCase();
    let authNote = "";
    if (errorMsg.includes('auth') || errorMsg.includes('credential') || errorMsg.includes('login') || errorMsg.includes('access_denied')) {
        authNote = "\n\n⚠️ AUTHENTICATION REQUIRED: This script appears to require user authentication. Please check your host machine for login prompts (like Azure or Windows Security), or pre-authenticate your session before calling this tool.";
    }
    return {
      success: false,
      error: error.message + authNote,
      workingDirectory: workingDirectory || 'Default'
    };
  } finally {
    await ps.dispose();
  }
}

// --- Built-in Tools Consolidation ---

function registerPowerShellTools(server) {
  server.tool(
    'execute-powershell',
    'Execute a PowerShell command with optional working directory',
    {
      command: z.string().describe('The PowerShell command to execute'),
      workingDirectory: z.string().optional().describe('Optional working directory for command execution')
    },
    async ({ command, workingDirectory }) => {
      const result = await executePowerShellCommand(command, workingDirectory);
      if (result.success) {
        return { content: [{ type: 'text', text: `✅ Command executed successfully\n\nOutput:\n${result.output}` }] };
      } else {
        return { content: [{ type: 'text', text: `❌ PowerShell command failed:\n\nError: ${result.error}` }], isError: true };
      }
    }
  );
  
  server.tool(
    'execute-powershell-script',
    'Execute a PowerShell script file with optional parameters',
    {
      scriptPath: z.string().describe('Path to the PowerShell script file (.ps1)'),
      parameters: z.array(z.string()).optional().describe('Optional parameters to pass to the script'),
      workingDirectory: z.string().optional().describe('Optional working directory')
    },
    async ({ scriptPath, parameters = [], workingDirectory }) => {
      let command = `& "${scriptPath}"`;
      if (parameters.length > 0) {
        command += ` ${parameters.map(p => `"${p}"`).join(' ')}`;
      }
      const result = await executePowerShellCommand(command, workingDirectory);
      if (result.success) {
        return { content: [{ type: 'text', text: `✅ Script executed\n\nOutput:\n${result.output}` }] };
      } else {
        return { content: [{ type: 'text', text: `❌ Script failed:\n\nError: ${result.error}` }], isError: true };
      }
    }
  );
}

function registerSystemTools(server) {
  server.tool(
    'get-system-info',
    'Get comprehensive Windows system information including hardware, OS, and performance metrics',
    {},
    async () => {
      const command = `
        $computerInfo = Get-ComputerInfo
        $osInfo = Get-WmiObject -Class Win32_OperatingSystem
        $cpuInfo = Get-WmiObject -Class Win32_Processor
        $memInfo = Get-WmiObject -Class Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum
        @{
          'Computer Name' = $computerInfo.WindowsProductName
          'OS Version' = $computerInfo.WindowsVersion
          'Total RAM (GB)' = [math]::Round($memInfo.Sum / 1GB, 2)
          'CPU Name' = ($cpuInfo | Select-Object -First 1).Name
        } | ConvertTo-Json
      `;
      const result = await executePowerShellCommand(command);
      if (result.success) {
        return { content: [{ type: 'text', text: `🖥️ **System Information**\n\n\`\`\`json\n${result.output}\n\`\`\`` }] };
      } else {
        return { content: [{ type: 'text', text: `❌ Failed to get system information:\n\n${result.error}` }], isError: true };
      }
    }
  );
}

// --- Dynamic psc Folder Tools Loading ---

/**
 * Scans the ./psc folder (or ../psc) for .ps1 scripts, parses their parameters and descriptions,
 * and registers them as MCP tools.
 */
async function loadDynamicPscTools(server) {
  // Check ./psc first, then ../psc, so the server can be placed anywhere.
  let pscPath = path.resolve(__dirname, 'psc');
  try {
    const stat = await fs.stat(pscPath);
    if (!stat.isDirectory()) throw new Error();
  } catch(e) {
    pscPath = path.resolve(__dirname, '..', 'psc');
    try {
        const stat2 = await fs.stat(pscPath);
        if (!stat2.isDirectory()) {
            log(`No 'psc' directory found locally or in parent. Dynamic loading skipped.`);
            return;
        }
    } catch(e2) {
        log(`No 'psc' directory found locally or in parent. Dynamic loading skipped.`);
        return;
    }
  }

  log(`Scanning for dynamic PowerShell tools in: ${pscPath}`);

  // Fetch all .ps1 files anywhere under the psc folder (including subfolders like psc/sample)
  const parseCommand = `
    $ErrorActionPreference = 'SilentlyContinue'
    $tools = @()
    $scripts = Get-ChildItem -Path "${pscPath}" -Filter "*.ps1" -Recurse

    foreach ($script in $scripts) {
        $cmd = Get-Command $script.FullName
        if (-not $cmd) { continue }
        
        $help = Get-Help $script.FullName
        $desc = "No description provided."
        if ($help.Synopsis) { $desc = $help.Synopsis.Trim() }
        elseif ($help.Description) { $desc = $help.Description.Trim() }
        
        $params = @{}
        if ($cmd.Parameters) {
            foreach ($param in $cmd.Parameters.Values) {
                if ($param.Name -in @("Verbose","Debug","ErrorAction","WarningAction","InformationAction","ErrorVariable","WarningVariable","InformationVariable","OutVariable","OutBuffer","PipelineVariable")) { continue }
                
                $params[$param.Name] = @{
                    Type = $param.ParameterType.Name
                    IsMandatory = [bool]($param.Attributes.Mandatory -contains $true)
                }
            }
        }
        
        $tools += @{
            Name = $script.BaseName.ToLower() -replace '[^a-z0-9_-]', '-'
            FullName = $script.FullName
            Description = $desc
            Parameters = $params
        }
    }
    $tools | ConvertTo-Json -Depth 4
  `;

  const result = await executePowerShellCommand(parseCommand);
  if (!result.success || !result.output.trim()) {
    log(`Failed to discover tools or no tools found.`);
    return;
  }

  try {
    const parsedOutputs = JSON.parse(result.output);
    const tools = Array.isArray(parsedOutputs) ? parsedOutputs : [parsedOutputs];

    for (const tool of tools) {
      if (!tool || !tool.Name) continue;
      
      const properties = {};
      const requiredParams = [];

      // Build Zod schema dynamically based on PowerShell parameters
      if (tool.Parameters) {
        for (const [paramName, paramDetails] of Object.entries(tool.Parameters)) {
           let zodType = z.string();
           if (paramDetails.Type === 'Int32' || paramDetails.Type === 'Double') {
               zodType = z.number();
           } else if (paramDetails.Type === 'Boolean' || paramDetails.Type === 'SwitchParameter') {
               zodType = z.boolean();
           }

           if (paramDetails.IsMandatory) {
             requiredParams.push(paramName);
           } else {
             zodType = zodType.optional();
           }
           
           properties[paramName] = zodType.describe(`Parameter type: ${paramDetails.Type}`);
        }
      }
      
      server.tool(
        tool.Name,
        tool.Description || `Dynamic tool executing ${path.basename(tool.FullName)}`,
        properties,
        async (args) => {
          let runCmd = `& "${tool.FullName}"`;
          
          for (const [key, value] of Object.entries(args)) {
             if (typeof value === 'boolean' && value) {
                 runCmd += ` -${key}`;
             } else {
                 runCmd += ` -${key} "${String(value).replace(/"/g, '\\"')}"`;
             }
          }

          log(`Executing dynamic tool: ${tool.Name}`);
          const execResult = await executePowerShellCommand(runCmd);
          
          if (execResult.success) {
            return { content: [{ type: 'text', text: `✅ Dynamic Script executed\n\nOutput:\n${execResult.output}` }] };
          } else {
            return { content: [{ type: 'text', text: `❌ Dynamic Script failed:\n\nError: ${execResult.error}` }], isError: true };
          }
        }
      );

      log(`Registered dynamic tool: ${tool.Name}`);
    }
  } catch (e) {
    log(`Error parsing dynamic tools JSON: ${e.message}`);
  }
}

// --- Server Startup ---

async function startServer() {
  log('Starting Standalone PowerShell MCP Server (psc-server.js)...');

  const server = new McpServer({
    name: 'powershell-mcp-server-psc',
    version: '1.2.0',
  });

  log('Registering baked-in tools...');
  registerPowerShellTools(server);
  registerSystemTools(server);
  
  // Register dynamic tools from psc
  await loadDynamicPscTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  log('PowerShell MCP Server is running and ready!');
}

// Error handling
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`);
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled rejection: ${reason}`);
});

startServer().catch((error) => {
  log(`Failed to start server: ${error.message}`);
  process.exit(1);
});
