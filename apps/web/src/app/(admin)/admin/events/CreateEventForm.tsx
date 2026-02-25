'use client';
import { useActionState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Fieldset, Form, TextField } from '@eventuras/ratio-ui/forms';
import { useToast } from '@eventuras/toast';

import { createEvent } from './actions';
export const CreateEventForm = ({ organizationId }: { organizationId: number }) => {
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
        <TextField name="organizationId" type="hidden" value={organizationId.toString()} />
        <TextField
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
