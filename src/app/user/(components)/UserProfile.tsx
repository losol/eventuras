'use client';

import { IconMail, IconPhone, IconUser } from '@tabler/icons-react';
import React, { useContext } from 'react';

import { Card } from '@/components/content';
import { UserContext } from '@/context';

const UserProfileCard = () => {
  const { userState } = useContext(UserContext);

  return (
    <Card>
      <dl className="py-5">
        {userState?.profile?.name && (
          <>
            <dt className="pt-5">
              <IconUser size={24} />
              <span className="sr-only">User Name:</span>
            </dt>
            <dd>{userState.profile.name}</dd>
          </>
        )}

        {userState?.profile?.email && (
          <>
            <dt className="pt-5">
              <IconMail size={24} />
              <span className="sr-only">Email:</span>
            </dt>
            <dd>{userState.profile.email}</dd>
          </>
        )}

        {userState?.profile?.phoneNumber && (
          <>
            <dt className="pt-5">
              <IconPhone size={24} />
              <span className="sr-only">Phone Number:</span>
            </dt>
            <dd>{userState.profile.phoneNumber}</dd>
          </>
        )}
      </dl>
    </Card>
  );
};

export default UserProfileCard;
