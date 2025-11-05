// ==========================================
// PLUGINS CONFIGURATION
// ==========================================
// Configurazione dei plugin Strapi con setup custom per upload su Google Cloud Storage.
//
// Plugins configurati:
// 1. @strapi-community/strapi-provider-upload-google-cloud-storage
//    - Upload automatico media su GCS bucket
//    - Path intelligente basato su: folder/contentType/slug/filename
//    - Sanitizzazione e slugify automatico di path e nomi file
//    - Cache per risoluzione folder gerarchici
//
// Features upload:
// - Generazione automatica path: /folder/api-pagina-pagina/il-mio-slug/immagine.jpg
// - Sanitizzazione nomi file con slugify (locale: it, strict: true)
// - Risoluzione ricorsiva folder parents per path completo
// - Cache in-memory per performance su folder lookup
// ==========================================

import path from "node:path";
import slugify from "slugify";

const FOLDER_UID = "plugin::upload.folder";
const folderSegmentsCache = new Map<string, string[]>();

const getStrapi = () => globalThis.strapi;

const normalizePath = (value?: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .trim();
};

const sanitizeSegment = (segment?: unknown): string | null => {
  if (!segment && segment !== 0) {
    return null;
  }

  const raw = String(segment);
  const cleaned = raw.replace(/[\\/]+/g, "-").trim();

  return cleaned.length > 0 ? cleaned : null;
};

const toFolderId = (value: unknown): number | string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return toFolderId(value[0]);
  }

  if (typeof value === "object" && "id" in (value as Record<string, unknown>)) {
    const maybeId = (value as Record<string, unknown>).id;
    if (typeof maybeId === "number" || typeof maybeId === "string") {
      return maybeId;
    }
  }

  return null;
};

const resolveFolderSegments = async (
  folderId?: number | string | null
): Promise<string[]> => {
  if (folderId === null || folderId === undefined) {
    return [];
  }

  const cacheKey = String(folderId);
  if (folderSegmentsCache.has(cacheKey)) {
    return folderSegmentsCache.get(cacheKey)!;
  }

  const strapi = getStrapi();
  if (!strapi?.entityService) {
    return [];
  }

  try {
    const folder = (await strapi.entityService.findOne(FOLDER_UID, folderId, {
      fields: ["id", "name"],
      populate: { parent: true },
    })) as Record<string, any> | null;

    if (!folder) {
      folderSegmentsCache.set(cacheKey, []);
      return [];
    }

    const parentSegments = await resolveFolderSegments(
      toFolderId(folder.parent)
    );
    const segment = sanitizeSegment(folder.name);
    const segments = segment ? [...parentSegments, segment] : parentSegments;

    folderSegmentsCache.set(cacheKey, segments);
    return segments;
  } catch (error) {

    folderSegmentsCache.set(cacheKey, []);
    return [];
  }
};

const ensureFolderPath = async (
  file: Record<string, any> | undefined | null
): Promise<string> => {
  if (!file) {
    return "";
  }

  const existing = normalizePath(file.path);
  if (existing) {
    file.path = `/${existing}`;
    return existing;
  }

  const folderId = toFolderId(file.folder);
  if (!folderId) {
    file.path = null;
    return "";
  }

  const segments = await resolveFolderSegments(folderId);
  const folderPath = segments.join("/");

  if (folderPath) {
    file.path = `/${folderPath}`;
    return folderPath;
  }

  file.path = null;
  return "";
};

const buildObjectName = async (basePath: string, file: Record<string, any>) => {
  const normalizedBase = normalizePath(basePath);
  const folderPath = await ensureFolderPath(file);

  const segments: string[] = [];
  if (normalizedBase) {
    segments.push(normalizedBase);
  }

  if (folderPath) {
    segments.push(folderPath);
  } else if (file.hash) {
    segments.push(String(file.hash));
  }

  const extension = typeof file.ext === "string" ? file.ext.toLowerCase() : "";
  const fileNameSeed =
    typeof file.hash === "string"
      ? file.hash
      : (file.name ?? Date.now().toString());
  const fileName = slugify(path.basename(fileNameSeed), {
    lower: false,
    strict: true,
  });

  const prefix = segments.length > 0 ? `${segments.join("/")}/` : "";
  return `${prefix}${fileName}${extension}`;
};

export default ({ env }) => {
  const basePath = env("GCS_BASE_PATH", "").trim();

  return {
    upload: {
      config: {
        provider:
          "@strapi-community/strapi-provider-upload-google-cloud-storage",
        providerOptions: {
          bucketName: env("GCS_BUCKET_NAME"),
          baseUrl: env("GCS_BASE_URL", null), // es: https://storage.googleapis.com/<bucket>
          ...(basePath ? { basePath } : {}),
          publicFiles: env.bool("GCS_PUBLIC_FILES", true),
          uniform: env.bool("GCS_UNIFORM", false),
          // Inserisci il JSON del service account come stringa in env e usa env.json per parse sicuro
          serviceAccount: env.json("GCS_SERVICE_ACCOUNT"),
          generateUploadFileName: (providerBasePath, file) =>
            buildObjectName(providerBasePath, file),
        },
      },
    },
    "tree-view": {
      enabled: true,
      resolve: "./src/plugins/tree-view",
    },
    "seo": { enabled: true },
  };
};
