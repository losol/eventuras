'use client';

import Link from 'next/link';

import { Breadcrumb, Breadcrumbs } from '@eventuras/ratio-ui/core/Breadcrumbs';

interface DocBreadcrumbsProps {
  segments: { label: string; href?: string }[];
}

export function DocBreadcrumbs({ segments }: DocBreadcrumbsProps) {
  return (
    <Breadcrumbs LinkComponent={Link}>
      {segments.map((segment, i) =>
        segment.href ? (
          <Breadcrumb key={i} href={segment.href}>
            {segment.label}
          </Breadcrumb>
        ) : (
          <Breadcrumb key={i}>{segment.label}</Breadcrumb>
        ),
      )}
    </Breadcrumbs>
  );
}
