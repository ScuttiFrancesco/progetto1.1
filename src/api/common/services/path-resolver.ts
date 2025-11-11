// ==========================================
// PATH RESOLVER SERVICE
// ==========================================
// Mantiene una mappa in-memory O(1) di tutti i path (slug + url_addizionali)
// per risolvere velocemente quale entity corrisponde ad un dato path.
//
// Features:
// - Cache in-memory per lookup O(1) su migliaia di path
// - Gestione path duplicati (ritorna array o singolo risultato)
// - Filtro automatico per tipoLayout='statico' (evita collisioni con pagine dinamiche)
// - Invalidazione automatica su create/update/delete via global lifecycle
// - Supporto multi-collection (pagina, comunicati-stampa, etc.)
//
// Utilizzo:
// - await pathResolver.initialize() - Inizializza la cache
// - pathResolver.resolvePath('/path', filterTipoLayout=true) - Risolve un path
// - pathResolver.invalidate() - Invalida e ricostruisce la cache
// ==========================================

/**
 * Path Resolver Service
 * 
 * Mantiene una mappa in-memory di tutti i path (slug + url_addizionali)
 * per risolvere velocemente quale pagina corrisponde ad un dato path.
 */

interface PathMap {
  [path: string]: {
    slug: string;
    documentId: string;
    id: string | number;
    isPrimary: boolean; // true se è lo slug principale, false se url addizionale
    contentType: string; // es: 'api::pagina.pagina', 'api::comunicati-stampa.comunicati-stampa'
    tipoLayout?: string; // Solo per api::pagina.pagina
  } | {
    slug: string;
    documentId: string;
    id: string | number;
    isPrimary: boolean;
    contentType: string;
    tipoLayout?: string;
  }[];
}

