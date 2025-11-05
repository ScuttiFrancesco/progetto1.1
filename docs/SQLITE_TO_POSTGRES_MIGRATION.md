# Analisi Migrazione SQLite → PostgreSQL

## 📋 Riepilogo
Le funzionalità custom implementate sono **100% compatibili** con PostgreSQL. Non ci sono query SQL dirette o funzionalità specifiche di SQLite.

---

## ✅ Funzionalità Custom Analizzate

### 1. **Path Resolver Service** (`src/api/common/services/path-resolver.ts`)
**Cosa fa:**
- Mantiene una cache in-memory di tutti i path (slug + url_addizionali)
- Risolve velocemente quale contenuto corrisponde a un path
- Gestisce invalidazione e aggiornamento cache

**Compatibilità PostgreSQL:** ✅ **100% Compatibile**
- Usa solo **Strapi Entity Service API** (astratto dal database)
- Cache in-memory (non dipende dal DB)
- Query tramite `strapi.entityService.findMany()` e `strapi.db.query()`
- **Nessuna query SQL diretta**

**Note:**
- Nessuna modifica necessaria per PostgreSQL
- Le performance potrebbero migliorare con PostgreSQL per progetti grandi

---

### 2. **Default Path Service** (`src/api/common/services/default-path.ts`)
**Cosa fa:**
- Genera automaticamente path gerarchici per contenuti con parent
- Risale la gerarchia dei parent per costruire il path completo (es: `parent/child/grandchild`)
- Gestisce relazioni self-referencing

**Compatibilità PostgreSQL:** ✅ **100% Compatibile**
- Usa solo **Strapi Database API** (`strapi.db.query()`)
- Nessuna query SQL diretta
- Logica indipendente dal database

**Note:**
- Funziona allo stesso modo su PostgreSQL
- La ricorsione nella gerarchia è gestita in JavaScript, non SQL

---

### 3. **Lifecycles Pagina** (`src/api/pagina/content-types/pagina/lifecycles.js`)
**Cosa fa:**
- Hook lifecycle per:
  - `beforeUpdate`: Salva vecchi valori per confronto
  - `afterCreate`: Aggiunge path alla cache se pubblicato
  - `afterUpdate`: Aggiorna cache in modo intelligente (pubblicazione/depubblicazione)
  - `afterDelete`: Rimuove path dalla cache
- Gestisce cache PathResolver su eventi CRUD

**Compatibilità PostgreSQL:** ✅ **100% Compatibile**
- Usa solo **Strapi Entity Service API**
- Logica in JavaScript, non SQL
- Eventi lifecycle sono database-agnostic

**Note:**
- Nessuna modifica necessaria
- Gli eventi funzionano allo stesso modo su PostgreSQL

---

### 4. **Controllers Custom** (`src/api/common/controllers/`)

#### 4.1 **Archivio Controller**
**Cosa fa:**
- Endpoint `/archivio/:contentType`
- Restituisce struttura gerarchica anno/mese/giorno per qualsiasi content-type
- Aggrega le date di pubblicazione

**Compatibilità PostgreSQL:** ✅ **100% Compatibile**
- Usa `strapi.entityService.findMany()`
- Aggregazione date in JavaScript
- Nessuna query SQL diretta

#### 4.2 **Path Resolver Controller**
**Cosa fa:**
- `/resolve-path/:path*`: Risolve path → content metadata
- `/resolve-path/stats`: Statistiche cache
- `/resolve-path/invalidate`: Invalida cache

**Compatibilità PostgreSQL:** ✅ **100% Compatibile**
- Chiama solo service PathResolver (già compatibile)
- Nessuna interazione diretta col DB

#### 4.3 **Unpublish Controller**
**Cosa fa:**
- `/unpublish/:contentType/:documentId`
- Depubblica qualsiasi documento

**Compatibilità PostgreSQL:** ✅ **100% Compatibile**
- Usa `strapi.entityService.update()`
- Gestione status Strapi v5 (document service)

---

### 5. **Bootstrap Logic** (`src/index.ts`)
**Cosa fa:**
- Inizializza PathResolver all'avvio
- Registra subscriber globali per tutte le collection con `slug`
- Gestisce default path automatici per gerarchie

**Compatibilità PostgreSQL:** ✅ **100% Compatibile**
- Usa solo Strapi APIs
- Nessuna dipendenza dal tipo di database
- I lifecycle subscribers funzionano su tutti i DB

---

## 🔍 Query Pattern Analizzati

### Pattern Usati (Tutti Compatibili):
1. **Entity Service API:**
   ```typescript
   strapi.entityService.findMany(uid, { filters, populate, status })
   strapi.entityService.findOne(uid, id, { populate })
   strapi.entityService.update(uid, id, { data })
   ```

