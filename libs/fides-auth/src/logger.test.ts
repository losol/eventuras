/**
 * Tests for the pluggable logger — typical production usage:
 *
 * 1. Default console logger works out of the box
 * 2. Plugging in a custom logger (pino-like, winston-like)
 * 3. Logger receives namespace and context
 */
import {
  configureLogger,
  createLogger,
  type FidesLogger,
  type FidesLoggerFactory,
  type FidesLoggerOptions,
} from './logger';

// ────────────────────────────────────────────
// Default console logger
// ────────────────────────────────────────────

describe('default console logger (structured JSON)', () => {
  it('creates a logger without any configuration', () => {
    const logger = createLogger({ namespace: 'test' });
    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('logs a string message as a JSON line to console.info', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => { });
    const logger = createLogger({ namespace: 'my-app' });

    logger.info('hello world');

    expect(spy).toHaveBeenCalledOnce();
    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry).toMatchObject({
      level: 'info',
      namespace: 'my-app',
      msg: 'hello world',
    });
    expect(typeof entry.time).toBe('string');
    spy.mockRestore();
  });

  it('merges context object with the message in a single JSON entry', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const logger = createLogger({ namespace: 'auth' });

    logger.warn({ userId: 42 }, 'Rate limited');

    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry).toMatchObject({
      level: 'warn',
      namespace: 'auth',
      msg: 'Rate limited',
      userId: 42,
    });
    spy.mockRestore();
  });

  it('includes persistent context fields in every entry', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => { });
    const logger = createLogger({
      namespace: 'auth:session',
      context: { module: 'validator' },
    });

    logger.debug('checking session');

    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry).toMatchObject({
      level: 'debug',
      namespace: 'auth:session',
      module: 'validator',
      msg: 'checking session',
    });
    spy.mockRestore();
  });

  it('serializes Error instances on the error field', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const logger = createLogger({ namespace: 'auth' });

    logger.error({ error: new Error('boom') }, 'request failed');

    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry.error).toMatchObject({ name: 'Error', message: 'boom' });
    expect(typeof entry.error.stack).toBe('string');
    spy.mockRestore();
  });

  it('protects reserved keys (level, time, namespace) from caller overrides', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => { });
    const logger = createLogger({
      namespace: 'auth',
      context: { time: 'context-clobber-attempt', user: 'alice' },
    });

    logger.info(
      { level: 'fatal', namespace: 'fake', requestId: 'r1' },
      'still original',
    );

    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry.level).toBe('info');
    expect(entry.namespace).toBe('auth');
    expect(typeof entry.time).toBe('string');
    expect(entry.time).not.toBe('context-clobber-attempt');
    // Caller fields that don't collide are preserved.
    expect(entry.user).toBe('alice');
    expect(entry.requestId).toBe('r1');
    expect(entry.msg).toBe('still original');
    spy.mockRestore();
  });

  it('skips empty calls without emitting a log line', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => { });
    const logger = createLogger({ namespace: 'auth' });

    logger.info();

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('survives circular and BigInt values without throwing', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => { });
    const logger = createLogger({ namespace: 'auth' });

    const circular: Record<string, unknown> = { name: 'self' };
    circular.self = circular;

    expect(() => logger.info({ circular, count: 9007199254740993n }, 'edge cases')).not.toThrow();

    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry.msg).toBe('edge cases');
    expect(entry.circular).toMatchObject({ name: 'self', self: '[Circular]' });
    expect(entry.count).toBe('9007199254740993');
    spy.mockRestore();
  });

  it('each log level delegates to the matching console method', () => {
    const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => { });
    const spyInfo = vi.spyOn(console, 'info').mockImplementation(() => { });
    const spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const spyError = vi.spyOn(console, 'error').mockImplementation(() => { });

    const logger = createLogger({ namespace: 'test' });

    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');

    expect(spyDebug).toHaveBeenCalled();
    expect(spyInfo).toHaveBeenCalled();
    expect(spyWarn).toHaveBeenCalled();
    expect(spyError).toHaveBeenCalled();

    spyDebug.mockRestore();
    spyInfo.mockRestore();
    spyWarn.mockRestore();
    spyError.mockRestore();
  });
});

// ────────────────────────────────────────────
// Custom logger (pluggable)
// ────────────────────────────────────────────

