import { redirect } from 'next/navigation';

import ServiceBusy from '@/components/ServiceBusy';
import { getV3EventsById } from '@/lib/eventuras-public-sdk';
import { isApiBusy, throwIfApiError } from '@/utils/api/apiErrors';

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

const Page: React.FC<EventInfoProps> = async props => {
  const params = await props.params;
  const response = await getV3EventsById({
    path: { id: params.id },
  });

  if (isApiBusy(response)) return <ServiceBusy />;
  throwIfApiError(response, `event ${params.id}`);
  if (!response.data) return <div>Event not found</div>;

  const eventinfo = response.data;
  redirect(`/events/${eventinfo.id!}/${encodeURI(eventinfo.slug!)}`);
};

export default Page;
