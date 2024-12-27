import type { Metadata } from 'next';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import React, { cache } from 'react';
import { notFound } from 'next/navigation';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { Hero } from '@/heros/Hero';
import PageClient from './page.client';
import { LivePreviewListener } from '@/components/LivePreviewListener';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });

  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      breadcrumbs: true,
    },
  });

  return pages.docs.map((page) => ({
    slug: [page.slug]
  }));
}

type Args = {
  params: {
    slug?: string[];
  };
};

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode();
  const params = await paramsPromise;

  // Get the last segment of the URL or 'home' for root
  const currentSlug = params.slug?.length ? params.slug[params.slug.length - 1] : 'home';

  const page = await queryPageBySlug({ slug: currentSlug });

  if (!page) {
    notFound();
  }

  const { title, image, breadcrumbs, story } = page;
  console.log('page', page.breadcrumbs);

  return (
    <>
      <PageClient />
      <LivePreviewListener />
      <article className="pt-16 pb-24">
        <section className="container">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb flex gap-2">
                <li className="breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={breadcrumb.id} className="breadcrumb-item flex items-center">
                    <span className="mx-2">/</span>
                    {index === breadcrumbs.length - 1 ? (
                      <span>{breadcrumb.label}</span>
                    ) : (
                      <a href={breadcrumb.url}>{breadcrumb.label}</a>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <Hero title={title} image={image} />
          <RenderBlocks blocks={story} />
        </section>
      </article>
    </>
  );
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug
      }
    },
    select: {
      title: true,
      slug: true,
      image: true,
      contributors: true,
      license: true,
      publishedAt: true,
      parent: true,
      breadcrumbs: true,
      story: true,
    },
  });

  return result.docs?.[0] || null;
});
