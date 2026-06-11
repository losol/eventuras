'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';

import UserEditor from '@/app/(admin)/admin/users/UserEditor';
import { UserDto } from '@/lib/eventuras-sdk';

const UserDrawer: React.FC = () => {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  // Once the user is created, hold onto it so the metadata (the new id) shows.
  const [createdUser, setCreatedUser] = useState<UserDto | undefined>(undefined);
  const showDrawer = () => {
    setCreatedUser(undefined); // fresh create form each time the drawer opens
    setVisible(true);
  };
  const onClose = () => setVisible(false);
  return (
    <>
      <Button onClick={showDrawer}>{t('admin.users.labels.createUser')}</Button>
      <Drawer isOpen={visible} onClose={onClose}>
        <UserEditor adminMode showMetadata user={createdUser} onUserUpdated={setCreatedUser} />
      </Drawer>
    </>
  );
};
export default UserDrawer;
