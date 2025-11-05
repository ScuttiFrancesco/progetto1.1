# Script di Migrazione - Guida Completa

Questo script Python migra automaticamente tutte le funzionalità custom dal progetto Strapi corrente ad un altro progetto Strapi.

---

## 📋 Cosa Viene Migrato

### ✅ Plugin Custom
- **tree-view**: Plugin per visualizzazione gerarchica dei content-types

### ✅ API Common (AGGIORNATO)
- **archivio**: Controller + routes per archivio gerarchico (anno/mese/giorno)
- **unpublish**: Controller + routes per unpublish universale
- **path-resolver**: Service + controller + routes per dynamic routing con cache O(1) + gestione path duplicati (filtro tipoLayout='statico')
- **default-path**: Service per path gerarchici automatici parent/child
- **content-type placeholder**: Content-type nascosto per registrare l'API

### ✅ Content-Types
- **TUTTE le collection types** in `src/api/` (pagina, e qualsiasi altra collection custom)
- Include: schema.json, lifecycles, controllers, routes, services custom

### ✅ Components
- **TUTTI i components** in `src/components/` (url-addizionali, e qualsiasi altro component custom)

### ✅ Bootstrap & Configuration
- **src/index.ts**: Global subscriber + logica default-path
- **config/admin.ts**: Configurazione preview
- **config/plugins.ts**: Configurazione GCS upload provider + tree-view

### ✅ Dipendenze (opzionale)
- `@strapi-community/strapi-provider-upload-google-cloud-storage` - Upload provider GCS
- `slugify` - Normalizzazione nomi file per upload (richiesto da config/plugins.ts)
- `@types/node` - TypeScript types

---

## 🚀 Opzione 1: Uso SENZA Python Installato (CONSIGLIATO)

### Crea l'Eseguibile (UNA VOLTA SOLA)

Se hai Python installato, puoi creare un eseguibile `.exe` standalone:

1. **Doppio click** su `crea_eseguibile.bat`
2. Aspetta che finisca (può richiedere qualche minuto)
3. Troverai `dist/migrazione.exe`

### Usa l'Eseguibile

Una volta creato `migrazione.exe`, **NON hai più bisogno di Python**!

Puoi copiare `migrazione.exe` ovunque e usarlo:

```cmd
# Vai nella root del progetto Strapi SORGENTE
cd C:\path\to\progetto\corrente

# Esegui migrazione
migrazione.exe --target "C:\path\to\nuovo\progetto"
```

**Vantaggi:**
- ✅ Non serve Python installato
- ✅ Distribuibile facilmente
- ✅ Funziona su qualsiasi Windows

---

## 🐍 Opzione 2: Uso CON Python Installato

### Prerequisiti

1. **Python 3.8+** installato
   - Download: https://www.python.org/downloads/
   - Durante installazione, seleziona "Add Python to PATH"

2. **Installa dipendenze:**
   ```bash
   pip install -r requirements.txt
   ```

### Esecuzione

```bash
# Vai nella root del progetto Strapi SORGENTE
cd C:\path\to\progetto\corrente

# Esegui lo script
python migrazione.py --target "C:\path\to\nuovo\progetto"
```

---

## 📝 Uso Dettagliato

### 1. Preparazione

Assicurati di:
- Essere nella **root del progetto SORGENTE** (quello da cui copiare)
- Il progetto target deve essere un **progetto Strapi valido**
- Avere i permessi di scrittura sul progetto target

### 2. Esecuzione

#### Con Eseguibile:
```cmd
migrazione.exe --target "C:\Users\francesco\progetti\nuovo-strapi"
```

#### Con Python:
```bash
python migrazione.py --target "C:\Users\francesco\progetti\nuovo-strapi"
```

### 3. Processo Guidato

Lo script ti guiderà attraverso:

1. **Validazione percorsi** - Verifica che sorgente e target siano validi
2. **Conferma** - Chiede conferma prima di procedere
3. **Migrazione plugin tree-view**
4. **Migrazione API Common** (con nuove funzionalità)
5. **Migrazione content-type pagina**
6. **Migrazione components**
7. **Migrazione src/index.ts**
8. **Migrazione config files**
9. **Installazione dipendenze** (opzionale)
10. **Verifica .env**
11. **Riepilogo finale**

### 4. Backup Automatici

Lo script crea automaticamente backup di file esistenti:
- `config/admin.ts.backup`
- `config/plugins.ts.backup`
- `src/index.ts.backup`

### 5. Dopo la Migrazione

Nel progetto target:

