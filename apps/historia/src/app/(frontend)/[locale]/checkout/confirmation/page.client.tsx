'use client';

import { useEffect } from 'react';

import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'historia:checkout',
  context: { module: 'ConfirmationPageClient' },
});

interface ConfirmationPageClientProps {
  locale: string;
  reference?: string;
}

export function ConfirmationPageClient({
  locale,
  reference,
}: ConfirmationPageClientProps) {
  useEffect(() => {
    if (reference) {
      logger.info({ reference }, 'Order confirmation displayed');
    }
  }, [reference]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mb-4 text-3xl font-bold">Takk for din bestilling!</h1>
        <p className="mb-2 text-lg text-gray-600">
          Din betaling er fullført.
        </p>

        {reference && (
          <p className="mb-8 text-sm text-gray-500">
            Ordrenummer: <span className="font-mono">{reference}</span>
          </p>
        )}

        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-lg font-semibold">Hva skjer nå?</h2>
          <ul className="space-y-2 text-left text-gray-600">
            <li className="flex items-start">
              <svg
                className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Du vil motta en bekreftelse på e-post
            </li>
            <li className="flex items-start">
              <svg
                className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Du får tilgang til dine digitale produkter umiddelbart
            </li>
            <li className="flex items-start">
              <svg
                className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Kvittering er sendt til din e-postadresse
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href={`/${locale}`}
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Gå til forsiden
          </a>
          <a
            href={`/${locale}/my-orders`}
            className="inline-block rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            Se mine bestillinger
          </a>
        </div>
      </div>
    </div>
  );
}
