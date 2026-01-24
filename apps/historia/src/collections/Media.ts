import path from 'path';
import { fileURLToPath } from 'url';

import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { siteEditors } from '@/access/siteRoleAccess';
import { accessOR } from '@/access/utils/accessOR';
import { contributors } from '@/fields/contributors';
import { description } from '@/fields/description';
import { license } from '@/fields/license';
import { relatedContent } from '@/fields/relatedContent';
import { title } from '@/fields/title';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    create: accessOR(admins, siteEditors),
    update: accessOR(admins, siteEditors),
    delete: admins,
  },
  admin: {
    group: 'Media',
    description: 'Organize media assets into collections with optional hierarchy',
  },
  fields: [
    title,
    description,
    license,
    contributors,
    {
      name: 'attributionUrl',
      type: 'text',
      admin: {
        description: 'A URL to the original source of the media.'
      },
    },
    {
      name: 'collection',
      type: 'relationship',
      hasMany: true,
      relationTo: 'media-collections',
      admin: {
        description: 'Optional: organize media into collections',
      },
    },
    relatedContent
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        withoutEnlargement: false,
      },
      {
        name: 'square',
        width: 1080,
        height: 1080,
        withoutEnlargement: false,
      },
      {
        name: 'landscape',
        width: 1920,
        height: 1080,
        withoutEnlargement: false,
      },
      {
        name: 'socialShare',
        width: 1200,
        height: 630,
        withoutEnlargement: false,
      },
      {
        name: 'verticalStory',
        width: 1080,
        height: 1920,
        withoutEnlargement: false,
      },
      {
        name: 'banner',
        width: 2560,
        height: 1080,
        withoutEnlargement: false,
      },
    ],
  },
};
