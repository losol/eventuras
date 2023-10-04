'use client';

import { UserDto } from '@losol/eventuras';
import { IconMail, IconPhone, IconUser } from '@tabler/icons-react';

import Card from '@/components/ui/Card';

export type UserProfileCardProps = {
  profile: UserDto;
};

const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  return (
    <Card>
      <dl className="py-5">
        {profile.name && (
          <>
            <dt className="pt-5">
              <IconUser size={24} />
              <span className="sr-only">User Name:</span>
            </dt>
            <dd>{profile.name}</dd>
          </>
        )}

        {profile.email && (
          <>
            <dt className="pt-5">
              <IconMail size={24} />
              <span className="sr-only">Email:</span>
            </dt>
            <dd>{profile.email}</dd>
          </>
        )}

        {profile.phoneNumber && (
          <>
            <dt className="pt-5">
              <IconPhone size={24} />
              <span className="sr-only">Phone Number:</span>
            </dt>
            <dd>{profile.phoneNumber}</dd>
          </>
        )}
      </dl>
    </Card>
  );
};

export default UserProfileCard;
