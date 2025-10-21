import { ErrorPage } from '@eventuras/ratio-ui/pages/ErrorPage';
import { getTranslations } from 'next-intl/server';
import { SiteInfo } from '@/utils/site/getSiteSettings';

interface FatalErrorProps {
  title: string;
  description: string;
  additional?: string;
  siteInfo?: SiteInfo | null;
}

/** See: {@link import('@eventuras/ratio-ui/blocks/ErrorPage').ErrorPageProps} */
const FatalError: React.FC<FatalErrorProps> = async ({
  title,
  description,
  additional,
  siteInfo,
}) => {
  // ➜ i18n strings
  const t = await getTranslations();

  // ➜ Render generic ErrorPage with fatal tone
  return (
    <ErrorPage tone="fatal" fullScreen>
      <ErrorPage.Title>{title}</ErrorPage.Title>

      <ErrorPage.Description>{description}</ErrorPage.Description>

      {additional && <ErrorPage.Extra>{additional}</ErrorPage.Extra>}

      {/* ➜ Project-specific contact block (kept in app) */}
      {siteInfo?.contactInformation?.support && (
        <ErrorPage.Extra>
          <h2 className="text-lg font-semibold">{t('common.labels.contactUs')}</h2>
          <p className="mt-1">{t('common.errorpage.contactUs')}</p>
          <p className="mt-1">{siteInfo.contactInformation.support.name}</p>
          <p className="mt-1">{siteInfo.contactInformation.support.email}</p>
        </ErrorPage.Extra>
      )}
    </ErrorPage>
  );
};

export default FatalError;
