import { redirect } from 'next/navigation';

import { getV3EventsById, publicClient } from '@/lib/eventuras-public-sdk';

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

  // Only a 404 means "not found"; other errors (e.g. 429) go to the error page.
  if (response.error && response.response?.status !== 404) {
    throw new Error(`Failed to load event ${id} (HTTP ${response.response?.status})`);
  }
  if (!response.data) return <div>Event not found</div>;

  const eventinfo = response.data;
  redirect(`/events/${eventinfo.id!}/${encodeURI(eventinfo.slug!)}`);
}
