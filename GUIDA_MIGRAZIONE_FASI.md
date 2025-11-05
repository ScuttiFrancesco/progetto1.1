# 📦 Migrazione in Fasi - Strapi Custom Features

Questa guida descrive la migrazione **incrementale e sicura** delle funzionalità custom da un progetto Strapi locale a un ambiente Docker/produzione.

---

## 🎯 Strategia di Migrazione

La migrazione è suddivisa in **3 fasi progressive** per minimizzare i rischi:

| Fase | Contenuto | Rischio | Tempo Test |
|------|-----------|---------|------------|
| **FASE 1** | Schema + Configurazioni base | 🟢 BASSO | 1-2 ore |
| **FASE 2** | Services + Controllers + Lifecycles | 🟡 MEDIO | 2-4 ore |
| **FASE 3** | Plugin + Admin + Config avanzate | 🔴 ALTO | 4-8 ore |

---

## 📋 Prerequisiti

✅ Progetto **sorgente** (locale) funzionante
✅ Progetto **target** (Docker/produzione) inizializzato
✅ Python 3.8+ installato
✅ Backup completo del progetto target

---

## 🚀 FASE 1: Schema + Configurazioni Base

### Cosa migra:
- ✅ Content-types schema (`src/api/*/content-types/*/schema.json`)
- ✅ Components (`src/components/**/*.json`)
- ✅ Configurazioni base (`config/server.ts`, `middlewares.ts`, `api.ts`)

### Cosa NON migra:
- ❌ Controllers, services, routes custom
- ❌ Lifecycles globali
- ❌ Plugin custom
- ❌ `.env` (da configurare manualmente)

### Esecuzione:

```bash
# Da eseguire nella root del progetto SORGENTE
python migrazione_fase1.py --target "C:\path\to\progetto\docker"
```

### Test da eseguire:

1. Riavvia Strapi nel container Docker
2. Verifica che tutti i content-types appaiano nell'admin
3. Verifica che i components siano disponibili
4. Testa la creazione di contenuti con i nuovi schema

### ✅ Criteri di successo:

- Strapi si avvia senza errori
- Tutti i content-types sono visibili nell'admin
- È possibile creare/modificare contenuti

**➡️ Se tutto OK, procedi con FASE 2**

---

## 🚀 FASE 2: Services + Controllers + Lifecycles

### Prerequisiti:
- ✅ **FASE 1 completata e testata con successo**

### Cosa migra:
- ✅ API Common (services, controllers, routes)
  - `path-resolver` service (cache O(1))
  - `default-path` service (path gerarchici)
  - `archivio` controller (anno/mese/giorno)
  - `unpublish` controller (universale)
- ✅ Controllers/services/routes di TUTTE le collection
- ✅ Global lifecycles (`src/index.ts`)
  - PathResolver invalidation
  - Auto-slug generation
  - SEO auto-populate
  - Default-path management
- ✅ Utils (`src/utils/seo-auto-populate.ts`)

### Dipendenze richieste:
```json
{
  "slugify": "^1.6.6"
}
```

### Esecuzione:

```bash
# Da eseguire nella root del progetto SORGENTE
python migrazione_fase2.py --target "C:\path\to\progetto\docker"
```

### Test da eseguire:

1. Installa dipendenze mancanti (se richiesto)
2. Riavvia Strapi nel container Docker
3. Verifica endpoint custom:
   ```
   GET  /api/resolve-path/:path
   GET  /api/archivio/:contentType
   POST /api/unpublish/:contentType/:documentId
   ```
4. Testa creazione contenuti:
   - Slug si genera automaticamente da `title`?
   - SEO si auto-popola?
   - Path gerarchici funzionano?
5. Verifica cache PathResolver inizializzata (check logs)

### ✅ Criteri di successo:

- Tutti gli endpoint custom rispondono correttamente
- Auto-slug funziona su creazione contenuti
- SEO si popola automaticamente
- Path gerarchici si costruiscono correttamente
- Cache PathResolver si invalida su modifiche

**➡️ Se tutto OK, procedi con FASE 3**

---

## 🚀 FASE 3: Plugin + Admin + Configurazioni Avanzate

### Prerequisiti:
- ✅ **FASE 1 completata e testata con successo**
- ✅ **FASE 2 completata e testata con successo**

### Cosa migra:
- ✅ Plugin custom (`tree-view`)
- ✅ Admin customizations (`src/admin/app.tsx`)
  - Nascondi menu Deploy/Marketplace per ruoli specifici
- ✅ Extensions (`content-manager` customizations)
- ✅ Configurazioni avanzate:
  - `config/admin.ts` (preview mode, security)
  - `config/plugins.ts` (GCS upload provider)

### Dipendenze richieste:
```json
{
  "@strapi-community/strapi-provider-upload-google-cloud-storage": "^5.0.5",
  "slugify": "^1.6.6"
}
```

### ⚠️ IMPORTANTE: Configurazione .env

**PRIMA di eseguire la migrazione**, prepara queste variabili per il `.env` del progetto target:

