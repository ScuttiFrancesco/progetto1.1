# Script per creare eseguibile standalone di migrazione.py
# Questo crea un file .exe che può essere usato SENZA avere Python installato

# PREREQUISITI:
# 1. Python 3.8+ installato
# 2. Dipendenze installate: pip install -r requirements.txt

# ESECUZIONE:
# python build_exe.py

import PyInstaller.__main__
import sys
from pathlib import Path

def build_executable():
    """Crea eseguibile standalone"""
    
    script_path = Path(__file__).parent / 'migrazione.py'
    
    if not script_path.exists():
        print(f"[ERRORE] Script non trovato: {script_path}")
        sys.exit(1)
    
    print("Creazione eseguibile standalone...")
    print(f"Script: {script_path}")
    print()
    
    PyInstaller.__main__.run([
        str(script_path),
        '--onefile',  # Un singolo file .exe
        '--name=migrazione',  # Nome dell'eseguibile
        '--clean',  # Pulisce cache
        '--noconfirm',  # Non chiede conferme
        '--console',  # Applicazione console
        '--add-data=docs;docs',  # Includi cartella docs (opzionale)
        '--icon=NONE',  # Nessuna icona custom
    ])
    
    print()
    print("[SUCCESS] Eseguibile creato in: dist/migrazione.exe")
    print()
    print("Puoi copiare 'dist/migrazione.exe' ovunque e usarlo senza Python:")
    print("    migrazione.exe --target \"C:\\path\\to\\nuovo\\progetto\"")
    print()

if __name__ == '__main__':
    build_executable()
