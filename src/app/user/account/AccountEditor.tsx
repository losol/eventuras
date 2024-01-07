'use client';

import { UserDto, UserFormDto } from '@losol/eventuras'; // Adjust the import path as necessary
import createTranslation from 'next-translate/createTranslation';
import React, { FC } from 'react';

import Form from '@/components/forms/Form';
import { TextInput } from '@/components/forms/src/inputs/TextInput';
import Button from '@/components/ui/Button';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Logger from '@/utils/Logger';

interface AccountEditorProps {
  user?: UserDto;
}

const AccountEditor: FC<AccountEditorProps> = ({ user }) => {
  const { t } = createTranslation('common');
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });

  const editMode = !!user;

  const onSubmit = async (data: UserDto) => {
    // Update existing user if there is a user here..
    if (user) {
      Logger.info({ namespace: 'AccountEditor' }, 'Updating user');
      const updatedUser = await apiWrapper(() =>
        sdk.users.putV3Users({ id: user.id!, requestBody: data as UserFormDto })
      );
      Logger.info({ namespace: 'AccountEditor' }, 'Updated user with id', updatedUser.value?.id);
      return updatedUser;
    }

    // Or create a new user, if there is no user here..
    else {
      Logger.info({ namespace: 'AccountEditor' }, 'Creating new user');
      return await apiWrapper(() => sdk.users.postV3Users({ requestBody: data as UserFormDto }));
    }
  };

  return (
    <Form onSubmit={onSubmit} defaultValues={user}>
      {/* Name Field */}
      <TextInput
        name="name"
        label={t('user:account.name.label')}
        description={t('user:account.name.description')}
        placeholder={t('user:account.name.placeholder')}
        validation={{ required: t('user:account.name.requiredText') }}
      />

      {/* Email Field */}
      <TextInput
        name="email"
        label={t('user:account.email.label')}
        description={
          editMode
            ? t('user:account.email.existingDescription')
            : t('user:account.email.description')
        }
        type="email"
        placeholder={t('user:account.email.placeholder')}
        validation={{ required: t('user:account.email.requiredText') }}
        disabled={editMode} // Disable editing email field for existing users
      />

      {/* Phone Field */}
      <TextInput
        name="phoneNumber"
        label={t('user:account.phoneNumber.label')}
        description={t('user:account.phoneNumber.description')}
        type="tel"
        placeholder={t('user:account.phoneNumber.placeholder')}
        validation={{ required: t('user:account.phoneNumber.requiredText') }}
      />

      {/* Submit Button */}
      <Button type="submit">{t('user:account.update.label')}</Button>
    </Form>
  );
};

export default AccountEditor;
