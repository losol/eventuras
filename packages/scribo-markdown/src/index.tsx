import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
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
