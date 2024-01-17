import { RegistrationDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';

import Badge from '@/components/ui/Badge';
import { Definition, DescriptionList, Item, Term } from '@/components/ui/DescriptionList';
import Heading from '@/components/ui/Heading';
import Section from '@/components/ui/Section';

import Order from '../orders/Order';

interface RegistrationProps {
  registration: RegistrationDto;
}

const Registration = ({ registration }: RegistrationProps) => {
  const { t } = createTranslation();
  return (
    <>
      <DescriptionList>
        <Item>
          <Term>{t('admin:registrations.labels.id')}</Term>
          <Definition>{registration.registrationId}</Definition>
        </Item>
        <Item>
          <Term>{t('admin:registrations.labels.eventTitle')}</Term>
          <Definition>{registration.event?.title}</Definition>
        </Item>
        <Item>
          <Term>{t('admin:registrations.labels.userName')}</Term>
          <Definition>{registration.user?.name}</Definition>
        </Item>
        <Item>
          <Term>{t('admin:registrations.labels.status')}</Term>
          <Definition>
            <Badge>{registration.status}</Badge>
          </Definition>
        </Item>
        <Item>
          <Term>{t('admin:registrations.labels.type')}</Term>
          <Definition>
            <Badge>{registration.type}</Badge>
          </Definition>
        </Item>
      </DescriptionList>

      {registration.products && (
        <Section>
          <Heading as="h2">{t('admin:registrations.labels.products')}</Heading>
          <ul>
            {registration.products.map(product => (
              <li key={product.productId}>{product.product?.name}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section>
        <Heading as="h2">{t('admin:registrations.labels.notes')}</Heading>
        <p>{registration.notes ?? t('admin:registrations.labels.notesEmpty')}</p>
      </Section>

      {registration.orders && (
        <Section>
          <Heading as="h2">{t('admin:registrations.labels.orders')}</Heading>
          <ul>
            {registration.orders.map(order => (
              <Order order={order} key={order.orderId} />
            ))}
          </ul>
        </Section>
      )}
    </>
  );
};

export default Registration;
