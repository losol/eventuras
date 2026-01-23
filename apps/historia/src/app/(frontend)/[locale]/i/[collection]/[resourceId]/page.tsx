import React from 'react';
import configPromise from '@payload-config';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { CollectionSlug, getPayload } from 'payload';

import { Story, StoryBody, StoryHeader } from '@eventuras/ratio-ui/blocks/Story';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Lead } from '@eventuras/ratio-ui/core/Lead';
import { Section } from '@eventuras/ratio-ui/core/Section';
import { Container } from '@eventuras/ratio-ui/layout/Container';

import { LivePreviewListener } from '@/components/LivePreviewListener';
import RichText from '@/components/RichText';
import { generateMeta } from '@/lib/seo';
import type { Quote, Source } from '@/payload-types';
import { extractPlainText, generateQuoteJsonLd, generateSourceJsonLd } from '@/utilities/json-ld';

// Map URL collection names to Payload collection slugs
const collectionMap: Record<string, CollectionSlug> = {
  quote: 'quotes',
  source: 'sources',
  sitat: 'quotes', // Norwegian
  kilde: 'sources', // Norwegian
};

export async function generateStaticParams() {
  // Skip static generation during build (ISR will handle runtime generation)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return [];
  }

  const payload = await getPayload({ config: configPromise });
  const locales = process.env.NEXT_PUBLIC_CMS_LOCALES?.split(',') || ['en'];

  const params: Array<{
    locale: string;
    collection: string;
    resourceId: string;
  }> = [];

  // Fetch quotes
  const quotes = await payload.find({
    collection: 'quotes',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    select: { resourceId: true },
  });

  // Fetch sources
  const sources = await payload.find({
    collection: 'sources',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    select: { resourceId: true },
  });

  for (const locale of locales) {
    const collectionName = locale === 'no' ? 'sitat' : 'quote';
    quotes.docs.forEach(({ resourceId }) => {
      if (resourceId) {
        params.push({ locale, collection: collectionName, resourceId });
      }
    });

    const sourceCollectionName = locale === 'no' ? 'kilde' : 'source';
    sources.docs.forEach(({ resourceId }) => {
      if (resourceId) {
        params.push({ locale, collection: sourceCollectionName, resourceId });
      }
    });
  }

  return params;
}

type Args = {
  params: Promise<{
    locale: string;
    collection: string;
    resourceId: string;
  }>;
};

export default async function ItemPage({ params: paramsPromise }: Args) {
  const { locale, collection: urlCollection, resourceId } = await paramsPromise;
  const { isEnabled: draft } = await draftMode();

  const collectionSlug = collectionMap[urlCollection];

  if (!collectionSlug) {
    return notFound();
  }

  const payload = await getPayload({ config: configPromise });

  let doc: Quote | Source | null = null;

  try {
    const result = await payload.find({
      collection: collectionSlug,
      draft,
      limit: 1,
      overrideAccess: draft,
      where: {
        resourceId: {
          equals: resourceId,
        },
      },
      locale: locale as 'en' | 'no' | 'all',
      depth: 2,
    });

    doc = (result.docs[0] as unknown as Quote | Source) || null;
  } catch (error) {
    console.error(`Error fetching ${collectionSlug} with resourceId ${resourceId}:`, error);
  }

  if (!doc) {
    return notFound();
  }

  return (
    <>
      {collectionSlug === 'quotes' && <QuotePage quote={doc as Quote} />}
      {collectionSlug === 'sources' && <SourcePage source={doc as Source} locale={locale} />}
      {draft && <LivePreviewListener />}
    </>
  );
}

function QuotePage({ quote }: { quote: Quote }) {
  const author =
    typeof quote.author === 'object' && quote.author !== null ? quote.author : undefined;
  const authorName = author && 'name' in author ? author.name : quote.attributionText || 'Unknown';

  const source =
    typeof quote.source === 'object' && quote.source !== null ? quote.source : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateQuoteJsonLd(quote)).replace(/</g, '\\u003c'),
        }}
      />
      <Container>
        <Story>
          <StoryHeader>
            <Heading as="h1">
              {extractPlainText(quote.quote)}
            </Heading>
            <Lead>— {authorName}</Lead>
          </StoryHeader>

        <StoryBody>
          {quote.quote && typeof quote.quote === 'object' && (
            <Section>
              <RichText data={quote.quote} />
            </Section>
          )}

          {source && (
            <Section>
              <Heading as="h2">Source</Heading>
              <p>
                {'title' in source && source.title}
                {quote.locator && ` (${quote.locator})`}
              </p>
            </Section>
          )}

          {quote.context && (
            <Section>
              <Heading as="h2">Context</Heading>
              <p>{quote.context}</p>
            </Section>
          )}
        </StoryBody>
      </Story>
    </Container>
    </>
  );
}

