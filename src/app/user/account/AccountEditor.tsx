'use client';

import { UserDto, UserFormDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import React, { FC } from 'react';

import Form from '@/components/forms/Form';
import { TextInput } from '@/components/forms/src/inputs/TextInput';
import Button from '@/components/ui/Button';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Logger from '@/utils/Logger';

interface AccountEditorProps {
  user?: UserDto;
  onUserUpdated?: (updatedUser: UserDto) => void;
}

const AccountEditor: FC<AccountEditorProps> = ({ user, onUserUpdated }) => {
  const { t } = createTranslation('common');
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const log_namespace = 'user.account';
  const { addAppNotification } = useAppNotifications();

  const createUser = async (form: UserDto) => {
    const user = await apiWrapper(() =>
      sdk.users.postV3Users({ requestBody: form as UserFormDto })
    );
    Logger.info({ namespace: log_namespace }, 'Created new user with id', user.value?.id);
    if (user.error) {
      addAppNotification({
        id: Date.now(),
        type: AppNotificationType.ERROR,
        message: t('common:labels.error') + ': ' + user.error.message,
      });
      Logger.error({ namespace: log_namespace }, 'Failed to create new user', user.error);
    }
    return user;
  };

  const updateUser = async (user: UserDto, form: UserDto) => {
    // Update existing user
    Logger.info({ namespace: log_namespace }, 'Updating user');
    const updatedUser = await apiWrapper(() =>
      sdk.users.putV3Users({ id: user.id!, requestBody: form as UserFormDto })
    );

    if (updatedUser.error) {
      addAppNotification({
        id: Date.now(),
        type: AppNotificationType.ERROR,
        message: t('common:labels.error') + ': ' + updatedUser.error.message,
      });
      Logger.error({ namespace: log_namespace }, 'Failed to update user', updatedUser.error);
      return;
    }

    Logger.info({ namespace: log_namespace }, 'Updated user with id', updatedUser.value?.id);
    return updatedUser;
  };

  const editMode = !!user;

  const onSubmit = async (form: UserDto) => {
    let result;
    if (editMode) {
      result = await updateUser(user, form);
    } else {
      result = await createUser(form);
    }
    if (onUserUpdated && result?.value) {
      onUserUpdated(result.value);
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
        validation={{
          required: t('user:account.name.requiredText'),
        }}
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
      <Button type="submit" data-test-id="account-update-button">
        {t('user:account.update.label')}
      </Button>
    </Form>
  );
};

export default AccountEditor;
