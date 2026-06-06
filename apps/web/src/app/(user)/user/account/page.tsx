import { getTranslations } from 'next-intl/server';

import { Accordion } from '@eventuras/ratio-ui/core/Accordion';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';

import UserEditor from '@/app/(admin)/admin/users/UserEditor';
import { getV3Userprofile } from '@/lib/eventuras-sdk';

const UserAccountPage = async () => {
  const t = await getTranslations();
  // Fetch user profile - this uses the authenticated client
  const response = await getV3Userprofile();
  if (!response.data) {
    return <div>{t('user.page.profileNotFound')}</div>;
  }
  const userId = response.data.id;

  return (
    <Container>
      <Heading>{t('user.profile.page.heading')}</Heading>
      <UserEditor user={response.data} />
      {userId && (
        <Accordion>
          <Accordion.Item className="mt-8">
            <Accordion.Summary>{t('user.account.details.title')}</Accordion.Summary>
            <Accordion.Content>
              <DescriptionList>
                <DescriptionList.Item>
                  <DescriptionList.Term>{t('user.account.details.userId')}</DescriptionList.Term>
                  <DescriptionList.Definition>
                    <span className="font-mono select-all">{userId}</span>
                  </DescriptionList.Definition>
                </DescriptionList.Item>
              </DescriptionList>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      )}
    </Container>
  );
};
export default UserAccountPage;
