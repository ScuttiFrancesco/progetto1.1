import slugify from 'slugify';
import { autoPopulateSeo } from './utils/seo-auto-populate';

type LifecycleEvent = {
  model?: { uid?: string };
  params?: { where?: Record<string, unknown>; data?: Record<string, any> };
  result?: { id?: number; slug?: string } & Record<string, any>;
  state?: Record<string, any>;
};

type DefaultPathSnapshot = {
  id: number;
  slug: string;
  path: string | null;
};

type StrapiLike = {
  log: {
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
  };
  service: (uid: string) => any;
  contentTypes: Record<string, any>;
  db: {
    lifecycles: {
      subscribe: (options: { models: string[]; [key: string]: unknown }) => void;
    };
    query: (uid: string) => {
      findOne: (query: { where: Record<string, unknown>; populate?: Record<string, unknown> }) => Promise<any>;
    };
  };
  entityService: {
    findOne: (uid: string, id: number, options?: Record<string, unknown>) => Promise<any>;
    findMany: (uid: string, options?: Record<string, unknown>) => Promise<any[]>;
    update: (uid: string, id: number, options: { data: Record<string, unknown> }) => Promise<any>;
  };
};

type HookName = 'afterCreate' | 'afterUpdate';

type DefaultPathState = {
  path: string | null;
  previousSlug: string | null;
  descendants: DefaultPathSnapshot[];
};

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: StrapiLike }) {
    try {
      // Attendi che Strapi sia completamente inizializzato dopo modifiche ai content-type
      await new Promise(resolve => setTimeout(resolve, 2000));

      // ==========================================
      // PATH RESOLVER SERVICE
      // ==========================================
      // Sistema di risoluzione path O(1) con cache in-memory.
      // Mappa tutti i path (slug + url_addizionali) alle rispettive entity.
      // Gestisce automaticamente duplicati filtrando per tipoLayout='statico'.
      // Si invalida automaticamente su create/update/delete di qualsiasi collection con slug.
      // ==========================================
      const pathResolver = strapi.service('api::common.path-resolver');
      if (pathResolver?.initialize) {
        await pathResolver.initialize();
      }

      const collectionsWithSlug = Object.keys(strapi.contentTypes).filter(uid => {
        const ct = strapi.contentTypes[uid];
        return ct?.kind === 'collectionType' && ct.attributes?.slug;
      });

    collectionsWithSlug.forEach(uid => {
      strapi.db.lifecycles.subscribe({
        models: [uid],
        async afterCreate() {
          await pathResolver?.invalidate?.();
        },
        async afterUpdate() {
          await pathResolver?.invalidate?.();
        },
        async afterDelete() {
          await pathResolver?.invalidate?.();
        },
      });
    });

    // ==========================================
    // AUTO-GENERAZIONE SLUG
    // ==========================================
    // Genera automaticamente lo slug dal targetField (es. 'title') se non fornito.
    // Utilizza slugify con locale italiano per normalizzazione URL-friendly.
    // Attivo su tutte le collection con attributo slug e targetField definito.
    // ==========================================
    collectionsWithSlug.forEach(uid => {
      const contentType = strapi.contentTypes[uid];
      const slugAttribute = contentType?.attributes?.slug;
      const targetField = slugAttribute?.targetField;
      
      if (!targetField) {
        return;
      }

      strapi.db.lifecycles.subscribe({
        models: [uid],
        async beforeCreate(event: LifecycleEvent) {
          const { data } = event.params || {};
          
          if (data && !data.slug && data[targetField]) {
            data.slug = slugify(String(data[targetField]), {
              lower: true,
              strict: true,
              locale: 'it',
            });
          }
        },
        
        async beforeUpdate(event: LifecycleEvent) {
          const { data } = event.params || {};
          
          if (data && data[targetField] && !data.slug) {
            data.slug = slugify(String(data[targetField]), {
              lower: true,
              strict: true,
              locale: 'it',
            });
          }
        },
      });
    });

    // ==========================================
    // AUTO-POPOLAMENTO SEO
    // ==========================================
    // Popola automaticamente i campi SEO (metaTitle, metaDescription, openGraph)
    // dai contenuti della pagina (title, testo, immagini) se non compilati manualmente.
    // Supporta component shared.seo con popolamento intelligente basato su tipo contenuto.
    // ==========================================
    const collectionsWithSeo = Object.keys(strapi.contentTypes).filter(uid => {
      const ct = strapi.contentTypes[uid];
      if (!ct?.attributes) return false;
      
      return Object.values(ct.attributes).some(
        (attr: any) => 
          attr.type === 'component' && 
          attr.component === 'shared.seo'
      );
    });

    collectionsWithSeo.forEach(uid => {
      strapi.db.lifecycles.subscribe({
        models: [uid],
        
        async afterCreate(event: LifecycleEvent) {
          const result = event.result;
          
          if (!result?.id) return;
          
          try {

            // Build dynamic populate based on available attributes
            const contentType = strapi.contentTypes[uid];
            const populate: any = {
              seo: {
                populate: ['openGraph', 'metaImage'],
              },
            };
            
            // Add available relation/media fields
            const possibleFields = [
              'categoria_silvaes', 'categories', 'categorie', 'tags',
              'immagineInEvidenza', 'immagineInPrimoPiano', 
              'featuredImage', 'coverImage', 'image'
            ];
            
            possibleFields.forEach(field => {
              if (contentType?.attributes?.[field]) {
                populate[field] = true;
              }
            });
            
            // Fetch the created entry with relations
            const entry = await strapi.entityService.findOne(uid, result.id, {
              populate,
            }) as any;
            
            if (!entry) return;
            
            // Check if SEO is already filled (manually added)
            const hasSeoData = entry.seo?.metaTitle || entry.seo?.metaDescription;
            
            if (hasSeoData) {

              return;
            }
            
            // Initialize SEO component
            const seoData: any = {
              openGraph: {},
            };
            
            // Prepare data for auto-population
            const dataToPopulate = { ...entry, seo: seoData };
            
            // Auto-populate SEO fields
            await autoPopulateSeo(dataToPopulate, uid, strapi as any);

            // Update the entry with populated SEO
            await strapi.entityService.update(uid, result.id, {
              data: {
                seo: dataToPopulate.seo,
              },
            });

          } catch (error) {

          }
        },
        
        async beforeUpdate(event: LifecycleEvent) {
          const { data, where } = event.params || {};
          
          if (!data || !where) return;
          
          try {
            // Only process if SEO-related fields are being updated
            const seoRelatedFields = ['title', 'slug', 'testo', 'sommario_da_verificare', 'blocco_centrale'];
            const hasSeoRelatedChanges = seoRelatedFields.some(field => field in data);
            
            if (!hasSeoRelatedChanges && !data.seo) {
              return; // Skip if no SEO-related changes
            }

            // Build dynamic populate
            const contentType = strapi.contentTypes[uid];
            const populate: any = {
              seo: {
                populate: ['openGraph', 'metaImage'],
              },
            };
            
            const possibleFields = [
              'categoria_silvaes', 'categories', 'categorie', 'tags',
              'immagineInEvidenza', 'immagineInPrimoPiano', 
              'featuredImage', 'coverImage', 'image'
            ];
            
            possibleFields.forEach(field => {
              if (contentType?.attributes?.[field]) {
                populate[field] = true;
              }
            });
            
            // Fetch existing entry
            const existing = await strapi.db.query(uid).findOne({
              where,
              populate,
            });
            
            if (!existing) return;
            
            // If SEO component doesn't exist yet, skip (will be handled by afterUpdate)
            if (!existing.seo && !data.seo) {
              return;
            }
            
            // Merge existing and new data
            const mergedData = { ...existing, ...data };
            
            // Ensure seo object exists
            if (!mergedData.seo) {
              mergedData.seo = {
                openGraph: {},
              };
            }
            
            // Auto-populate only empty SEO fields
            await autoPopulateSeo(mergedData, uid, strapi as any);
            
            // Update event data with populated SEO
            event.params.data.seo = mergedData.seo;

          } catch (error) {

          }
        },
        
        async afterUpdate(event: LifecycleEvent) {
          const result = event.result;
          
          if (!result?.id) return;
          
          try {
            // Build dynamic populate
            const contentType = strapi.contentTypes[uid];
            const populate: any = {
              seo: {
                populate: ['openGraph', 'metaImage'],
              },
            };
            
            const possibleFields = [
              'categoria_silvaes', 'categories', 'categorie', 'tags',
              'immagineInEvidenza', 'immagineInPrimoPiano', 
              'featuredImage', 'coverImage', 'image'
            ];
            
            possibleFields.forEach(field => {
              if (contentType?.attributes?.[field]) {
                populate[field] = true;
              }
            });
            
            // Fetch the updated entry
            const entry = await strapi.entityService.findOne(uid, result.id, {
              populate,
            }) as any;
            
            if (!entry) return;
            
            // If SEO component doesn't exist, create and populate it
            if (!entry.seo) {

              const seoData: any = {
                openGraph: {},
              };
              
              const dataToPopulate = { ...entry, seo: seoData };
              await autoPopulateSeo(dataToPopulate, uid, strapi as any);
              
              await strapi.entityService.update(uid, result.id, {
                data: {
                  seo: dataToPopulate.seo,
                },
              });

            }
          } catch (error) {

          }
        },
      });
    });

    // ==========================================
    // DEFAULT PATH SERVICE
    // ==========================================
    // Gestione automatica dei path gerarchici (es. /parent/child/grandchild).
    // Costruisce il path di default seguendo la catena di parent e lo inserisce
    // automaticamente in url_addizionali. Aggiorna in cascata i discendenti
    // quando lo slug del parent cambia. Mantiene sempre il path di default
    // come primo elemento dell'array url_addizionali.
    // ==========================================
    const defaultPathCollections = Object.keys(strapi.contentTypes).filter(uid => {
      const ct = strapi.contentTypes[uid];
      return (
        ct?.kind === 'collectionType' &&
        ct.attributes?.slug &&
        ct.attributes?.url_addizionali?.type === 'component'
      );
    });

    if (defaultPathCollections.length === 0) {

      return;
    }

    strapi.db.lifecycles.subscribe({
      models: defaultPathCollections,
      async beforeUpdate(event: LifecycleEvent) {
        await cachePreviousDefaultPath(strapi, event);
      },
      async afterCreate(event: LifecycleEvent) {
        await ensureDefaultPath(strapi, event, 'afterCreate');
      },
      async afterUpdate(event: LifecycleEvent) {
        await ensureDefaultPath(strapi, event, 'afterUpdate');
      },
    });
    } catch (error) {
      strapi.log.error('[Bootstrap] Fatal error during initialization:', error);
      strapi.log.error('[Bootstrap] Strapi will continue but some features may not work correctly');
    }
  },
};

