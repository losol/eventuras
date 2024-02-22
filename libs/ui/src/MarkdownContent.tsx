import { compiler } from 'markdown-to-jsx';

import Heading from '@eventuras/ui/Heading';

export type MarkdownContentProps = {
  markdown?: string | null | undefined;
  heading?: string;
};
const MarkdownContent = ({ markdown, heading }: MarkdownContentProps) => {
  if (!markdown) return null;

  return (
    <>
      {heading && <Heading as="h2">{heading}</Heading>}
      {compiler(markdown)}
    </>
  );
};

export default MarkdownContent;
