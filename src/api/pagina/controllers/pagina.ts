// path: src/api/pagina/controllers/pagina.ts
import { factories } from '@strapi/strapi';
import { url } from 'inspector';
import { Context } from 'koa';

interface Pagina {
  id: number;
  slug: string;
  title: string;
  tipoLayout: string;
  documentId: string;
  pagina?: { id: number } | null; // Riferimento al genitore
  ordineVisualizzazioneMenu?: number;
  mostraInMenu?: string[];
  url_addizionali?: any[]; // Popoliamo gli URL addizionali se presenti
  children?: Pagina[]; // Aggiungiamo un array per i figli
  [key: string]: any;
}

// Funzione helper ricorsiva con maxDepth
async function findDescendants(parentId: number, maxDepth: number = Infinity, currentDepth: number = 1): Promise<Pagina[]> {
  if (currentDepth > maxDepth) {
    return [];
  }
  
  // Usa la stessa logica del tree.js per trovare i children tramite la tabella di join
  const db = strapi.db.connection;
  
  // Query per trovare gli ID dei children dalla tabella di collegamento
  const linkResults = await db.raw(`
    SELECT pagina_id 
    FROM paginas_pagina_lnk 
    WHERE inv_pagina_id = ?
  `, [parentId]);
  
  // Estrai gli ID dalla risposta (il formato dipende dal database)
  let childIds: number[] = [];
  if (Array.isArray(linkResults)) {
    childIds = linkResults.map((row: any) => row.pagina_id);
  } else if (linkResults.rows) {
    childIds = linkResults.rows.map((row: any) => row.pagina_id);
  }
  
  if (childIds.length === 0) {
    return [];
  }
  
  // Trova i document_id di questi record
  const directCheck = await db.raw(`
    SELECT document_id 
    FROM paginas 
    WHERE id IN (${childIds.join(',')})
  `);
  
  let documentIds = [];
  if (Array.isArray(directCheck)) {
    documentIds = directCheck.map((row: any) => row.document_id);
  } else if (directCheck.rows) {
    documentIds = directCheck.rows.map((row: any) => row.document_id);
  }
  
  if (documentIds.length === 0) {
    return [];
  }
  
  // Trova le versioni PUBBLICATE di questi document_id
  const publishedVersions = await db.raw(`
    SELECT id 
    FROM paginas 
    WHERE document_id IN (${documentIds.map((id: string) => `'${id}'`).join(',')}) 
    AND published_at IS NOT NULL
  `);
  
  let publishedIds = [];
  if (Array.isArray(publishedVersions)) {
    publishedIds = publishedVersions.map((row: any) => row.id);
  } else if (publishedVersions.rows) {
    publishedIds = publishedVersions.rows.map((row: any) => row.id);
  }
  
  if (publishedIds.length === 0) {
    return [];
  }
  
  // Trova i figli diretti usando gli ID pubblicati
  const children: Pagina[] = await strapi.db.query('api::pagina.pagina').findMany({
    where: { 
      id: { $in: publishedIds }
    },
  });

  // Per ogni figlio, trova ricorsivamente i suoi discendenti
  for (const child of children) {
    child.children = await findDescendants(child.id, maxDepth, currentDepth + 1);
  }

  return children;
}

function reduceToSlugAndChildren(node: Pagina | Pagina[] | null): any {
  if (!node) return null;
  if (Array.isArray(node)) {
    return node.map(reduceToSlugAndChildren);
  }
  // Mantieni solo slug e ricorsione sui children
  return {
    title: node.title,
    slug: node.slug,
    tipoLayout: node.tipoLayout,
    id: node.id,
    documentId: node.documentId,
    ordineVisualizzazioneMenu: node.ordineVisualizzazioneMenu,
    mostraInMenu: node.mostraInMenu,
    url_addizionali: node['url_addizionali'] || [],
    children: node.children ? reduceToSlugAndChildren(node.children) : [],
  };
}

