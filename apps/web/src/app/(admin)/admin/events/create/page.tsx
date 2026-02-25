import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { CreateEventForm } from '@/app/(admin)/admin/events/CreateEventForm';
import { getOrganizationId } from '@/utils/organization';

export default async function CreateEventPage() {
  const t = await getTranslations();
  const organizationId = getOrganizationId();
  return (
    <>
      <Heading>{t('admin.createEvent.content.title')}</Heading>
      <CreateEventForm organizationId={organizationId} />
    </>
  );
}
