'use client';

import { Fieldset, Form, Input } from '@eventuras/forms';
import { Button } from '@eventuras/ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';

import Environment from '@/utils/Environment';

import { createEvent } from './actions';

export const CreateEventForm = () => {
  const t = await getTranslations();

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
          {...{ [DATA_TEST_ID]: 'event-title-input' }}
        />
      </Fieldset>

      <Button type="submit" {...{ [DATA_TEST_ID]: 'create-event-submit-button' }}>
        {t('common.buttons.submit')}
      </Button>
    </Form>
  );
};
