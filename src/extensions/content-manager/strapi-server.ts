type DocumentId = string;

declare const strapi: any;

type PaginaEntry = {
  id?: number;
  documentId?: DocumentId;
  pagina?: {
    id?: number;
    documentId?: DocumentId;
  } | null;
};

const CONTENT_TYPE_UID = 'api::pagina.pagina';

type ReorderResult = {
  ordered: DocumentId[];
  skipped: DocumentId[];
};

const sortDocumentIdsByHierarchy = async (strapi: any, documentIds: DocumentId[]): Promise<ReorderResult> => {
  if (documentIds.length <= 1) {
    return { ordered: documentIds, skipped: [] };
  }

  const entries: PaginaEntry[] = await strapi.entityService.findMany(CONTENT_TYPE_UID, {
    fields: ['id', 'documentId'],
    filters: { documentId: { $in: documentIds } },
    populate: {
      pagina: {
        fields: ['id', 'documentId'],
      },
    },
    publicationState: 'preview',
    limit: documentIds.length,
  });

  const docIdToEntry = new Map<DocumentId, PaginaEntry>();
  const numericIdToDocId = new Map<number, DocumentId>();

  entries.forEach(entry => {
    if (entry.documentId) {
      docIdToEntry.set(entry.documentId, entry);
    }
    if (typeof entry.id === 'number' && entry.documentId) {
      numericIdToDocId.set(entry.id, entry.documentId);
    }
  });

  const resolveParentDocumentId = (entry: PaginaEntry): DocumentId | null => {
    const parent = entry?.pagina;
    if (!parent) {
      return null;
    }

    if (parent.documentId) {
      return parent.documentId;
    }

    if (typeof parent.id === 'number') {
      const mapped = numericIdToDocId.get(parent.id);
      if (mapped) {
        return mapped;
      }
    }

    return null;
  };

  const docIdSet = new Set(documentIds);
  const parentDocIdsNeedingCheck = new Set<DocumentId>();
  docIdToEntry.forEach(entry => {
    const parentDocId = resolveParentDocumentId(entry);
    if (parentDocId && !docIdSet.has(parentDocId)) {
      parentDocIdsNeedingCheck.add(parentDocId);
    }
  });

  let publishedParents = new Set<DocumentId>();
  if (parentDocIdsNeedingCheck.size > 0) {
    const published = await strapi.db.query(CONTENT_TYPE_UID).findMany({
      where: {
        documentId: { $in: Array.from(parentDocIdsNeedingCheck) },
        publishedAt: { $notNull: true },
      },
      select: ['documentId'],
    });
    publishedParents = new Set(published.map((entry: any) => entry.documentId));
  }

  const orderedIds: DocumentId[] = [];
  const skippedIds = new Set<DocumentId>();
  const visited = new Set<DocumentId>();
  const visiting = new Set<DocumentId>();

  const visit = (docId: DocumentId) => {
    if (visited.has(docId)) {
      return;
    }

    if (visiting.has(docId)) {
      visited.add(docId);
      orderedIds.push(docId);
      return;
    }

    visiting.add(docId);

    const entry = docIdToEntry.get(docId);
    if (entry) {
      const parentDocId = resolveParentDocumentId(entry);
      if (parentDocId && !docIdSet.has(parentDocId) && !publishedParents.has(parentDocId)) {
        skippedIds.add(docId);
        visiting.delete(docId);
        visited.add(docId);
        return;
      }
      if (parentDocId && docIdToEntry.has(parentDocId)) {
        visit(parentDocId);
        if (skippedIds.has(parentDocId)) {
          skippedIds.add(docId);
          visiting.delete(docId);
          visited.add(docId);
          return;
        }
      }
    }

    visiting.delete(docId);
    visited.add(docId);
    orderedIds.push(docId);
  };

  documentIds.forEach(visit);

  const uniqueOrdered = orderedIds.filter((id, idx) => orderedIds.indexOf(id) === idx && !skippedIds.has(id));
  const remaining = documentIds.filter(id => !uniqueOrdered.includes(id) && !skippedIds.has(id));

  return {
    ordered: [...uniqueOrdered, ...remaining],
    skipped: Array.from(skippedIds),
  };
};

export default (plugin: any) => {
  const originalBulkPublish = plugin.controllers['collection-types']?.bulkPublish;

  if (originalBulkPublish) {
    plugin.controllers['collection-types'].bulkPublish = async function bulkPublishWithHierarchy(ctx: any) {
      if (ctx?.params?.model === CONTENT_TYPE_UID) {
        const ids: DocumentId[] | undefined = ctx.request?.body?.documentIds;
        if (Array.isArray(ids) && ids.length > 0) {
          try {
            const { ordered, skipped } = await sortDocumentIdsByHierarchy(strapi, ids);

            if (skipped.length > 0) {

            }

            if (ordered.length === 0) {
              ctx.status = 200;
              ctx.body = { count: 0 };
              return;
            }

            ctx.request.body.documentIds = ordered;
          } catch (error) {

          }
        }
      }

      return originalBulkPublish.call(this, ctx);
    };
  }

  return plugin;
};
