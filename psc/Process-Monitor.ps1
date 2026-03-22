<#
.SYNOPSIS
Monitors and displays the top running processes based on usage metrics.
.DESCRIPTION
This script fetches the top consuming processes from the system. It calculates resource usage like memory in MB and handles sorting logic internally.
.PARAMETER TopCount
The number of top processes to return (default 10).
.PARAMETER SortBy
The property to sort by (e.g. "CPU", "Memory", "Name"). Defaults to CPU.
#>
param(
    [int]$TopCount = 10,
    [string]$SortBy = "CPU"  # Options: CPU, Memory, Name
)

Write-Host "=== Process Monitor ===" -ForegroundColor Green
Write-Host "Showing top $TopCount processes sorted by $SortBy"
Write-Host ""

try {
    # Get all processes
    $processes = Get-Process | Where-Object {$_.ProcessName -ne "Idle"}
    
    # Sort based on parameter
    switch ($SortBy.ToLower()) {
        "memory" { 
            $sortedProcesses = $processes | Sort-Object WorkingSet -Descending 
            Write-Host "--- Top $TopCount Processes by Memory Usage ---" -ForegroundColor Yellow
        }
        "name" { 
            $sortedProcesses = $processes | Sort-Object ProcessName 
            Write-Host "--- Top $TopCount Processes by Name ---" -ForegroundColor Yellow
        }
        default { 
            $sortedProcesses = $processes | Sort-Object CPU -Descending 
            Write-Host "--- Top $TopCount Processes by CPU Usage ---" -ForegroundColor Yellow
        }
    }
    
    # Display top processes
    $topProcesses = $sortedProcesses | Select-Object -First $TopCount
    
    foreach ($process in $topProcesses) {
        $cpu = if ($process.CPU) { [math]::Round($process.CPU, 2) } else { "N/A" }
        $memory = [math]::Round($process.WorkingSet / 1MB, 2)
        $name = $process.ProcessName
        $id = $process.Id
        
        Write-Host "PID: $id | Name: $name | CPU: $cpu | Memory: $memory MB"
    }
    
    Write-Host ""
    Write-Host "--- Process Summary ---" -ForegroundColor Yellow
    $totalProcesses = $processes.Count
    $totalMemory = [math]::Round(($processes | Measure-Object WorkingSet -Sum).Sum / 1GB, 2)
    
    Write-Host "Total Processes: $totalProcesses"
    Write-Host "Total Memory Used: $totalMemory GB"
    
    # Find high resource processes
    $highCPU = $processes | Where-Object {$_.CPU -gt 100} | Measure-Object
    $highMemory = $processes | Where-Object {$_.WorkingSet -gt 500MB} | Measure-Object
    
    Write-Host "High CPU Processes (>100): $($highCPU.Count)"
    Write-Host "High Memory Processes (>500MB): $($highMemory.Count)"
    
} catch {
    Write-Error "Error monitoring processes: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Process Monitor Complete ===" -ForegroundColor Green
