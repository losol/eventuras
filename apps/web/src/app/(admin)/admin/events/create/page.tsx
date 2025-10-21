;
import { useTranslations } from 'next-intl';
import { CreateEventForm } from '@/app/(admin)/admin/events/CreateEventForm';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

;
export default function CreateEventPage() {
  const t = useTranslations();
  return (
    <>
    <Heading>{t('admin.createEvent.content.title')}</Heading>
      <CreateEventForm />
    </>
  );
}