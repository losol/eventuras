'use client';

import createTranslation from 'next-translate/createTranslation';

import Button from '@/components/ui/Button';
import { SiteInfo } from '@/utils/site/getSiteSettings';

export type RegistrationCancellationProps = {
  onBack?: () => void;
  siteInfo?: SiteInfo;
};

const RegistrationCancellation: React.FC<RegistrationCancellationProps> = ({
  onBack,
  siteInfo,
}) => {
  const { t } = createTranslation();

  return (
    <>
      <p>{t('user:events.cancellationpage.description')}</p>

      {siteInfo && siteInfo.contactInformation && (
        <p>
          {siteInfo.contactInformation.support.name} - {siteInfo.contactInformation.support.email}
        </p>
      )}

      {onBack && <Button onClick={onBack}>{t('common:buttons.back')}</Button>}
    </>
  );
};

export default RegistrationCancellation;
