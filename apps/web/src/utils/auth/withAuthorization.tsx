import { get } from 'http';
import { NextPage } from 'next';
import { headers } from 'next/headers';

import { Unauthorized } from '@/components/Unauthorized';
import { getCurrentSession } from '@/lib/auth/session';
import Environment from '@/utils/Environment';

import { createSDK } from '../api/EventurasApi';

const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);

const withAuthorization = (WrappedComponent: NextPage, role: string): NextPage => {
  const WithAuthorizationWrapper: NextPage = async props => {
    const { user, session } = await getCurrentSession();

    const eventuras = createSDK({
      inferUrl: { enabled: true },
      authHeader: session?.accessToken,
    });

    // Check if user is logged in
    const appUser = await eventuras.users.getV3UsersMe({}).catch(() => null);
    console.log('appUser', appUser);
    if (!appUser) {
      return <Unauthorized />;
    }

    const roles = await eventuras.organizationMemberRoles.getV3OrganizationsMembersRoles({
      organizationId: ORGANIZATION_ID,
      userId: appUser.id!,
      eventurasOrgId: ORGANIZATION_ID,
    });

    // Check if user has the required role
    if (!roles.includes(role)) {
      return <Unauthorized />;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthorizationWrapper;
};

export default withAuthorization;
