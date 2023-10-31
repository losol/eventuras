import { OrganizationMemberRolesService, UsersService } from '@losol/eventuras';
import { NextPage } from 'next';
import { headers } from 'next/headers';

import { Unauthorized } from '@/components/ui/Unauthorized';
import Environment from '@/utils/Environment';
import { setupOpenAPI } from '@/utils/setupOpenApi';

const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);

const withAuthorization = (WrappedComponent: NextPage, role: string): NextPage => {
  const WithAuthorizationWrapper: NextPage = async props => {
    setupOpenAPI(headers().get('Authorization'));

    let user;
    try {
      user = await UsersService.getV3UsersMe({});
    } catch (error) {
      return <Unauthorized />;
    }

    if (!user) {
      return <Unauthorized />;
    }

    let roles;
    try {
      roles = await OrganizationMemberRolesService.getV3OrganizationsMembersRoles({
        organizationId: ORGANIZATION_ID,
        userId: user.id!,
        eventurasOrgId: ORGANIZATION_ID,
      });
    } catch (error) {
      return <Unauthorized />;
    }

    if (!roles.includes(role)) {
      return <Unauthorized />;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthorizationWrapper;
};

export default withAuthorization;
