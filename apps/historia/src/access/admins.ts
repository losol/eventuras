import type { Access, FieldAccess } from 'payload';

export const admins: Access = ({ req: { user } }) => {
  // Return true or false based on if the user has an admin role
  // Check if user is from 'users' collection and has roles
  return Boolean(user && 'roles' in user && user.roles?.includes('admin'));
};

export const adminsFieldLevel: FieldAccess = ({ req: { user } }) => {
  // Return true or false based on if the user has an admin role
  // Check if user is from 'users' collection and has roles
  return Boolean(user && 'roles' in user && user.roles?.includes('admin'));
};
