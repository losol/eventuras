import { PageOverlay } from '@eventuras/ratio-ui/core/PageOverlay';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
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
 * Server-side error display component.
 * Translations should be passed as props from the parent component.
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
    <PageOverlay variant="error" fullScreen>
      <Error type="server-error" tone="error">
        <Error.Title>{title}</Error.Title>
        <Error.Description>
          {description ||
            'An unexpected error occurred. Our team has been notified and is working on it.'}
        </Error.Description>
        {additional && <Error.Details>{additional}</Error.Details>}
        {(siteInfo?.contactInformation?.support || siteInfo?.publisher || contactUsText) && (
          <Error.Details>
            <div className="text-sm space-y-2">
              {contactUsLabel && <p className="font-medium">{contactUsLabel}</p>}
              {contactUsText && <p>{contactUsText}</p>}
              {siteInfo?.contactInformation?.support?.email && (
                <p>
                  Support Email:{' '}
                  <a
                    href={`mailto:${siteInfo.contactInformation.support.email}`}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {siteInfo.contactInformation.support.email}
                  </a>
                </p>
              )}
              {siteInfo?.publisher?.phone && (
                <p>
                  Phone:{' '}
                  <a
                    href={`tel:${siteInfo.publisher.phone}`}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {siteInfo.publisher.phone}
                  </a>
                </p>
              )}
              {siteInfo?.publisher?.email && (
                <p>
                  Email:{' '}
                  <a
                    href={`mailto:${siteInfo.publisher.email}`}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {siteInfo.publisher.email}
                  </a>
                </p>
              )}
            </div>
          </Error.Details>
        )}
      </Error>
    </PageOverlay>
  );
};

export default FatalError;
