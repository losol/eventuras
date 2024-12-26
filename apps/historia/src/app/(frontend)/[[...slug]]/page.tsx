import type { Metadata } from 'next';

import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import React, { cache } from 'react';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { Hero } from '@/heros/Hero';
import { generateMeta } from '@/utilities/generateMeta';
import PageClient from './page.client';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { Topics } from '@/components/Topics';
import { PayloadRedirects } from '@/components/PayloadRedirects';

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

  const params = pages.docs.map((page) => {
    if (page.breadcrumbs) {
      const urlSegments = page.breadcrumbs.map((crumb) => crumb.url.split('/')).flat();
      return { slug: urlSegments.slice(1) };
    }

    return { slug: [page.slug] };
  });

  return params;
}

type Args = {
  params: {
    slug?: string | string[];
  };
};

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode();

  const params = await paramsPromise;

  const slug = Array.isArray(params.slug)
    ? params.slug[params.slug.length - 1]
    : params.slug || 'home';

  const page = await queryPageBySlug({ slug });

  if (!page) {
    return (
      <section className="pt-16 pb-24">
        <div className="text-center">
          <h1>Page Not Found</h1>
        </div>
      </section>
    );
  }

  const { title, image, breadcrumbs, story } = page;

  return (
    <article className="pt-16 pb-24">
      <section className="container">
        {breadcrumbs && (
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              {breadcrumbs.map((breadcrumb) => (
                <li key={breadcrumb.id} className="breadcrumb-item">
                  <a href={breadcrumb.url}>{breadcrumb.label}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <Hero title={title} image={image} />
        <RenderBlocks blocks={story} />
      </section>
    </article>
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
        equals: slug,
      },
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