function SourcePage({ source, locale }: { source: Source; locale: string }) {
  const contributors =
    Array.isArray(source.contributors) && source.contributors.length > 0
      ? source.contributors
      : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSourceJsonLd(source)).replace(/</g, '\\u003c'),
        }}
      />
      <Container>
        <Story>
          <StoryHeader>
            <Heading as="h1">
              {source.title}
            </Heading>
          {contributors.length > 0 && (
            <Lead>
              {contributors
                .map((c) => {
                  let entityValue: unknown = null;

                  if (c && typeof c.entity === 'object' && c.entity !== null) {
                    const entity = c.entity as Record<string, unknown>;
                    entityValue =
                      'value' in entity && entity.value !== undefined ? entity.value : entity;
                  }

                  if (typeof entityValue === 'string' || entityValue === null) {
                    // Unresolved relation (ID only) or missing entity; skip this contributor
                    return '';
                  }

                  let name = '';
                  if (
                    entityValue &&
                    typeof entityValue === 'object' &&
                    'name' in entityValue &&
                    typeof entityValue.name === 'string'
                  ) {
                    name = entityValue.name;
                  }

                  if (!name) {
                    return '';
                  }

                  const role = c.role || 'contributor';
                  return `${name} (${role})`;
                })
                .filter(Boolean)
                .join(', ')}
            </Lead>
          )}

        </StoryHeader>

        <StoryBody>
          {source.publisher && (
            <Section>
              <Heading as="h2">Publisher</Heading>
              <p>{source.publisher}</p>
            </Section>
          )}

          {source.publishedDate && (
            <Section>
              <Heading as="h2">Published</Heading>
              <p>{new Date(source.publishedDate).toLocaleDateString(locale)}</p>
            </Section>
          )}

          {source.url && (
            <Section>
              <Heading as="h2">
                URL
              </Heading>
              <p>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.url}
                </a>
              </p>
            </Section>
          )}

          {source.publicationPlace && (
            <Section>
              <Heading as="h2">Publication Place</Heading>
              <p>{source.publicationPlace}</p>
            </Section>
          )}

          {source.publicationContext && (
            <Section>
              <Heading as="h2">Publication Context</Heading>
              {source.publicationContext.containerTitle && (
                <p>
                  <strong>In:</strong> {source.publicationContext.containerTitle}
                </p>
              )}
              {source.publicationContext.volume && (
                <p>
                  <strong>Volume:</strong> {source.publicationContext.volume}
                </p>
              )}
              {source.publicationContext.issue && (
                <p>
                  <strong>Issue:</strong> {source.publicationContext.issue}
                </p>
              )}
              {source.publicationContext.page && (
                <p>
                  <strong>Pages:</strong> {source.publicationContext.page}
                </p>
              )}
            </Section>
          )}

          {Array.isArray(source.identifiers) && source.identifiers.length > 0 && (
            <Section>
              <Heading as="h2">Identifiers</Heading>
              <ul>
                {source.identifiers.map((id, index) => (
                  <li key={index}>
                    <strong>{id.type?.toUpperCase()}:</strong> {id.value}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </StoryBody>
      </Story>
    </Container>
    </>
  );
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, collection: urlCollection, resourceId } = await paramsPromise;

  const collectionSlug = collectionMap[urlCollection];

  if (!collectionSlug) {
    return {};
  }

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: collectionSlug,
    limit: 1,
    overrideAccess: false,
    where: {
      resourceId: {
        equals: resourceId,
      },
    },
    locale: locale as 'en' | 'no' | 'all',
  });

  const doc = result.docs[0];

  if (!doc) {
    return {};
  }

  if (collectionSlug === 'quotes') {
    const quote = doc as Quote;
    const author =
      typeof quote.author === 'object' && quote.author !== null ? quote.author : undefined;
    const authorName =
      author && 'name' in author ? author.name : quote.attributionText || 'Unknown';

    // Extract plain text from rich text
    const quoteText = extractPlainText(quote.quote).substring(0, 160);

    return generateMeta({
      doc: {
        title: `${quoteText} — ${authorName}`,
        meta: {
          description: quote.context || quoteText,
        },
      },
    });
  }

  if (collectionSlug === 'sources') {
    const source = doc as Source;
    const contributors =
      Array.isArray(source.contributors) && source.contributors.length > 0
        ? source.contributors
        : [];

    const authorNames = contributors
      .map((c) => {
        const entity = typeof c.entity === 'object' && c.entity !== null ? c.entity : null;
        if (!entity) {
          return '';
        }

        // Handle polymorphic relationship objects: { relationTo, value }
        const entityRecord = entity as Record<string, unknown>;
        const value =
          typeof entityRecord.value === 'object' && entityRecord.value !== null
            ? entityRecord.value
            : entity;

        return typeof value === 'object' && value !== null && 'name' in value
          ? (value as Record<string, unknown>).name
          : '';
      })
      .filter(Boolean)
      .join(', ');

    const description = authorNames ? `By ${authorNames}` : source.publisher || '';

    return generateMeta({
      doc: {
        title: source.title || 'Source',
        meta: {
          description,
        },
      },
    });
  }

  return {};
}
