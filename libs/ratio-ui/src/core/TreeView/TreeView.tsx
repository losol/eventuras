'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight } from '../../icons';

export interface TreeViewNode {
  title: string;
  href?: string;
  children?: TreeViewNode[];
}

export interface TreeViewProps {
  /** Hierarchical tree of navigation nodes */
  tree: TreeViewNode[];
  /** Currently active path — used to highlight the active item and auto-expand ancestors */
  currentPath?: string;
  /** Routing link component (e.g. Next.js Link, React Router Link) */
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
  /** Accessible label for the nav element */
  'aria-label'?: string;
  className?: string;
}

/**
 * Hierarchical tree navigation with collapsible sections and active-path highlighting.
 *
 * Pass a `LinkComponent` for SPA routers (e.g. Next.js `Link`).
 * When no `currentPath` is provided, no item is highlighted.
 */
export function TreeView({
  tree,
  currentPath,
  LinkComponent,
  'aria-label': ariaLabel = 'Navigation',
  className = '',
}: Readonly<TreeViewProps>) {
  return (
    <nav aria-label={ariaLabel} className={`text-sm ${className}`}>
      <ul className="space-y-1">
        {tree.map((node) => (
          <TreeViewItem
            key={node.href ?? node.title}
            node={node}
            currentPath={currentPath}
            LinkComponent={LinkComponent}
            depth={0}
          />
        ))}
      </ul>
    </nav>
  );
}

interface TreeViewItemProps {
  node: TreeViewNode;
  currentPath?: string;
  LinkComponent?: TreeViewProps['LinkComponent'];
  depth: number;
}

function isActive(href: string | undefined, currentPath: string | undefined): boolean {
  if (!href || !currentPath) return false;
  const a = href.replace(/\/$/, '') || '/';
  const b = currentPath.replace(/\/$/, '') || '/';
  return a === b;
}

function hasActiveChild(node: TreeViewNode, currentPath: string | undefined): boolean {
  if (!currentPath) return false;
  if (isActive(node.href, currentPath)) return true;
  return node.children?.some((child) => hasActiveChild(child, currentPath)) ?? false;
}

function TreeViewItem({ node, currentPath, LinkComponent, depth }: Readonly<TreeViewItemProps>) {
  const hasChildren = node.children && node.children.length > 0;
  const active = isActive(node.href, currentPath);
  const containsActive = hasActiveChild(node, currentPath);

  const [isOpen, setIsOpen] = useState(containsActive || active);

  // Auto-expand when currentPath changes to match this node or its children
  useEffect(() => {
    if (containsActive || active) {
      setIsOpen(true);
    }
  }, [containsActive, active]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const LinkTag = LinkComponent ?? ('a' as React.ElementType);
  const paddingLeft = `${0.75 + depth * 0.75}rem`;

  if (hasChildren) {
    return (
      <li>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left transition-colors
            ${containsActive ? 'font-medium text-(--text)' : 'text-(--text-muted)'}
            hover:bg-card-hover`}
          style={{ paddingLeft }}
        >
          <span>{node.title}</span>
          <ChevronRight
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
        </button>
        {isOpen && (
          <ul className="mt-1 space-y-1">
            {node.href && (
              <TreeViewLink
                href={node.href}
                title="Overview"
                active={active}
                LinkTag={LinkTag}
                paddingLeft={`${0.75 + (depth + 1) * 0.75}rem`}
              />
            )}
            {node.children!.map((child) => (
              <TreeViewItem
                key={child.href ?? child.title}
                node={child}
                currentPath={currentPath}
                LinkComponent={LinkComponent}
                depth={depth + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <TreeViewLink
      href={node.href ?? '#'}
      title={node.title}
      active={active}
      LinkTag={LinkTag}
      paddingLeft={paddingLeft}
    />
  );
}

function TreeViewLink({
  href,
  title,
  active,
  LinkTag,
  paddingLeft,
}: Readonly<{
  href: string;
  title: string;
  active: boolean;
  LinkTag: React.ElementType;
  paddingLeft: string;
}>) {
  return (
    <li>
      <LinkTag
        href={href}
        className={`block rounded-md px-3 py-1.5 transition-colors
          ${active
            ? 'bg-primary-100 dark:bg-primary-800 font-medium text-(--primary)'
            : 'text-(--text-muted) hover:bg-card-hover hover:text-(--text)'
          }`}
        style={{ paddingLeft }}
        aria-current={active ? 'page' : undefined}
      >
        {title}
      </LinkTag>
    </li>
  );
}
