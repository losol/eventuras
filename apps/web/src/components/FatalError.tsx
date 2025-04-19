import { Heading, Section } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import { SiteInfo } from '@/utils/site/getSiteSettings';

interface FatalErrorProps {
  title: string;
  description: string;
  additional?: string;
  siteInfo?: SiteInfo | null;
}

/**
 * Displays a full-screen error message with a link to return to the homepage.
 *
 * This file should probably to be refactored to avoid importing the sitesettings type from the utils folder.
 *
 * @param {FatalErrorProps} props The properties of the FatalError component.
 * @returns {JSX.Element} The FatalError component.
 */
const FatalError: React.FC<FatalErrorProps> = async ({
  title,
  description,
  additional,
  siteInfo,
}) => {
  const t = await getTranslations();

  return (
    <div className="fixed w-full h-full top-0 left-0 right-0 bg-black flex p-10">
      <div
        className="bg-red-100 w-full border-l-4 border-red-500 text-red-800 p-4 self-center"
        role="alert"
      >
        <Heading>{title}</Heading>
        <p>{description}</p>
        {additional && <p>{additional}</p>}
        {siteInfo && siteInfo.contactInformation && (
          <Section>
            <Heading as="h2">{t('common.labels.contactUs')}</Heading>
            <div>
              <p>{t('common.errorpage.contactUs')}</p>
              <p>{siteInfo.contactInformation.support.name}</p>
              <p>{siteInfo.contactInformation.support.email}</p>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default FatalError;
