'use client';
import { useTranslations } from 'next-intl';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { UserDto } from '@/lib/eventuras-sdk';
export type UserProfileCardProps = {
  profile: UserDto;
};
const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  const t = useTranslations();
  return (
    <Card>
      <DescriptionList>
        {profile.name && (
          <DescriptionList.Item>
            <DescriptionList.Term>{t('common.labels.name')}</DescriptionList.Term>
            <DescriptionList.Definition>{profile.name}</DescriptionList.Definition>
          </DescriptionList.Item>
        )}
        {profile.email && (
          <DescriptionList.Item>
            <DescriptionList.Term>{t('common.labels.email')}</DescriptionList.Term>
            <DescriptionList.Definition>{profile.email}</DescriptionList.Definition>
          </DescriptionList.Item>
        )}
        {profile.phoneNumber && (
          <DescriptionList.Item>
            <DescriptionList.Term>{t('common.labels.phoneNumber')}</DescriptionList.Term>
            <DescriptionList.Definition>{profile.phoneNumber}</DescriptionList.Definition>
          </DescriptionList.Item>
        )}
      </DescriptionList>
      <Text marginY="xs">
        <Link href="/user/account" variant="button-outline" marginY="xs">
          {t('common.labels.editProfile')}
        </Link>
      </Text>
    </Card>
  );
};
export default UserProfileCard;
