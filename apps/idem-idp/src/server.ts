// Express app (no HTML inline)
import express from "express";
import { renderHomepage } from "./views/homepage";

/**
 * Creates the Express app.
 * @returns Express.Application
 */
export function createServer() {
  // Create app
  const app = express();

  // Health probe
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Root page (HTML from view)
  app.get("/", (_req, res) => {
    const name = "idem-idp";
    const version = process.env.npm_package_version ?? "dev";
    // Send HTML
    res.type("html").send(renderHomepage({ name, version }));
  });

  return app;
}
