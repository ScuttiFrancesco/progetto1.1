/**
 * Tree controller
 * Builds a hierarchical structure for a given self-referential content-type.
 * Query params:
 *  contentType (required) -> UID e.g. api::pagina.pagina
 *  parentField (optional, default: parent) -> relation field name referencing same CT
 *  labelField (optional, default: title|name|id) -> field used for display
 */

module.exports = {
  async find(ctx) {
    strapi.log.debug('[tree-view] controller tree.find called with query %o', ctx.query);
    const { contentType, parentField, labelField, lazyLoad } = ctx.query;
    if (!contentType) {
      return ctx.badRequest('Missing contentType query parameter');
    }

    const isLazyLoad = lazyLoad === 'true';

    try {
      // Inline tree building logic to avoid service context issues
      const ctSchema = strapi.getModel(contentType);
      if (!ctSchema) {
        throw new Error(`Unknown content-type: ${contentType}`);
      }

      // Auto-detect parent field if not provided
      let actualParentField = parentField;
      if (!actualParentField) {
        // Find self-referential field
        for (const [fieldName, fieldConfig] of Object.entries(ctSchema.attributes)) {
          if (fieldConfig.type === 'relation' && 
              fieldConfig.target === contentType &&
              (fieldConfig.relation === 'oneToOne' || fieldConfig.relation === 'manyToOne')) {
            actualParentField = fieldName;
            break;
          }
        }
        // Common fallbacks
        if (!actualParentField) {
          const commonFields = ['parent', 'pagina', 'categoria', 'genitore'];
          for (const fieldName of commonFields) {
            if (ctSchema.attributes[fieldName] && ctSchema.attributes[fieldName].type === 'relation') {
              actualParentField = fieldName;
              break;
            }
          }
        }
      }

      if (!actualParentField) {
        throw new Error(`No self-referential field found in ${contentType}. Available fields: ${Object.keys(ctSchema.attributes).join(', ')}`);
      }

      // Auto-detect label field
      let labelKey = labelField;
      if (!labelKey || !ctSchema.attributes[labelKey]) {
        if (ctSchema.attributes.title) labelKey = 'title';
        else if (ctSchema.attributes.titolo) labelKey = 'titolo';
        else if (ctSchema.attributes.name) labelKey = 'name';
        else if (ctSchema.attributes.label) labelKey = 'label';
        else labelKey = 'id';
      }

      // Use strapi.db instead of entityService for manual routes
      const entries = await strapi.db.query(contentType).findMany({
        populate: [actualParentField],
        orderBy: { id: 'asc' },
        where: {
          publishedAt: { $notNull: true } // Solo contenuti pubblicati
        }
      });

      if (isLazyLoad) {
        // Per lazy loading, restituisci solo i nodi root con flag hasChildren
        const roots = [];
        const childCountMap = new Map();
        
        // Prima passa: conta i children per ogni nodo
        entries.forEach((e) => {
          const parentValue = e[actualParentField];
          let parentId = null;
          if (parentValue) {
            if (typeof parentValue === 'object') {
              parentId = parentValue.documentId || parentValue.id;
            } else {
              parentId = parentValue;
            }
          }
          if (parentId) {
            childCountMap.set(parentId, (childCountMap.get(parentId) || 0) + 1);
          }
        });
        
        // Seconda passa: crea i nodi root con hasChildren flag
        entries.forEach((e) => {
          const parentValue = e[actualParentField];
          let parentId = null;
          if (parentValue) {
            if (typeof parentValue === 'object') {
              parentId = parentValue.documentId || parentValue.id;
            } else {
              parentId = parentValue;
            }
          }
          
          // Solo nodi root (senza parent)
          if (!parentId) {
            const nodeId = e.documentId || e.id;
            const node = {
              id: nodeId,
              numericId: e.id,
              documentId: e.documentId,
              slug: e.slug, // Aggiungi slug per l'endpoint custom
              label: e[labelKey] ?? `#${e.id}`,
              parent: null,
              hasChildren: childCountMap.has(nodeId),
              children: [], // Vuoto per lazy loading
              raw: e,
            };
            
            roots.push(node);
          }
        });
        
        roots.sort((a, b) => a.label.localeCompare(b.label));
        ctx.body = { data: roots };
        return;
      }

      // Logica originale per caricamento completo
      const nodes = entries.map((e) => {
        const parentValue = e[actualParentField];
        let parentId = null;
        
        // Gestione migliore delle relazioni parent
        if (parentValue) {
          if (typeof parentValue === 'object') {
            // Se parentValue è un oggetto con dati completi
            parentId = parentValue.documentId || parentValue.id;
          } else {
            // Se parentValue è un ID diretto (numerico o stringa)
            parentId = parentValue;
          }
        }
        
        return {
          id: e.documentId || e.id, // Usa documentId se disponibile, altrimenti id numerico
          numericId: e.id, // Mantieni l'id numerico per compatibilità
          documentId: e.documentId, // Aggiungi documentId esplicito
          slug: e.slug, // Aggiungi slug per l'endpoint custom
          label: e[labelKey] ?? `#${e.id}`,
          parent: parentId,
          children: [],
          raw: e,
        };
      });

      // Build tree
      const byId = new Map();
      const byNumericId = new Map();
      
      // Popola le mappe con entrambi gli ID per gestire relazioni miste
      nodes.forEach((n) => {
        byId.set(n.id, n);
        if (n.numericId) {
          byNumericId.set(n.numericId, n);
        }
        if (n.documentId) {
          byId.set(n.documentId, n);
        }
      });
      
      const roots = [];
      
      nodes.forEach((n) => {
        if (n.parent) {
          // Cerca il parent usando sia documentId che ID numerico
          let parentNode = byId.get(n.parent) || byNumericId.get(n.parent);
          
          if (parentNode) {
            parentNode.children.push(n);
          } else {
            // Se il parent non è trovato, aggiungi ai root
            roots.push(n);
          }
        } else {
          roots.push(n);
        }
      });

      // Sort children recursively alphabetically by label
      const sortRec = (arr) => {
        arr.sort((a, b) => a.label.localeCompare(b.label));
        arr.forEach((c) => sortRec(c.children));
      };
      sortRec(roots);
      
      ctx.body = { data: roots };
    } catch (e) {

      ctx.throw(500, e.message);
    }
  },

  async findChildren(ctx) {
    strapi.log.debug('[tree-view] controller tree.findChildren called with params %o and query %o', ctx.params, ctx.query);
    const { parentId } = ctx.params;
    const { contentType, parentField, labelField } = ctx.query;
    
    if (!contentType) {
      return ctx.badRequest('Missing contentType query parameter');
    }
    
    if (!parentId) {
      return ctx.badRequest('Missing parentId parameter');
    }

    try {
      const ctSchema = strapi.getModel(contentType);
      if (!ctSchema) {
        throw new Error(`Unknown content-type: ${contentType}`);
      }

      // Auto-detect parent field
      let actualParentField = parentField;
      if (!actualParentField) {
        for (const [fieldName, fieldConfig] of Object.entries(ctSchema.attributes)) {
          if (fieldConfig.type === 'relation' && 
              fieldConfig.target === contentType &&
              (fieldConfig.relation === 'oneToOne' || fieldConfig.relation === 'manyToOne')) {
            actualParentField = fieldName;
            break;
          }
        }
        if (!actualParentField) {
          const commonFields = ['parent', 'pagina', 'categoria', 'genitore'];
          for (const fieldName of commonFields) {
            if (ctSchema.attributes[fieldName] && ctSchema.attributes[fieldName].type === 'relation') {
              actualParentField = fieldName;
              break;
            }
          }
        }
      }

      if (!actualParentField) {
        throw new Error(`No self-referential field found in ${contentType}`);
      }

      // Auto-detect label field
      let labelKey = labelField;
      if (!labelKey || !ctSchema.attributes[labelKey]) {
        if (ctSchema.attributes.title) labelKey = 'title';
        else if (ctSchema.attributes.titolo) labelKey = 'titolo';
        else if (ctSchema.attributes.name) labelKey = 'name';
        else if (ctSchema.attributes.label) labelKey = 'label';
        else labelKey = 'id';
      }

      // Prima, cerchiamo l'entry parent per ottenere sia documentId che numericId
      const parentEntry = await strapi.db.query(contentType).findOne({
        where: {
          $or: [
            { documentId: parentId },
            { id: parentId }
          ]
        },
        select: ['id', 'documentId']
      });

      if (!parentEntry) {
        ctx.body = { data: [] };
        return;
      }

      // Carica i children usando la tabella di collegamento
      // Per Strapi v5, le relazioni oneToOne usano spesso tabelle di collegamento
      let children = [];
      
      try {
        // Query diretta sulla tabella di collegamento paginas_pagina_lnk
        const db = strapi.db.connection;
        
        const linkResults = await db.raw(`
          SELECT pagina_id 
          FROM paginas_pagina_lnk 
          WHERE inv_pagina_id = ?
        `, [parentEntry.id]);
        
        // Estrai gli ID dalla risposta (il formato dipende dal database)
        let childIds = [];
        if (Array.isArray(linkResults)) {
          childIds = linkResults.map(row => row.pagina_id);
        } else if (linkResults.rows) {
          childIds = linkResults.rows.map(row => row.pagina_id);
        }
        
        if (childIds.length > 0) {
          // Filtriamo solo quelli pubblicati
          children = await strapi.db.query(contentType).findMany({
            where: {
              id: { $in: childIds },
              publishedAt: { $notNull: true }
            },
            orderBy: { [labelKey]: 'asc' },
          });
        }
        
      } catch (error) {

      }

      // Per ogni child, verifica se ha a sua volta dei children (per il flag hasChildren)
      const childIds = children.map(c => c.documentId || c.id);
      let childCountMap = new Map();
      
      if (childIds.length > 0) {
        const grandChildren = await strapi.db.query(contentType).findMany({
          where: {
            [actualParentField]: { $in: childIds },
            publishedAt: { $notNull: true }
          },
          select: ['id', 'documentId', actualParentField],
        });
        
        grandChildren.forEach((gc) => {
          const parentValue = gc[actualParentField];
          let grandParentId = null;
          if (parentValue) {
            if (typeof parentValue === 'object') {
              grandParentId = parentValue.documentId || parentValue.id;
            } else {
              grandParentId = parentValue;
            }
          }
          if (grandParentId) {
            childCountMap.set(grandParentId, (childCountMap.get(grandParentId) || 0) + 1);
          }
        });
      }

      const nodes = children.map((child) => ({
        id: child.documentId || child.id,
        numericId: child.id,
        documentId: child.documentId,
        label: child[labelKey] ?? `#${child.id}`,
        parent: parentId,
        hasChildren: childCountMap.has(child.documentId || child.id),
        children: [], // Vuoto per lazy loading
        raw: child,
      }));

      ctx.body = { data: nodes };
    } catch (e) {

      ctx.throw(500, e.message);
    }
  },
};
