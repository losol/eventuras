import type { Access } from 'payload/config';

/// Access control function to only allow published content to be read
/// Based on https://github.com/payloadcms/website-cms/blob/main/src/access/publishedOnly.ts
/// @param {Access} - Access control object
/// @returns {boolean} - Returns true if status is published or user is an admin , otherwise returns an object with a status of 'published'

export const publishedOnly: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) {
    return true;
  }

  return {
    _status: {
      equals: 'published',
    },
  };
};
