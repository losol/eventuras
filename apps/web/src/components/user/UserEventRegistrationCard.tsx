import { ReactElement } from 'react';
import { useTranslations } from 'next-intl';

import { formatDateSpan } from '@eventuras/core/datetime';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { appConfig } from '@/config.server';
import { ProductOrderDto } from '@/lib/eventuras-sdk';

export type UserEventRegistrationCardProps = {
  eventId: string;
  registrationId: number;
  eventTitle: string;
  eventDescription: string;
  dateStart: any;
  dateEnd: any;
  products: ProductOrderDto[];
};

const UserEventRegistrationCard = ({
  eventId,
  eventTitle,
  dateStart,
  dateEnd,
  products,
}: UserEventRegistrationCardProps): ReactElement => {
  const t = useTranslations();
  return (
    <Card hoverEffect>
      <Heading as="h3" padding="pt-2">
        {eventTitle}
      </Heading>
      <Text>
        {formatDateSpan(dateStart, dateEnd, {
          locale: appConfig.env.NEXT_PUBLIC_DEFAULT_LOCALE as string,
        })}
      </Text>
      {products.length > 0 && (
        <Text as="div">
          <ul>
            {products.map(product => (
              <li key={product.productId}>{product.product?.name}</li>
            ))}
          </ul>
        </Text>
      )}
      <Text className="py-5">
        <Link
          href={`/user/events/${eventId}`}
          variant="button-primary"
          onDark
          linkOverlay
          testId={eventId}
        >
          {t('common.buttons.user-event-page')}
        </Link>
      </Text>
    </Card>
  );
};

export default UserEventRegistrationCard;
