'use client';

import createTranslation from 'next-translate/createTranslation';
import { useState } from 'react';

import UserEditor from '@/app/admin/users/UserEditor';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';

const UserDrawer: React.FC = () => {
  const { t } = createTranslation();
  const [visible, setVisible] = useState(false);

  const showDrawer = () => setVisible(true);
  const onClose = () => setVisible(false);

  return (
    <>
      <Button onClick={showDrawer}>{t('admin:users.labels.createUser')}</Button>
      <Drawer isOpen={visible} onCancel={onClose}>
        <UserEditor adminMode />
      </Drawer>
    </>
  );
};

export default UserDrawer;
