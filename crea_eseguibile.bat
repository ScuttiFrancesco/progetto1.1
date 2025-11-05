# Script batch per Windows - Crea eseguibile standalone
# Doppio click su questo file per creare migrazione.exe

@echo off
echo ========================================
echo  Creazione Eseguibile Migrazione
echo ========================================
echo.

REM Controlla se Python è installato
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRORE] Python non trovato!
    echo.
    echo Installa Python da: https://www.python.org/downloads/
    echo Assicurati di selezionare "Add Python to PATH" durante l'installazione
    pause
    exit /b 1
)

echo [1/3] Python trovato
python --version
echo.

REM Installa dipendenze
echo [2/3] Installazione dipendenze...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERRORE] Errore installazione dipendenze
    pause
    exit /b 1
)
echo.

REM Crea eseguibile
echo [3/3] Creazione eseguibile...
python build_exe.py
if errorlevel 1 (
    echo [ERRORE] Errore creazione eseguibile
    pause
    exit /b 1
)

echo.
echo ========================================
echo  COMPLETATO!
echo ========================================
echo.
echo Eseguibile creato: dist\migrazione.exe
echo.
echo Puoi copiarlo ovunque e usarlo senza Python:
echo   migrazione.exe --target "C:\path\to\nuovo\progetto"
echo.
pause
