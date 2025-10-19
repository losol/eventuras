import { Heading } from '@eventuras/ratio-ui';
import { useTranslations } from 'next-intl';

import Wrapper from '@/components/eventuras/Wrapper';
import { CreateEventForm } from '@/app/admin/events/CreateEventForm';

export default function CreateEventPage() {
  const t = useTranslations();

  return (
    <Wrapper>
      <Heading>{t('admin.createEvent.content.title')}</Heading>
      <CreateEventForm />
    </Wrapper>
  );
}
