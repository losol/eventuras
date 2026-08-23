'use client';

/* eslint-disable react/prop-types */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { ValueTile } from '@eventuras/ratio-ui/core/ValueTile';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';
import { Stack } from '@eventuras/ratio-ui/layout/Stack';

import { RegistrationDto, RegistrationStatus } from '@/lib/eventuras-sdk';

import { computeOrderStatistics } from './orderStatistics';
import Registration from '../../registrations/Registration';

type EconomySectionProps = {
  participants: RegistrationDto[];
};

// Define the order for status groups
const STATUS_GROUP_CONFIG: {
  status: RegistrationStatus;
  translationKey: string;
}[] = [
  { status: 'Verified', translationKey: 'common.registrations.labels.verified' },
  { status: 'Draft', translationKey: 'common.registrations.labels.draft' },
  { status: 'Attended', translationKey: 'common.registrations.labels.attended' },
  { status: 'Finished', translationKey: 'common.registrations.labels.finished' },
  { status: 'WaitingList', translationKey: 'common.registrations.labels.waitingList' },
  { status: 'NotAttended', translationKey: 'common.registrations.labels.notAttended' },
  { status: 'Cancelled', translationKey: 'common.registrations.labels.cancelled' },
];

const EconomySection: React.FC<EconomySectionProps> = ({ participants }) => {
  const t = useTranslations();

  const statistics = useMemo(() => computeOrderStatistics(participants), [participants]);

  // Group participants by registration status
  const groupedParticipants = useMemo(() => {
    const groups = new Map<RegistrationStatus, RegistrationDto[]>();
    for (const registration of participants) {
      const status: RegistrationStatus = registration.status ?? 'Draft';
      const existing = groups.get(status) || [];
      existing.push(registration);
      groups.set(status, existing);
    }
    return groups;
  }, [participants]);

  if (participants.length === 0) {
    return (
      <Stack gap="xl" className="py-8">
        <p className="text-gray-500">{t('admin.economy.labels.noOrders')}</p>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" className="py-8">
      {/* Summary */}
      <Grid cols={{ sm: 2, md: 2 }}>
        <Card transparent border className="text-center">
          <ValueTile
            number={statistics.totalOrders}
            label={t('admin.economy.statistics.totalOrders')}
            className="items-center"
          />
        </Card>
        <Card transparent border className="text-center">
          <ValueTile
            number={Number.parseFloat(statistics.totalRevenue.toFixed(2))}
            label={`${t('admin.economy.statistics.totalRevenue')} (kr)`}
            className="items-center"
          />
        </Card>
      </Grid>

      {/* Order status breakdown */}
      <Grid cols={{ sm: 2, md: 3 }}>
        <Card transparent border className="text-center">
          <ValueTile
            number={statistics.draftOrders}
            label={t('admin.economy.statistics.draftOrders')}
            className="items-center"
          />
        </Card>
        <Card transparent border className="text-center">
          <ValueTile
            number={statistics.verifiedOrders}
            label={t('admin.economy.statistics.verifiedOrders')}
            className="items-center"
          />
        </Card>
        <Card transparent border className="text-center">
          <ValueTile
            number={statistics.invoicedOrders}
            label={t('admin.economy.statistics.invoicedOrders')}
            className="items-center"
          />
        </Card>
        <Card transparent border className="text-center">
          <ValueTile
            number={statistics.cancelledOrders}
            label={t('admin.economy.statistics.cancelledOrders')}
            className="items-center"
          />
        </Card>
        <Card transparent border className="text-center">
          <ValueTile
            number={statistics.refundedOrders}
            label={t('admin.economy.statistics.refundedOrders')}
            className="items-center"
          />
        </Card>
      </Grid>

      {/* Registrations grouped by status */}
      {STATUS_GROUP_CONFIG.map(({ status, translationKey }) => {
        const group = groupedParticipants.get(status);
        if (!group || group.length === 0) return null;

        return (
          <Stack key={status} gap="md">
            <Heading as="h2">
              {t(translationKey)} ({group.length})
            </Heading>
            {group.map(registration => (
              <Card key={registration.registrationId} className="p-6">
                <Registration
                  registration={registration}
                  adminMode={true}
                  showProducts={false}
                  showNotes={false}
                  editMode={false}
                  userNameHeading={true}
                />
              </Card>
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
};

export default EconomySection;
