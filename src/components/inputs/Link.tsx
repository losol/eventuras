import NextLink from 'next/link';

const BlockLink = (props: any) => (
  <NextLink
    href={props.href}
    className={`bg-sky-400 dark:bg-sky-950 hover:bg-sky-700 text-white font-bold my-6 py-4 px-4 block`}
  >
    {props.children}
  </NextLink>
);

export { BlockLink };
