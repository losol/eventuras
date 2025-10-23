'use client';
import { useTranslations } from 'next-intl';

import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Definition, DescriptionList, Item, Term } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Form, Select } from '@eventuras/smartform';

import {
  PaymentProvider,
  RegistrationCustomerInfoDto,
  RegistrationDto,
  RegistrationStatus,
  RegistrationType,
} from "@/lib/eventuras-sdk";

import Order from '../orders/Order';
interface RegistrationProps {
  registration?: RegistrationDto;
  adminMode?: boolean;
}
// Replace with the real type from the SDK when it's available
export type RegistrationUpdateDto = {
  status?: RegistrationStatus;
  type?: RegistrationType;
  notes?: string | null;
  customer?: RegistrationCustomerInfoDto;
  paymentMethod?: PaymentProvider;
};
type TranslationFunction = (
  key: string,
  options?: Record<string, string | number | Date>
) => string;
/**
 * Retrieves status labels translated based on the current language.
 * @param {function} t - The translation function from next-translate.
 * @returns {Array<Object>} An array of objects containing value and label pairs for statuses.
 */
export const getStatusLabels = (t: TranslationFunction) => [
  { value: 'Draft' as RegistrationStatus, label: t('common.registrations.labels.draft') },
  { value: 'Cancelled' as RegistrationStatus, label: t('common.registrations.labels.cancelled') },
  { value: 'Verified' as RegistrationStatus, label: t('common.registrations.labels.verified') },
  {
    value: 'NotAttended' as RegistrationStatus,
    label: t('common.registrations.labels.notAttended'),
  },
  { value: 'Attended' as RegistrationStatus, label: t('common.registrations.labels.attended') },
  { value: 'Finished' as RegistrationStatus, label: t('common.registrations.labels.finished') },
  {
    value: 'WaitingList' as RegistrationStatus,
    label: t('common.registrations.labels.waitingList'),
  },
];
/**
 * Retrieves type labels translated based on the current language.
 * @param {function} t - The translation function from next-translate.
 * @returns {Array<Object>} An array of objects containing value and label pairs for types.
 */
export const getTypeLabels = (t: TranslationFunction) => [
  { value: 'Participant' as RegistrationType, label: t('common.registrations.labels.participant') },
  { value: 'Student' as RegistrationType, label: t('common.registrations.labels.student') },
  { value: 'Lecturer' as RegistrationType, label: t('common.registrations.labels.lecturer') },
  { value: 'Staff' as RegistrationType, label: t('common.registrations.labels.staff') },
  { value: 'Artist' as RegistrationType, label: t('common.registrations.labels.artist') },
];
const Registration = ({ registration, adminMode = false }: RegistrationProps) => {
  const t = useTranslations();
  // TODO: Implement proper registration update functionality
  // This component needs a complete refactor to handle registration updates correctly
  const handleUpdateRegistration = async () => {
    throw new Error('Registration update not yet implemented. Please use the admin panel.');
  };
  if (!registration) {
    return <p>{t('common.registrations.labels.noRegistration')}</p>;
  }
  const statusLabel = getStatusLabels(t).find(label => label.value === registration.status)?.label;
  const typeLabel = getTypeLabels(t).find(label => label.value === registration.type)?.label;
  return (
    <>
      <DescriptionList>
        <Item>
          <Term>{t('common.registrations.labels.id')}</Term>
          <Definition testId="registration-registrationId">
            {registration.registrationId}
          </Definition>
        </Item>
        <Item>
          <Term>{t('common.registrations.labels.userName')}</Term>
          <Definition>{registration.user?.name}</Definition>
        </Item>
        <Item>
          <Term>{t('common.registrations.labels.eventTitle')}</Term>
          <Definition>{registration.event?.title}</Definition>
        </Item>
        {!adminMode && (
          <>
            <Item>
              <Term>{t('common.registrations.labels.status')}</Term>
              <Definition>
                <Badge>{statusLabel}</Badge>
              </Definition>
            </Item>
            <Item>
              <Term>{t('common.registrations.labels.type')}</Term>
              <Definition>
                <Badge>{typeLabel}</Badge>
              </Definition>
            </Item>
          </>
        )}
        {adminMode && (
          <Form
            defaultValues={{
              type: registration.type,
              status: registration.status,
            }}
            onSubmit={handleUpdateRegistration}
            className=""
          >
            <Select name="type" options={getTypeLabels(t)} label="Type" />
            <Select name="status" options={getStatusLabels(t)} label="Status" />
            <Button type="submit">{t('common.labels.save')}</Button>
          </Form>
        )}
      </DescriptionList>
      {registration.products && (
        <Section>
          <Heading as="h2">{t('common.registrations.labels.products')}</Heading>
          <ul>
            {registration.products.map(product => (
              <li key={product.productId}>{product.product?.name}</li>
            ))}
          </ul>
        </Section>
      )}
      <Section>
        <Heading as="h2">{t('common.registrations.labels.notes')}</Heading>
        <p>{registration.notes ?? t('common.registrations.labels.notesEmpty')}</p>
      </Section>
      {registration.orders && (
        <Section>
          <Heading as="h2">{t('common.registrations.labels.orders')}</Heading>
          <ul>
            {registration.orders.map(order => (
              <Order order={order} key={order.orderId} admin={adminMode} />
            ))}
          </ul>
        </Section>
      )}
    </>
  );
};
export default Registration;
