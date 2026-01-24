import React from 'react';
import configPromise from '@payload-config';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import { Story, StoryBody, StoryHeader } from '@eventuras/ratio-ui/blocks/Story';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Lead } from '@eventuras/ratio-ui/core/Lead';
import { Section } from '@eventuras/ratio-ui/core/Section';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Link } from '@eventuras/ratio-ui-next';

import { LivePreviewListener } from '@/components/LivePreviewListener';
import RichText from '@/components/RichText';
import { generateMeta } from '@/lib/seo';
import type { Term } from '@/payload-types';
import { extractPlainText, generateTermJsonLd } from '@/utilities/json-ld';

export async function generateStaticParams() {
  // Skip static generation during build (ISR will handle runtime generation)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return [];
  }

  const payload = await getPayload({ config: configPromise });
  const locales = process.env.NEXT_PUBLIC_CMS_LOCALES?.split(',') || ['en'];

  const params: Array<{
    locale: string;
    resourceId: string;
  }> = [];

  // Fetch terms
  const terms = await payload.find({
    collection: 'terms',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    select: { resourceId: true },
  });

  for (const locale of locales) {
    terms.docs.forEach(({ resourceId }) => {
      if (resourceId) {
        params.push({ locale, resourceId });
      }
    });
  }

  return params;
}

type Args = {
  params: Promise<{
    locale: string;
    resourceId: string;
  }>;
};

export default async function TermPage({ params: paramsPromise }: Readonly<Args>) {
  const { locale, resourceId } = await paramsPromise;
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  let term: Term | null = null;

  try {
    const result = await payload.find({
      collection: 'terms',
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

    term = (result.docs[0] as unknown as Term) || null;
  } catch (error) {
    console.error(`Error fetching term with resourceId ${resourceId}:`, error);
  }

  if (!term) {
    return notFound();
  }

  // Find primary definition or use first
  const definitions = Array.isArray(term.definitions) ? term.definitions : [];
  const primaryDefinition = definitions.find((d) => d.isPrimary) || definitions[0];
  const alternativeDefinitions = definitions.filter((d) => d !== primaryDefinition);

  const synonyms = Array.isArray(term.synonyms) ? term.synonyms : [];
  const relatedTerms = Array.isArray(term.relatedTerms) ? term.relatedTerms : [];
  const categories = Array.isArray(term.category) ? term.category : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateTermJsonLd(term)).replaceAll('<', String.raw`\u003c`),
        }}
      />
      {draft && <LivePreviewListener />}
      <Container>
        <Story>
          <StoryHeader>
            <Heading as="h1">{term.title || term.term}</Heading>
            {term.context && <Lead>{term.context}</Lead>}
          </StoryHeader>

          <StoryBody>
            {/* Primary definition */}
            {primaryDefinition && (
              <Section>
                {primaryDefinition.variant && (
                  <Heading as="h2">{primaryDefinition.variant}</Heading>
                )}
                {primaryDefinition.definition &&
                  typeof primaryDefinition.definition === 'object' && (
                    <RichText data={primaryDefinition.definition} />
                  )}

                {/* Sources for primary definition */}
                {Array.isArray(primaryDefinition.sources) &&
                  primaryDefinition.sources.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold">Sources:</p>
                      <ul className="list-disc list-inside text-sm">
                        {primaryDefinition.sources.map((source) => {
                          if (typeof source === 'object' && source !== null && 'title' in source) {
                            return (
                              <li key={source.id || source.resourceId}>
                                {typeof source.resourceId === 'string' ? (
                                  <Link href={`/${locale}/i/source/${source.resourceId}`}>
                                    {source.title}
                                  </Link>
                                ) : (
                                  source.title
                                )}
                              </li>
                            );
                          }
                          return null;
                        })}
                      </ul>
                    </div>
                  )}
              </Section>
            )}

            {/* Alternative definitions */}
            {alternativeDefinitions.length > 0 && (
              <Section>
                <Heading as="h2">Alternative Definitions</Heading>
                {alternativeDefinitions.map((def) => (
                  <div key={def.id} className="mb-6">
                    {def.variant && <Heading as="h3">{def.variant}</Heading>}
                    {def.definition && typeof def.definition === 'object' && (
                      <RichText data={def.definition} />
                    )}

                    {/* Sources for alternative definition */}
                    {Array.isArray(def.sources) && def.sources.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold">Sources:</p>
                        <ul className="list-disc list-inside text-sm">
                          {def.sources.map((source) => {
                            if (
                              typeof source === 'object' &&
                              source !== null &&
                              'title' in source
                            ) {
                              return (
                                <li key={source.id || source.resourceId}>
                                  {typeof source.resourceId === 'string' ? (
                                    <Link href={`/${locale}/i/source/${source.resourceId}`}>
                                      {source.title}
                                    </Link>
                                  ) : (
                                    source.title
                                  )}
                                </li>
                              );
                            }
                            return null;
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </Section>
            )}

            {/* Synonyms */}
            {synonyms.length > 0 && (
              <Section>
                <Heading as="h2">Synonyms</Heading>
                <p>
                  {synonyms
                    .map((s) => (typeof s === 'object' && s !== null && 'synonym' in s ? s.synonym : ''))
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </Section>
            )}

            {/* Related terms */}
            {relatedTerms.length > 0 && (
              <Section>
                <Heading as="h2">Related Terms</Heading>
                <ul className="list-disc list-inside">
                  {relatedTerms.map((rt) => {
                    if (typeof rt === 'object' && rt !== null && 'title' in rt) {
                      return (
                        <li key={rt.id}>
                          {typeof rt.resourceId === 'string' ? (
                            <Link href={`/${locale}/t/${rt.resourceId}`}>{rt.title}</Link>
                          ) : (
                            rt.title
                          )}
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              </Section>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <Section>
                <Heading as="h2">Categories</Heading>
                <p>
                  {categories
                    .map((cat) => (typeof cat === 'object' && cat !== null && 'title' in cat ? cat.title : ''))
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </Section>
            )}
          </StoryBody>
        </Story>
      </Container>
    </>
  );
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, resourceId } = await paramsPromise;

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'terms',
    limit: 1,
    overrideAccess: false,
    where: {
      resourceId: {
        equals: resourceId,
      },
    },
    locale: locale as 'en' | 'no' | 'all',
  });

  const term = result.docs[0];

  if (!term) {
    return {};
  }

  // Find primary definition or use first
  const definitions = Array.isArray(term.definitions) ? term.definitions : [];
  const primaryDefinition = definitions.find((d) => d.isPrimary) || definitions[0];

  const description = primaryDefinition?.shortDefinition || extractPlainText(primaryDefinition?.definition).substring(0, 160);

  return generateMeta({
    doc: {
      title: term.title || term.term || 'Term',
      meta: {
        description: description || `Definition of ${term.term}`,
      },
    },
  });
}
