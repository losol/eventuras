import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import MarkdownEditor from "./MarkdownEditor";

/*
  Let's keep a handy way to test the editor locally when in development mode, whilst only building the editor in production mode.
  Build size difference neglible
  */

if (process.env.NODE_ENV !== "production") {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
  );
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
export default MarkdownEditor;
