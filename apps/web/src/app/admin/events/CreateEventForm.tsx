'use client';

import { Fieldset, Form, Input } from '@eventuras/ratio-ui/forms';
import { Button } from '@eventuras/ratio-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Logger } from '@eventuras/logger';
import { useToast } from '@eventuras/toast';

import { publicEnv } from '@/config.client';

import { createEvent } from './actions';

const logger = Logger.create({
  namespace: 'web:admin',
  context: { component: 'CreateEventForm' }
});

export const CreateEventForm = () => {
  const t = useTranslations();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      logger.info('Submission already in progress, ignoring');
      return;
    }

    setIsSubmitting(true);
    logger.info('Starting event creation form submission');

    const formData = new FormData(event.currentTarget);
    const title = formData.get('title')?.toString();

    logger.info({
      title,
      organizationId: publicEnv.NEXT_PUBLIC_ORGANIZATION_ID
    }, 'Form data collected');

    try {
      const result = await createEvent(formData);

      // If result is returned (not redirected), it means there was an error
      if (!result.success) {
        logger.error({ error: result.error }, 'Event creation failed');
        toast.error(result.error.message);
        setIsSubmitting(false);
      } else {
        // Success case - though redirect should happen before this
        logger.info({ data: result.data }, 'Event created successfully');
        toast.success(t('admin.createEvent.success'));
      }
    } catch (error) {
      // Handle unexpected errors
      logger.error({ error }, 'Unexpected error during event creation');

      // Check if it's a Next.js redirect (which is expected)
      if (error && typeof error === 'object' && 'digest' in error) {
        logger.info('Redirect caught - this is expected behavior');
        throw error; // Re-throw to allow redirect
      }

      toast.error(t('admin.createEvent.error'));
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
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

      <Button
        type="submit"
        testId="create-event-submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('common.buttons.submitting') : t('common.buttons.submit')}
      </Button>
    </Form>
  );
};
