import { Heading } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { getV3UsersMe } from '@eventuras/event-sdk';
import { createClient } from '@/utils/apiClient';

import UserEditor from '../../admin/users/UserEditor';

const UserAccountPage = async () => {
  const client = await createClient();
  const t = await getTranslations();

  const response = await getV3UsersMe({ client });
  if (!response.data) {
    return <Wrapper>{t('user.page.profileNotFound')}</Wrapper>;
  }

  return (
    <Wrapper>
      <Heading>{t('user.profile.page.heading')}</Heading>
      <UserEditor user={response.data} />
    </Wrapper>
  );
};

export default UserAccountPage;
