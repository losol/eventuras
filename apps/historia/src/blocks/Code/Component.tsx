import React from 'react';
import { Code } from './Component.client';
import type { CodeBlock as CodeBlockPropsFromCollections } from '@/payload-types'

export type CodeBlockProps = CodeBlockPropsFromCollections & {
  className?: string;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ className, code, language }) => {
  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <Code code={code} language={language} />
    </div>
  );
};
