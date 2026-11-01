import { redirect } from 'next/navigation';

import { getV3EventsById, publicClient } from '@/lib/eventuras-public-sdk';
import { throwIfApiError } from '@/utils/api/apiErrors';

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function EventPage({ params }: Readonly<EventInfoProps>) {
  const { id } = await params;
  const response = await getV3EventsById({
    client: publicClient,
    path: { id },
  });

  throwIfApiError(response, `event ${id}`);
  if (!response.data) return <div>Event not found</div>;

  const eventinfo = response.data;
  redirect(`/events/${eventinfo.id!}/${encodeURI(eventinfo.slug!)}`);
}
