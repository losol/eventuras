import React, { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import Editor from './Editor';
import EditorTheme from './themes/EditorTheme';
import EditorNodes from './nodes/EditorNodes';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { EditorState } from 'lexical';

function App() {
  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const initalMarkdown = `Hello **markdown**!`;

  const onChange = (editorState: EditorState) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      setMarkdownOutput(markdown);
    });
  };

  const initialConfig = {
    editorState: () => $convertFromMarkdownString(initalMarkdown, TRANSFORMERS),
    namespace: 'ScriboMD',
    nodes: [...EditorNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: EditorTheme,
  };

  return (
    <div className='App'>
      <h1>Markdown editor</h1>
      <h2>Make some content</h2>
      <LexicalComposer initialConfig={initialConfig}>
        <Editor onChange={onChange} />
      </LexicalComposer>
      <h2>Markdown output</h2>
      <pre>{markdownOutput}</pre>
    </div>
  );
}

export default App;