async function ensureDefaultPath(strapi: StrapiLike, event: LifecycleEvent, hookName: HookName) {
  const uid = event.model?.uid;
  const result = event.result;

  if (!uid || !result?.id || !result.slug) {
    return;
  }

  const defaultPathService = strapi.service('api::common.default-path');
  if (!defaultPathService?.buildDefaultPath) {

    return;
  }

  try {
    const defaultState = event.state?.defaultPath as DefaultPathState | undefined;
    const newDefaultPath = await defaultPathService.buildDefaultPath(result.slug, uid, result.id);
    if (!newDefaultPath) {
      return;
    }

    const entity = await strapi.entityService.findOne(uid, result.id, {
      populate: { url_addizionali: true },
    });

    if (!entity) {
      return;
    }

    const normalizedExisting = normalizeUrlAddizionali(entity.url_addizionali);
    let workingList = [...normalizedExisting];
    let requiresUpdate = false;

    const previousPath: string | null = defaultState?.path ?? null;
    const slugChanged = defaultState?.previousSlug
      ? defaultState.previousSlug !== result.slug
      : false;

    if (hookName === 'afterUpdate') {
      if (previousPath && previousPath !== newDefaultPath) {
        const filtered = workingList.filter(item => item.path !== previousPath);
        if (filtered.length !== workingList.length) {
          workingList = filtered;
          requiresUpdate = true;
        }
      }
    }

    if (!workingList.some(item => item.path === newDefaultPath)) {
      workingList = [{ path: newDefaultPath }, ...workingList];
      requiresUpdate = true;
    }

    if (requiresUpdate) {
      await strapi.entityService.update(uid, result.id, {
        data: { url_addizionali: workingList },
      });

      const refreshed = await strapi.entityService.findOne(uid, result.id, {
        populate: { url_addizionali: true },
      });

      event.result = {
        ...event.result,
        url_addizionali: refreshed?.url_addizionali ?? workingList,
      };
    } else {
      event.result = {
        ...event.result,
        url_addizionali: entity.url_addizionali ?? normalizedExisting,
      };
    }

    if (hookName === 'afterCreate') {

      return;
    }

    const snapshots: DefaultPathSnapshot[] = slugChanged
      ? defaultState?.descendants ?? []
      : [];
    if (snapshots.length > 0) {
      await updateDescendantDefaultPaths(strapi, uid, snapshots, defaultPathService);
    }

  } catch (error) {

  }
}

