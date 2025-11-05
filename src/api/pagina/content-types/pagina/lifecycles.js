// src/api/pagina/content-types/pagina/lifecycles.js

const contentType = 'api::pagina.pagina';

module.exports = {
  /**
   * Prima dell'aggiornamento, salva i vecchi valori per confronto
   */
  async beforeUpdate(event) {
    const { where } = event.params;
    
    try {
      // Recupera l'entità corrente (prima della modifica)
      if (where.id || where.documentId) {
        const current = await strapi.entityService.findOne(
          contentType,
          where.id || where.documentId,
          {
            populate: {
              url_addizionali: {
                fields: ['path'],
              },
            },
          }
        );
        
        // Salva i vecchi valori nell'evento per usarli in afterUpdate
        event.state = event.state || {};
        event.state.oldEntity = current;
      }
    } catch (error) {

    }
  },

  /**
   * Dopo la creazione, aggiunge i path alla cache (solo se pubblicata)
   * E aggiunge il path di default agli url_addizionali
   */
  async afterCreate(event) {
    const { result } = event;
    
    try {

      // PathResolver: aggiunge i path alla cache
      const pathResolver = strapi.service('api::common.path-resolver');
      if (!pathResolver?.isInitialized) return;

      // ⚠️ IMPORTANTE: Aggiunge SOLO se pubblicata
      if (!result.publishedAt) {
        strapi.log.debug(`[PathResolver] Pagina "${result.slug}" non pubblicata, skip cache`);
        return;
      }

      // Aggiunge lo slug principale
      if (result.slug) {
        pathResolver.addPath(result.slug, result, contentType, true);
      }

      // Aggiunge gli url addizionali
      if (result.url_addizionali && Array.isArray(result.url_addizionali)) {
        for (const urlAdd of result.url_addizionali) {
          if (urlAdd.path) {
            pathResolver.addPath(urlAdd.path, result, contentType, false);
          }
        }
      }

    } catch (error) {

    }
  },

  /**
   * Dopo l'aggiornamento, aggiorna la cache in modo intelligente
   * E aggiunge/aggiorna il path di default agli url_addizionali
   */
  async afterUpdate(event) {
    const { result, state } = event;
    const oldEntity = state?.oldEntity;
    
    try {

      // PathResolver: aggiorna la cache
      const pathResolver = strapi.service('api::common.path-resolver');
      if (!pathResolver?.isInitialized) return;

      // CASO 1: Da pubblicata a non pubblicata (depubblicazione)
      if (oldEntity?.publishedAt && !result.publishedAt) {

        // Rimuove tutti i path della pagina
        if (oldEntity.slug) {
          pathResolver.removePath(oldEntity.slug);
        }
        if (oldEntity.url_addizionali && Array.isArray(oldEntity.url_addizionali)) {
          for (const urlAdd of oldEntity.url_addizionali) {
            if (urlAdd.path) pathResolver.removePath(urlAdd.path);
          }
        }
        return;
      }

      // CASO 2: Da non pubblicata a pubblicata (pubblicazione)
      if (!oldEntity?.publishedAt && result.publishedAt) {

        // Aggiunge i nuovi path
        if (result.slug) {
          pathResolver.addPath(result.slug, result, contentType, true);
        }
        if (result.url_addizionali && Array.isArray(result.url_addizionali)) {
          for (const urlAdd of result.url_addizionali) {
            if (urlAdd.path) {
              pathResolver.addPath(urlAdd.path, result, contentType, false);
            }
          }
        }
        return;
      }

      // CASO 3: Non pubblicata (nessuna azione sulla cache)
      if (!result.publishedAt) {
        strapi.log.debug(`[PathResolver] ⚪ Pagina non pubblicata, skip: ${result.slug}`);
        return;
      }

      // CASO 4: Pubblicata e modificata (aggiorna path)

      // Rimuove i vecchi path
      if (oldEntity) {
        if (oldEntity.slug) {
          pathResolver.removePath(oldEntity.slug);
        }
        if (oldEntity.url_addizionali && Array.isArray(oldEntity.url_addizionali)) {
          for (const urlAdd of oldEntity.url_addizionali) {
            if (urlAdd.path) pathResolver.removePath(urlAdd.path);
          }
        }
      }

      // Aggiunge i nuovi path
      if (result.slug) {
        pathResolver.addPath(result.slug, result, contentType, true);
      }
      if (result.url_addizionali && Array.isArray(result.url_addizionali)) {
        for (const urlAdd of result.url_addizionali) {
          if (urlAdd.path) {
            pathResolver.addPath(urlAdd.path, result, contentType, false);
          }
        }
      }

    } catch (error) {

    }
  },

  /**
   * Dopo la cancellazione, rimuove i path dalla cache
   */
  async afterDelete(event) {
    const { result } = event;
    
    try {
      const pathResolver = strapi.service('api::common.path-resolver');
      if (!pathResolver?.isInitialized) return;

      // Rimuove lo slug principale
      if (result.slug) {
        pathResolver.removePath(result.slug);
      }

      // Rimuove gli url addizionali
      if (result.url_addizionali && Array.isArray(result.url_addizionali)) {
        for (const urlAdd of result.url_addizionali) {
          if (urlAdd.path) {
            pathResolver.removePath(urlAdd.path);
          }
        }
      }
    } catch (error) {

    }
  },
};