```env
# Frontend Preview
CLIENT_URL=https://tuo-frontend-test.com
PREVIEW_SECRET=la-tua-chiave-segreta-preview

# Google Cloud Storage
GCS_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
GCS_BUCKET_NAME=tuo-bucket-name
GCS_BASE_PATH=uploads
```

### Esecuzione:

```bash
# Da eseguire nella root del progetto SORGENTE
python migrazione_fase3.py --target "C:\path\to\progetto\docker"
```

### Test da eseguire:

1. **Configura `.env`** con variabili sopra indicate
2. Installa dipendenze mancanti (se richiesto)
3. **Rebuild admin panel**: `npm run build`
4. Riavvia Strapi nel container Docker
5. Testa plugin tree-view:
   - Appare nel menu admin?
   - Visualizzazione ad albero funziona?
   - Drag-and-drop funziona?
6. Verifica menu nascosti:
   - Login come Editor/Author
   - Menu Deploy e Marketplace sono nascosti?
7. Testa preview mode (se frontend disponibile):
   - Bottone preview appare?
   - Si apre il frontend corretto?
8. Testa upload file su GCS:
   - Upload funziona?
   - Path generato corretto: `folder/contentType/slug/filename`?

### ✅ Criteri di successo:

- Plugin tree-view funziona nell'admin
- Menu Deploy/Marketplace nascosti per ruoli corretti
- Preview mode funziona (se frontend configurato)
- Upload su GCS funziona con path corretti
- Admin customizations non causano errori

---

## 🛡️ Cosa NON viene MAI migrato

```
❌ node_modules/          (reinstalla con npm install)
❌ .cache/                (rigenerata automaticamente)
❌ dist/                  (ricompila con npm run build)
❌ build/                 (ricompila con npm run build)
❌ .tmp/                  (database SQLite - non usare in produzione!)
❌ package-lock.json      (rigeneralo in Docker)
❌ .env                   (configura manualmente)
❌ database/migrations/   (gestisci separatamente se necessario)
```

---

## 🆘 Troubleshooting

### Errore: "Invalid route config config.auth must be a object"
**Soluzione:** In Strapi v5 usa `auth: false` per endpoint pubblici, oppure ometti il campo per endpoint autenticati.

### Plugin tree-view non appare nell'admin
**Soluzione:** Esegui `npm run build` per ricompilare l'admin panel.

### Upload su GCS non funziona
**Soluzione:** 
1. Verifica credenziali GCS in `.env`
2. Controlla permessi del service account
3. Verifica che il bucket esista

### Preview mode non funziona
**Soluzione:**
1. Verifica `CLIENT_URL` in `.env`
2. Verifica che il frontend sia raggiungibile
3. Aggiungi il content-type in `config/admin.ts` (switch case)

### Auto-slug non funziona
**Soluzione:**
1. Verifica che `slugify` sia installato: `npm list slugify`
2. Verifica che `src/index.ts` sia stato migrato correttamente
3. Check logs per errori nei lifecycles

---

## 📊 Checklist Completa

### Prima della migrazione:
- [ ] Backup completo progetto target
- [ ] Progetto sorgente funzionante
- [ ] Python 3.8+ installato
- [ ] Variabili `.env` preparate (FASE 3)

### FASE 1:
- [ ] Eseguito `migrazione_fase1.py`
- [ ] Strapi si avvia senza errori
- [ ] Content-types visibili nell'admin
- [ ] Components disponibili

### FASE 2:
- [ ] Eseguito `migrazione_fase2.py`
- [ ] Dipendenze installate (`slugify`)
- [ ] Endpoint custom funzionanti
- [ ] Auto-slug attivo
- [ ] SEO auto-populate attivo
- [ ] Path gerarchici funzionanti

### FASE 3:
- [ ] `.env` configurato
- [ ] Eseguito `migrazione_fase3.py`
- [ ] Dipendenze installate (GCS provider)
- [ ] Admin rebuild completato
- [ ] Plugin tree-view funzionante
- [ ] Menu nascosti per ruoli corretti
- [ ] Preview mode testato
- [ ] Upload GCS testato

---

## 🎉 Migrazione Completata!

Se tutte e 3 le fasi sono state completate con successo:

✅ Tutte le funzionalità custom sono migrate
✅ Il progetto è pronto per l'ambiente di test/produzione
✅ Tutti i test sono stati eseguiti con successo

### Prossimi passi consigliati:

1. **Testing completo end-to-end**
2. **Monitoraggio logs** per 24-48 ore
3. **Performance testing** (cache PathResolver, lifecycles)
4. **Backup regolari** del database e configurazioni
5. **Documentazione** delle configurazioni specifiche dell'ambiente

---

## 📞 Supporto

Per problemi o domande sulla migrazione, consulta:
- `README_MIGRAZIONE.md` - Guida migrazione completa (script originale)
- `QUICKSTART_MIGRAZIONE.md` - Guida rapida
- `docs/SQLITE_TO_POSTGRES_MIGRATION.md` - Analisi compatibilità database

---

**Buona migrazione! 🚀**
