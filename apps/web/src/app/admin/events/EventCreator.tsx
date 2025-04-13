import { Heading } from '@eventuras/ui';
import { useTranslations } from 'next-intl';

import Wrapper from '@/components/eventuras/Wrapper';

import { CreateEventForm } from './CreateEventForm';

const EventCreator = () => {
  const t = useTranslations();

  //## Render
  return (
    <Wrapper>
      <Heading>{t('admin.createEvent.content.title')}</Heading>
      <CreateEventForm />
    </Wrapper>
  );
};

export default EventCreator;
