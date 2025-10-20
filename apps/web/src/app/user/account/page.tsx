import { Heading } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import { getV3UsersMe } from '@eventuras/event-sdk';

import UserEditor from '../../admin/users/UserEditor';

const UserAccountPage = async () => {
  const t = await getTranslations();

  try {
    // No need to create a client - the SDK uses the configured global client
    const response = await getV3UsersMe();
    if (!response.data) {
      return {t('user.page.profileNotFound')};
    }

    return (
      <Heading>{t('user.profile.page.heading')}</Heading>
        <UserEditor user={response.data} />
    );
  } catch (error) {
    // Gracefully handle connection errors during build
    return {t('user.page.profileNotFound')};
  }
};

export default UserAccountPage;
