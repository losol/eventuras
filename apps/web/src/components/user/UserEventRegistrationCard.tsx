import { ProductOrderDto } from '@eventuras/sdk';
import Card from '@eventuras/ui/Card';
import createTranslation from 'next-translate/createTranslation';
import { ReactElement } from 'react';

import Link from '@/components/Link';
import Environment from '@/utils/Environment';
import { formatDateSpan } from '@/utils/formatDate';

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
        {formatDateSpan(dateStart, dateEnd, { locale: Environment.NEXT_PUBLIC_DEFAULT_LOCALE })}
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
