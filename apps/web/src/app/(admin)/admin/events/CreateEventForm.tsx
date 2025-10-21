'use client';
import { useActionState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Fieldset, Form, Input } from '@eventuras/ratio-ui/forms';
import { useToast } from '@eventuras/toast';

import { publicEnv } from '@/config.client';

import { createEvent } from './actions';
export const CreateEventForm = () => {
  const t = useTranslations();
  const toast = useToast();
  const [state, formAction, isPending] = useActionState(createEvent, null);
  // Show toast notifications based on action result
  useEffect(() => {
    if (state?.success) {
      toast.success(t('admin.createEvent.success'));
    } else if (state?.error) {
      toast.error(state.error.message);
    }
  }, [state, toast, t]);
  return (
    <Form action={formAction}>
      <Fieldset>
        <Input
          name="organizationId"
          type="hidden"
          value={publicEnv.NEXT_PUBLIC_ORGANIZATION_ID?.toString() ?? ''}
        />
        <Input
          name="title"
          placeholder={t('admin.createEvent.form.titlePlaceholder')}
          testId="event-title-input"
          required
        />
      </Fieldset>
      <Button type="submit" testId="create-event-submit-button" disabled={isPending}>
        {isPending ? t('common.buttons.submitting') : t('common.buttons.submit')}
      </Button>
    </Form>
  );
};
