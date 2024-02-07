import React, { useState } from "react";
import ReactDOM from "react-dom/client";

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
      <h1>Markdown editor</h1>
      <h2>Make some content</h2>
      <MarkdownEditor onChange={onChange} initialMarkdown={markdown} />
      <h2>Markdown output</h2>
      <pre>{markdown}</pre>
    </div>
  );
}

if (process.env.NODE_ENV !== "production") {
  const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