describe('configureLogger — custom logger integration', () => {
  // Reset to default after each test to avoid contaminating other tests
  afterEach(() => {
    configureLogger({
      create({ namespace, context }) {
        // Restore the default console logger
        return createDefaultConsoleLogger(namespace, context);
      },
    });
  });

  it('replaces the default logger with a custom implementation', () => {
    const messages: Array<{ level: string; msg?: string; data?: unknown; }> = [];

    const customFactory: FidesLoggerFactory = {
      create(_options: FidesLoggerOptions): FidesLogger {
        return {
          debug: (data, msg) => messages.push({ level: 'debug', msg, data }),
          info: (data, msg) => messages.push({ level: 'info', msg, data }),
          warn: (data, msg) => messages.push({ level: 'warn', msg, data }),
          error: (data, msg) => messages.push({ level: 'error', msg, data }),
        };
      },
    };

    configureLogger(customFactory);

    const logger = createLogger({ namespace: 'test' });
    logger.info({ userId: 1 }, 'Logged in');

    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual({
      level: 'info',
      msg: 'Logged in',
      data: { userId: 1 },
    });
  });

  it('passes namespace and context to the factory', () => {
    let receivedOptions: FidesLoggerOptions | undefined;

    configureLogger({
      create(options) {
        receivedOptions = options;
        return {
          debug: () => { },
          info: () => { },
          warn: () => { },
          error: () => { },
        };
      },
    });

    const logger = createLogger({ namespace: 'auth:vipps', context: { provider: 'vipps' } });
    // Trigger lazy initialization
    logger.debug('init');

    expect(receivedOptions).toEqual({
      namespace: 'auth:vipps',
      context: { provider: 'vipps' },
    });
  });

  it('simulates a pino-like logger adapter', () => {
    const logs: string[] = [];

    // A pino-like logger that just collects formatted strings
    configureLogger({
      create({ namespace }) {
        const log = (level: string) => (data?: any, msg?: string) => {
          const formatted = typeof data === 'string'
            ? `${level} [${namespace}] ${data}`
            : `${level} [${namespace}] ${msg} ${JSON.stringify(data)}`;
          logs.push(formatted);
        };
        return { debug: log('DEBUG'), info: log('INFO'), warn: log('WARN'), error: log('ERROR') };
      },
    });

    const logger = createLogger({ namespace: 'fides-auth:oauth' });
    logger.info({ issuer: 'https://id.example.com' }, 'Starting token refresh');
    logger.error('Something went wrong');

    expect(logs).toHaveLength(2);
    expect(logs[0]).toContain('INFO');
    expect(logs[0]).toContain('fides-auth:oauth');
    expect(logs[0]).toContain('Starting token refresh');
    expect(logs[1]).toContain('ERROR');
    expect(logs[1]).toContain('Something went wrong');
  });
});

// ────────────────────────────────────────────
// Lazy proxy — configureLogger after createLogger
// ────────────────────────────────────────────

describe('lazy proxy — configureLogger after createLogger', () => {
  afterEach(() => {
    configureLogger({
      create({ namespace, context }) {
        return createDefaultConsoleLogger(namespace, context);
      },
    });
  });

  it('picks up a factory configured AFTER the logger was created', () => {
    // Simulate module-scope: logger created before configureLogger
    const logger = createLogger({ namespace: 'early-module' });

    const messages: Array<{ level: string; data?: unknown; msg?: string }> = [];
    configureLogger({
      create() {
        return {
          debug: (data, msg) => messages.push({ level: 'debug', data, msg }),
          info: (data, msg) => messages.push({ level: 'info', data, msg }),
          warn: (data, msg) => messages.push({ level: 'warn', data, msg }),
          error: (data, msg) => messages.push({ level: 'error', data, msg }),
        };
      },
    });

    logger.info({ action: 'test' }, 'should use custom factory');

    expect(messages).toHaveLength(1);
    expect(messages[0]!.msg).toBe('should use custom factory');
  });

  it('switches factory mid-session when configureLogger is called again', () => {
    const logger = createLogger({ namespace: 'switch-test' });

    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('uses default console');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

    const custom: Array<{ data?: unknown; msg?: string }> = [];
    configureLogger({
      create() {
        return {
          debug: () => {},
          info: (data, msg) => custom.push({ data, msg }),
          warn: () => {},
          error: () => {},
        };
      },
    });

    logger.info({ step: 2 }, 'now uses custom');
    expect(custom).toHaveLength(1);
    expect(custom[0]!.msg).toBe('now uses custom');
  });
});

/**
 * Helper: replicate the default JSONL ConsoleLogger so the suites that
 * `configureLogger()` mid-test can reset back to the default behavior in
 * afterEach without importing the private ConsoleLogger class.
 */
function createDefaultConsoleLogger(
  namespace: string,
  context?: Record<string, unknown>,
): FidesLogger {
  const log = (method: 'debug' | 'info' | 'warn' | 'error') =>
    (data?: Record<string, unknown> | string, msg?: string) => {
      const entry: Record<string, unknown> = {
        level: method,
        time: new Date().toISOString(),
        namespace,
        ...context,
      };
      if (typeof data === 'string') {
        entry.msg = data;
      } else {
        if (msg !== undefined) entry.msg = msg;
        if (data) Object.assign(entry, data);
      }
      console[method](JSON.stringify(entry));
    };

  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
  };
}
