import Link from './BaseLink';

type UnauthorizedProps = {
  homeUrl?: string;
  variant?: 'small' | 'large';
};

export function Unauthorized({ homeUrl = '/', variant = 'large' }: UnauthorizedProps) {
  const isSmall = variant === 'small';

  return (
    <div className={`text-center ${isSmall ? 'py-8' : 'py-20'} bg-red-500 text-white`}>
      <div className="inline-flex items-center justify-center p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${isSmall ? 'h-6 w-6' : 'h-8 w-8'} animate-bounce`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <h1 className={`${isSmall ? 'text-2xl' : 'text-4xl'} font-extrabold ml-2`}>Unauthorized</h1>
      </div>
      <p className={`${isSmall ? 'text-md' : 'text-lg'} mt-2`}>
        Uh-oh! It looks like you do not have the right permissions to view this content.
      </p>
      {!isSmall && (
        <p className="text-md my-6">If you believe this is an error, please contact support.</p>
      )}
      <Link href={homeUrl} variant="button-primary">
        Return to Home
      </Link>
    </div>
  );
}
