# @eventuras/app-config

## 0.1.4

### Patch Changes

- a29b507: Stop bundling runtime dependencies into published library output, and stop minifying.

  The vanilla/react/next library presets used to inline every transitive dep (e.g. `oauth4webapi` was bundled into `@eventuras/fides-auth`) and minify class/function names. Two consequences:
  - **`instanceof` failed across module boundaries.** A consumer importing `ResponseBodyError` from `openid-client` got a different class than the one a library threw, because the library carried its own bundled+renamed copy.
  - **Stack traces were unreadable** — minified names like `j` instead of `ResponseBodyError`.

  The presets now:
  - Auto-externalize every entry in the consumer's `dependencies`, `peerDependencies`, and `optionalDependencies` (plus `node:*` built-ins).
  - Set `build.minify: false` (libraries should not minify — consumers minify their own bundle).
  - Emit sourcemaps so consumer stack traces map back to original sources.

  No API changes — all affected packages are bumped `patch`. The only observable effect is leaner, more debuggable output: deps are required at install time (already the case via each lib's `dependencies`) instead of duplicated inside the bundle.

## 0.1.3

### Patch Changes

- 7c9fe79: chore: update dependencies

## 0.1.2

### Patch Changes

- chore: update deps

## 0.1.1

### Patch Changes

- chore: update dependencies across frontend packages

## 0.1.0 (2025-10-18)

### 🧱 Features

- **Initial release**: Declarative environment configuration for Eventuras applications
- **JSON Schema**: Provides JSON Schema (`app-config.schema.json`) for IDE autocomplete and validation
- **Type validation**: Runtime validation with automatic type conversion (string, url, int, bool, json)
- **Helpful errors**: Descriptive error messages with context when env vars are missing or invalid
- **Default values**: Support for default values in configuration
- **Pattern matching**: Regex pattern validation for env vars
- **Enum validation**: Restrict env vars to allowed values
- **Client/Server separation**: Mark env vars as client-accessible (NEXT*PUBLIC*\*) or server-only
- **Vite-based build**: Uses `@eventuras/vite-config/vanilla-lib` preset for consistent builds

### API

- `createConfig(configPath)`: Load and validate app configuration from `app.config.json`
- `ConfigLoader.get<T>(varName)`: Get typed environment variable value
- `ConfigLoader.has(varName)`: Check if variable exists
- `ConfigLoader.getAllEnv()`: Get all environment variables as object
- `ConfigLoader.getConfig()`: Get raw app configuration

### 📝 Documentation

- README with usage examples
- Next.js integration examples
- JSON Schema documentation

### Dependencies

- `zod`: ^3.23.8 - Schema validation
- `@eventuras/vite-config`: workspace:\* - Build configuration
- `vite`: ^7.1.10 - Build tool
- `typescript`: ^5.7.2 - TypeScript compiler
