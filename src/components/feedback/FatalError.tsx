import React from 'react';

import { BlockLink } from '../inputs/Link';
const FatalError = ({ title, description }: { title: string; description: string }) => (
  <div className="fixed w-full h-full top-0 left-0 right-0 bg-black flex p-10">
    <div
      className="bg-red-100 w-full border-l-4 border-red-500 text-red-800 p-4 self-center "
      role="alert"
    >
      <p className="font-bold">{title}</p>
      <p>{description}</p>
      <BlockLink href="/">Return</BlockLink>
    </div>
  </div>
);

export default FatalError;
