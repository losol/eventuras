'use client';
import { useLocale, useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { useToast } from '@eventuras/ratio-ui/toast';
import { Form, Select } from '@eventuras/smartform';

import { CertificateActionsButton } from '@/components/eventuras/CertificateActionsButton';
import {
  PaymentProvider,
  RegistrationDto,
  RegistrationPatchDto,
  RegistrationStatus,
  RegistrationType,
} from '@/lib/eventuras-sdk';

import { patchRegistration } from './actions';
import Order from '../orders/Order';

const logger = Logger.create({
  namespace: 'web:admin:registrations',
  context: { component: 'Registration' },
});
interface RegistrationProps {
  registration?: RegistrationDto;
  adminMode?: boolean;
  showProducts?: boolean;
  showNotes?: boolean;
  editMode?: boolean;
  userNameHeading?: boolean;
}
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

/**
 * Payment method labels. Hardcoded strings until translations are added.
 */
export const paymentMethodLabels: { value: PaymentProvider; label: string }[] = [
  { value: 'EmailInvoice', label: 'Email invoice' },
  { value: 'PowerOfficeEmailInvoice', label: 'PowerOffice email invoice' },
  { value: 'PowerOfficeEHFInvoice', label: 'PowerOffice EHF invoice' },
  { value: 'StripeInvoice', label: 'Stripe invoice' },
  { value: 'StripeDirect', label: 'Stripe (direct)' },
  { value: 'VippsInvoice', label: 'Vipps invoice' },
  { value: 'VippsDirect', label: 'Vipps (direct)' },
];

export const getPaymentMethodLabel = (method?: PaymentProvider | null): string => {
  if (!method) return '';
  return paymentMethodLabels.find(x => x.value === method)?.label ?? method;
};

export const formatRegistrationTime = (
  instant?: string | null,
  locale?: string
): string | null => {
  if (!instant) return null;
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

/**
 * Gets the appropriate badge variant for registration status
 */
export const getStatusBadgeStatus = (status: string): 'neutral' | 'info' | 'success' | 'error' => {
  switch (status) {
    case 'Cancelled':
      return 'error';
    case 'Verified':
    case 'Attended':
    case 'Finished':
      return 'success';
    case 'Draft':
      return 'neutral';
    case 'WaitingList':
      return 'info';
    default:
      return 'neutral';
  }
};

const Registration = ({
  registration,
  adminMode = false,
  showProducts = true,
  showNotes = true,
  editMode = true,
  userNameHeading = false,
}: RegistrationProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const toast = useToast();

  const handleUpdateRegistration = async (form: RegistrationPatchDto) => {
    if (!registration?.registrationId) {
      return;
    }
    const result = await patchRegistration(registration.registrationId, form);
    if (!result.success) {
      logger.error(
        { error: result.error, registrationId: registration.registrationId },
        'Failed to patch registration'
      );
      toast.error(result.error.message);
      return;
    }
    logger.info({ registrationId: registration.registrationId }, 'Registration patched');
    toast.success(result.message ?? t('common.labels.save'));
  };

  if (!registration) {
    return <p>{t('common.registrations.labels.noRegistration')}</p>;
  }
  const statusLabel = getStatusLabels(t).find(label => label.value === registration.status)?.label;
  const typeLabel = getTypeLabels(t).find(label => label.value === registration.type)?.label;

  // Use badge layout when not in edit mode
  if (!editMode) {
    return (
      <>
        {userNameHeading && registration.user?.name && (
          <Heading as="h3" marginBottom="sm">
            {registration.user.name}
          </Heading>
        )}
        <dl className="flex flex-wrap gap-2 mb-4">
          <Badge definition label={t('common.registrations.labels.id')} status="neutral">
            {registration.registrationId}
          </Badge>
          <Badge definition label={t('common.registrations.labels.status')}>
            {statusLabel}
          </Badge>
          <Badge definition label={t('common.registrations.labels.type')} status="neutral">
            {typeLabel}
          </Badge>
        </dl>
        {registration.orders && registration.orders.length > 0 && (
          <Section>
            <Heading as="h4" marginBottom="xs">
              {t('common.registrations.labels.orders')}
            </Heading>
            <ul className="space-y-2">
              {registration.orders.map(order => (
                <Order order={order} key={order.orderId} admin={adminMode} />
              ))}
            </ul>
          </Section>
        )}
      </>
    );
  }

  return (
    <>
      {userNameHeading && registration.user?.name && (
        <Heading as="h3" marginBottom="sm">
          {registration.user.name}
        </Heading>
      )}
      <DescriptionList>
        <DescriptionList.Item>
          <DescriptionList.Term>{t('common.registrations.labels.id')}</DescriptionList.Term>
          <DescriptionList.Definition testId="registration-registrationId">
            {registration.registrationId}
          </DescriptionList.Definition>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>{t('common.registrations.labels.userName')}</DescriptionList.Term>
          <DescriptionList.Definition>{registration.user?.name}</DescriptionList.Definition>
        </DescriptionList.Item>
        {registration.registrationTime && (
          <DescriptionList.Item>
            <DescriptionList.Term>
              {t('common.registrations.labels.registeredAt')}
            </DescriptionList.Term>
            <DescriptionList.Definition>
              {formatRegistrationTime(registration.registrationTime, locale)}
            </DescriptionList.Definition>
          </DescriptionList.Item>
        )}
        {/* Show status and type as badges when not in edit mode, or when not in admin mode */}
        {(!editMode || !adminMode) && (
          <>
            <DescriptionList.Item>
              <DescriptionList.Term>{t('common.registrations.labels.status')}</DescriptionList.Term>
              <DescriptionList.Definition>
                <Badge status={getStatusBadgeStatus(registration.status || '')}>
                  {statusLabel}
                </Badge>
              </DescriptionList.Definition>
            </DescriptionList.Item>
            <DescriptionList.Item>
              <DescriptionList.Term>{t('common.registrations.labels.type')}</DescriptionList.Term>
              <DescriptionList.Definition>
                <Badge status="neutral">{typeLabel}</Badge>
              </DescriptionList.Definition>
            </DescriptionList.Item>
            {registration.paymentMethod && (
              <DescriptionList.Item>
                <DescriptionList.Term>
                  {t('common.registrations.labels.paymentMethod')}
                </DescriptionList.Term>
                <DescriptionList.Definition>
                  <Badge status="neutral">
                    {getPaymentMethodLabel(registration.paymentMethod)}
                  </Badge>
                </DescriptionList.Definition>
              </DescriptionList.Item>
            )}
          </>
        )}
        {registration.customerVatNumber && (
          <DescriptionList.Item>
            <DescriptionList.Term>
              {t('common.registrations.labels.vatNumber')}
            </DescriptionList.Term>
            <DescriptionList.Definition>
              {registration.customerVatNumber}
            </DescriptionList.Definition>
          </DescriptionList.Item>
        )}
        {registration.customerInvoiceReference && (
          <DescriptionList.Item>
            <DescriptionList.Term>
              {t('common.registrations.labels.invoiceReference')}
            </DescriptionList.Term>
            <DescriptionList.Definition>
              {registration.customerInvoiceReference}
            </DescriptionList.Definition>
          </DescriptionList.Item>
        )}
        {adminMode && registration.uuid && (
          <DescriptionList.Item>
            <DescriptionList.Term>{t('common.registrations.labels.uuid')}</DescriptionList.Term>
            <DescriptionList.Definition>
              <code className="text-xs">{registration.uuid}</code>
            </DescriptionList.Definition>
          </DescriptionList.Item>
        )}
        {/* Show editable forms when in edit mode and admin mode */}
        {editMode && adminMode && (
          <Form
            defaultValues={{
              type: registration.type,
              status: registration.status,
              paymentMethod: registration.paymentMethod,
            }}
            onSubmit={handleUpdateRegistration}
          >
            <Select
              name="type"
              options={getTypeLabels(t)}
              label={t('common.registrations.labels.type')}
            />
            <Select
              name="status"
              options={getStatusLabels(t)}
              label={t('common.registrations.labels.status')}
            />
            <Select
              name="paymentMethod"
              options={paymentMethodLabels}
              label={t('common.registrations.labels.paymentMethod')}
            />
            <Button type="submit">{t('common.labels.save')}</Button>
          </Form>
        )}
      </DescriptionList>
      {showProducts && registration.products && (
        <Section>
          <Heading as="h2">{t('common.registrations.labels.products')}</Heading>
          <ul>
            {registration.products.map(product => (
              <li key={product.productId}>{product.product?.name}</li>
            ))}
          </ul>
        </Section>
      )}
      {showNotes && (
        <Section>
          <Heading as="h2">{t('common.registrations.labels.notes')}</Heading>
          <p>{registration.notes ?? t('common.registrations.labels.notesEmpty')}</p>
        </Section>
      )}
      {adminMode && (
        <Section>
          <Heading as="h2">{t('admin.events.tabs.certificate')}</Heading>
          {registration.certificateId && registration.registrationId ? (
            <CertificateActionsButton
              certificateId={registration.certificateId}
              registrationId={registration.registrationId}
            />
          ) : (
            <p className="text-gray-500">{t('admin.certificates.labels.noCertificate')}</p>
          )}
          {registration.certificateComment && (
            <p className="mt-2 text-sm">
              <strong>{t('admin.certificates.labels.comment')}:</strong>{' '}
              {registration.certificateComment}
            </p>
          )}
        </Section>
      )}
      {registration.orders && (
        <Section>
          <Heading as="h4">{t('common.registrations.labels.orders')}</Heading>
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
