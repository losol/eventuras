'use client';
import { FC, useState } from 'react';
import { useTranslations } from 'next-intl';

import * as regex from '@eventuras/core/regex';
import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Fieldset } from '@eventuras/ratio-ui/forms';
import { Form, PhoneInput, TextField } from '@eventuras/smartform';
import { useToast } from '@eventuras/toast';

import { UserDto, UserFormDto } from '@/lib/eventuras-sdk';

import { createUser, updateUser, updateUserProfile } from './actions';
const logger = Logger.create({
  namespace: 'web:admin:users',
  context: { component: 'UserEditor' },
});
interface UserEditorProps {
  user?: UserDto;
  onUserUpdated?: (updatedUser: UserDto) => void;
  testId?: string;
  adminMode?: boolean;
  submitButtonLabel?: string;
}
const UserEditor: FC<UserEditorProps> = props => {
  const { adminMode, user, onUserUpdated, submitButtonLabel } = props;
  const t = useTranslations();
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();
  if (user?.id) {
    logger.info({ userId: user.id }, 'UserEditor rendering');
  } else {
    logger.info('UserEditor rendering (new user)');
  }
  const handleCreateUser = async (form: UserDto) => {
    const result = await createUser(form as UserFormDto);
    if (!result.success) {
      logger.error({ error: result.error }, 'Failed to create new user');
      toast.error(result.error.message);
      return { success: false, error: result.error };
    }
    logger.info({ userId: result.data.id }, 'Created new user');
    toast.success('User created successfully');
    return { success: true, data: result.data };
  };
  const handleUpdateUser = async (user: UserDto, form: UserDto, adminMode: boolean) => {
    // Update existing user
    logger.info({ userId: user.id }, 'Updating user');
    setIsUpdating(true);
    // if adminMode, update user with users endpoint, otherwise use userProfile endpoint
    const result = adminMode
      ? await updateUser(user.id!, form as UserFormDto)
      : await updateUserProfile(form as UserFormDto);
    setIsUpdating(false);
    if (!result.success) {
      logger.error({ error: result.error, userId: user.id }, 'Failed to update user');
      toast.error(result.error.message);
      return { success: false, error: result.error };
    }
    logger.info({ userId: result.data.id }, 'Updated user successfully');
    return { success: true, data: result.data };
  };
  const editMode = !!user;
  const onSubmit = async (form: UserDto, event?: React.BaseSyntheticEvent) => {
    // Prevent default form submission to avoid page refresh
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    let result;
    if (editMode) {
      result = await handleUpdateUser(user, form, adminMode || false);
    } else {
      result = await handleCreateUser(form);
    }
    if (onUserUpdated && result?.success && result.data) {
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
        <TextField
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
        <TextField
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
        <TextField
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
        <TextField
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
        <TextField
          name="professionalIdentityNumber"
          label={t('common.account.professionalIdentityNumber.label')}
          description={t('common.account.professionalIdentityNumber.description')}
          testId="accounteditor-form-professionalIdentityNumber"
        />
        <TextField
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
