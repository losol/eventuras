'use client';

import React from 'react';
import { Contributors as ContributorsType } from '@/payload-types';

interface ContributorsProps {
  contributors: ContributorsType | null;
}

export const Contributors: React.FC<ContributorsProps> = ({ contributors }) => {
  if (!contributors || contributors.length === 0) return null;

  return (
    <div className="mt-4 text-sm">
      <p>Contributors:</p>
      <ul className="mt-2 space-y-1">
        {contributors.map((contributor, index) => {
          return (
            <li key={contributor.id || index} className="flex items-center gap-2">
              <span className="font-semibold">{contributor.person.toString()}</span>
              <span className="text-gray-400">({contributor.role})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
