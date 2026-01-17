import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { siteEditors } from '@/access/siteRoleAccess';
import { accessOR } from '@/access/utils/accessOR';
import { config } from '@/fields/config';
import { contentLocations } from '@/fields/contentLocations';
import { endDate } from '@/fields/endDate';
import { image } from '@/fields/image';
import { lead } from '@/fields/lead';
import { program } from '@/fields/program';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { startDate } from '@/fields/startDate';
import { storyField } from '@/fields/story';
import { title } from '@/fields/title';
import { seoTab } from '@/lib/payload-plugin-seo';



export const Happenings: CollectionConfig = {
  slug: 'happenings',
  access: {
    read: anyone,
    create: accessOR(admins, siteEditors),
    update: accessOR(admins, siteEditors),
    delete: admins,
  },
  admin: {
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
            storyField(),
            startDate,
            endDate,
            program,
            contentLocations,
          ],
        },
        {
          label: 'Meta',
          fields: [
            ...slugField(),
            resourceId,
            config,
          ],
        },
        seoTab(),
      ],
    },
  ],
};
