'use client';

import { UserDto } from '@eventuras/sdk';
import Card from '@eventuras/ui/Card';
import { Definition, DescriptionList, Item, Term } from '@eventuras/ui/DescriptionList';
import createTranslation from 'next-translate/createTranslation';

import Link from '@/components/Link';

export type UserProfileCardProps = {
  profile: UserDto;
};

const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  const { t } = createTranslation();
  return (
    <Card>
      <DescriptionList>
        {profile.name && (
          <Item>
            <Term>{t('common:labels.name')}</Term>
            <Definition>{profile.name}</Definition>
          </Item>
        )}

        {profile.email && (
          <Item>
            <Term>{t('common:labels.email')}</Term>
            <Definition>{profile.email}</Definition>
          </Item>
        )}

        {profile.phoneNumber && (
          <Item>
            <Term>{t('common:labels.phoneNumber')}</Term>
            <Definition>{profile.phoneNumber}</Definition>
          </Item>
        )}
      </DescriptionList>
      <Card.Text className="my-2">
        <Link href="/user/account" variant="button-outline" margin="my-3">
          {t('common:labels.editProfile')}
        </Link>
      </Card.Text>
    </Card>
  );
};

export default UserProfileCard;
