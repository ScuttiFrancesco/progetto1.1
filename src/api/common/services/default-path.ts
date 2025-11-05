// ==========================================
// DEFAULT PATH SERVICE
// ==========================================
// Genera automaticamente path gerarchici per collection con url_addizionali.
// Risale la catena di parent (relazioni self-referencing oneToOne) e costruisce
// il path completo concatenando gli slug (es. /parent/child/grandchild).
//
// Features:
// - Auto-detect del campo parent (relazione oneToOne self-referencing)
// - Costruzione ricorsiva del path dalla gerarchia
// - Inserimento automatico in url_addizionali come primo elemento
// - Aggiornamento in cascata dei discendenti quando lo slug del parent cambia
//
// Utilizzo:
// - buildDefaultPath(slug, contentType, entityId) - Costruisce il path gerarchico
// - findParentField(contentType) - Trova il campo parent della collection
// ==========================================

// path: src/api/common/services/default-path.ts

/**
 * Service per generare automaticamente il path di default
 * per tutte le collection con componente url_addizionali
 */

export default () => ({
  /**
   * Trova il campo parent per una collection
   * (cerca una relazione oneToOne verso la stessa collection)
   */
  findParentField(contentType: string): string | null {
    try {
      const schema = strapi.contentType(contentType as any);
      if (!schema?.attributes) return null;

      // Cerca una relazione self-referencing
      for (const [fieldName, field] of Object.entries(schema.attributes)) {
        if (
          (field as any).type === 'relation' &&
          (field as any).relation === 'oneToOne' &&
          (field as any).target === contentType
        ) {
          return fieldName;
        }
      }

      return null;
    } catch (error) {

      return null;
    }
  },

  /**
   * Costruisce il path di default dalla gerarchia dei parent
   * @param slug - Lo slug dell'entità
   * @param contentType - Il tipo di content (es: 'api::pagina.pagina')
   * @param entityId - L'ID dell'entità (opzionale, usato per evitare di ricercare)
   * @returns Il path costruito dalla gerarchia
   */
  async buildDefaultPath(slug: string, contentType: string, entityId?: number): Promise<string | null> {
    try {
      // Trova il campo parent per questa collection
      const parentField = this.findParentField(contentType);
      
      if (!parentField) {
        strapi.log.debug(`[DefaultPath] Nessun campo parent trovato per ${contentType}`);
        // Se non c'è parent, usa solo lo slug
        return slug;
      }

      // Trova l'entità corrente (usa l'ID se fornito, altrimenti cerca per slug)
      let entity;
      if (entityId) {
        entity = await strapi.db.query(contentType).findOne({
          where: { id: entityId },
          populate: { [parentField]: true },
        });
      } else {
        entity = await strapi.db.query(contentType).findOne({
          where: { slug },
          populate: { [parentField]: true },
        });
      }

      if (!entity) {
        strapi.log.debug(`[DefaultPath] Entità non trovata per slug: ${slug}`);
        return null;
      }

      // Array per costruire il path (ordine: root -> leaf)
      const pathParts: string[] = [];
      let currentNode = entity;

      // Risali la gerarchia fino alla radice
      let depth = 0;
      const maxDepth = 10; // Evita loop infiniti
      
      while (currentNode && depth < maxDepth) {
        pathParts.unshift(currentNode.slug); // Aggiungi all'inizio
        
        // Passa al parent
        if (currentNode[parentField]) {
          currentNode = await strapi.db.query(contentType).findOne({
            where: { id: currentNode[parentField].id },
            populate: { [parentField]: true },
          });
        } else {
          currentNode = null;
        }
        
        depth++;
      }

      // Costruisci il path completo
      const defaultPath = pathParts.join('/');

      return defaultPath;

    } catch (error) {

      return null;
    }
  },

  /**
   * Verifica se un'entità ha il componente url_addizionali
   */
  hasUrlAddizionaliComponent(contentType: string): boolean {
    try {
      const schema = strapi.contentType(contentType as any);
      return !!schema?.attributes?.url_addizionali;
    } catch {
      return false;
    }
  },

  /**
   * Aggiunge o aggiorna il path di default negli url_addizionali
   * @param entity - L'entità da aggiornare
   * @param defaultPath - Il path di default generato
   * @returns Gli url_addizionali aggiornati
   */
  async updateUrlAddizionali(entity: any, defaultPath: string): Promise<any[]> {
    const urlAddizionali = entity.url_addizionali || [];
    
    // Verifica se esiste già un path di default (potremmo marcarlo in qualche modo)
    // Per semplicità, se non ci sono url_addizionali o il primo non corrisponde, aggiungiamo
    const existingPaths = urlAddizionali.map((item: any) => item.path);
    
    // Se il path di default non esiste già, aggiungilo come primo elemento
    if (!existingPaths.includes(defaultPath)) {
      // Rimuovi eventuali vecchi path di default (opzionale, dipende dalla logica)
      // Per ora semplicemente aggiungiamo all'inizio
      return [
        { path: defaultPath },
        ...urlAddizionali
      ];
    }
    
    return urlAddizionali;
  }
});
