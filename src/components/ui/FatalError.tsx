import React from 'react';

import Link from './Link';
/**
 *
 * Shows a full screen error with a Return link to return to '/'.
 *
 * @param  {string} options.title       [description]
 * @param  {string} options.description [description]
 * @param  {string} options.additional  [description]
 * @return Component
 */
const FatalError = ({
  title,
  description,
  additional,
}: {
  title: string;
  description: string;
  additional?: string;
}) => (
  <div className="fixed w-full h-full top-0 left-0 right-0 bg-black flex p-10">
    <div
      className="bg-red-100 w-full border-l-4 border-red-500 text-red-800 p-4 self-center "
      role="alert"
    >
      <p className="font-bold">{title}</p>
      <p>{description}</p>
      {additional && additional.length > 0 && <p>{additional}</p>}
      <Link href="/">Return</Link>
    </div>
  </div>
);

export default FatalError;
