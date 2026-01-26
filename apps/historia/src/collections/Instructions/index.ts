import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { publishedOnly } from '@/access/publishedOnly';
import { siteEditors } from '@/access/siteRoleAccess';
import { accessOR } from '@/access/utils/accessOR';
import { Content } from '@/blocks/Content/config';
import { InstructionBlock } from '@/blocks/InstructionBlock/config';
import { InstructionSection } from '@/blocks/InstructionSection/config';
import { ResourcesBlock } from '@/blocks/ResourcesBlock/config';
import { config } from '@/fields/config';
import { image } from '@/fields/image';
import { lead } from '@/fields/lead';
import { publishedAt } from '@/fields/publishedAt';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { storyField } from '@/fields/story';
import { title } from '@/fields/title';
import { seoTab } from '@/lib/payload-plugin-seo';

import { revalidateInstruction } from './hooks/revalidateInstruction';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';

export const Instructions: CollectionConfig = {
  slug: 'instructions',
  access: {
    create: accessOR(admins, siteEditors),
    read: publishedOnly,
    readVersions: admins,
    update: accessOR(admins, siteEditors),
    delete: admins,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
          collection: 'instructions',
          req,
        });

        return path;
      },
    },
    preview: (data, { req }) => {
      const path = generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
        collection: 'instructions',
        req
      });

      return path;
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            title,
            lead,
            image,
            storyField([
              Content,
              ResourcesBlock,
              InstructionBlock,
              InstructionSection,
            ]),
          ],
        },
        {
          label: 'Meta',
          fields: [
            publishedAt,
            ...slugField(),
            resourceId,
            config,
          ],
        },
        seoTab(),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateInstruction],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 1000,
      },
    },
  },
};
