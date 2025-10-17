'use client';

import { Fieldset, Form, Input } from '@eventuras/ratio-ui/forms';
import { Button } from '@eventuras/ratio-ui';
import { useTranslations } from 'next-intl';

import Environment from '@/utils/Environment';

import { createEvent } from './actions';

export const CreateEventForm = () => {
  const t = useTranslations();

  return (
    <Form action={createEvent}>
      <Fieldset>
        <Input
          name="organizationId"
          type="hidden"
          value={Environment.NEXT_PUBLIC_ORGANIZATION_ID}
        />
        <Input
          name="title"
          placeholder="Event Title"
          testId="event-title-input"
        />
      </Fieldset>

      <Button type="submit" testId="create-event-submit-button">
        {t('common.buttons.submit')}
      </Button>
    </Form>
  );
};
