import { redirect } from 'next/navigation';

import { getV3EventsById } from '@eventuras/event-sdk';

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

  if (!response.data) return <div>Event not found</div>;

  const eventinfo = response.data;
  redirect(`/events/${eventinfo.id!}/${encodeURI(eventinfo.slug!)}`);
};

export default Page;
