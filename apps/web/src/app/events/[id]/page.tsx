import { redirect } from 'next/navigation';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function EventPage({ params }: Readonly<EventInfoProps>) {
  const { id } = await params;
  const eventInfoQuery = await apiWrapper(() =>
    createSDK({ inferUrl: true }).events.getV3Events1({ id: id })
  );

  if (!eventInfoQuery.ok || !eventInfoQuery.value) return <div>Event not found</div>;

  const eventinfo = eventInfoQuery.value;
  redirect(`/events/${eventinfo.id!}/${encodeURI(eventinfo.slug!)}`);
}
