'use client';

import { Button } from '@eventuras/ratio-ui';
import { useTranslations } from 'next-intl';

import { SiteInfo } from '@/utils/site/getSiteSettings';

export type RegistrationCancellationProps = {
  onBack?: () => void;
  siteInfo?: SiteInfo;
};

const RegistrationCancellation: React.FC<RegistrationCancellationProps> = ({
  onBack,
  siteInfo,
}) => {
  const t = useTranslations();

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
