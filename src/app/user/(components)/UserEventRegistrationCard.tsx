import { ProductOrderDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import React, { ReactElement } from 'react';

import Card from '@/components/ui/Card';
import Link from '@/components/ui/Link';
import Environment from '@/utils/Environment';
import formatDate from '@/utils/formatDate';

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
  const { t } = createTranslation();
  return (
    <Card>
      <Card.Heading as="h3" spacingClassName="pt-2">
        {eventTitle}
      </Card.Heading>
      <Card.Text>
        {formatDate(dateStart, dateEnd, Environment.NEXT_PUBLIC_DEFAULT_LOCALE)}
      </Card.Text>
      {products.length > 0 && (
        <Card.Text as="div">
          <ul>
            {products.map(product => (
              <li key={product.productId}>{product.product?.name}</li>
            ))}
          </ul>
        </Card.Text>
      )}
      <Card.Text className="py-5">
        <Link
          href={`/user/events/${eventId}`}
          variant="button-primary"
          bgDark
          stretch
          data-test-id={eventId}
        >
          {t('common:buttons.user-event-page')}
        </Link>
      </Card.Text>
    </Card>
  );
};

export default UserEventRegistrationCard;
