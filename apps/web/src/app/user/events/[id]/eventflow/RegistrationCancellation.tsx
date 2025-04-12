'use client';

import { Button } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';

import { SiteInfo } from '@/utils/site/getSiteSettings';

export type RegistrationCancellationProps = {
  onBack?: () => void;
  siteInfo?: SiteInfo;
};

const RegistrationCancellation: React.FC<RegistrationCancellationProps> = ({
  onBack,
  siteInfo,
}) => {
  const t = await getTranslations();

  return (
    <>
      <p>{t('user.events.cancellationpage.description')}</p>

      {siteInfo && siteInfo.contactInformation && (
        <p>
          {siteInfo.contactInformation.support.name} - {siteInfo.contactInformation.support.email}
        </p>
      )}

      {onBack && <Button onClick={onBack}>{t('common.buttons.back')}</Button>}
    </>
  );
};

export default RegistrationCancellation;
