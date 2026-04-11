import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from './Logger.js';
import { ConsoleTransport } from './transports/console.js';
import { PinoTransport } from './transports/pino.js';
import type { LogTransport } from './types.js';

/**
 * Creates a mock LogTransport that records all calls for assertions.
 */
function createMockTransport(): LogTransport & { calls: Array<{ level: string; data: Record<string, unknown>; msg?: string; }>; } {
  const calls: Array<{ level: string; data: Record<string, unknown>; msg?: string; }> = [];
  const transport: LogTransport & { calls: typeof calls; } = {
    calls,
    log(level, data, msg) {
      calls.push({ level, data, msg });
    },
    child(bindings) {
      const childCalls = calls;
      return {
        log(level, data, msg) {
          childCalls.push({ level, data: { ...bindings, ...data }, msg });
        },
        child(innerBindings) {
          return transport.child({ ...bindings, ...innerBindings });
        },
      };
    },
  };
  return transport;
}

describe('Logger', () => {
  let mockTransport: ReturnType<typeof createMockTransport>;

  beforeEach(() => {
    mockTransport = createMockTransport();
    Logger.configure({ transport: mockTransport });
  });

  afterEach(() => {
    // Reset to default PinoTransport
    Logger.configure({ transport: new PinoTransport() });
  });

  describe('static methods', () => {
    it('Logger.info() logs at info level', () => {
      Logger.info({ namespace: 'test' }, 'hello');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('info');
      expect(mockTransport.calls[0]!.data).toMatchObject({ namespace: 'test' });
    });

    it('Logger.debug() logs at debug level', () => {
      Logger.debug({ namespace: 'test' }, 'debug msg');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('debug');
    });

    it('Logger.warn() logs at warn level', () => {
      Logger.warn({}, 'warning');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('warn');
    });

    it('Logger.error() logs at error level with error info', () => {
      const err = new Error('test error');
      Logger.error({ error: err, namespace: 'test' }, 'failed');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('error');
      expect(mockTransport.calls[0]!.data).toHaveProperty('error');
      expect(mockTransport.calls[0]!.data).toHaveProperty('namespace', 'test');
    });

    it('Logger.fatal() logs at fatal level', () => {
      Logger.fatal({ error: new Error('fatal') }, 'crash');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('fatal');
    });

    it('Logger.trace() logs at trace level', () => {
      Logger.trace({ namespace: 'verbose' }, 'trace msg');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('trace');
    });

    it('includes correlationId in log data', () => {
      Logger.info({ correlationId: 'abc-123' }, 'correlated');

      expect(mockTransport.calls[0]!.data).toHaveProperty('correlationId', 'abc-123');
    });

    it('includes context fields in log data', () => {
      Logger.info({ context: { userId: 42, role: 'admin' } }, 'ctx');

      expect(mockTransport.calls[0]!.data).toMatchObject({ userId: 42, role: 'admin' });
    });

    it('skips developerOnly logs when not in development', () => {
      // NODE_ENV is not 'development' in test
      Logger.info({ developerOnly: true }, 'should not appear');

      expect(mockTransport.calls).toHaveLength(0);
    });
  });

  describe('Logger.create() instance methods', () => {
    it('creates a scoped logger with namespace', () => {
      const logger = Logger.create({ namespace: 'MyModule' });
      logger.info('hello from module');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.data).toHaveProperty('namespace', 'MyModule');
    });

    it('creates a scoped logger with context', () => {
      const logger = Logger.create({
        namespace: 'API',
        context: { service: 'users' },
      });
      logger.info({ requestId: '123' }, 'request processed');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.data).toMatchObject({
        namespace: 'API',
        service: 'users',
        requestId: '123',
      });
    });

    it('instance info logs with string only', () => {
      const logger = Logger.create({ namespace: 'test' });
      logger.info('just a message');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('info');
    });

    it('instance debug/warn/trace work', () => {
      const logger = Logger.create({ namespace: 'test' });
      logger.debug('d');
      logger.warn('w');
      logger.trace('t');

      expect(mockTransport.calls).toHaveLength(3);
      expect(mockTransport.calls.map(c => c.level)).toEqual(['debug', 'warn', 'trace']);
    });

    it('instance error with Error object', () => {
      const logger = Logger.create({ namespace: 'test' });
      const err = new Error('boom');
      logger.error(err, 'Something broke');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('error');
      expect(mockTransport.calls[0]!.data).toHaveProperty('error', err);
    });

    it('instance error with string only', () => {
      const logger = Logger.create({ namespace: 'test' });
      logger.error('simple error');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('error');
    });

    it('instance error with data object and message', () => {
      const logger = Logger.create({ namespace: 'test' });
      logger.error({ code: 'NOT_FOUND' }, 'Resource missing');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.data).toMatchObject({
        namespace: 'test',
        code: 'NOT_FOUND',
      });
    });

    it('instance fatal works like error', () => {
      const logger = Logger.create({ namespace: 'test' });
      logger.fatal(new Error('critical'), 'System down');

      expect(mockTransport.calls).toHaveLength(1);
      expect(mockTransport.calls[0]!.level).toBe('fatal');
    });

    it('logger without options uses root transport', () => {
      const logger = Logger.create();
      logger.info('no options');

      expect(mockTransport.calls).toHaveLength(1);
    });
  });

  describe('configure()', () => {
    it('switches to ConsoleTransport', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
      Logger.configure({ transport: new ConsoleTransport() });

      Logger.info({ namespace: 'test' }, 'console log');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('getTransport() returns the active transport', () => {
      const transport = Logger.getTransport();
      expect(transport).toBe(mockTransport);
    });

    it('getPinoInstance() throws when not using PinoTransport', () => {
      expect(() => Logger.getPinoInstance()).toThrow('getPinoInstance() requires PinoTransport');
    });

    it('getPinoInstance() works with PinoTransport', () => {
      Logger.configure({ transport: new PinoTransport() });
      expect(() => Logger.getPinoInstance()).not.toThrow();
      expect(Logger.getPinoInstance()).toBeDefined();
    });
  });
});
