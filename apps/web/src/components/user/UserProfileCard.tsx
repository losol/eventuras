'use client';
import { useTranslations } from 'next-intl';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { Definition, DescriptionList, Item, Term } from '@eventuras/ratio-ui/core/DescriptionList';
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
          <Item>
            <Term>{t('common.labels.name')}</Term>
            <Definition>{profile.name}</Definition>
          </Item>
        )}
        {profile.email && (
          <Item>
            <Term>{t('common.labels.email')}</Term>
            <Definition>{profile.email}</Definition>
          </Item>
        )}
        {profile.phoneNumber && (
          <Item>
            <Term>{t('common.labels.phoneNumber')}</Term>
            <Definition>{profile.phoneNumber}</Definition>
          </Item>
        )}
      </DescriptionList>
      <Text className="my-2">
        <Link href="/user/account" variant="button-outline" margin="my-3">
          {t('common.labels.editProfile')}
        </Link>
      </Text>
    </Card>
  );
};
export default UserProfileCard;
