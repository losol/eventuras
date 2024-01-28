import { redirect } from 'next/navigation';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';

type EventInfoProps = {
  params: {
    id: number;
  };
};

const Page: React.FC<EventInfoProps> = async ({ params }) => {
  const eventInfoQuery = await apiWrapper(() =>
    createSDK({ inferUrl: true }).events.getV3Events1({ id: params.id })
  );

  if (!eventInfoQuery.ok || !eventInfoQuery.value) return <div>Event not found</div>;

  const eventinfo = eventInfoQuery.value;
  redirect(`/events/${eventinfo.id!}/${eventinfo.slug!}`);
};

export default Page;
