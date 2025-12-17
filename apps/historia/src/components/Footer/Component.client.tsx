'use client';

import React from 'react';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { List } from '@eventuras/ratio-ui/core/List';
import { Link } from '@eventuras/ratio-ui-next';

import { useLocale } from '@/hooks/useLocale';
import type { NavBlock, Page } from '@/payload-types';
import { getPageUrl } from '@/utilities/getPageUrl';

interface FooterClientProps {
  navigation?: NavBlock[] | null;
}

export const FooterClient: React.FC<FooterClientProps> = ({ navigation }) => {
  const locale = useLocale();

  if (!navigation || navigation.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {navigation.map((navBlock, index) => (
        <div key={navBlock.id || index}>
          {navBlock.title && (
            <Heading
              as="h3"
              className="pb-2 text-sm font-semibold uppercase"
              onDark
              padding="p-0"
            >
              {navBlock.title}
            </Heading>
          )}
          <List
            as="ul"
            variant="unstyled"
            className="space-y-2 text-gray-600 dark:text-gray-400"
          >
            {navBlock.items?.map((item, itemIndex) => {
              if (item.blockType === 'separator') {
                if (item.style === 'line') {
                  return (
                    <List.Item
                      key={item.id || itemIndex}
                      className="border-t border-gray-300 dark:border-gray-700"
                    />
                  );
                }
                if (item.style === 'space') {
                  return <List.Item key={item.id || itemIndex} className="h-4" />;
                }
                if (item.style === 'dots') {
                  return (
                    <List.Item
                      key={item.id || itemIndex}
                      className="text-center text-gray-400"
                    >
                      • • •
                    </List.Item>
                  );
                }
              }

              if (item.blockType === 'internalLink') {
                const page = item.page;
                const pageObject = typeof page === 'object' ? (page as Page) : null;
                const slug = pageObject?.slug;

                if (!slug) return null;

                // Use provided text or fallback to page title
                const linkText = item.text || pageObject?.title || slug;

                return (
                  <List.Item key={item.id || itemIndex}>
                    <Link href={getPageUrl(slug, locale)} className="hover:underline">
                      {linkText}
                    </Link>
                  </List.Item>
                );
              }

              if (item.blockType === 'externalLink') {
                return (
                  <List.Item key={item.id || itemIndex}>
                    <a
                      href={item.url ?? undefined}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="hover:underline"
                    >
                      {item.text}
                    </a>
                  </List.Item>
                );
              }

              return null;
            })}
          </List>
        </div>
      ))}
    </div>
  );
};
