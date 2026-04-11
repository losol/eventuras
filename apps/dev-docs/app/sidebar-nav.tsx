'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { TreeView, type TreeViewNode } from '@eventuras/ratio-ui/core/TreeView';

interface DocSidebarNavProps {
  tree: TreeViewNode[];
}

/**
 * Wrapper that provides the current pathname and Next.js Link to TreeView.
 */
export function DocSidebarNav({ tree }: Readonly<DocSidebarNavProps>) {
  const pathname = usePathname();

  return (
    <TreeView
      tree={tree}
      currentPath={pathname}
      LinkComponent={Link}
      aria-label="Documentation"
    />
  );
}
