'use client';

import { ErrorPage } from '@eventuras/ratio-ui/pages/ErrorPage';
import { SiteInfo } from '@/utils/site/getSiteSettings';

interface FatalErrorProps {
  title: string;
  description: string;
  additional?: string;
  siteInfo?: SiteInfo | null;
  contactUsLabel?: string;
  contactUsText?: string;
}

/**
 * Client-side error display component.
 * Translations should be passed as props from the parent component.
 * See: {@link import('@eventuras/ratio-ui/blocks/ErrorPage').ErrorPageProps}
 */
const FatalError: React.FC<FatalErrorProps> = ({
  title,
  description,
  additional,
  siteInfo,
  contactUsLabel,
  contactUsText,
}) => {
  return (
    <ErrorPage tone="fatal" fullScreen>
      <ErrorPage.Title>{title}</ErrorPage.Title>

      <ErrorPage.Description>{description}</ErrorPage.Description>

      {additional && <ErrorPage.Extra>{additional}</ErrorPage.Extra>}

      {/* ➜ Project-specific contact block (kept in app) */}
      {siteInfo?.contactInformation?.support && (
        <ErrorPage.Extra>
          {contactUsLabel && <h2 className="text-lg font-semibold">{contactUsLabel}</h2>}
          {contactUsText && <p className="mt-1">{contactUsText}</p>}
          <p className="mt-1">{siteInfo.contactInformation.support.name}</p>
          <p className="mt-1">{siteInfo.contactInformation.support.email}</p>
        </ErrorPage.Extra>
      )}
    </ErrorPage>
  );
};

export default FatalError;
