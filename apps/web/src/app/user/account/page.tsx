import Heading from '@eventuras/ui/Heading';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import FixedContainer from '@/components/eventuras/navigation/FixedContainer';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';

import UserEditor from '../../admin/users/UserEditor';

const UserAccountPage = async () => {
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const { t } = createTranslation();

  const result = await apiWrapper(() => eventuras.users.getV3UsersMe({}));
  if (!result.ok || !result.value) {
    return <FixedContainer>{t('user:page.profileNotFound')}</FixedContainer>;
  }

  return (
    <FixedContainer>
      <Heading>{t('user:profile.page.heading')}</Heading>
      <UserEditor user={result.value} />
    </FixedContainer>
  );
};

export default UserAccountPage;