```bash
# 1. Verifica .env (aggiungi se mancanti)
CLIENT_URL=http://localhost:4200
PREVIEW_SECRET=la-mia-super-segreta-chiave-di-preview

# 2. Installa dipendenze (se non fatto automaticamente)
npm install

# 3. Build del progetto
npm run build

# 4. Avvia in development
npm run develop

# 5. Verifica nei log:
# ✅ [PathResolver] Inizializzazione mappa dei path...
# ✅ [PathResolver] ✅ Subscriber globale registrato
# ✅ [DefaultPath] Monitoro le collection con path di default
```

---

## 🔧 Risoluzione Problemi

### Errore: "Python non trovato"

**Soluzione:**
1. Installa Python da https://www.python.org/downloads/
2. Durante installazione, **seleziona "Add Python to PATH"**
3. Riavvia il terminale

**Oppure:**
- Usa l'eseguibile standalone `migrazione.exe` (non serve Python!)

### Errore: "Il progetto target non sembra un progetto Strapi"

**Verifica:**
```bash
# Nel progetto target, controlla che esista package.json con Strapi
cat package.json | grep "@strapi/strapi"
```

### Errore: "npm install" fallito

**Soluzione:**
```bash
# Nel progetto target, installa manualmente:
npm install @strapi-community/strapi-provider-upload-google-cloud-storage@^5.0.5
npm install --save-dev @types/node
```

### Warning: "Variabili ambiente mancanti"

**Soluzione:**
Aggiungi al file `.env` del progetto target:
```env
CLIENT_URL=http://localhost:4200
PREVIEW_SECRET=la-mia-super-segreta-chiave-di-preview
```

---

## 📊 Differenze con Script PowerShell

| Funzionalità | PowerShell | Python |
|-------------|-----------|--------|
| **Supporto OS** | Solo Windows | Windows/Linux/Mac |
| **Eseguibile standalone** | ❌ No | ✅ Sì (.exe) |
| **Colori output** | ✅ | ✅ |
| **Gestione errori** | Buona | Migliore |
| **Cross-platform** | ❌ | ✅ |
| **Dipendenze** | Nessuna | Python (o .exe standalone) |

**Vantaggio Python:**
- Script più robusto e cross-platform
- Può creare eseguibile standalone (meglio di PowerShell!)
- Migliore gestione errori

---

## 🎯 Funzionalità Migrate - Dettaglio

### Path Resolver (Cache O(1))
- Risolve path → content in tempo costante
- Cache in-memory aggiornata automaticamente
- Fallback su DB se cache manca
- Endpoint: `GET /api/resolve-path/:path*`

### Default Path (Gerarchie Automatiche)
- Genera path gerarchici automatici per content con parent
- Esempio: pagina "Contatti" con parent "Chi Siamo" → path: `chi-siamo/contatti`
- Aggiorna automaticamente path figli quando cambia parent

### Archivio API
- Endpoint: `GET /api/archivio/:contentType`
- Restituisce struttura gerarchica anno/mese/giorno
- Funziona con qualsiasi content-type

### Unpublish API
- Endpoint: `POST /api/unpublish/:contentType/:documentId`
- Depubblica qualsiasi documento
- Universale per tutti i content-types

### Tree-View Plugin
- Visualizzazione gerarchica nell'admin
- Mostra parent/child relationships
- Drag & drop per riorganizzare

---

## 📄 Files Coinvolti

```
progetto1.1/
├── migrazione.py           # Script Python principale
├── requirements.txt        # Dipendenze Python
├── build_exe.py           # Script per creare .exe
├── crea_eseguibile.bat    # Batch Windows per creare .exe
├── README_MIGRAZIONE.md   # Questa guida
└── dist/
    └── migrazione.exe     # Eseguibile standalone (dopo build)
```

---

## 🔐 Sicurezza

Lo script:
- ✅ Non modifica il progetto sorgente
- ✅ Crea backup automatici dei file sovrascritti
- ✅ Chiede conferma prima di procedere
- ✅ Valida entrambi i progetti prima di iniziare
- ✅ Non esegue codice da fonti esterne

---

## 📞 Supporto

Per problemi o domande:
1. Verifica la guida sopra
2. Controlla i log di errore
3. Leggi `docs/SQLITE_TO_POSTGRES_MIGRATION.md` per dettagli tecnici

---

## ✨ Novità rispetto allo script PowerShell

1. **✅ Migrazione Default-Path Service** (NUOVO!)
2. **✅ Migrazione Content-Type Common placeholder** (NUOVO!)
3. **✅ Supporto cross-platform** (Windows/Linux/Mac)
4. **✅ Creazione eseguibile standalone .exe**
5. **✅ Migliore gestione errori e validazioni**
6. **✅ Output colorato compatibile Windows/Linux**
7. **✅ Backup automatici più robusti**

---

**Versione:** 2.0  
**Data:** 20 Ottobre 2025  
**Compatibilità:** Strapi v5.x
