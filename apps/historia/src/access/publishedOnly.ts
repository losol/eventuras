import type { Access } from 'payload';

export const publishedOnly: Access = ({ req: { user } }) => {
  // Check if user is from 'users' collection and has roles
  if (user && 'roles' in user && user.roles?.includes('admin')) {
    return true;
  }

  return {
    _status: {
      equals: 'published',
    },
  };
};