export default factories.createCoreController('api::pagina.pagina', ({ strapi }) => ({
  
  /**
   * Recupera l'albero genealogico di una pagina dato il suo slug.
   * @param {Context} ctx - Il contesto della richiesta Koa.
   */
  async getTree(ctx: Context) {
    const { slug } = ctx.params as { slug: string };
    const tree: Pagina[] = [];
    
    // Trova il nodo di partenza usando lo slug
    let currentNode: Pagina | null = await strapi.db.query('api::pagina.pagina').findOne({
      where: { slug },
      populate: { pagina: true, url_addizionali: true }, // Popola il genitore e gli URL addizionali
    });

    if (!currentNode) {
      return ctx.notFound('Pagina non trovata con lo slug fornito.');
    }

    // Cicla a ritroso per trovare tutti gli antenati
    while (currentNode) {
      // Estraiamo il genitore per il prossimo ciclo e teniamo il resto dei dati
      const { pagina: parent, ...attributes } = currentNode;
      
      // Aggiungiamo il nodo corrente all'inizio dell'array (per l'ordine corretto)
      tree.unshift(attributes);

      // Passiamo al genitore successivo
      if (parent) {
        // Se il genitore è già popolato ma i suoi dati sono parziali, potremmo doverlo ricaricare.
        // In questo caso, il populate semplice è sufficiente.
        currentNode = await strapi.db.query('api::pagina.pagina').findOne({
            where: { id: parent.id },
            populate: { pagina: true, url_addizionali: true },
        });
      } else {
        currentNode = null; // Fine della catena, usciamo dal ciclo
      }
    }
    const reducedTree = reduceToSlugAndChildren(tree);

    // Sanitize and transform the response
    const sanitizedTree = await this.sanitizeOutput(reducedTree, ctx);
    return this.transformResponse(sanitizedTree);
  },

   async getChildren(ctx: Context) {
    const { slug } = ctx.params as { slug: string };
    
    try {
      // 1. Trova l'ID della pagina genitore a partire dal suo slug
      const parentPage = await strapi.db.query('api::pagina.pagina').findOne({
        where: { 
          slug,
          publishedAt: { $notNull: true } // Solo genitori pubblicati
        },
        select: ['id'], // Ci serve solo l'ID
      });

      if (!parentPage) {
        return ctx.notFound('Pagina genitore non trovata.');
      }

      // 2. Trova tutte le pagine che hanno questo ID come genitore e sono pubblicate
      const children = await strapi.db.query('api::pagina.pagina').findMany({
        where: { 
          pagina: { id: parentPage.id },
          publishedAt: { $notNull: true } // Solo figli pubblicati
        },
        orderBy: { title: 'asc' }, // Ordina per title
      });

      const sanitizedChildren = await this.sanitizeOutput(children, ctx);
      return this.transformResponse(sanitizedChildren);
    } catch (error) {
      return ctx.internalServerError('Errore nel caricamento dei figli.');
    }
  },

   /**
   * Recupera il sotto-albero completo di una pagina dato il suo slug.
   * @param {Context} ctx - Il contesto della richiesta Koa.
   */

  async getSubtree(ctx: Context) {
    const { slug } = ctx.params as { slug: string };
    // Leggi maxDeep dalla query string, default Infinity
    const maxDeep = ctx.query.maxDeep ? parseInt(ctx.query.maxDeep as string, 10) : Infinity;

    // 1. Trova il nodo radice del nostro sotto-albero
    const rootNode: Pagina | null = await strapi.db.query('api::pagina.pagina').findOne({
      where: { slug },
      populate: { url_addizionali: true } // Popola gli URL addizionali se presenti
    });

    if (!rootNode) {
      return ctx.notFound('Pagina non trovata.');
    }

    // 2. Avvia la ricerca ricorsiva dei discendenti con maxDeep
    rootNode.children = await findDescendants(rootNode.id, maxDeep);

    const reducedTree = reduceToSlugAndChildren(rootNode);

    // 3. Sanitize e restituisci l'albero completo
    const sanitizedTree = await this.sanitizeOutput(reducedTree, ctx);
    return this.transformResponse(sanitizedTree);
  },

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

      } else {

      }

      // If `publishedAt` key is present, honor it. Otherwise force draft by setting null.
      const payload = Object.prototype.hasOwnProperty.call(data, 'publishedAt') 
        ? data 
        : { ...data, publishedAt: null };

      strapi.log.debug('[pagina.create] Payload publishedAt:', payload.publishedAt);

      // Use entityService per creare il documento
      const created = await strapi.entityService.create('api::pagina.pagina', {
        data: payload
      });

      strapi.log.debug('[pagina.create] Documento creato con ID:', created.id);
      
      // WORKAROUND: Aggiorna manualmente i creator fields perché entityService non usa ctx.state.user con API Token
      if (adminUser) {
  strapi.log.debug('[pagina.create] Aggiornamento manuale creator fields per user ID:', adminUser.id);
  strapi.log.debug('[pagina.create] DocumentId creato:', created.documentId);
        
        // IMPORTANTE: Aggiorna TUTTE le versioni (draft + published) con lo stesso documentId
        // perché quando pubblichi, Strapi crea sia la draft che la published version
        await strapi.db.connection('paginas')
          .where({ document_id: created.documentId })
          .update({
            created_by_id: adminUser.id,
            updated_by_id: adminUser.id
          });
        
        strapi.log.debug('[pagina.create] Creator fields aggiornati manualmente per tutte le versioni');
        
        // Verifica DB con query raw
        const dbCheck = await strapi.db.connection('paginas')
          .select('id', 'document_id', 'published_at', 'created_by_id', 'updated_by_id')
          .where({ document_id: created.documentId });
        strapi.log.debug('[pagina.create] DB Check dopo update:', JSON.stringify(dbCheck, null, 2));
      } else {

      }
      
      // Ricarica il documento con i creator fields popolati
      const updated = await strapi.entityService.findOne('api::pagina.pagina', created.id, {
        populate: ['createdBy', 'updatedBy']
      });

      const sanitized = await this.sanitizeOutput(updated, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {

      throw error;
    }
  },
  
}));