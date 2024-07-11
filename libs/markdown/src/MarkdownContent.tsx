import Markdown from 'markdown-to-jsx';

import { Heading, Text} from '@eventuras/ui';

export type MarkdownContentProps = {
  markdown?: string | null | undefined;
  heading?: string;
};

export const MarkdownContent = ({ markdown, heading }: MarkdownContentProps) => {
  if (!markdown) return null;

  const options = {
    overrides: {
    p: {
      component: Text as React.FC,
      props: {
        as: 'p',
        className: 'pb-3',
      },
      },
  }};

  return (
    <>
      {heading && <Heading as="h2">{heading}</Heading>}
      <Markdown options={options} children={markdown} />
    </>
  );
};
