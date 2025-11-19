/**
 * new controller
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController('api::new.new', ({ strapi }) => ({

  async create(ctx: Context) {
    const { data } = ctx.request.body ?? {};
    if (!data) return ctx.badRequest("Missing 'data' in request body");

    try {
      // Prendi l'email dalla query string, altrimenti usa quella di default
      const userEmail = ctx.query.userEmail || 'frarapto87@gmail.com';
      
      // Trova l'admin user per il tracking
      const adminUser = await strapi.query('admin::user').findOne({ 
        where: { email: userEmail } 
      });

      if (adminUser) {
        // Imposta l'admin user nel contesto per popolare createdBy/updatedBy
        ctx.state.user = adminUser;
        strapi.log.debug('[new.create] Admin user trovato:', adminUser.email);
      } else {
        strapi.log.warn('[new.create] Admin user non trovato per email:', userEmail);
      }

      // If `publishedAt` key is present, honor it. Otherwise force draft by setting null.
      const payload = Object.prototype.hasOwnProperty.call(data, 'publishedAt') 
        ? data 
        : { ...data, publishedAt: null };

      strapi.log.debug('[new.create] Payload publishedAt:', payload.publishedAt);

      // Use entityService per creare il documento
      const created = await strapi.entityService.create('api::new.new', {
        data: payload
      });

      strapi.log.debug('[new.create] Documento creato con ID:', created.id);
      
      // WORKAROUND: Aggiorna manualmente i creator fields perché entityService non usa ctx.state.user con API Token
      if (adminUser) {
        strapi.log.debug('[new.create] Aggiornamento manuale creator fields per user ID:', adminUser.id);
        strapi.log.debug('[new.create] DocumentId creato:', created.documentId);
        
        // IMPORTANTE: Aggiorna TUTTE le versioni (draft + published) con lo stesso documentId
        // perché quando pubblichi, Strapi crea sia la draft che la published version
        await strapi.db.connection('news')
          .where({ document_id: created.documentId })
          .update({
            created_by_id: adminUser.id,
            updated_by_id: adminUser.id
          });
        
        strapi.log.debug('[new.create] Creator fields aggiornati manualmente per tutte le versioni');
        
        // Verifica DB con query raw
        const dbCheck = await strapi.db.connection('news')
          .select('id', 'document_id', 'published_at', 'created_by_id', 'updated_by_id')
          .where({ document_id: created.documentId });
        strapi.log.debug('[new.create] DB Check dopo update:', JSON.stringify(dbCheck, null, 2));
      } else {
        strapi.log.warn('[new.create] Nessun admin user, creator fields non aggiornati');
      }
      
      // Ricarica il documento con i creator fields popolati
      const updated = await strapi.entityService.findOne('api::new.new', created.id, {
        populate: ['createdBy', 'updatedBy']
      });

      const sanitized = await this.sanitizeOutput(updated, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {
      strapi.log.error('[new.create] Errore durante la creazione:', error);
      throw error;
    }
  }
}));
