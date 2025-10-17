'use client';
import {
  PaymentProvider,
  RegistrationCustomerInfoDto,
  RegistrationDto,
  RegistrationStatus,
  RegistrationType,
} from '@eventuras/sdk';
import { Form, Select } from '@eventuras/smartform';
import {
  Badge,
  Button,
  Definition,
  DescriptionList,
  Heading,
  Item,
  Section,
  Term,
} from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'Registration' });

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { apiWrapper, createSDK, fetcher } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

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
  { value: RegistrationStatus.DRAFT, label: t('common.registrations.labels.draft') },
  { value: RegistrationStatus.CANCELLED, label: t('common.registrations.labels.cancelled') },
  { value: RegistrationStatus.VERIFIED, label: t('common.registrations.labels.verified') },
  { value: RegistrationStatus.NOT_ATTENDED, label: t('common.registrations.labels.notAttended') },
  { value: RegistrationStatus.ATTENDED, label: t('common.registrations.labels.attended') },
  { value: RegistrationStatus.FINISHED, label: t('common.registrations.labels.finished') },
  { value: RegistrationStatus.WAITING_LIST, label: t('common.registrations.labels.waitingList') },
];

/**
 * Retrieves type labels translated based on the current language.
 * @param {function} t - The translation function from next-translate.
 * @returns {Array<Object>} An array of objects containing value and label pairs for types.
 */
export const getTypeLabels = (t: TranslationFunction) => [
  { value: RegistrationType.PARTICIPANT, label: t('common.registrations.labels.participant') },
  { value: RegistrationType.STUDENT, label: t('common.registrations.labels.student') },
  { value: RegistrationType.LECTURER, label: t('common.registrations.labels.lecturer') },
  { value: RegistrationType.STAFF, label: t('common.registrations.labels.staff') },
  { value: RegistrationType.ARTIST, label: t('common.registrations.labels.artist') },
];

export const updateRegistration = async (
  id: number,
  updatedRegistration: RegistrationUpdateDto,
  onUpdate?: (registration: RegistrationDto) => void
) => {
  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const result = await apiWrapper(() =>
    eventuras.registrations.putV3Registrations({
      id: id,
      requestBody: updatedRegistration,
    })
  );
  if (result.ok) {
    logger.info({ registrationId: id }, `Registration updated successfully`);
    onUpdate?.(result.value!);
  } else {
    logger.error({ error: result.error, registrationId: id }, `Error updating registration`);
  }
  return result;
};

export const statusPatchRequest = async (registrationId: number, status: RegistrationStatus) => {
  const patchDocument = [{ op: 'replace', path: '/status', value: status }];

  const result = await fetcher(() =>
    fetch(`${Environment.NEXT_PUBLIC_API_BASE_URL}/v3/registrations/${registrationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify(patchDocument),
    })
  );

  if (result.ok) {
    logger.info({ registrationId, status }, `Registration status updated successfully`);
  } else {
    logger.error({ error: result.error, registrationId }, `Error updating registration status`);
  }
  return result;
};

const Registration = ({ registration, adminMode = false }: RegistrationProps) => {
  const router = useRouter();
  const t = useTranslations();

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
            defaultValues={registration}
            onSubmit={form => {
              updateRegistration(registration.registrationId!, form, router.refresh);
            }}
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