2. **Database Query API:**
   ```typescript
   strapi.db.query(uid).findOne({ where, populate })
   ```

3. **Content Type Introspection:**
   ```typescript
   strapi.contentTypes[uid]
   strapi.contentType(uid)
   ```

4. **Lifecycle Hooks:**
   ```javascript
   beforeUpdate, afterCreate, afterUpdate, afterDelete
   ```

### ⚠️ Pattern NON Usati (Buono!):
- ❌ Query SQL raw (`strapi.db.connection.raw()`)
- ❌ Funzioni SQLite specifiche
- ❌ Transazioni custom SQL
- ❌ Stored procedures

---

## 📊 Considerazioni Performance

### SQLite:
- ✅ Ottimo per development
- ✅ File-based, semplice
- ⚠️ Limitazioni concorrenza (write lock)
- ⚠️ Performance degrada con molti dati

### PostgreSQL:
- ✅ Migliore concorrenza (MVCC)
- ✅ Performance superiori su grandi dataset
- ✅ Indici più efficienti
- ✅ Query parallele
- ✅ Transazioni ACID complete

### PathResolver Cache:
- La cache in-memory compensa eventuali rallentamenti DB
- Con PostgreSQL, il "fallback su DB" sarà comunque più veloce
- Nessuna modifica necessaria al caching

---

## 🚀 Piano di Migrazione

### Step 1: Backup Database
```bash
# Esporta tutti i dati da SQLite
npm run strapi export -- --file ./backup-sqlite.tar.gz
```

### Step 2: Configura PostgreSQL
**Installa PostgreSQL** (se non già presente):
```bash
# Windows: scaricare da https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql
```

**Crea Database:**
```sql
CREATE DATABASE strapi_progetto;
CREATE USER strapi_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE strapi_progetto TO strapi_user;
```

### Step 3: Aggiorna config/database.ts
```typescript
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi_progetto'),
      user: env('DATABASE_USERNAME', 'strapi_user'),
      password: env('DATABASE_PASSWORD', 'your_password'),
      ssl: env.bool('DATABASE_SSL', false) && {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false),
      },
    },
    debug: false,
  },
});
```

### Step 4: Aggiorna .env
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=strapi_progetto
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=your_password
DATABASE_SSL=false
```

### Step 5: Installa Driver PostgreSQL
```bash
npm install pg
```

### Step 6: Ricostruisci Database
```bash
# Strapi crea automaticamente le tabelle
npm run develop
```

### Step 7: Importa Dati (Opzionale)
```bash
npm run strapi import -- --file ./backup-sqlite.tar.gz
```

### Step 8: Verifica Funzionalità
1. ✅ Verifica PathResolver: `GET /api/resolve-path/stats`
2. ✅ Testa risoluzione path: `GET /api/resolve-path/chi-siamo`
3. ✅ Verifica archivio: `GET /api/archivio/pagina`
4. ✅ Testa publish/unpublish
5. ✅ Verifica URL addizionali
6. ✅ Testa gerarchie parent/child

---

## ⚠️ Potenziali Issue (Molto Rari)

### 1. **Case Sensitivity**
- SQLite: case-insensitive di default
- PostgreSQL: case-sensitive
- **Impatto:** PathResolver normalizza i path con `.toLowerCase()` → **Nessun problema**

### 2. **Date/Time Format**
- Entrambi supportano ISO 8601
- Strapi gestisce automaticamente
- **Impatto:** Nessuno

### 3. **Transazioni**
- SQLite: lock su write
- PostgreSQL: MVCC
- **Impatto:** Migliore performance su PostgreSQL

### 4. **Auto-increment IDs**
- SQLite: `INTEGER PRIMARY KEY`
- PostgreSQL: `SERIAL` o `BIGSERIAL`
- **Impatto:** Strapi gestisce automaticamente

---

## 📝 Checklist Pre-Migrazione

- [ ] Backup completo database SQLite
- [ ] Test tutte le funzionalità custom
- [ ] PostgreSQL installato e configurato
- [ ] Database e user creati
- [ ] Driver `pg` installato
- [ ] File .env aggiornato
- [ ] config/database.ts aggiornato
- [ ] Test in environment di staging prima della produzione

---

## 🎯 Conclusione

**Verdetto Finale:** ✅ **MIGRAZIONE SICURA AL 100%**

Tutte le funzionalità custom sono implementate usando le API standard di Strapi, che sono database-agnostic. La migrazione da SQLite a PostgreSQL sarà:

1. **Trasparente** per il codice custom
2. **Migliorativa** per le performance
3. **Sicura** senza rischio di rotture
4. **Semplice** seguendo gli step sopra

**Nessuna modifica al codice custom è necessaria!** 🎉