async function cachePreviousDefaultPath(strapi: StrapiLike, event: LifecycleEvent) {
  const uid = event.model?.uid;
  if (!uid) {
    return;
  }

  const defaultPathService = strapi.service('api::common.default-path');
  if (!defaultPathService?.buildDefaultPath) {
    return;
  }

  try {
    const where = event.params?.where ?? {};
    if (!where || Object.keys(where).length === 0) {
      return;
    }

    const entity = await strapi.db.query(uid).findOne({
      where,
      populate: { url_addizionali: true },
    });

    if (!entity?.id) {
      return;
    }

    const parentField = defaultPathService.findParentField?.(uid);
    const incomingSlug = event.params?.data?.slug;
    const slugWillChange = typeof incomingSlug === 'string' && incomingSlug !== entity.slug;
    const descendants = slugWillChange && parentField
      ? await collectDescendantSnapshots(strapi, uid, entity.id, defaultPathService, parentField)
      : [];

    const path = await defaultPathService.buildDefaultPath(entity.slug, uid, entity.id);

    event.state = event.state || {};
    (event.state as { defaultPath: DefaultPathState }).defaultPath = {
      path,
      previousSlug: entity.slug ?? null,
      descendants,
    };
  } catch (error) {

  }
}

function normalizeUrlAddizionali(components: unknown): Array<Record<string, any>> {
  if (!Array.isArray(components)) {
    return [];
  }

  return components
    .map(component => {
      if (!component || typeof component !== 'object') {
        return null;
      }

      const { id, __temp_key__, ...rest } = component as Record<string, any>;
      const payload: Record<string, any> = { ...rest };
      if (id) {
        payload.id = id;
      }
      return payload;
    })
    .filter(Boolean) as Array<Record<string, any>>;
}

