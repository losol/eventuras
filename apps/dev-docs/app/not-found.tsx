import { Heading } from '@eventuras/ratio-ui/core/Heading';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Heading as="h1">404</Heading>
      <p className="mt-4 text-gray-500 dark:text-gray-400">
        Page not found.
      </p>
      <Link
        href="/"
        className="mt-6 text-primary-600 underline hover:text-primary-800 dark:text-primary-400"
      >
        Back to docs
      </Link>
    </div>
  );
}
