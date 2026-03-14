import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { ThreeColumnLayout } from '@eventuras/ratio-ui/pages/ThreeColumnLayout';
import { TableOfContents } from '@eventuras/ratio-ui/core/TableOfContents';

import { getAllDocSlugs, getDocBySlug, getSidebarTree } from '../../lib/content';
import { DocSidebarNav } from '../sidebar-nav';
import { MarkdownRenderer } from '../markdown-renderer';
import { DocBreadcrumbs } from '../doc-breadcrumbs';

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string[] }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};

  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

export default async function DocPage(
  props: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await props.params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const tree = getSidebarTree();

  // Build breadcrumb segments
  const segments = [
    { label: 'Home', href: '/' },
    ...slug.slice(0, -1).map((segment, i) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/[-_]/g, ' '),
      href: `/${slug.slice(0, i + 1).join('/')}`,
    })),
    { label: doc.frontmatter.title },
  ];

  return (
    <ThreeColumnLayout
      left={<DocSidebarNav tree={tree} />}
      right={doc.headings.length > 0 ? <TableOfContents headings={doc.headings} /> : undefined}
    >
      <DocBreadcrumbs segments={segments} />

      <article className="mt-6">
        <Heading as="h1">{doc.frontmatter.title}</Heading>
        {doc.frontmatter.description && (
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {doc.frontmatter.description}
          </p>
        )}
        <div className="prose mt-8">
          <MarkdownRenderer content={doc.content} />
        </div>
      </article>
    </ThreeColumnLayout>
  );
}
