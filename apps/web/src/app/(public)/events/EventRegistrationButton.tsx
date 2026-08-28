import { getTranslations } from 'next-intl/server';

import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { eventStatusLabel } from '@/app/(public)/events/eventStatusLabel';
import { EventDto, EventInfoStatus } from '@/lib/eventuras-public-sdk';
export type EventRegistrationButtonProps = {
  event: EventDto;
  /** Override when the page renders more than one CTA, so test IDs stay unique. */
  testId?: string;
};
export default async function EventRegistrationButton({
  event,
  testId = 'event-registration-button',
}: Readonly<EventRegistrationButtonProps>) {
  const t = await getTranslations();
  const canRegister = event.status === EventInfoStatus.REGISTRATIONS_OPEN;
  if (canRegister) {
    return (
      <Link href={`/user/events/${event.id}`} variant="button-primary" block testId={testId}>
        {t('common.buttons.register-cta')}
      </Link>
    );
  } else {
    return <Badge block>{eventStatusLabel(t, event.status)}</Badge>;
  }
}
