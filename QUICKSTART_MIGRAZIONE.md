# Quick Start - Script Migrazione

## 🚀 Modo Più Semplice (SENZA Python)

### 1️⃣ Crea l'eseguibile (solo la prima volta)

**Doppio click** su: `crea_eseguibile.bat`

Aspetta che finisca → Troverai `dist/migrazione.exe`

### 2️⃣ Usa l'eseguibile

```cmd
# Vai nel progetto SORGENTE
cd C:\path\to\questo\progetto

# Esegui migrazione
dist\migrazione.exe --target "C:\path\to\nuovo\progetto"
```

**FATTO!** 🎉

---

## 🐍 Con Python (Alternativa)

```bash
# Installa dipendenze (solo la prima volta)
pip install -r requirements.txt

# Vai nel progetto SORGENTE
cd C:\path\to\questo\progetto

# Esegui migrazione
python migrazione.py --target "C:\path\to\nuovo\progetto"
```

---

## ❓ Domande Frequenti

**Q: Serve Python installato?**  
A: NO se usi `migrazione.exe`. SÌ se usi `migrazione.py`

**Q: Funziona su Linux/Mac?**  
A: `migrazione.py` sì. `migrazione.exe` solo Windows

**Q: Posso distribuire l'exe ad altri?**  
A: SÌ! `migrazione.exe` è standalone

**Q: Cosa succede ai file esistenti?**  
A: Vengono creati backup (.backup)

---

**Guida completa:** `README_MIGRAZIONE.md`
