import { ProductOrderDto } from '@losol/eventuras';
import React, { ReactElement } from 'react';

import Link from '@/components/ui/Link';

export type UserEventRegistrationCardProps = {
  registrationId: number;
  eventTitle: string;
  eventDescription: string;
  startDate: any;
  endDate: any;
  products: ProductOrderDto[];
};
/**
 * Single registration card
 * @param  {UserEventRegistrationCardProps}UserEventRegistrationCardProps Contains the event details
 * @return {ReactElement} Renders a single card
 */
const UserEventRegistrationCard = ({
  registrationId,
  eventTitle,
  eventDescription,
  startDate,
  endDate,
  products,
}: UserEventRegistrationCardProps): ReactElement => (
  <div className="mb-12 bg-white rounded-lg p-4 flex flex-col justify-between leading-normal">
    <h3 className="text-gray-900 font-bold text-l mb-2">{eventTitle}</h3>
    <p className="text-gray-900">{eventDescription}</p>
    <p className="text-gray-900">
      {startDate} → {endDate}{' '}
    </p>
    {products.length > 0 && <h3 className="text-gray-900">Products</h3>}
    <ul>
      {products.map(product => (
        <li key={product.productId}>
          <p className="text-gray-900">{product.product?.name}</p>
          <p className="text-gray-900">{product.product?.description}</p>
          <p className="text-gray-900">
            <span>Quantity:</span>
            {product.quantity}
          </p>
        </li>
      ))}
    </ul>
    <Link href={`/user/registrations/${registrationId}`}>View</Link>
  </div>
);

export default UserEventRegistrationCard;
