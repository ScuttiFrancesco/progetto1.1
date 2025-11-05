// ==========================================
// SEO AUTO-POPULATE UTILITIES
// ==========================================
// Utility per auto-popolamento intelligente dei campi SEO (shared.seo component).
// Genera automaticamente metaTitle, metaDescription, keywords, openGraph
// dai contenuti della pagina se non compilati manualmente dall'utente.
//
// Features:
// - Estrazione automatica testo da HTML/rich-text (strip HTML tags)
// - Generazione metaDescription intelligente (primi 160 caratteri)
// - Popolamento OpenGraph (ogTitle, ogDescription, ogImage, ogUrl)
// - Supporto multi-campo: title, testo, sommario, blocco_centrale, etc.
// - Estrazione automatica immagini per metaImage/ogImage
// - Generazione keywords da titolo e contenuto
// - Respect dei campi già compilati manualmente (no override)
//
// Utilizzo:
// - await autoPopulateSeo(entry, contentType, strapi) - Popola i campi SEO dell'entry
//
// Configurazione:
// - SITE_NAME: Nome del sito (da .env SITE_NAME)
// - BASE_URL: URL base del sito (da .env PUBLIC_URL)
// ==========================================

/**
 * SEO Auto-Population Utilities
 * Automatically fills SEO component fields for any content-type
 */

import type { Core } from '@strapi/strapi';

interface SeoComponent {
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: any;
  keywords?: string;
  focusKeyword?: string;
  metaRobots?: string;
  canonicalURL?: string;
  structuredData?: any;
  openGraph?: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: any;
    ogUrl?: string;
    ogType?: string;
  };
}

interface ContentWithSeo {
  id?: number;
  documentId?: string;
  title?: string;
  slug?: string;
  seo?: SeoComponent | null;
  [key: string]: any;
}

const SITE_NAME = process.env.SITE_NAME || 'Il tuo Sito';
const BASE_URL = process.env.PUBLIC_URL || 'https://example.com';

/**
 * Strip HTML tags and decode entities
 */
const stripHtml = (html?: string | null): string => {
  if (!html) return '';
  
  // First, decode common HTML entities
  let text = html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '...')
    .replace(/&agrave;/g, 'à')
    .replace(/&egrave;/g, 'è')
    .replace(/&eacute;/g, 'é')
    .replace(/&igrave;/g, 'ì')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&Agrave;/g, 'À')
    .replace(/&Egrave;/g, 'È')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Igrave;/g, 'Ì')
    .replace(/&Ograve;/g, 'Ò')
    .replace(/&Ugrave;/g, 'Ù')
    .replace(/&euro;/g, '€')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    // Decode numeric entities (&#123; or &#xAB;)
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  return text;
};

/**
 * Truncate text to specified length, breaking at word boundary
 */
const truncate = (text: string, maxLength: number, addEllipsis = true): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return addEllipsis 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated.substring(0, lastSpace);
  }
  
  return addEllipsis ? truncated + '...' : truncated;
};

/**
 * Extract plain text from rich text content
 */
const extractTextContent = (richText?: string | null, maxLength = 160): string => {
  if (!richText) return '';
  
  const plainText = stripHtml(richText);
  
  // Ensure we never exceed maxLength
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Truncate without ellipsis for extraction
  return truncate(plainText, maxLength - 3, true); // -3 for "..."
};

/**
 * Generate meta title from content title
 */
const generateMetaTitle = (title?: string, includeSiteName = true): string => {
  if (!title) return SITE_NAME;
  
  // Clean title first
  const cleanTitle = stripHtml(title);
  
  const maxTitleLength = includeSiteName ? 60 - SITE_NAME.length - 3 : 60;
  
  // Don't add ellipsis to title, just truncate
  const truncatedTitle = cleanTitle.length > maxTitleLength
    ? truncate(cleanTitle, maxTitleLength, false)
    : cleanTitle;
  
  return includeSiteName 
    ? `${truncatedTitle} | ${SITE_NAME}`
    : truncatedTitle;
};

/**
 * Generate meta description from content
 */
const generateMetaDescription = (
  summary?: string | null,
  content?: string | null,
  fallback = ''
): string => {
  const MAX_LENGTH = 157; // 160 - 3 for "..." if needed
  
  // Try summary first
  if (summary) {
    const text = extractTextContent(summary, MAX_LENGTH);
    if (text.length >= 50) {
      // Ensure final length is exactly within limits
      return text.length <= 160 ? text : text.substring(0, 157) + '...';
    }
  }
  
  // Try main content
  if (content) {
    const text = extractTextContent(content, MAX_LENGTH);
    if (text.length >= 50) {
      return text.length <= 160 ? text : text.substring(0, 157) + '...';
    }
  }
  
  // Fallback
  const fallbackText = fallback || `Leggi di più su ${SITE_NAME}`;
  return fallbackText.length <= 160 
    ? fallbackText 
    : fallbackText.substring(0, 157) + '...';
};

