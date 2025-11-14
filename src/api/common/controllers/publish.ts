import type { Core } from '@strapi/strapi';

// ==========================================
// PUBLISH CONTROLLER (UNIVERSALE)
// ==========================================
// Permette di pubblicare documenti in bozza (draft) di qualsiasi collection
// che abbia draft & publish abilitato. Supporta locale specifico o tutte le locale.
//
// Endpoint: POST /api/publish/:contentType/:documentId?locale=en
// Esempio: POST /api/publish/pagina/abc123
//          POST /api/publish/articolo/xyz789?locale=*
// ==========================================

/**
 * Controller universale per publish di qualsiasi collection.
 * 
 * Path params:
 * - contentType: es. 'pagina', 'articolo' (viene convertito in api::pagina.pagina)
 * - documentId: ID del documento da pubblicare
 * 
 * Query params (opzionali):
 * - locale: specifica locale, oppure '*' per tutte le localizzazioni
 * 
 * Esempio: POST /api/publish/pagina/abc123
 * Esempio: POST /api/publish/articolo/xyz789?locale=en
 */
const controller: Core.Controller = {
  async publish(ctx) {
    strapi.log?.info?.('[publish] Universal publish handler invoked');
    
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

    strapi.log?.info?.(`[publish] Publishing ${uid} - documentId: ${documentId}${locale ? `, locale: ${locale}` : ''}`);

    try {
      // Publish del documento
      const result = await strapi.documents(uid as any).publish({
        documentId,
        ...(locale && { locale }), // Opzionale: locale specificato
      });

      strapi.log?.info?.(`[publish] ✅ Successfully published ${result.entries} entries`);
      
      ctx.body = { 
        success: true,
        documentId: result.documentId, 
        entries: result.entries,
        contentType: uid,
        message: 'Pubblicazione avvenuta con successo'
      };
    } catch (error: any) {
      strapi.log?.error?.(`[publish] ❌ Failed to publish ${uid}:`, error);
      return ctx.internalServerError(error.message || 'Failed to publish document');
    }
  },
};

export default controller;
