import { describe, it, expect, beforeEach } from 'vitest';
import { NotitiaTemplates, createNotitiaTemplates } from './NotitiaTemplates';
import type { Template } from './types';

describe('NotitiaTemplates', () => {
  let templates: NotitiaTemplates;

  beforeEach(() => {
    templates = createNotitiaTemplates();
  });

  describe('Default Templates', () => {
    it('should render welcome email template', () => {
      const result = templates.render('email', 'welcome', {
        name: 'John Doe',
        organizationName: 'Eventuras',
        loginUrl: 'https://example.com/login',
      });

      expect(result.content).toContain('Hello John Doe');
      expect(result.content).toContain('Welcome to Eventuras');
      expect(result.content).toContain('https://example.com/login');
      expect(result.subject).toBe('Welcome to Eventuras');
    });

    it('should render welcome SMS template', () => {
      const result = templates.render('sms', 'welcome', {
        name: 'John Doe',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Welcome to Eventuras');
      expect(result.content).toContain('John Doe');
    });

    it('should render registration confirmation email', () => {
      const result = templates.render('email', 'registration-confirmation', {
        name: 'Jane Smith',
        eventTitle: 'Tech Conference 2025',
        eventDate: '2025-06-15',
        eventLocation: 'Oslo',
        registrationId: 'REG-12345',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Jane Smith');
      expect(result.content).toContain('Tech Conference 2025');
      expect(result.content).toContain('REG-12345');
      expect(result.subject).toContain('Tech Conference 2025');
    });

    it('should render event reminder', () => {
      const result = templates.render('email', 'event-reminder', {
        name: 'Alice',
        eventTitle: 'Workshop',
        eventDate: '2025-07-01',
        eventLocation: 'Bergen',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Alice');
      expect(result.content).toContain('Workshop');
      expect(result.content).toContain('Bergen');
      expect(result.subject).toContain('Reminder');
    });

    it('should render payment confirmation', () => {
      const result = templates.render('email', 'payment-confirmation', {
        name: 'Bob',
        orderId: 'ORD-999',
        amount: '299.00',
        currency: 'NOK',
        paymentMethod: 'Vipps',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Bob');
      expect(result.content).toContain('ORD-999');
      expect(result.content).toContain('299.00 NOK');
      expect(result.content).toContain('Vipps');
      expect(result.subject).toContain('ORD-999');
    });

    it('should render password reset email', () => {
      const result = templates.render('email', 'password-reset', {
        name: 'Charlie',
        resetUrl: 'https://example.com/reset?token=abc123',
        expirationHours: '24',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Charlie');
      expect(result.content).toContain('https://example.com/reset?token=abc123');
      expect(result.content).toContain('24 hours');
      expect(result.subject).toContain('Password Reset');
    });

    it('should render order confirmation', () => {
      const result = templates.render('email', 'order-confirmation', {
        name: 'Diana',
        orderId: 'ORD-123',
        orderDate: '2025-06-10',
        totalAmount: '1499.00',
        currency: 'NOK',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Diana');
      expect(result.content).toContain('ORD-123');
      expect(result.content).toContain('1499.00');
      expect(result.subject).toContain('Order Confirmation');
    });

    it('should render order shipped notification', () => {
      const result = templates.render('email', 'order-shipped', {
        name: 'Eve',
        orderId: 'ORD-456',
        trackingNumber: 'TRACK-789',
        estimatedDelivery: '2025-06-20',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Eve');
      expect(result.content).toContain('ORD-456');
      expect(result.content).toContain('TRACK-789');
      expect(result.subject).toContain('Shipped');
    });
  });

  describe('Custom Templates', () => {
    it('should register and use custom template', () => {
      const customTemplate: Template = {
        subject: 'Custom Subject for {{name}}',
        content: 'Hello {{name}}, this is a custom template!',
      };

      templates.registerTemplate('email', 'custom', customTemplate);

      const result = templates.render('email', 'custom', {
        name: 'Test User',
      });

      expect(result.content).toBe('Hello Test User, this is a custom template!');
      expect(result.subject).toBe('Custom Subject for Test User');
    });

    it('should override default template with custom one', () => {
      const customWelcome: Template = {
        subject: 'Custom Welcome',
        content: 'Custom welcome message for {{name}}',
      };

      templates.registerTemplate('email', 'welcome', customWelcome);

      const result = templates.render('email', 'welcome', {
        name: 'Override Test',
      });

      expect(result.content).toBe('Custom welcome message for Override Test');
      expect(result.subject).toBe('Custom Welcome');
    });

    it('should register multiple templates at once', () => {
      templates.registerTemplates({
        'email:test1': {
          content: 'Test 1 for {{name}}',
        },
        'email:test2': {
          content: 'Test 2 for {{name}}',
        },
      });

      expect(templates.hasTemplate('email', 'test1' as any)).toBe(true);
      expect(templates.hasTemplate('email', 'test2' as any)).toBe(true);
    });

    it('should unregister custom template and fall back to default', () => {
      const customTemplate: Template = {
        content: 'Custom template',
      };

      templates.registerTemplate('email', 'welcome', customTemplate);
      const customResult = templates.render('email', 'welcome', {
        name: 'Test',
        organizationName: 'Test Org',
      });
      expect(customResult.content).toBe('Custom template');

      templates.unregisterTemplate('email', 'welcome');
      const defaultResult = templates.render('email', 'welcome', {
        name: 'Test',
        organizationName: 'Test Org',
      });
      expect(defaultResult.content).toContain('Hello Test');
    });

    it('should clear all custom templates', () => {
      templates.registerTemplate('email', 'custom', {
        content: 'Custom',
      });
      templates.registerTemplate('sms', 'custom', {
        content: 'SMS Custom',
      });

      templates.clearCustomTemplates();

      expect(templates.hasTemplate('email', 'custom')).toBe(false);
      expect(templates.hasTemplate('sms', 'custom')).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    it('should handle conditional blocks', () => {
      templates.registerTemplate('email', 'custom', {
        content: 'Hello {{name}}{{#if age}}, you are {{age}} years old{{/if}}',
      });

      const withAge = templates.render('email', 'custom', {
        name: 'John',
        age: 30,
      });
      expect(withAge.content).toBe('Hello John, you are 30 years old');

      const withoutAge = templates.render('email', 'custom', {
        name: 'Jane',
      });
      expect(withoutAge.content).toBe('Hello Jane');
    });

    it('should throw error for non-existent template', () => {
      expect(() => {
        templates.render('email', 'non-existent' as any, {});
      }).toThrow('Template not found');
    });

    it('should handle missing subject gracefully', () => {
      templates.registerTemplate('sms', 'custom', {
        content: 'SMS without subject',
      });

      const result = templates.render('sms', 'custom', {});

      expect(result.content).toBe('SMS without subject');
      expect(result.subject).toBeUndefined();
    });

    it('should trim whitespace from rendered content', () => {
      templates.registerTemplate('email', 'custom', {
        content: '\n\n  Hello {{name}}  \n\n',
      });

      const result = templates.render('email', 'custom', {
        name: 'Test',
      });

      expect(result.content).toBe('Hello Test');
    });
  });

  describe('Custom Helpers', () => {
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

  describe('Custom Template Rendering', () => {
    it('should render custom template string directly', () => {
      const result = templates.renderCustom('Hello {{name}}, welcome!', {
        name: 'Direct',
      });

      expect(result).toBe('Hello Direct, welcome!');
    });

    it('should render custom template with helpers', () => {
      const result = templates.renderCustom(
        'Value: {{double num}}',
        {
          num: 21,
        },
        {
          helpers: {
            double: function (n: number) {
              return n * 2;
            },
          },
        }
      );

      expect(result).toBe('Value: 42');
    });
  });

  describe('Template Management', () => {
    it('should check if template exists', () => {
      expect(templates.hasTemplate('email', 'welcome')).toBe(true);
      expect(templates.hasTemplate('email', 'non-existent' as any)).toBe(false);
    });

    it('should get available templates', () => {
      const available = templates.getAvailableTemplates();

      expect(available).toContain('email:welcome');
      expect(available).toContain('sms:welcome');
      expect(available).toContain('email:registration-confirmation');
      expect(available.length).toBeGreaterThan(0);
    });

    it('should get template info', () => {
      const info = templates.getTemplateInfo('email', 'welcome');

      expect(info).toBeDefined();
      expect(info?.content).toBeDefined();
      expect(info?.subject).toBeDefined();
      expect(info?.description).toBe('Welcome email for new users');
    });
  });
});
