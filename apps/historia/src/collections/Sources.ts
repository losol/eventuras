import type { CollectionConfig } from 'payload';

import resourceId from '@/fields/resourceId';
import { generatePreviewPath } from '@/utilities/generatePreviewPath';

import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { siteEditors } from '../access/siteRoleAccess';
import { accessOR } from '../access/utils/accessOR';

export const Sources: CollectionConfig = {
  slug: 'sources',
  admin: {
    useAsTitle: 'title',
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
          collection: 'sources',
          req,
        });
        return path;
      },
    },
    preview: (data, { req }) => {
      const path = generatePreviewPath({
        resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
        collection: 'sources',
        req,
      });
      return path;
    },
  },
  access: {
    read: anyone,
    create: accessOR(admins, siteEditors),
    update: accessOR(admins, siteEditors),
    delete: admins,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            // Title
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Title',
            },

            // Contributors (with roles)
            {
              name: 'contributors',
              type: 'array',
              label: 'Contributors',
              admin: {
                description: 'People or organizations who contributed to this work. Order matters.',
              },
              fields: [
                {
                  name: 'entity',
                  type: 'relationship',
                  relationTo: ['persons', 'organizations'],
                  label: 'Person/Organization',
                  required: true,
                },
                {
                  name: 'role',
                  type: 'select',
                  label: 'Role',
                  required: true,
                  defaultValue: 'author',
                  options: [
                    { label: 'Author', value: 'author' },
                    { label: 'Editor', value: 'editor' },
                    { label: 'Translator', value: 'translator' },
                    { label: 'Interviewer', value: 'interviewer' },
                    { label: 'Interviewee', value: 'interviewee' },
                    { label: 'Producer', value: 'producer' },
                    { label: 'Contributor', value: 'contributor' },
                  ],
                },
              ],
            },

            {
              name: 'sourceType',
              type: 'select',
              options: [
                // Academic
                { label: 'Journal Article', value: 'article-journal' },
                { label: 'Book', value: 'book' },
                { label: 'Book Chapter', value: 'chapter' },
                { label: 'Report', value: 'report' },
                { label: 'Thesis', value: 'thesis' },
                { label: 'Conference Paper', value: 'paper-conference' },

                // Media/web
                { label: 'Webpage', value: 'webpage' },
                { label: 'Newspaper Article', value: 'article-newspaper' },

                // Legal/government
                { label: 'Legislation', value: 'legislation' },
              ],
            },

            // Publisher
            {
              name: 'publisher',
              type: 'text',
              label: 'Publisher',
              admin: {
                description: 'Name of the publisher',
              },
            },

            // Published date
            {
              name: 'publishedDate',
              type: 'date',
              label: 'Published Date',
            },

            // URL
            {
              name: 'url',
              type: 'text',
              label: 'URL',
            },

            // Accessed date (for web sources)
            {
              name: 'accessedDate',
              type: 'date',
              label: 'Accessed Date',
              admin: {
                condition: (data) => data?.sourceType === 'webpage',
              },
            },

            // Publication place
            {
              name: 'publicationPlace',
              type: 'text',
              label: 'Publication Place',
              admin: {
                description: 'e.g. "Oslo", "New York"',
                condition: (data) => ['book', 'chapter', 'thesis'].includes(data?.sourceType),
              },
            },

            // Edition
            {
              name: 'edition',
              type: 'text',
              label: 'Edition',
              admin: {
                condition: (data) => data?.sourceType === 'book',
              },
            },

            // Files upload (multiple)
            {
              name: 'files',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Files',
              admin: {
                description: 'Upload source documents (PDFs, different editions, etc.)',
              },
            },

            // Identifiers (ISBN, DOI, etc.)
            {
              name: 'identifiers',
              type: 'array',
              label: 'Identifiers',
              admin: {
                description: 'Add one or more identifiers (ISBN, DOI, PMID, etc.)',
              },
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  label: 'Type',
                  required: true,
                  options: [
                    { label: 'ISBN', value: 'isbn' },
                    { label: 'DOI', value: 'doi' },
                    { label: 'PMID', value: 'pmid' },
                    { label: 'arXiv', value: 'arxiv' },
                    { label: 'ISSN', value: 'issn' },
                    { label: 'Other', value: 'other' },
                  ],
                },
                {
                  name: 'value',
                  type: 'text',
                  label: 'Value',
                  required: true,
                },
              ],
            },

            // Publication context
            {
              name: 'publicationContext',
              type: 'group',
              label: 'Publication Context',
              fields: [
                {
                  name: 'containerTitle',
                  type: 'text',
                  label: 'Journal/Book Title',
                  admin: {
                    description: 'Title of journal, magazine, or edited book containing this article',
                  },
                },
                {
                  name: 'volume',
                  type: 'text',
                  label: 'Volume',
                },
                {
                  name: 'issue',
                  type: 'text',
                  label: 'Issue',
                },
                {
                  name: 'page',
                  type: 'text',
                  label: 'Pages',
                  admin: {
                    description: 'e.g. "123-145", "S12-S15", "xii-xv"',
                  },
                },
              ],
            },

            // Resource ID
            resourceId,
          ],
        },
      ],
    },
  ],
};
