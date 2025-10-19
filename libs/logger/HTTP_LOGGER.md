# HTTP Logging

Header redaction utility for safe HTTP logging.

## Features

- 🔒 **Automatic header redaction** - Sensitive headers are automatically redacted
- 🎚️ **Use with any log level** - Works with `logger.debug()`, `logger.info()`, `logger.error()`
- 📊 **Simple utility function** - Just wrap your headers before logging

## Usage

### Basic Setup

```typescript
import { Logger, redactHeaders } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'my-api-client' });
```

### Log Requests/Responses

```typescript
// Log outgoing request (debug level)
logger.debug({
  request: {
    url: '/api/users',
    method: 'GET',
    headers: redactHeaders(headers),
  },
}, 'HTTP request');

// Log successful response (debug level)
logger.debug({
  response: {
    url: '/api/users',
    status: 200,
    statusText: 'OK',
  },
}, 'HTTP response');

// Log errors (error level)
logger.error({
  error: { message: err.message, code: err.code },
  request: {
    url: '/api/users',
    method: 'GET',
    headers: redactHeaders(headers),
  },
}, 'Connection refused');
```

### Log Level Control

Use the standard `LOG_LEVEL` environment variable:

```bash
# See all HTTP traffic (debug logs)
LOG_LEVEL=debug

# See only errors and warnings
LOG_LEVEL=info
```

## Header Redaction

The following headers are automatically redacted:

- `authorization`
- `cookie`
- `set-cookie`
- `x-api-key`
- `x-auth-token`
- `proxy-authorization`

Redacted values are replaced with `[REDACTED]` in logs.

## Error Categorization

Errors are automatically categorized and logged at appropriate levels:

### Connection Errors (ERROR)
```json
{
  "error": {
    "message": "fetch failed",
    "code": "ECONNREFUSED"
  },
  "request": {
    "url": "https://api.example.com/users",
    "method": "GET",
    "headers": { "authorization": "[REDACTED]" }
  },
  "msg": "Connection refused - Backend unreachable"
}
```

### HTTP Errors (WARN for 4xx, ERROR for 5xx)
```json
{
  "request": {
    "url": "https://api.example.com/users/123",
    "method": "GET"
  },
  "response": {
    "status": 404,
    "statusText": "Not Found"
  },
  "msg": "HTTP 404 Not Found"
}
```

## Complete Example

```typescript
import { client } from '@your/sdk';
import { Logger, HttpLogger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'my-app:api-client',
});

const httpLogger = new HttpLogger({
  logger,
  logRequests: process.env.HTTP_LOG_REQUESTS === 'true',
  logResponses: process.env.HTTP_LOG_RESPONSES === 'true',
});

const baseUrl = 'https://api.example.com';

// Request interceptor
client.interceptors.request.use(async (options) => {
  const fullUrl = options.url?.startsWith('http') 
    ? options.url 
    : `${baseUrl}${options.url || ''}`;
  
  httpLogger.logRequest(fullUrl, options.method, options.headers);
});

// Response interceptor
client.interceptors.response.use(async (response) => {
  httpLogger.logResponse(response.url, response.status, response.statusText);
  return response;
});

// Error interceptor
client.interceptors.error.use(async (error, response, options) => {
  const fullUrl = options.url?.startsWith('http')
    ? options.url
    : `${baseUrl}${options.url || ''}`;
  
  httpLogger.logError(error, response, fullUrl, options.method, options.headers);
  return error;
});
```

## API Reference

### `HttpLogger`

#### Constructor

```typescript
new HttpLogger(options: HttpLoggerOptions)
```

**Options:**
- `logger: Logger` - Logger instance to use (required)
- `logRequests?: boolean` - Enable request logging (default: from `HTTP_LOG_REQUESTS` env var)
- `logResponses?: boolean` - Enable response logging (default: from `HTTP_LOG_RESPONSES` env var)
- `logErrors?: boolean` - Enable error logging (default: `true`)

#### Methods

##### `logRequest(url, method?, headers?)`

Log an outgoing HTTP request.

##### `logResponse(url, status, statusText?)`

Log a successful HTTP response.

##### `logError(error, response, url, method?, headers?)`

Log an HTTP error with full context.

### `redactHeaders(headers)`

Utility function to redact sensitive headers from any header object.

```typescript
import { redactHeaders } from '@eventuras/logger';

const headers = new Headers({
  'authorization': 'Bearer token123',
  'content-type': 'application/json',
});

const redacted = redactHeaders(headers);
// { authorization: '[REDACTED]', 'content-type': 'application/json' }
```
