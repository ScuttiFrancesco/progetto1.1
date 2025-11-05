// ==========================================
// PATH RESOLVER CONTROLLER
// ==========================================
// API endpoint per risolvere path verso entity tramite cache in-memory.
// Supporta path duplicati con filtro opzionale per tipoLayout='statico'.
//
// Endpoints:
// - GET /api/resolve-path/:path* - Risolve un path (supporta slash multipli)
// - GET /api/resolve-path/stats - Statistiche cache (totale path, duplicati, etc.)
// - POST /api/resolve-path/invalidate - Invalida e ricostruisce la cache
//
// Query params:
// - filterStatic: true/false (default: true) - filtra per tipoLayout='statico'
//
// Esempi:
// - GET /api/resolve-path/chi-siamo
// - GET /api/resolve-path/servizi/area-riservata?filterStatic=false
// ==========================================

/**
 * Path Resolver Controller
 * 
 * Gestisce le richieste per risolvere path verso pagine
 */

export default {
  /**
   * Risolve un path e restituisce la pagina corrispondente
   * 
   * GET /api/resolve-path/:path*
   * Query params:
   * - filterStatic: true/false (default: true) - se true, filtra per tipoLayout='statico'
   * 
   * Esempi:
   * - /api/resolve-path/chi-siamo
   * - /api/resolve-path/chi-siamo/oggi
   * - /api/resolve-path/servizi/area-riservata?filterStatic=false
   */
  async resolve(ctx) {
    try {
      // Estrae il path dai params (supporta path con slash multipli)
      const path = ctx.params.path || ctx.params[0] || '';

      if (!path) {
        return ctx.badRequest('Path mancante');
      }

      // Query param per disabilitare il filtro tipoLayout='statico'
      const filterStatic = ctx.query.filterStatic !== 'false'; // default: true

      // Usa il service per risolvere il path
      const pathResolver = strapi.service('api::common.path-resolver');
      const result = await pathResolver.resolvePath(path, filterStatic);

      if (!result) {
        return ctx.notFound('Pagina non trovata per questo path');
      }

      // Se ci sono più risultati (array)
      if (Array.isArray(result)) {
        ctx.body = {
          data: result.map(r => ({
            slug: r.slug,
            documentId: r.documentId,
            id: r.id,
            contentType: r.contentType,
            tipoLayout: r.tipoLayout,
            resolvedFrom: r.isPrimary ? 'slug' : 'url_addizionali',
          })),
          meta: {
            count: result.length,
            requestedPath: path,
            filtered: filterStatic,
          },
        };
      } else {
        // Singolo risultato
        ctx.body = {
          data: {
            slug: result.slug,
            documentId: result.documentId,
            id: result.id,
            contentType: result.contentType,
            tipoLayout: result.tipoLayout,
            resolvedFrom: result.isPrimary ? 'slug' : 'url_addizionali',
            requestedPath: path,
          },
        };
      }
    } catch (error) {

      ctx.internalServerError('Errore durante la risoluzione del path');
    }
  },

  /**
   * Restituisce statistiche sulla cache dei path
   * 
   * GET /api/resolve-path/stats
   */
  async stats(ctx) {
    try {
      const pathResolver = strapi.service('api::common.path-resolver');
      const stats = pathResolver.getStats();

      ctx.body = {
        data: stats,
      };
    } catch (error) {

      ctx.internalServerError('Errore durante il recupero delle statistiche');
    }
  },

  /**
   * Invalida la cache e la ricostruisce
   * 
   * POST /api/resolve-path/invalidate
   */
  async invalidate(ctx) {
    try {
      const pathResolver = strapi.service('api::common.path-resolver');
      await pathResolver.invalidate();

      ctx.body = {
        data: {
          message: 'Cache invalidata e ricostruita con successo',
          stats: pathResolver.getStats(),
        },
      };
    } catch (error) {

      ctx.internalServerError('Errore durante l\'invalidazione della cache');
    }
  },
};
