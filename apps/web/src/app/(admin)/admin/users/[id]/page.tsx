import { getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { getV3UsersById } from '@/lib/eventuras-sdk';

import UserEditor from '../UserEditor';

type EventInfoProps = {
  params: Promise<{
    id: string;
  }>;
};
const AdminUserDetailPage: React.FC<EventInfoProps> = async props => {
  const params = await props.params;
  const t = await getTranslations();
  const response = await getV3UsersById({
    path: { id: params.id },
  });
  if (!response.data) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch user id ${params.id}, error: ${response.error}`
    );
  }
  if (!response.data) {
    return <div>{t('admin.users.labels.userNotFound')}</div>;
  }
  return (
    <>
      <Section className="bg-white dark:bg-black pb-8">
        <Container>
          <Heading as="h1">{t('admin.users.detailspage.title')}</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <UserEditor user={response.data} adminMode />
        </Container>
      </Section>
    </>
  );
};
export default AdminUserDetailPage;
