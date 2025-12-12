import { describe, it, expect, beforeEach } from 'vitest';
import { NotitiaTemplates, createNotitiaTemplates } from '../NotitiaTemplates';

describe('NotitiaTemplates - Helpers', () => {
  let templates: NotitiaTemplates;

  beforeEach(() => {
    templates = createNotitiaTemplates();
  });

  describe('Built-in Helpers', () => {
    it('should use built-in formatDate helper', () => {
      templates.registerTemplate('email', 'custom', {
        content: 'Date: {{formatDate date}}',
      });

      const result = templates.render('email', 'custom', {
        date: '2025-06-15T10:30:00Z',
      });

      expect(result.content).toContain('Date:');
      // Result will vary by locale, just check it doesn't error
    });

    it('should use built-in upper helper', () => {
      templates.registerTemplate('email', 'custom', {
        content: '{{upper text}}',
      });

      const result = templates.render('email', 'custom', {
        text: 'hello world',
      });

      expect(result.content).toBe('HELLO WORLD');
    });

    it('should use built-in lower helper', () => {
      templates.registerTemplate('email', 'custom', {
        content: '{{lower text}}',
      });

      const result = templates.render('email', 'custom', {
        text: 'HELLO WORLD',
      });

      expect(result.content).toBe('hello world');
    });

    it('should use built-in eq helper', () => {
      templates.registerTemplate('email', 'custom', {
        content: '{{#if (eq status "active")}}User is active{{else}}User is not active{{/if}}',
      });

      const activeResult = templates.render('email', 'custom', {
        status: 'active',
      });
      expect(activeResult.content).toBe('User is active');

      const inactiveResult = templates.render('email', 'custom', {
        status: 'inactive',
      });
      expect(inactiveResult.content).toBe('User is not active');
    });
  });

  describe('Custom Helpers', () => {
    it('should register and use custom helper', () => {
      templates.registerHelper('multiply', function (a: number, b: number) {
        return a * b;
      });

      templates.registerTemplate('email', 'custom', {
        content: 'Result: {{multiply num1 num2}}',
      });

      const result = templates.render('email', 'custom', {
        num1: 5,
        num2: 3,
      });

      expect(result.content).toBe('Result: 15');
    });

    it('should use custom helpers from render options', () => {
      templates.registerTemplate('email', 'custom', {
        content: 'Reversed: {{reverse text}}',
      });

      const result = templates.render(
        'email',
        'custom',
        {
          text: 'hello',
        },
        {
          helpers: {
            reverse: function (str: string) {
              return str.split('').reverse().join('');
            },
          },
        }
      );

      expect(result.content).toBe('Reversed: olleh');
    });
  });
});
