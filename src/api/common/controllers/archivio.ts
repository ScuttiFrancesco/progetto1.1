import type { Core } from '@strapi/strapi';

// ==========================================
// ARCHIVIO CONTROLLER (UNIVERSALE)
// ==========================================
// Genera archivio gerarchico anno/mese/giorno per qualsiasi collection
// che abbia il campo publishedAt. Restituisce conteggio documenti per data.
// Supporta filtri temporali opzionali (from/to).
//
// Endpoint: GET /api/archivio/:contentType?from=2024-01-01&to=2024-12-31
// Esempio: GET /api/archivio/pagina
//          GET /api/archivio/articolo?from=2024-01-01
// ==========================================

export type GiornoNode = { giorno: number; count: number };
export type MeseNode = { mese: number; count: number; giorni: GiornoNode[] };
export type AnnoNode = { anno: number; count: number; mesi: MeseNode[] };
export type ArchivioResponse = { data: AnnoNode[] };

type DocumentWithDate = {
  documentId: string | number;
  publishedAt: string; // ISO date
};

function normalizeDate(iso: string) {
  const d = new Date(iso);
  return { y: d.getFullYear(), m: d.getMonth() + 1, g: d.getDate() };
}

/**
 * Controller universale per generare archivio gerarchico (anno/mese/giorno)
 * di qualsiasi collection che abbia il campo publishedAt.
 * 
 * Path params:
 * - contentType: (REQUIRED) es. 'pagina', 'articolo' (nome corto della collection)
 * 
 * Query params:
 * - from: (optional) data ISO inizio filtro
 * - to: (optional) data ISO fine filtro
 * 
 * Esempio: GET /api/archivio/pagina
 * Esempio: GET /api/archivio/pagina?from=2024-01-01&to=2024-12-31
 */
const controller: Core.Controller = {
  async index(ctx) {
    strapi.log?.info?.('[archivio] Universal archive handler invoked');
    
    const { contentType } = ctx.params as { contentType?: string };
    const { from, to } = (ctx.query ?? {}) as { 
      from?: string; 
      to?: string 
    };

    // Validazione: contentType è obbligatorio
    if (!contentType) {
      return ctx.badRequest('Path parameter "contentType" is required. Example: /api/archivio/pagina');
    }

    // Costruisci UID completo (es. 'pagina' -> 'api::pagina.pagina')
    const uid = `api::${contentType}.${contentType}`;

    // Validazione: verifica che il contentType esista
    const model = strapi.contentType(uid as any);
    if (!model) {
      return ctx.badRequest(`Content type "${uid}" not found`);
    }

    // Validazione: verifica che abbia il campo publishedAt
    if (!model.attributes.publishedAt) {
      return ctx.badRequest(`Content type "${uid}" does not have publishedAt field`);
    }

    strapi.log?.info?.(`[archivio] Processing archive for: ${uid}`);

    // Costruisci filtri v5 per il campo "publishedAt"
    const filters: any = {};
    if (from || to) {
      filters.publishedAt = {};
      if (from) filters.publishedAt.$gte = from;
      if (to) filters.publishedAt.$lte = to;
    }

    // Prendi solo campi minimi usando DB query
    let docs: DocumentWithDate[] = [];
    try {
      docs = (await strapi.db.query(uid).findMany({
        where: filters,
        orderBy: { publishedAt: 'desc' },
        limit: -1,
        select: ['publishedAt'],
      })) as any as DocumentWithDate[];
      
      strapi.log?.info?.(`[archivio] DB query returned ${docs.length} documents for ${uid}`);
    } catch (err) {
      strapi.log?.error?.(`[archivio] DB query failed for ${uid}`, err);
      return ctx.internalServerError('Failed to query database');
    }

    // Aggregazione: year -> month -> day -> count
    const byYear = new Map<number, Map<number, Map<number, number>>>();

    for (const d of docs) {
      if (!d?.publishedAt) continue;
      const { y, m, g } = normalizeDate(d.publishedAt);
      if (!byYear.has(y)) byYear.set(y, new Map());
      const ym = byYear.get(y)!;
      if (!ym.has(m)) ym.set(m, new Map());
      const md = ym.get(m)!;
      md.set(g, (md.get(g) || 0) + 1);
    }

    // Proiezione ordinata in array
    const anni: AnnoNode[] = Array.from(byYear.keys())
      .sort((a, b) => b - a)
      .map((y) => {
        const mesiMap = byYear.get(y)!;
        const mesiKeys = Array.from(mesiMap.keys()).sort((a, b) => a - b);

        const mesi: MeseNode[] = mesiKeys.map((m) => {
          const giorniMap = mesiMap.get(m)!;
          const giorniKeys = Array.from(giorniMap.keys()).sort((a, b) => a - b);
          const giorni: GiornoNode[] = giorniKeys.map((g) => ({
            giorno: g,
            count: giorniMap.get(g)!,
          }));
          const count = giorni.reduce((s, n) => s + n.count, 0);
          return { mese: m, count, giorni };
        });

        const count = mesi.reduce((s, n) => s + n.count, 0);
        return { anno: y, count, mesi };
      });

    // Cache consigliata
    ctx.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=604800');

    const payload: ArchivioResponse = { data: anni };
    ctx.body = payload;
  },
};

export default controller;
