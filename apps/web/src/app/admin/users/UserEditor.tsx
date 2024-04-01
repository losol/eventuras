'use client';

import { Fieldset } from '@eventuras/forms';
import { UserDto, UserFormDto } from '@eventuras/sdk';
import { Form, Input } from '@eventuras/smartform';
import Button from '@eventuras/ui/Button';
import { Logger } from '@eventuras/utils';
import createTranslation from 'next-translate/createTranslation';
import { FC, useState } from 'react';

import { AppNotificationType, useAppNotifications } from '@/hooks/useAppNotifications';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';

interface UserEditorProps {
  user?: UserDto;
  onUserUpdated?: (updatedUser: UserDto) => void;
  dataTestId?: string;
  adminMode?: boolean;
  submitButtonLabel?: string;
}

const regex = {
  internationalPhoneNumber: /^\+[1-9]{1}[0-9]{1,14}$/,
  letters: /^[\p{L}]+$/u,
  lettersAndSpace: /^[\p{L} ]+$/u,
  lettersSpaceAndHyphen: /^[\p{L} -]+$/u,
};

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

  Logger.info({ namespace: log_namespace }, 'UserEditor rendering, user:', user);

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
      {/* Given Name Field */}
      <Fieldset label={t('common:account.name.legend')}>
        <Input
          name="givenName"
          label={t('common:labels.givenName')}
          description={t('user:account.name.description')}
          placeholder="Gerhard"
          // Only allow letters, including accentuated characters
          validation={{
            required: t('user:account.name.requiredText'),
            pattern: {
              value: regex.lettersSpaceAndHyphen,
              message: t('common:account.name.validationText'),
            },
          }}
          dataTestId="accounteditor-form-givenname"
        />

        <Input
          name="middleName"
          label={t('common:labels.middleName')}
          description={t('user:account.name.description')}
          placeholder="Armauer"
          // Only allow letters, including accentuated characters
          validation={{
            pattern: {
              value: regex.lettersSpaceAndHyphen,
              message: t('common:account.name.validationText'),
            },
          }}
          dataTestId="accounteditor-form-middlename"
        />
        {/* Family Name Field */}
        <Input
          name="familyName"
          label={t('common:labels.familyName')}
          description={t('user:account.name.description')}
          placeholder="Hansen"
          validation={{
            required: t('user:account.name.requiredText'),
            pattern: {
              value: regex.lettersSpaceAndHyphen,
              message: t('common:account.name.validationText'),
            },
          }}
          dataTestId="accounteditor-form-familyname"
        />
      </Fieldset>
      <Fieldset label={t('common:account.contactInfo.legend')}>
        {/* Email Field */}
        <Input
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
        <Input
          name="phoneNumber"
          label={t('user:account.phoneNumber.label')}
          description={t('user:account.phoneNumber.description')}
          type="tel"
          placeholder={t('user:account.phoneNumber.placeholder')}
          validation={{
            required: adminMode ? false : t('user:account.phoneNumber.requiredText'),
            pattern: {
              value: regex.internationalPhoneNumber,
              message: t('user:account.phoneNumber.invalidFormatText'),
            },
          }}
          dataTestId="accounteditor-form-phonenumber"
        />
      </Fieldset>
      <Fieldset label={t('common:account.moreInfo.legend')}>
        <Input
          name="professionalIdentityNumber"
          label={t('common:account.professionalIdentityNumber.label')}
          description={t('common:account.professionalIdentityNumber.description')}
          dataTestId="accounteditor-form-professionalIdentityNumber"
        />
        <Input
          name="supplementaryInformation"
          label={t('common:account.supplementaryInformation.label')}
          description={t('common:account.supplementaryInformation.description')}
          dataTestId="accounteditor-form-supplementaryInformation"
        />
      </Fieldset>

      {/* Submit Button */}
      <Button type="submit" data-test-id="account-update-button" loading={isUpdating}>
        {getButtonLabel()}
      </Button>
    </Form>
  );
};

export default UserEditor;
