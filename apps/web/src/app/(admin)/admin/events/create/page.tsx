import { Heading } from '@eventuras/ratio-ui';
import { useTranslations } from 'next-intl';

import { CreateEventForm } from '@/app/(admin)/admin/events/CreateEventForm';

export default function CreateEventPage() {
  const t = useTranslations();

  return (
    <>
    <Heading>{t('admin.createEvent.content.title')}</Heading>
      <CreateEventForm />
    </>
  );
}
