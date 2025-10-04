import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  outDir: "dist",
  sourcemap: true,
  clean: true,
  target: "node20",
  format: ["esm"],
  platform: "node",
  dts: false,
  splitting: false,
  minify: false,
  shims: false
});
