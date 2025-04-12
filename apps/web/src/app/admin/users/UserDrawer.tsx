'use client';

import { Button, Drawer } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';
import { useState } from 'react';

import UserEditor from '@/app/admin/users/UserEditor';

const UserDrawer: React.FC = () => {
  const t = await getTranslations();
  const [visible, setVisible] = useState(false);

  const showDrawer = () => setVisible(true);
  const onClose = () => setVisible(false);

  return (
    <>
      <Button onClick={showDrawer}>{t('admin.users.labels.createUser')}</Button>
      <Drawer isOpen={visible} onCancel={onClose}>
        <UserEditor adminMode />
      </Drawer>
    </>
  );
};

export default UserDrawer;
