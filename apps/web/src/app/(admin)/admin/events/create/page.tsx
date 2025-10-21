import { useTranslations } from 'next-intl';

import { Heading } from '@eventuras/ratio-ui/core/Heading';

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