/**
 * Generate canonical URL
 */
const generateCanonicalUrl = (slug?: string, prefix = ''): string => {
  if (!slug) return BASE_URL;
  
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '');
  
  if (cleanPrefix) {
    return `${BASE_URL}/${cleanPrefix}/${cleanSlug}`;
  }
  
  return `${BASE_URL}/${cleanSlug}`;
};

/**
 * Extract first image from content or media fields
 */
const extractFirstImage = (data: any): any => {
  // Check common image fields
  const imageFields = [
    'immagineInEvidenza',
    'immagineInPrimoPiano',
    'featuredImage',
    'coverImage',
    'image',
    'media'
  ];
  
  for (const field of imageFields) {
    if (data[field]) {
      return data[field];
    }
  }
  
  // Check dynamic zones for images
  const dynamicZoneFields = ['blocco_centrale', 'blocks', 'content'];
  
  for (const field of dynamicZoneFields) {
    if (Array.isArray(data[field])) {
      for (const block of data[field]) {
        if (block.__component?.includes('immagine') || block.__component?.includes('image')) {
          if (block.immagine || block.image || block.media) {
            return block.immagine || block.image || block.media;
          }
        }
      }
    }
  }
  
  return null;
};

/**
 * Extract keywords from categories or tags
 */
const extractKeywords = (data: any): string => {
  const keywords: string[] = [];
  
  // Check for category relations
  const categoryFields = [
    'categoria_silvaes',
    'categories',
    'categorie',
    'tags'
  ];
  
  for (const field of categoryFields) {
    const relation = data[field];
    if (Array.isArray(relation)) {
      relation.forEach((item: any) => {
        if (item.name || item.nome || item.title) {
          keywords.push(item.name || item.nome || item.title);
        }
      });
    }
  }
  
  return keywords.join(', ');
};

/**
 * Generate focus keyword from title
 * Takes 2-3 most significant words from title
 */
const generateFocusKeyword = (title?: string): string => {
  if (!title) return '';
  
  const cleanTitle = stripHtml(title).toLowerCase();
  
  // Remove common Italian stop words
  const stopWords = new Set([
    'il', 'lo', 'la', 'i', 'gli', 'le',
    'un', 'uno', 'una', 'dei', 'degli', 'delle',
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'e', 'ed', 'o', 'ma', 'se', 'come', 'quando', 'dove', 'chi', 'che', 'cosa',
    'del', 'dello', 'della', 'dell', 'al', 'allo', 'alla', 'all',
    'nel', 'nello', 'nella', 'nell', 'sul', 'sullo', 'sulla', 'sull',
    'dal', 'dallo', 'dalla', 'dall', 'col', 'collo', 'colla', 'coll'
  ]);
  
  // Split into words and filter
  const words = cleanTitle
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Take first 2-3 significant words
  return words.slice(0, 3).join(' ');
};

/**
 * Generate Article structured data (schema.org)
 */
