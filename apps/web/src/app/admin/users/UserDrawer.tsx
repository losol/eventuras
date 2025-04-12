'use client';

import { Button, Drawer } from '@eventuras/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import UserEditor from '@/app/admin/users/UserEditor';

const UserDrawer: React.FC = () => {
  const t = useTranslations();
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
