import type { CollectionConfig } from 'payload';
import { populatePublishedAt } from '../../hooks/populatePublishedAt';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';
import { revalidatePage } from './hooks/revalidatePage';
import { revalidateDelete } from './hooks/revalidatePage';
import { admins } from '@/access/admins';
import { publishedOnly } from '@/access/publishedOnly';
import { slugField } from '@/fields/slug';
import { image } from '@/fields/image';
import { story } from '@/fields/story';
import { contributors } from '@/fields/contributor';
import { license } from '@/fields/license';
import { createParentField } from '@payloadcms/plugin-nested-docs';
import { createBreadcrumbsField } from '@payloadcms/plugin-nested-docs';

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields';
import { anyone } from '@/access/anyone';

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: admins,
    read: anyone, // publishedOnly,
    readVersions: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
          req,
        });

        return path;
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            image,
            story
          ],
        },
        {
          label: 'Meta',
          fields: [
            ...slugField(),
            contributors,
            license,
            {
              name: 'publishedAt',
              type: 'date',
            },
          ]
        },
        {
          label: 'Seo',
          name: 'seo',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
            {
              name: 'relatedContent',
              type: 'relationship',
              relationTo: ['articles', 'pages'],
              hasMany: true,
              filterOptions: ({ id }) => ({
                id: { not_in: [id] },
              }),
            },
          ],
        },
        createParentField('pages',
          {
            admin: {
              position: undefined,
            },
          },
        ),
        createBreadcrumbsField('pages',
          {
            admin: {
              position: undefined,
              initCollapsed: true,
            },
          },
        )

      ],
      defaultPopulate: {
        title: true,
        slug: true,
        meta: {
          title: true,
          description: true,
          image: true,
        },
      },
      hooks: {
        afterChange: [revalidatePage],
        beforeChange: [populatePublishedAt],
        beforeDelete: [revalidateDelete],
      },
      versions: {
        drafts: {
          autosave: {
            interval: 100,
          },
        },
        maxPerDoc: 50,
      },
    }
  ],
};