const generateArticleStructuredData = (data: any, canonicalUrl: string): any => {
  const image = extractFirstImage(data);
  const imageUrl = image?.url ? `${BASE_URL}${image.url}` : undefined;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title || '',
    description: data.sommario_da_verificare 
      ? extractTextContent(data.sommario_da_verificare, 200)
      : '',
    image: imageUrl,
    datePublished: data.data || data.createdAt,
    dateModified: data.updatedAt,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`, // Adjust as needed
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };
};

/**
 * Generate WebPage structured data (schema.org)
 */
const generateWebPageStructuredData = (data: any, canonicalUrl: string): any => {
  const image = extractFirstImage(data);
  const imageUrl = image?.url ? `${BASE_URL}${image.url}` : undefined;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.title || '',
    description: generateMetaDescription(
      null,
      extractTextFromDynamicZone(data.blocco_centrale)
    ),
    image: imageUrl,
    url: canonicalUrl,
  };
};

/**
 * Extract text from dynamic zone blocks
 */
const extractTextFromDynamicZone = (blocks?: any[]): string => {
  if (!Array.isArray(blocks)) return '';
  
  let text = '';
  
  for (const block of blocks) {
    // Check for text/richtext fields
    if (block.testo || block.text || block.content) {
      text += ' ' + (block.testo || block.text || block.content);
    }
    
    if (text.length > 300) break; // Enough for description
  }
  
  return text.trim();
};

/**
 * Main function to auto-populate SEO component
 */
export const autoPopulateSeo = async (
  data: ContentWithSeo,
  contentType: string,
  strapi: Core.Strapi
): Promise<ContentWithSeo> => {

  // Initialize SEO component if it doesn't exist
  if (!data.seo) {
    data.seo = {};
  }
  
  const seo = data.seo;
  
  // Determine content type category (article, page, etc.)
  const isArticle = contentType.includes('articoli') || contentType.includes('article');
  const urlPrefix = isArticle ? 'articoli' : '';
  
  // Generate canonical URL
  const canonicalUrl = generateCanonicalUrl(data.slug, urlPrefix);

  // Auto-fill metaTitle if empty
  if (!seo.metaTitle && data.title) {
    seo.metaTitle = generateMetaTitle(data.title);

  }
  
  // Auto-fill metaDescription if empty
  if (!seo.metaDescription) {
    let description = '';
    
    if (isArticle) {
      description = generateMetaDescription(
        data.sommario_da_verificare,
        data.testo
      );
    } else {
      const dynamicText = extractTextFromDynamicZone(data.blocco_centrale);
      description = generateMetaDescription(null, dynamicText);
    }
    
    seo.metaDescription = description;

  }
  
  // Auto-fill metaImage if empty
  if (!seo.metaImage) {
    const image = extractFirstImage(data);
    if (image) {
      // Se l'immagine ha un ID, usa solo l'ID (relazione Strapi)
      seo.metaImage = typeof image === 'object' && image.id ? image.id : image;

    }
  }
  
  // Auto-fill keywords if empty
  if (!seo.keywords) {
    seo.keywords = extractKeywords(data);

  }
  
  // Auto-fill focusKeyword if empty
  if (!seo.focusKeyword) {
    seo.focusKeyword = generateFocusKeyword(data.title);

  }
  
  // Auto-fill canonicalURL if empty
  if (!seo.canonicalURL) {
    seo.canonicalURL = canonicalUrl;
  }
  
  // Auto-fill structuredData if empty
  if (!seo.structuredData) {
    seo.structuredData = isArticle
      ? generateArticleStructuredData(data, canonicalUrl)
      : generateWebPageStructuredData(data, canonicalUrl);

  }
  
  // Initialize OpenGraph if it doesn't exist
  if (!seo.openGraph) {
    seo.openGraph = {};
  }
  
  const og = seo.openGraph;
  
  // Auto-fill OpenGraph fields
  if (!og.ogTitle) {
    const cleanTitle = data.title ? stripHtml(data.title) : seo.metaTitle || '';
    og.ogTitle = cleanTitle.length > 70 
      ? truncate(cleanTitle, 70, false) // No ellipsis for OG title
      : cleanTitle;

  }
  
  if (!og.ogDescription) {
    const cleanDesc = seo.metaDescription || '';
    og.ogDescription = cleanDesc.length > 200
      ? truncate(cleanDesc, 200, true) // Ellipsis OK for description
      : cleanDesc;

  }
  
  if (!og.ogImage && seo.metaImage) {
    og.ogImage = seo.metaImage;

  }
  
  if (!og.ogUrl) {
    og.ogUrl = canonicalUrl;
  }
  
  if (!og.ogType) {
    og.ogType = isArticle ? 'article' : 'website';
  }

  // Final validation: ensure all fields respect length limits
  if (seo.metaTitle && seo.metaTitle.length > 60) {
    seo.metaTitle = seo.metaTitle.substring(0, 60);

  }
  
  if (seo.metaDescription && seo.metaDescription.length > 160) {
    seo.metaDescription = seo.metaDescription.substring(0, 157) + '...';

  }
  
  if (og.ogTitle && og.ogTitle.length > 70) {
    og.ogTitle = og.ogTitle.substring(0, 70);

  }
  
  if (og.ogDescription && og.ogDescription.length > 200) {
    og.ogDescription = og.ogDescription.substring(0, 197) + '...';

  }
  
  return data;
};

/**
 * Check if SEO should be regenerated based on changed fields
 */
export const shouldRegenerateSeo = (data: any, previousData?: any): boolean => {
  if (!previousData) return true;
  
  // Regenerate if key fields changed
  const keyFields = ['title', 'slug', 'testo', 'sommario_da_verificare', 'blocco_centrale'];
  
  for (const field of keyFields) {
    if (data[field] !== previousData[field]) {
      return true;
    }
  }
  
  return false;
};
