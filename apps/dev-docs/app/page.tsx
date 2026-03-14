import Link from 'next/link';

import { Heading } from '@eventuras/ratio-ui/core/Heading';

export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <Heading as="h1">Eventuras Docs</Heading>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Event and Course Management Solution
      </p>
      <Link
        href="/docs"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Browse documentation
      </Link>
    </div>
  );
}
