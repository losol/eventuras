import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { ThreeColumnLayout } from '@eventuras/ratio-ui/pages/ThreeColumnLayout';

import { getDocBySlug, getSidebarTree } from '../lib/content';
import { DocSidebarNav } from './sidebar-nav';
import { MarkdownRenderer } from './markdown-renderer';

export default function DocsIndexPage() {
  const tree = getSidebarTree();
  const doc = getDocBySlug([]);

  return (
    <ThreeColumnLayout
      left={<DocSidebarNav tree={tree} />}
    >
      <article>
        <Heading as="h1">{doc?.frontmatter.title ?? 'Documentation'}</Heading>
        {doc?.frontmatter.description && (
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {doc.frontmatter.description}
          </p>
        )}
        {doc?.content && (
          <div className="prose mt-8">
            <MarkdownRenderer content={doc.content} />
          </div>
        )}
      </article>
    </ThreeColumnLayout>
  );
}
