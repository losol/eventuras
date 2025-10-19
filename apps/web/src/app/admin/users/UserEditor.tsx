'use client';

import { Fieldset } from '@eventuras/ratio-ui/forms';
import { UserDto, UserFormDto, postV3Users, putV3UsersById, putV3Userprofile } from '@eventuras/event-sdk';
import { Form, Input, PhoneInput } from '@eventuras/smartform';
import { Button } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import { useToast } from '@eventuras/toast';
import { createClient } from '@/utils/apiClient';

const logger = Logger.create({ namespace: 'web:admin:users', context: { component: 'UserEditor' } });

interface UserEditorProps {
  user?: UserDto;
  onUserUpdated?: (updatedUser: UserDto) => void;
  testId?: string;
  adminMode?: boolean;
  submitButtonLabel?: string;
}

const regex = {
  internationalPhoneNumber: /^\+[1-9]{1}[0-9]{1,14}$/,
  letters: /^[\p{L}]+$/u,
  lettersAndSpace: /^[\p{L} ]+$/u,
  lettersSpaceAndHyphen: /^[\p{L} -]+$/u,
};

const UserEditor: FC<UserEditorProps> = props => {
  const { adminMode, user, onUserUpdated, submitButtonLabel } = props;
  const t = useTranslations();
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  logger.info({ user }, 'UserEditor rendering');

  const createUser = async (form: UserDto) => {
    const client = await createClient();
    const response = await postV3Users({
      body: form as UserFormDto,
      client,
    });
    
    logger.info({ userId: response.data?.id }, 'Created new user');
    
    if (!response.data) {
      toast.error(t('common.labels.error') + ': ' + (response.error?.toString() || 'Unknown error'));
      logger.error({ error: response.error }, 'Failed to create new user');
      return response;
    }

    toast.success('User created successfully');
    return response;
  };

  const updateUser = async (user: UserDto, form: UserDto, adminMode: boolean) => {
    // Update existing user
    logger.info({ userId: user.id }, 'Updating user');
    setIsUpdating(true);
    const client = await createClient();
    
    // if adminMode, update user with users endpoint, otherwise use userProfile endpoint
    const response = adminMode
      ? await putV3UsersById({
          path: { id: user.id! },
          body: form as UserFormDto,
          client,
        })
      : await putV3Userprofile({
          body: form as UserFormDto,
          client,
        });
    setIsUpdating(false);

    if (!response.data) {
      toast.error(t('common.labels.error') + ': ' + (response.error?.toString() || 'Unknown error'));
      logger.error({ error: response.error, userId: user.id }, 'Failed to update user');
      return response;
    }

    logger.info({ userId: response.data?.id }, 'Updated user successfully');

    toast.success(t('user.labels.updateUserSuccess') + ': ' + response.data?.name);

    return response;
  };

  const editMode = !!user;

  const onSubmit = async (form: UserDto, event?: React.BaseSyntheticEvent) => {
    // Prevent default form submission to avoid page refresh
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    let result;
    if (editMode) {
      result = await updateUser(user, form, adminMode || false);
    } else {
      result = await createUser(form);
    }
    if (onUserUpdated && result?.data) {
      onUserUpdated(result.data);
    }
  };

  const getButtonLabel = () => {
    if (submitButtonLabel) {
      return submitButtonLabel;
    }
    return editMode ? t('user.account.update.label') : t('user.account.create.label');
  };

  return (
    <Form onSubmit={onSubmit} defaultValues={user} testId={props.testId}>
      {/* Given Name Field */}
      <Fieldset label={t('common.account.name.legend')}>
        <Input
          name="givenName"
          label={t('common.labels.givenName')}
          description={t('user.account.name.description')}
          placeholder="Gerhard"
          // Only allow letters, including accentuated characters
          validation={{
            required: t('user.account.name.requiredText'),
            pattern: {
              value: regex.lettersSpaceAndHyphen,
              message: t('common.account.name.validationText'),
            },
          }}
          testId="accounteditor-form-givenname"
        />

        <Input
          name="middleName"
          label={t('common.labels.middleName')}
          description={t('user.account.name.description')}
          placeholder="Armauer"
          // Only allow letters, including accentuated characters
          validation={{
            pattern: {
              value: regex.lettersSpaceAndHyphen,
              message: t('common.account.name.validationText'),
            },
          }}
          testId="accounteditor-form-middlename"
        />
        {/* Family Name Field */}
        <Input
          name="familyName"
          label={t('common.labels.familyName')}
          description={t('user.account.name.description')}
          placeholder="Hansen"
          validation={{
            required: t('user.account.name.requiredText'),
            pattern: {
              value: regex.lettersSpaceAndHyphen,
              message: t('common.account.name.validationText'),
            },
          }}
          testId="accounteditor-form-familyname"
        />
      </Fieldset>
      <Fieldset label={t('common.account.contactInfo.legend')}>
        {/* Email Field */}
        <Input
          name="email"
          label={t('user.account.email.label')}
          description={
            editMode
              ? t('user.account.email.existingDescription')
              : t('user.account.email.description')
          }
          type="email"
          placeholder={t('user.account.email.placeholder')}
          validation={{ required: t('user.account.email.requiredText') }}
          disabled={editMode} // Disable editing email field for existing users
        />

        {/* Phone Field */}
        <PhoneInput
          name="phoneNumber"
          label={t('user.account.phoneNumber.label')}
          description={t('user.account.phoneNumber.description')}
          validation={{
            required: adminMode ? false : t('user.account.phoneNumber.requiredText'),
            pattern: {
              value: regex.internationalPhoneNumber,
              message: t('user.account.phoneNumber.invalidFormatText'),
            },
          }}
          testId="accounteditor-form-phonenumber"
        />
      </Fieldset>
      <Fieldset label={t('common.account.moreInfo.legend')}>
        <Input
          name="professionalIdentityNumber"
          label={t('common.account.professionalIdentityNumber.label')}
          description={t('common.account.professionalIdentityNumber.description')}
          testId="accounteditor-form-professionalIdentityNumber"
        />
        <Input
          name="supplementaryInformation"
          label={t('common.account.supplementaryInformation.label')}
          description={t('common.account.supplementaryInformation.description')}
          testId="accounteditor-form-supplementaryInformation"
        />
      </Fieldset>

      {/* Submit Button */}
      <Button type="submit" testId="account-update-button" loading={isUpdating}>
        {getButtonLabel()}
      </Button>
    </Form>
  );
};

export default UserEditor;
