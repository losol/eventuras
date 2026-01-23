/**
 * JSON-LD structured data generation for schema.org compliance
 *
 * These utilities generate schema.org structured data for Quotes and Sources,
 * enabling rich snippets, academic citations, and machine-readable metadata.
 *
 * Can be used in:
 * - Standalone pages (script tags in <head>)
 * - Future richText blocks (embedded structured data)
 * - API responses for external consumption
 */

import type { Quote, Source } from '@/payload-types';

/**
 * Extract plain text from Payload richText field
 * Simplified extraction - walks the lexical tree and concatenates text nodes
 */
export function extractPlainText(richText: unknown): string {
  if (!richText || typeof richText !== 'object') return '';
  if (!('root' in richText)) return '';

  const { root } = richText;
  if (!root || typeof root !== 'object' || !('children' in root) || !Array.isArray(root.children)) return '';

  function walkNodes(nodes: unknown[]): string {
    return nodes
      .map((node: unknown) => {
        if (typeof node !== 'object' || node === null) return '';
        if ('type' in node && node.type === 'text' && 'text' in node) {
          return typeof node.text === 'string' ? node.text : '';
        }
        if ('children' in node && Array.isArray(node.children)) {
          return walkNodes(node.children);
        }
        return '';
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (!Array.isArray(root.children)) return '';
  return walkNodes(root.children);
}

/**
 * Generate schema.org Quotation JSON-LD for a Quote
 *
 * @see https://schema.org/Quotation
 * @see ADR 0006 - Schema.org compatibility decisions
 *
 * @example
 * ```tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(generateQuoteJsonLd(quote)) }}
 * />
 * ```
 */
export function generateQuoteJsonLd(quote: Quote): object {
  const author =
    typeof quote.author === 'object' && quote.author !== null ? quote.author : null;
  const source =
    typeof quote.source === 'object' && quote.source !== null ? quote.source : null;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Quotation',
    text: extractPlainText(quote.quote),
  };

  // Author (Person or attributionText fallback)
  if (author && 'name' in author) {
    jsonLd.author = {
      '@type': 'Person',
      name: author.name,
    };
    if ('url' in author && author.url) {
      (jsonLd.author as Record<string, unknown>).url = author.url;
    }
  } else if (quote.attributionText) {
    // For organizations or uncertain attribution
    jsonLd.creator = quote.attributionText;
  }

  // Citation (link to source)
  if (source && 'title' in source) {
    const citation: Record<string, unknown> = {
      '@type': 'CreativeWork',
      name: source.title,
    };

    if ('url' in source && source.url) {
      citation.url = source.url;
    }

    // Add locator as position within work (e.g., "p. 42")
    if (quote.locator) {
      citation.position = quote.locator;
    }

    jsonLd.citation = citation;
  }

  // Context as description
  if (quote.context) {
    jsonLd.description = quote.context;
  }

  return jsonLd;
}

/**
 * Generate schema.org CreativeWork JSON-LD for a Source
 *
 * Maps CSL JSON source types to appropriate schema.org types:
 * - article-journal → ScholarlyArticle
 * - book → Book
 * - chapter → Chapter
 * - webpage → WebPage
 * - etc.
 *
 * @see https://schema.org/CreativeWork
 * @see ADR 0006 - Source types and schema.org mapping
 *
 * @example
 * ```tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSourceJsonLd(source)) }}
 * />
 * ```
 */
export function generateSourceJsonLd(source: Source): object {
  // Map CSL JSON types to schema.org types
  const schemaTypeMap: Record<string, string> = {
    'article-journal': 'ScholarlyArticle',
    'article-newspaper': 'NewsArticle',
    book: 'Book',
    chapter: 'Chapter',
    report: 'Report',
    thesis: 'Thesis',
    'paper-conference': 'ScholarlyArticle',
    webpage: 'WebPage',
    legislation: 'Legislation',
  };

  const schemaType = schemaTypeMap[source.sourceType || 'default'] || 'CreativeWork';

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: source.title,
  };

  // Contributors (authors, editors, etc.)
  if (Array.isArray(source.contributors) && source.contributors.length > 0) {
    const authors: Record<string, unknown>[] = [];
    const editors: Record<string, unknown>[] = [];

    source.contributors.forEach((contributor) => {
      const rawEntity =
        typeof contributor.entity === 'object' && contributor.entity !== null
          ? contributor.entity
          : null;

      if (!rawEntity || !('value' in rawEntity) || !rawEntity.value || typeof rawEntity.value !== 'object') {
        return;
      }

      const entity = rawEntity.value as unknown as Record<string, unknown>;
      if (!('name' in entity) || typeof entity.name !== 'string') {
        return;
      }

      const relationTo = 'relationTo' in rawEntity ? rawEntity.relationTo : undefined;
      let entityType: string = 'Person';
      if (relationTo === 'organizations') {
        entityType = 'Organization';
      } else if (relationTo === 'persons') {
        entityType = 'Person';
      }

      const contributorEntity: Record<string, unknown> = {
        '@type': entityType,
        name: entity.name,
      };

      if ('url' in entity && entity.url) {
        contributorEntity.url = entity.url;
      }

      if (contributor.role === 'author') {
        authors.push(contributorEntity);
      } else if (contributor.role === 'editor') {
        editors.push(contributorEntity);
      }
      // translator, interviewer, etc. not in base schema.org
    });

    if (authors.length > 0) {
      jsonLd.author = authors.length === 1 ? authors[0] : authors;
    }
    if (editors.length > 0) {
      jsonLd.editor = editors.length === 1 ? editors[0] : editors;
    }
  }

  // Publisher
  if (source.publisher) {
    jsonLd.publisher = {
      '@type': 'Organization',
      name: source.publisher,
    };
  }

  // Publication date
  if (source.publishedDate) {
    jsonLd.datePublished = source.publishedDate;
  }

  // URL
  if (source.url) {
    jsonLd.url = source.url;
  }
  // Note: accessedDate is kept in Payload for citation purposes but not emitted to schema.org
  // (sdDatePublished refers to when structured data was published, not when a webpage was accessed)

  // Identifiers (ISBN, DOI, etc.)
  if (Array.isArray(source.identifiers) && source.identifiers.length > 0) {
    source.identifiers.forEach((identifier) => {
      if (!identifier.value) return;

      switch (identifier.type) {
        case 'isbn':
          jsonLd.isbn = identifier.value;
          break;
        case 'doi':
          jsonLd.identifier = `https://doi.org/${identifier.value}`;
          break;
        case 'issn':
          jsonLd.issn = identifier.value;
          break;
        // pmid, arxiv, other - use generic identifier
        default:
          if (!jsonLd.identifier) {
            jsonLd.identifier = identifier.value;
          }
      }
    });
  }

  // Publication context (for articles)
  if (source.publicationContext) {
    const { containerTitle, volume, issue, page } = source.publicationContext;

    if (containerTitle) {
      jsonLd.isPartOf = {
        '@type': 'Periodical',
        name: containerTitle,
      };

      if (volume) {
        (jsonLd.isPartOf as Record<string, unknown>).volumeNumber = volume;
      }
      if (issue) {
        (jsonLd.isPartOf as Record<string, unknown>).issueNumber = issue;
      }
    }

    if (page) {
      jsonLd.pagination = page;
    }
  }

  // Edition (for books)
  if (source.edition) {
    jsonLd.bookEdition = source.edition;
  }

  // Publication place (for books)
  if (source.publicationPlace) {
    jsonLd.contentLocation = source.publicationPlace;
  }

  return jsonLd;
}
