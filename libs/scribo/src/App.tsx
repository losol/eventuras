import { useState } from "react";

import MarkdownEditor from "./MarkdownEditor";

import "./App.css";

function App() {
  const initialMarkdown = "Hello **markdown**!";
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);

  const onChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
  };

  return (
    <div className="App">
      <h1>Scribo Markdown editor</h1>
      <div className="editor-container">
        <div className="markdown-editor">
          <h2>Write some content</h2>
          <MarkdownEditor onChange={onChange} initialMarkdown={markdown} />
        </div>
        <div className="markdown-output">
          <h2>See the markdown output</h2>
          <pre>{markdown}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;