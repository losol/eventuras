# @eventuras/app-config

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
