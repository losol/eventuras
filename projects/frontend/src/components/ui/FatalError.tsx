import createTranslation from 'next-translate/createTranslation';
import React from 'react';

import { SiteInfo } from '@/utils/site/getSiteSettings';

import Heading from './Heading';
import Section from './Section';

interface FatalErrorProps {
  title: string;
  description: string;
  additional?: string;
  siteInfo?: SiteInfo | null;
}

/**
 * Displays a full-screen error message with a link to return to the homepage.
 *
 * @param {FatalErrorProps} props The properties of the FatalError component.
 * @returns {JSX.Element} The FatalError component.
 */
const FatalError: React.FC<FatalErrorProps> = ({ title, description, additional, siteInfo }) => {
  const { t } = createTranslation();

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
            <Heading as="h2">{t('common:labels.contactUs')}</Heading>
            <div>
              <p>{t('common:errorpage.contactUs')}</p>
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
