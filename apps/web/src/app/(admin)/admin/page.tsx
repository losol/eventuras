import { Container } from '@eventuras/ratio-ui/layout/Container';

import { getOrganizationId } from '@/utils/organization';

import { AdminEventOverview } from './AdminEventOverview';
import { fetchEvents } from './events/eventActions';
import { HealthAlert } from './HealthAlert';

/** Enough to cover upcoming events, drafts and recent history; the rest is on /admin/events. */
const OVERVIEW_EVENT_COUNT = 100;

/** Today as a LocalDate in the organization's time zone. */
const todayInOslo = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Oslo' }).format(new Date());

const AdminPage = async () => {
  const { data: events } = await fetchEvents({
    organizationId: getOrganizationId(),
    includePastEvents: true,
    pageSize: OVERVIEW_EVENT_COUNT,
    ordering: ['DateStart:desc'],
  });

  return (
    <Container>
      <HealthAlert />
      <AdminEventOverview events={events} today={todayInOslo()} />
    </Container>
  );
};

export default AdminPage;