async function collectDescendantSnapshots(
  strapi: StrapiLike,
  uid: string,
  parentId: number,
  defaultPathService: any,
  parentField: string,
  accumulator: DefaultPathSnapshot[] = [],
): Promise<DefaultPathSnapshot[]> {
  const children = await strapi.entityService.findMany(uid, {
    filters: { [parentField]: { id: parentId } },
    populate: { url_addizionali: true },
    fields: ['id', 'slug'],
    pagination: { page: 1, pageSize: 1000 },
  });

  for (const child of children) {
    const path = await defaultPathService.buildDefaultPath(child.slug, uid, child.id);
    accumulator.push({ id: child.id, slug: child.slug, path });
    await collectDescendantSnapshots(
      strapi,
      uid,
      child.id,
      defaultPathService,
      parentField,
      accumulator,
    );
  }

  return accumulator;
}

async function updateDescendantDefaultPaths(
  strapi: StrapiLike,
  uid: string,
  snapshots: DefaultPathSnapshot[],
  defaultPathService: any,
) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) {
    return;
  }

  for (const snapshot of snapshots) {
    await updateEntityDefaultPath(strapi, uid, snapshot.id, snapshot.path, defaultPathService);
  }
}

async function updateEntityDefaultPath(
  strapi: StrapiLike,
  uid: string,
  entityId: number,
  oldPath: string | null,
  defaultPathService: any,
) {
  const entity = await strapi.entityService.findOne(uid, entityId, {
    populate: { url_addizionali: true },
  });

  if (!entity) {
    return;
  }

  const normalizedExisting = normalizeUrlAddizionali(entity.url_addizionali);
  let workingList = [...normalizedExisting];
  let requiresUpdate = false;

  if (oldPath) {
    const filtered = workingList.filter(item => item.path !== oldPath);
    if (filtered.length !== workingList.length) {
      workingList = filtered;
      requiresUpdate = true;
    }
  }

  const newDefaultPath = await defaultPathService.buildDefaultPath(entity.slug, uid, entityId);
  if (newDefaultPath && !workingList.some(item => item.path === newDefaultPath)) {
    workingList = [{ path: newDefaultPath }, ...workingList];
    requiresUpdate = true;
  }

  if (!requiresUpdate) {
    return;
  }

  await strapi.entityService.update(uid, entityId, {
    data: { url_addizionali: workingList },
  });

}
