import type { CollectionConfig } from 'payload';

import path from 'path';
import { fileURLToPath } from 'url';

import { anyone } from '@/access/anyone';
import { admins } from '@/access/admins';
import { license } from '@/fields/license';
import { contributors } from '@/fields/contributors';
import { contentPersons } from '@/fields/contentPersons';
import { contentLocations } from '@/fields/contentLocations';
import { name } from '@/fields/name';
import { description } from '@/fields/description';
import { relatedContent } from '@/fields/relatedContent';
import { title } from '@/fields/title';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
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
        position: 'center',
        withoutEnlargement: false
      },
      {
        name: 'standard',
        width: 1920,
        height: 1080,
        position: 'center',
        withoutEnlargement: false
      },
    ],
  },
};
