import { EventsService, RegistrationsService } from '@losol/eventuras';
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

import EventAdminPage from './(components)/EventAdminPage';

type EventAdminProps = {
  params: {
    id: number;
  };
};

async function loadInfoAndRegistrations(eventId: number) {
  const session = await getServerSession(authOptions);

  if (!session) return { eventInfo: null, registrations: null };

  const [eventInfo, registrations] = await Promise.all([
    EventsService.getV3Events1({ id: eventId }),
    // ! ↓ This request requires a valid JWT access token to be provided ↓
    RegistrationsService.getV3Registrations({
      eventId,
      includeProducts: true,
      includeUserInfo: true,
    }),
  ]);

  return { eventInfo, registrations: registrations.data! };
}

export default async function EventAdmin({ params }: EventAdminProps) {
  const { eventInfo, registrations } = await loadInfoAndRegistrations(params.id);

  if (!eventInfo) return <div>Event not found</div>;

  return <EventAdminPage pathId={params.id} eventInfo={eventInfo} registrations={registrations} />;
}
