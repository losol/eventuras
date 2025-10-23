import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';

import UserEditor from '@/app/(admin)/admin/users/UserEditor';
import { getV3UsersMe } from "@/lib/eventuras-sdk";

const UserAccountPage = async () => {
  const t = await getTranslations();
  // Fetch user profile - this uses the authenticated client
  const response = await getV3UsersMe();
  if (!response.data) {
    return <div>{t('user.page.profileNotFound')}</div>;
  }
  return (
    <>
      <Heading>{t('user.profile.page.heading')}</Heading>
      <UserEditor user={response.data} />
    </>
  );
};
export default UserAccountPage;
