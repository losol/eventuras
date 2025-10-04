// Express app (no HTML inline)
import express, {Express} from "express";
import { renderHomepage } from "./views/homepage";

/**
 * Creates the Express app.
 * @returns Express.Application
 */
export function createServer() {
  const app = express();

  // Health probe
  // @ts-ignore
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Root page (HTML from view)
  // @ts-ignore
  app.get("/", (_req, res) => {
    const name = "idem-idp";
    const version = process.env.npm_package_version ?? "dev";
    // Send HTML
    res.type("html").send(renderHomepage({ name, version }));
  });

  return app;
}
