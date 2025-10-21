'use client';
;
import { useEffect } from 'react';
import FatalError from '@/components/FatalError';
import { SiteInfo } from '@/utils/site/getSiteSettings';
import { eventFlowLogger } from './lib/eventFlowLogger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

;
interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  siteInfo?: SiteInfo;
}
export default function Error({ error, reset, siteInfo }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error when component mounts
    eventFlowLogger.error(
      {
        error,
        digest: error.digest,
        stack: error.stack
      },
      'Event flow error boundary triggered'
    );
  }, [error]);
  if (siteInfo) {
    return (
      <FatalError
        title="Registration Error"
        description="We encountered an error during the registration process. Please try again or contact support if the problem persists."
        siteInfo={siteInfo}
        contactUsLabel="Contact Support"
        contactUsText="Need help? Get in touch with us."
      />
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <Heading as="h2" className="text-red-600 dark:text-red-400">
        Registration Error
      </Heading>
      <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md text-center">
        We encountered an error during the registration process.
      </p>
      <button
        onClick={reset}
        className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}