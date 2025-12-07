import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { addressGroup } from '@/fields/address';
import { description } from '@/fields/description';
import { image } from '@/fields/image';
import { name } from '@/fields/name';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { url } from '@/fields/url';

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    name,
    description,
    {
      name: 'organizationNumber',
      type: 'text',
      label: 'Organization Number',
      admin: {
        placeholder: 'e.g., NO24352345MVA',
        description: 'VAT or business registration number',
      },
    },
    url,
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      admin: {
        placeholder: 'contact@example.com',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
      admin: {
        placeholder: '+47 123 45 678',
      },
    },
    addressGroup('address'),
    image,
    ...slugField("name"),
    resourceId
  ],
};
