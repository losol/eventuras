'use client';
import {
  PaymentProvider,
  RegistrationCustomerInfoDto,
  RegistrationDto,
  RegistrationStatus,
  RegistrationType,
} from '@losol/eventuras';
import { useRouter } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';

import Form from '@/components/forms/Form';
import Select from '@/components/forms/src/inputs/Select';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Definition, DescriptionList, Item, Term } from '@/components/ui/DescriptionList';
import Heading from '@/components/ui/Heading';
import Section from '@/components/ui/Section';
import { apiWrapper, createSDK, fetcher } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

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

type TranslationFunction = (key: string, options?: object) => string;
const logger_namespace = 'Registration';

/**
 * Retrieves status labels translated based on the current language.
 * @param {function} t - The translation function from next-translate.
 * @returns {Array<Object>} An array of objects containing value and label pairs for statuses.
 */
export const getStatusLabels = (t: TranslationFunction) => [
  { value: RegistrationStatus.DRAFT, label: t('admin:registrations.labels.draft') },
  { value: RegistrationStatus.CANCELLED, label: t('admin:registrations.labels.cancelled') },
  { value: RegistrationStatus.VERIFIED, label: t('admin:registrations.labels.verified') },
  { value: RegistrationStatus.NOT_ATTENDED, label: t('admin:registrations.labels.notAttended') },
  { value: RegistrationStatus.ATTENDED, label: t('admin:registrations.labels.attended') },
  { value: RegistrationStatus.FINISHED, label: t('admin:registrations.labels.finished') },
  { value: RegistrationStatus.WAITING_LIST, label: t('admin:registrations.labels.waitingList') },
];

/**
 * Retrieves type labels translated based on the current language.
 * @param {function} t - The translation function from next-translate.
 * @returns {Array<Object>} An array of objects containing value and label pairs for types.
 */
export const getTypeLabels = (t: TranslationFunction) => [
  { value: RegistrationType.PARTICIPANT, label: t('admin:registrations.labels.participant') },
  { value: RegistrationType.STUDENT, label: t('admin:registrations.labels.student') },
  { value: RegistrationType.LECTURER, label: t('admin:registrations.labels.lecturer') },
  { value: RegistrationType.STAFF, label: t('admin:registrations.labels.staff') },
  { value: RegistrationType.ARTIST, label: t('admin:registrations.labels.artist') },
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
    Logger.info({ namespace: logger_namespace }, `Registration ${id} updated successfully`);
    onUpdate?.(result.value!);
  } else {
    Logger.error(
      { namespace: logger_namespace },
      `Error updating registration ${id}: ${result.error}`
    );
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
    Logger.info(
      { namespace: logger_namespace },
      `Registration ${registrationId} status updated to ${status}`
    );
  } else {
    Logger.error(
      { namespace: logger_namespace },
      `Error updating registration ${registrationId}: ${result.error}`
    );
  }
  return result;
};

const Registration = ({ registration, adminMode = false }: RegistrationProps) => {
  const router = useRouter();
  const { t } = createTranslation();

  if (!registration) {
    return <p>{t('admin:registrations.labels.noRegistration')}</p>;
  }
  const statusLabel = getStatusLabels(t).find(label => label.value === registration.status)?.label;
  const typeLabel = getTypeLabels(t).find(label => label.value === registration.type)?.label;

  return (
    <>
      <DescriptionList>
        <Item>
          <Term>{t('admin:registrations.labels.id')}</Term>
          <Definition dataTestId="registration-registrationId">
            {registration.registrationId}
          </Definition>
        </Item>
        <Item>
          <Term>{t('admin:registrations.labels.userName')}</Term>
          <Definition>{registration.user?.name}</Definition>
        </Item>

        <Item>
          <Term>{t('admin:registrations.labels.eventTitle')}</Term>
          <Definition>{registration.event?.title}</Definition>
        </Item>
        {!adminMode && (
          <>
            <Item>
              <Term>{t('admin:registrations.labels.status')}</Term>
              <Definition>
                <Badge>{statusLabel}</Badge>
              </Definition>
            </Item>
            <Item>
              <Term>{t('admin:registrations.labels.type')}</Term>
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

            <Button type="submit">{t('common:labels.save')}</Button>
          </Form>
        )}
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
