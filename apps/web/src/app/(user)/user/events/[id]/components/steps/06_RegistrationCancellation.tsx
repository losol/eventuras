'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { SiteInfo } from '@/utils/site/getSiteSettings';

import { logStepEntry, logUserAction } from '../../lib/eventFlowLogger';

export type Step06RegistrationCancellationProps = {
  onBack?: () => void;
  siteInfo?: SiteInfo;
};
const Step06RegistrationCancellation: React.FC<Step06RegistrationCancellationProps> = ({
  onBack,
  siteInfo,
}) => {
  const t = useTranslations();
  useEffect(() => {
    logStepEntry('06', 'RegistrationCancellation');
  }, []);
  const handleBack = () => {
    logUserAction('Back from cancellation view');
    onBack?.();
  };
  return (
    <div className="max-w-2xl mx-auto">
      <Heading as="h2" className="mb-6 text-red-600 dark:text-red-400">
        {t('user.events.cancellationpage.title')}
      </Heading>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        {t('user.events.cancellationpage.description')}
      </p>
      {siteInfo && siteInfo.contactInformation && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="font-semibold">{t('common.labels.contactInfo')}</p>
          <p>
            {siteInfo.contactInformation.support.name} -{' '}
            <a
              href={`mailto:${siteInfo.contactInformation.support.email}`}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              {siteInfo.contactInformation.support.email}
            </a>
          </p>
        </div>
      )}
      {onBack && (
        <Button onClick={handleBack} variant="outline">
          {t('common.buttons.back')}
        </Button>
      )}
    </div>
  );
};
export default Step06RegistrationCancellation;
