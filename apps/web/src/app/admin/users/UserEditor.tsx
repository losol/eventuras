'use client';

import { UserDto, UserFormDto } from '@eventuras/sdk';
import createTranslation from 'next-translate/createTranslation';
import React, { FC, useState } from 'react';

import Form from '@/components/forms/Form';
import { TextInput } from '@/components/forms/src/inputs/TextInput';
import Button from '@/components/ui/Button';
import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Logger from '@/utils/Logger';

interface UserEditorProps {
  user?: UserDto;
  onUserUpdated?: (updatedUser: UserDto) => void;
  dataTestId?: string;
  adminMode?: boolean;
  submitButtonLabel?: string;
}

const UserEditor: FC<UserEditorProps> = ({
  adminMode,
  user,
  onUserUpdated,
  submitButtonLabel,
  dataTestId,
}) => {
  const { t } = createTranslation('common');
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const [isUpdating, setIsUpdating] = useState(false);
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

    addAppNotification({
      id: Date.now(),
      type: AppNotificationType.SUCCESS,
      message: t('common:labels.createUserSuccess') + ': ' + user.value?.name,
    });

    return user;
  };

  const updateUser = async (user: UserDto, form: UserDto, adminMode: boolean) => {
    // Update existing user
    Logger.info({ namespace: log_namespace }, 'Updating user');
    setIsUpdating(true);
    // if adminMode, update user with users endpoint, otherwise use userProfile endpoint
    const updatedUser = adminMode
      ? await apiWrapper(() =>
          sdk.users.putV3Users({ id: user.id!, requestBody: form as UserFormDto })
        )
      : await apiWrapper(() =>
          sdk.userProfile.putV3Userprofile({ id: user.id!, requestBody: form as UserFormDto })
        );
    setIsUpdating(false);

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
      result = await updateUser(user, form, adminMode || false);
    } else {
      result = await createUser(form);
    }
    if (onUserUpdated && result?.value) {
      onUserUpdated(result.value);
    }
  };

  const getButtonLabel = () => {
    if (submitButtonLabel) {
      return submitButtonLabel;
    }
    return editMode ? t('user:account.update.label') : t('user:account.create.label');
  };

  return (
    <Form onSubmit={onSubmit} defaultValues={user} dataTestId={dataTestId}>
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
        validation={adminMode ? {} : { required: t('user:account.phoneNumber.requiredText') }}
        dataTestId="accounteditor-form-phonenumber"
      />

      {/* Submit Button */}
      <Button type="submit" data-test-id="account-update-button" loading={isUpdating}>
        {getButtonLabel()}
      </Button>
    </Form>
  );
};

export default UserEditor;
