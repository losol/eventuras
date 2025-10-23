import { redirect } from 'next/navigation';

import { getV3EventsById } from "@/lib/eventuras-public-sdk";

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function EventPage({ params }: Readonly<EventInfoProps>) {
  const { id } = await params;
  const response = await getV3EventsById({
    path: { id },
  });

  if (!response.data) return <div>Event not found</div>;

  const eventinfo = response.data;
  redirect(`/events/${eventinfo.id!}/${encodeURI(eventinfo.slug!)}`);
}
