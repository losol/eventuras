import { createServer } from "./server";

const port: number = Number(process.env.PORT) || 3200;
createServer().listen(port, () => {
  console.log(`✅ listening on http://localhost:${port}`);
});
