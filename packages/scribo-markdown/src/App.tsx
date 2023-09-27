import React, { useState } from 'react';
import { MarkdownEditor } from './MarkdownEditor';

function App() {
  const initialMarkdown = 'Hello **markdown**!';
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);

  const onChange = (markdown: string) => {
    setMarkdown(markdown);
  };

  return (
    <div className='App'>
      <h1>Markdown editor</h1>
      <h2>Make some content</h2>
      <MarkdownEditor onChange={onChange} initialMarkdown={markdown} />
      <h2>Markdown output</h2>
      <pre>{markdown}</pre>
    </div>
  );
}

export default App;
