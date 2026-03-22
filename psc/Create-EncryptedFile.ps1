<#
.SYNOPSIS
Creates an encrypted test file in the current working directory.
#>
param(
    [string]$FolderName = "EncryptionTest"
)

# 1. CREATE A TEST FILE
# ---------------------------------------------------------
$testFolderPath = Join-Path -Path (Get-Location).Path -ChildPath $FolderName
$sourceFile = Join-Path -Path $testFolderPath -ChildPath "MySecretData.txt"
$encryptedFile = Join-Path -Path $testFolderPath -ChildPath "MySecretData.encrypted"

# Create the directory if it doesn't exist
if (-not (Test-Path $testFolderPath)) { New-Item -ItemType Directory -Path $testFolderPath -Force | Out-Null }

# Create the test file with some dummy data
"This is highly classified test data. Do not share!" | Out-File -FilePath $sourceFile -Encoding utf8
Write-Host "Created test file at: $sourceFile" -ForegroundColor Cyan

# 2. GET THE PASSWORD (Using your GUI method)
# ---------------------------------------------------------
$credential = Get-Credential -UserName "Admin" -Message "Enter the password to ENCRYPT the file"
$plainTextPassword = [System.Net.NetworkCredential]::new("", $credential.Password).Password

# 3. ENCRYPT THE FILE USING AES-256
# ---------------------------------------------------------
Write-Host "Encrypting file..." -ForegroundColor Yellow

# We need a "Salt" to make the password-derived key stronger. 
# (For a quick test, a static salt is fine. In production, you'd generate a random one).
$salt = [System.Text.Encoding]::UTF8.GetBytes("MySuperSecretSalt123") 

# Derive a secure 32-byte key (AES-256) and 16-byte IV from your password
$rfc2898 = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($plainTextPassword, $salt, 10000)
$key = $rfc2898.GetBytes(32)
$iv = $rfc2898.GetBytes(16)

# Initialize AES encryption
$aes = [System.Security.Cryptography.Aes]::Create()
$aes.Key = $key
$aes.IV = $iv

# Set up the file streams to read the plain text and write the encrypted text
$inputStream = New-Object System.IO.FileStream($sourceFile, [System.IO.FileMode]::Open)
$outputStream = New-Object System.IO.FileStream($encryptedFile, [System.IO.FileMode]::Create)

# Set up the crypto stream
$encryptor = $aes.CreateEncryptor()
$cryptoStream = New-Object System.Security.Cryptography.CryptoStream($outputStream, $encryptor, [System.Security.Cryptography.CryptoStreamMode]::Write)

# Perform the encryption by copying the data through the crypto stream
$inputStream.CopyTo($cryptoStream)

# Close and clean up everything (Important so the files aren't locked)
$cryptoStream.Close()
$outputStream.Close()
$inputStream.Close()
$aes.Dispose()
$rfc2898.Dispose()

# Clear the plain text password from memory as a security best practice
$plainTextPassword = $null 

Write-Host "Success! File encrypted to: $encryptedFile" -ForegroundColor Green

# 4. BASE64 ENCODE THE ENCRYPTED FILE
# ---------------------------------------------------------
Write-Host "Base64 encoding the encrypted file for email/transport..." -ForegroundColor Yellow
$base64File = "$encryptedFile.b64"
$bytes = [System.IO.File]::ReadAllBytes($encryptedFile)
$base64String = [System.Convert]::ToBase64String($bytes, [System.Base64FormattingOptions]::InsertLineBreaks)
[System.IO.File]::WriteAllText($base64File, $base64String)

Write-Host "Success! Base64 file created at: $base64File" -ForegroundColor Green

