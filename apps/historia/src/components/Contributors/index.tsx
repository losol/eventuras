'use client';

import React from 'react';
import { Contributor } from '@/payload-types';

interface ContributorsProps {
  contributors: Contributor[];
}

export const Contributors: React.FC<ContributorsProps> = ({ contributors }) => {
  if (!contributors || contributors.length === 0) return null;

  return (
    <div className="mt-4 text-sm">
      <p>Contributors:</p>
      <ul className="mt-2 space-y-1">
        {contributors.map(({ person, role, id }, index) => {
          const name =
            typeof person === 'object' && person !== null ? person.name : `Person ${person}`;
          const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1);

          return (
            <li key={id || index} className="flex items-center gap-2">
              <span className="font-semibold">{name}</span>
              <span className="text-gray-400">({roleCapitalized})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
