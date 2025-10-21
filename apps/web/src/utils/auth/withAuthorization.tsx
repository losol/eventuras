import { NextPage } from 'next';

import { Unauthorized } from '@eventuras/ratio-ui/blocks/Unauthorized';

import { checkAuthorization } from './checkAuthorization';

/**
 * Higher-order component that wraps a page with authorization checks.
 * Uses event-sdk via server action to verify user has required role.
 *
 * @param WrappedComponent - The Next.js page component to protect
 * @param role - The required role name (e.g., 'Admin', 'SuperAdmin')
 * @returns A new page component that checks authorization before rendering
 *
 * @example
 * ```tsx
 * const AdminPage = async () => {
 *   return <div>Admin Content</div>;
 * };
 *
 * export default withAuthorization(AdminPage, 'Admin');
 * ```
 */
const withAuthorization = (WrappedComponent: NextPage, role: string): NextPage => {
  const WithAuthorizationWrapper: NextPage = async props => {
    // Check authorization using server action
    const authResult = await checkAuthorization(role);

    // If not authorized, show unauthorized page
    if (!authResult.authorized) {
      return <Unauthorized />;
    }

    // User is authorized, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  return WithAuthorizationWrapper;
};

export default withAuthorization;
