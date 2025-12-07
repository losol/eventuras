'use client';

import React from 'react';
import Link from 'next/link';

import type { NavBlock, Page } from '@/payload-types';

interface FooterClientProps {
  navigation?: NavBlock[] | null;
}

export const FooterClient: React.FC<FooterClientProps> = ({ navigation }) => {
  if (!navigation || navigation.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {navigation.map((navBlock, index) => (
        <div key={navBlock.id || index}>
          {navBlock.title && (
            <h3 className="mb-4 text-sm font-semibold uppercase dark:text-white">
              {navBlock.title}
            </h3>
          )}
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            {navBlock.items?.map((item, itemIndex) => {
              if (item.blockType === 'separator') {
                if (item.style === 'line') {
                  return (
                    <li
                      key={item.id || itemIndex}
                      className="border-t border-gray-300 dark:border-gray-700"
                    />
                  );
                }
                if (item.style === 'space') {
                  return <li key={item.id || itemIndex} className="h-4" />;
                }
                if (item.style === 'dots') {
                  return (
                    <li
                      key={item.id || itemIndex}
                      className="text-center text-gray-400"
                    >
                      • • •
                    </li>
                  );
                }
              }

              if (item.blockType === 'internalLink') {
                const page = item.page;
                const slug = typeof page === 'object' ? (page as Page).slug : null;

                if (!slug) return null;

                return (
                  <li key={item.id || itemIndex}>
                    <Link
                      href={slug}
                      className="hover:underline"
                    >
                      {item.text}
                    </Link>
                  </li>
                );
              }

              if (item.blockType === 'externalLink') {
                return (
                  <li key={item.id || itemIndex}>
                    <a
                      href={item.href}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="hover:underline"
                    >
                      {item.text}
                    </a>
                  </li>
                );
              }

              return null;
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};
