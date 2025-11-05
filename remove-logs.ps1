# Script PowerShell per rimuovere tutti i log da file TypeScript/JavaScript
# Rimuove: strapi.log.info, strapi.log.warn, strapi.log.error, console.log, console.warn, console.error

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Rimozione Log da Progetto Strapi" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pattern da rimuovere (regex)
$logPatterns = @(
    "^\s*strapi\.log\.(info|warn|error)\([^;]*\);\s*$",
    "^\s*console\.(log|warn|error)\([^;]*\);\s*$"
)

# Directory da processare
$directories = @(
    "src",
    "config"
)

$totalFilesProcessed = 0
$totalLinesRemoved = 0

foreach ($dir in $directories) {
    if (-Not (Test-Path $dir)) {
        Write-Host "Directory '$dir' non trovata, skip..." -ForegroundColor Yellow
        continue
    }

    Write-Host "Processando directory: $dir" -ForegroundColor Green
    
    # Trova tutti i file .ts, .tsx, .js
    $files = Get-ChildItem -Path $dir -Include *.ts,*.tsx,*.js -Recurse -File
    
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $linesRemovedInFile = 0
        
        # Applica tutti i pattern
        foreach ($pattern in $logPatterns) {
            # Conta quante righe matchano prima della rimozione
            $matches = [regex]::Matches($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
            $linesRemovedInFile += $matches.Count
            
            # Rimuovi le righe che matchano il pattern
            $content = [regex]::Replace($content, $pattern, "", [System.Text.RegularExpressions.RegexOptions]::Multiline)
        }
        
        # Rimuovi righe vuote multiple consecutive (max 2 righe vuote)
        $content = [regex]::Replace($content, "(\r?\n){3,}", "`n`n", [System.Text.RegularExpressions.RegexOptions]::Multiline)
        
        # Salva solo se ci sono cambiamenti
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            
            $relativePath = Resolve-Path -Path $file.FullName -Relative
            Write-Host "  > $relativePath - Rimossi $linesRemovedInFile log" -ForegroundColor Gray
            
            $totalFilesProcessed++
            $totalLinesRemoved += $linesRemovedInFile
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Riepilogo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "File processati: $totalFilesProcessed" -ForegroundColor Green
Write-Host "Righe di log rimosse: $totalLinesRemoved" -ForegroundColor Green
Write-Host ""
Write-Host "Operazione completata!" -ForegroundColor Green
