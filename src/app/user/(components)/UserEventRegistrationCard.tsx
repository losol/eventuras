import { ProductOrderDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import React, { ReactElement } from 'react';

import Card from '@/components/ui/Card';
import Link from '@/components/ui/Link';

export type UserEventRegistrationCardProps = {
  registrationId: number;
  eventTitle: string;
  eventDescription: string;
  startDate: any;
  endDate: any;
  products: ProductOrderDto[];
};

const UserEventRegistrationCard = ({
  registrationId,
  eventTitle,
  eventDescription,
  startDate,
  endDate,
  products,
}: UserEventRegistrationCardProps): ReactElement => {
  const { t } = createTranslation('user');
  return (
    <Card>
      <Card.Heading as="h3" spacingClassName="pt-2">
        {eventTitle}
      </Card.Heading>
      <Card.Text>{eventDescription}</Card.Text>
      <Card.Text>
        {startDate} → {endDate}
      </Card.Text>
      {products.length > 0 && (
        <Card.Text>
          <ul>
            {products.map(product => (
              <li key={product.productId}>{product.product?.name}</li>
            ))}
          </ul>
        </Card.Text>
      )}
      <Card.Text className="py-5">
        <Link
          href={`/user/registrations/${registrationId}`}
          variant="button-primary"
          bgDark
          stretch
        >
          {t('View')}
        </Link>
      </Card.Text>
    </Card>
  );
};

export default UserEventRegistrationCard;