export default ({ strapi }: { strapi: any }) => ({
  pathMap: null as PathMap | null,
  isInitialized: false,
  isInitializing: false,

  /**
   * Inizializza la mappa dei path
   */
  async initialize() {
    if (this.isInitializing) {
      // Aspetta che l'inizializzazione in corso finisca
      await this.waitForInitialization();
      return;
    }

    this.isInitializing = true;
    
    try {

      const startTime = Date.now();
      
      // Ottiene tutte le collection types che hanno il campo 'slug' e 'url_addizionali'
      const contentTypes = Object.keys(strapi.contentTypes).filter(uid => {
        const contentType = strapi.contentTypes[uid];
        // Solo collection types (non single types)
        if (contentType.kind !== 'collectionType') return false;
        
        const attributes = contentType.attributes || {};
        // Deve avere almeno il campo 'slug'
        return attributes.slug !== undefined;
      });

      this.pathMap = {};
      let totalPaths = 0;
      let totalEntities = 0;

      // Itera su ogni collection type
      for (const contentTypeUID of contentTypes) {
        try {
          const contentType = strapi.contentTypes[contentTypeUID];
          const attributes = contentType.attributes || {};
          const hasUrlAddizionali = attributes.url_addizionali !== undefined;

          // Query con status: 'published' per Strapi v5
          // Include tipoLayout per api::pagina.pagina
          const fields: any = ['id', 'slug', 'documentId', 'publishedAt'];
          if (contentTypeUID === 'api::pagina.pagina' && attributes.tipoLayout) {
            fields.push('tipoLayout');
          }

          const allEntities: any = await strapi.entityService.findMany(contentTypeUID as any, {
            fields,
            status: 'published', // Solo versioni pubblicate in Strapi v5
            populate: hasUrlAddizionali ? {
              url_addizionali: {
                fields: ['path'],
              },
            } : {},
            limit: -1, // Tutte le entità
          });

          if (!allEntities || !Array.isArray(allEntities)) {

            continue;
          }

          if (allEntities.length > 0) {

          }

          // Filtro manualmente solo le entità pubblicate (doppia sicurezza)
          const entities = allEntities.filter(e => e.publishedAt !== null && e.publishedAt !== undefined);

          // Log di debug per verificare lo stato delle entità

          if (entities.length > 0) {
            entities.forEach(e => {

            });
          }

          totalEntities += entities.length;

          // Costruisce la mappa per questa collection
          for (const entity of entities) {
            // Aggiunge lo slug principale
            if (entity.slug) {
              const normalizedSlug = this.normalizePath(entity.slug);
              
              const pathEntry = {
                slug: entity.slug,
                documentId: entity.documentId,
                id: entity.id,
                isPrimary: true,
                contentType: contentTypeUID,
                ...(entity.tipoLayout && { tipoLayout: entity.tipoLayout }),
              };
              
              // Controlla duplicati tra collection diverse
              if (this.pathMap[normalizedSlug]) {
                // Se esiste già, trasforma in array
                const existing = this.pathMap[normalizedSlug];
                if (Array.isArray(existing)) {
                  existing.push(pathEntry);

                } else {
                  this.pathMap[normalizedSlug] = [existing, pathEntry];

                }
              } else {
                this.pathMap[normalizedSlug] = pathEntry;
                totalPaths++;
              }
            }

            // Aggiunge gli url addizionali (se presenti)
            if (hasUrlAddizionali && entity.url_addizionali && Array.isArray(entity.url_addizionali)) {
              for (const urlAdd of entity.url_addizionali) {
                if (urlAdd.path) {
                  const normalizedPath = this.normalizePath(urlAdd.path);
                  
                  const pathEntry = {
                    slug: entity.slug,
                    documentId: entity.documentId,
                    id: entity.id,
                    isPrimary: false,
                    contentType: contentTypeUID,
                    ...(entity.tipoLayout && { tipoLayout: entity.tipoLayout }),
                  };
                  
                  // Controlla duplicati
                  if (this.pathMap[normalizedPath]) {
                    // Se esiste già, trasforma in array
                    const existing = this.pathMap[normalizedPath];
                    if (Array.isArray(existing)) {
                      existing.push(pathEntry);

                    } else {
                      this.pathMap[normalizedPath] = [existing, pathEntry];

                    }
                  } else {
                    this.pathMap[normalizedPath] = pathEntry;
                    totalPaths++;
                  }
                }
              }
            }
          }
        } catch (error) {

        }
      }

      this.isInitialized = true;
      const duration = Date.now() - startTime;

    } catch (error) {

      this.pathMap = null;
      this.isInitialized = false;
    } finally {
      this.isInitializing = false;
    }
  },

  /**
   * Aspetta che l'inizializzazione finisca
   */
  async waitForInitialization(maxWait = 10000) {
    const startTime = Date.now();
    while (this.isInitializing && Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  },

  /**
   * Normalizza un path (rimuove slash iniziali/finali, lowercase)
   */
  normalizePath(path: string): string {
    if (!path) return '';
    return path
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, ''); // Rimuove slash iniziali e finali
  },

  /**
   * Risolve un path e restituisce la pagina corrispondente
   * Se ci sono più risultati, filtra per tipoLayout='statico' (solo per api::pagina.pagina)
   */
  async resolvePath(path: string, filterTipoLayout: boolean = true) {
    // Se la mappa non è inizializzata, la inizializza
    if (!this.isInitialized && !this.isInitializing) {
      await this.initialize();
    }

    const normalizedPath = this.normalizePath(path);

    // Cerca nella mappa (O(1))
    if (this.pathMap && this.pathMap[normalizedPath]) {
      const result = this.pathMap[normalizedPath];
      
      // Se è un array (path duplicato)
      if (Array.isArray(result)) {
        // Se il filtro è attivo e c'è almeno una pagina con tipoLayout
        if (filterTipoLayout) {
          const staticPage = result.find(r => r.tipoLayout === 'pagina');
          if (staticPage) {

            return staticPage;
          }
        }
        
        // Altrimenti restituisce tutti i risultati

        return result;
      }
      
      // Se è un singolo risultato, restituiscilo
      return result;
    }

    // Fallback: cerca nel database (più lento)

    return await this.findPathInDatabase(normalizedPath, filterTipoLayout);
  },

  /**
   * Fallback: cerca il path direttamente nel database
   */
  async findPathInDatabase(normalizedPath: string, filterTipoLayout: boolean = true) {
    try {
      // Ottiene tutte le collection types con slug
      const contentTypes = Object.keys(strapi.contentTypes).filter(uid => {
        const contentType = strapi.contentTypes[uid];
        if (contentType.kind !== 'collectionType') return false;
        const attributes = contentType.attributes || {};
        return attributes.slug !== undefined;
      });

      const results: any[] = [];

      // Cerca per slug in tutte le collection
      for (const contentTypeUID of contentTypes) {
        const contentType = strapi.contentTypes[contentTypeUID];
        const attributes = contentType.attributes || {};
        
        const fields: any = ['id', 'slug', 'documentId', 'publishedAt'];
        if (contentTypeUID === 'api::pagina.pagina' && attributes.tipoLayout) {
          fields.push('tipoLayout');
        }

        const allEntities: any = await strapi.entityService.findMany(contentTypeUID as any, {
          filters: {
            slug: normalizedPath,
          },
          fields,
          status: 'published',
          limit: -1,
        });

        if (allEntities && allEntities.length > 0) {
          // Filtra solo le versioni pubblicate
          const published = allEntities.filter(e => e.publishedAt !== null);
          
          for (const entity of published) {
            results.push({
              slug: entity.slug,
              documentId: entity.documentId,
              id: entity.id,
              isPrimary: true,
              contentType: contentTypeUID,
              ...(entity.tipoLayout && { tipoLayout: entity.tipoLayout }),
            });
          }
        }
      }

      // Cerca negli url addizionali
      for (const contentTypeUID of contentTypes) {
        const contentType = strapi.contentTypes[contentTypeUID];
        const attributes = contentType.attributes || {};
        const hasUrlAddizionali = attributes.url_addizionali !== undefined;

        if (!hasUrlAddizionali) continue;

        const fields: any = ['id', 'slug', 'documentId', 'publishedAt'];
        if (contentTypeUID === 'api::pagina.pagina' && attributes.tipoLayout) {
          fields.push('tipoLayout');
        }

        const allEntities: any = await strapi.entityService.findMany(contentTypeUID as any, {
          populate: {
            url_addizionali: {
              fields: ['path'],
            },
          },
          fields,
          status: 'published',
        });

        if (!allEntities || !Array.isArray(allEntities)) continue;

        // Filtra solo le versioni pubblicate
        const entities = allEntities.filter(e => e.publishedAt !== null);

        for (const entity of entities) {
          if (entity.url_addizionali && Array.isArray(entity.url_addizionali)) {
            for (const urlAdd of entity.url_addizionali) {
              if (urlAdd.path && this.normalizePath(urlAdd.path) === normalizedPath) {
                results.push({
                  slug: entity.slug,
                  documentId: entity.documentId,
                  id: entity.id,
                  isPrimary: false,
                  contentType: contentTypeUID,
                  ...(entity.tipoLayout && { tipoLayout: entity.tipoLayout }),
                });
              }
            }
          }
        }
      }

      // Se non ci sono risultati, prova fallback slug search
      if (results.length === 0) {
        return await this.fallbackSlugSearch(normalizedPath);
      }

      // Se c'è un solo risultato
      if (results.length === 1) {
        return results[0];
      }

      // Se ci sono più risultati, filtra per tipoLayout='statico'
      if (filterTipoLayout) {
        const staticPage = results.find(r => r.tipoLayout === 'pagina');
        if (staticPage) {

          return staticPage;
        }
      }

      // Restituisce tutti i risultati

      return results;
    } catch (error) {

      return null;
    }
  },

  /**
   * Fallback: cerca per slug l'ultimo segmento del path
   * Cerca solo nelle collection specificate nella whitelist
   */
  async fallbackSlugSearch(normalizedPath: string) {
    try {
      // Estrai lo slug (ultimo segmento del path)
      const pathSegments = normalizedPath.split('/').filter(Boolean);
      if (pathSegments.length === 0) return null;
      
      const slug = pathSegments[pathSegments.length - 1];
      
      // Whitelist delle collection da cercare (in ordine di priorità)
      // Puoi modificare questa lista aggiungendo/rimuovendo collection
      const collectionWhitelist = [
        'api::comunicati-stampa.comunicati-stampa',
        'api::new.new',
        'api::articoli.articoli',
        'api::appuntamenti.appuntamenti',
        'api::appuntamenti-storia.appuntamenti-storia',
        'api::atti.atti',
        'api::comunicazioni-cocer.comunicazioni-cocer',
        'api::contatti.contatti',
        'api::enti.enti',
        'api::eventi.eventi',
        'api::ordine-del-giorno.ordine-del-giorno',
        'api::gare-appalto.gare-appalto',
        'api::incarichi-vertice.incarichi-vertice',
        'api::medaglie.medaglie',
        // Aggiungi altre collection qui se necessario
      ];

      // Cerca lo slug in ogni collection della whitelist
      for (const contentTypeUID of collectionWhitelist) {
        // Verifica che la collection esista
        const contentType = strapi.contentTypes[contentTypeUID];
        if (!contentType || contentType.kind !== 'collectionType') continue;

        const attributes = contentType.attributes || {};
        if (!attributes.slug) continue;

        // Prepara i campi da recuperare
        const fields: any = ['id', 'slug', 'documentId', 'publishedAt'];
        
        // Aggiungi campi comuni se esistono
        if (attributes.title) fields.push('title');
        if (attributes.titolo) fields.push('titolo');
        if (attributes.titoloBreve) fields.push('titoloBreve');

        const entities: any = await strapi.entityService.findMany(contentTypeUID as any, {
          filters: {
            slug: slug,
          },
          fields,
          status: 'published',
          limit: 1,
        });

        if (entities && entities.length > 0 && entities[0].publishedAt) {
          const entity = entities[0];
          
          return {
            slug: entity.slug,
            documentId: entity.documentId,
            id: entity.id,
            isPrimary: true,
            contentType: contentTypeUID,
            resolvedFrom: 'fallback-slug',
            // Includi il campo title/titolo se presente
            ...(entity.title && { title: entity.title }),
            ...(entity.titolo && { titolo: entity.titolo }),
            ...(entity.titoloBreve && { titoloBreve: entity.titoloBreve }),
          };
        }
      }

      // Se non trova nulla, ritorna null (404)
      return null;
    } catch (error) {

      return null;
    }
  },

  /**
   * Aggiorna un singolo path nella mappa
   */
  updatePath(oldPath: string, newPath: string, entity: any, contentType: string) {
    if (!this.pathMap || !this.isInitialized) return;

    const normalizedOld = this.normalizePath(oldPath);
    const normalizedNew = this.normalizePath(newPath);

    // Rimuove il vecchio path
    if (normalizedOld && this.pathMap[normalizedOld]) {
      delete this.pathMap[normalizedOld];
    }

    // Aggiunge il nuovo path
    if (normalizedNew) {
      this.pathMap[normalizedNew] = {
        slug: entity.slug,
        documentId: entity.documentId,
        id: entity.id,
        isPrimary: oldPath === entity.slug,
        contentType: contentType,
      };
    }
  },

  /**
   * Rimuove un path dalla mappa
   */
  removePath(path: string) {
    if (!this.pathMap || !this.isInitialized) return;
    
    const normalizedPath = this.normalizePath(path);
    if (this.pathMap[normalizedPath]) {
      delete this.pathMap[normalizedPath];
    }
  },

  /**
   * Aggiunge un path alla mappa
   */
  addPath(path: string, entity: any, contentType: string, isPrimary = false) {
    if (!this.pathMap || !this.isInitialized) return;

    const normalizedPath = this.normalizePath(path);
    if (normalizedPath) {
      this.pathMap[normalizedPath] = {
        slug: entity.slug,
        documentId: entity.documentId,
        id: entity.id,
        isPrimary,
        contentType: contentType,
      };
    }
  },

  /**
   * Invalida la cache (forza re-inizializzazione)
   */
  async invalidate() {

    this.pathMap = null;
    this.isInitialized = false;
    await this.initialize();
  },

  /**
   * Restituisce statistiche sulla mappa
   */
  getStats() {
    if (!this.pathMap) {
      return {
        initialized: false,
        totalPaths: 0,
        primaryPaths: 0,
        additionalPaths: 0,
        duplicatePaths: 0,
      };
    }

    const pathEntries = Object.values(this.pathMap);
    let totalPaths = 0;
    let primaryPaths = 0;
    let additionalPaths = 0;
    let duplicatePaths = 0;

    pathEntries.forEach(entry => {
      if (Array.isArray(entry)) {
        // Path duplicato
        duplicatePaths++;
        totalPaths += entry.length;
        entry.forEach(e => {
          if (e.isPrimary) primaryPaths++;
          else additionalPaths++;
        });
      } else {
        // Path singolo
        totalPaths++;
        if (entry.isPrimary) primaryPaths++;
        else additionalPaths++;
      }
    });

    return {
      initialized: this.isInitialized,
      totalPaths,
      primaryPaths,
      additionalPaths,
      duplicatePaths,
    };
  },
});
