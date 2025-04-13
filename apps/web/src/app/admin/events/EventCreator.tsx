import { Button, Heading } from '@eventuras/ui';
import { DATA_TEST_ID, Logger } from '@eventuras/utils';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Wrapper from '@/components/eventuras/Wrapper';
import Environment from '@/utils/Environment';

import { CreateEventForm } from './CreateEventForm';

const EventCreator = () => {
  const t = useTranslations();

  //## Render
  return (
    <Wrapper>
      <Heading>{t('admin.createEvent.content.title')}</Heading>
      <p>{t('Add a fantastic event!')}</p>
      <CreateEventForm />
    </Wrapper>
  );
};

export default EventCreator;
