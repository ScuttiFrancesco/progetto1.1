import type { Core } from '@strapi/strapi';

// ==========================================
// UNPUBLISH CONTROLLER (UNIVERSALE)
// ==========================================
// Permette di spubblicare (unpublish) documenti di qualsiasi collection
// che abbia draft & publish abilitato. Supporta locale specifico o tutte le locale.
//
// Endpoint: POST /api/unpublish/:contentType/:documentId?locale=en
// Esempio: POST /api/unpublish/pagina/abc123
//          POST /api/unpublish/articolo/xyz789?locale=*
// ==========================================

/**
 * Controller universale per unpublish di qualsiasi collection.
 * 
 * Path params:
 * - contentType: es. 'pagina', 'articolo' (viene convertito in api::pagina.pagina)
 * - documentId: ID del documento da unpublish
 * 
 * Query params (opzionali):
 * - locale: specifica locale, oppure '*' per tutte le localizzazioni
 * 
 * Esempio: POST /api/unpublish/pagina/abc123
 * Esempio: POST /api/unpublish/articolo/xyz789?locale=en
 */
const controller: Core.Controller = {
  async unpublish(ctx) {
    strapi.log?.info?.('[unpublish] Universal unpublish handler invoked');
    
    const { contentType, documentId } = ctx.params as { 
      contentType?: string; 
      documentId?: string;
    };
    const { locale } = ctx.query as { locale?: string };

    // Validazione: contentType e documentId obbligatori
    if (!contentType) {
      return ctx.badRequest('Path parameter "contentType" is required');
    }
    if (!documentId) {
      return ctx.badRequest('Path parameter "documentId" is required');
    }

    // Costruisci UID completo (es. 'pagina' -> 'api::pagina.pagina')
    const uid = `api::${contentType}.${contentType}`;
    
    // Validazione: verifica che il contentType esista
    const model = strapi.contentType(uid as any);
    if (!model) {
      return ctx.badRequest(`Content type "${uid}" not found. Available types: check your Strapi models.`);
    }

    // Validazione: verifica che abbia draftAndPublish abilitato
    if (!model.options?.draftAndPublish) {
      return ctx.badRequest(`Content type "${uid}" does not have draft & publish enabled`);
    }

    strapi.log?.info?.(`[unpublish] Unpublishing ${uid} - documentId: ${documentId}${locale ? `, locale: ${locale}` : ''}`);

    try {
      // Unpublish del documento
      const result = await strapi.documents(uid as any).unpublish({
        documentId,
        ...(locale && { locale }), // Opzionale: locale specificato
      });

      strapi.log?.info?.(`[unpublish] ✅ Successfully unpublished ${result.entries} entries`);
      
      ctx.body = { 
        success: true,
        documentId: result.documentId, 
        entries: result.entries,
        contentType: uid,
        message: 'Spubblicazione avvenuta con successo'
      };
    } catch (error: any) {
      strapi.log?.error?.(`[unpublish] ❌ Failed to unpublish ${uid}:`, error);
      return ctx.internalServerError(error.message || 'Failed to unpublish document');
    }
  },
};

export default controller;
