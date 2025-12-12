import { describe, it, expect, beforeEach } from 'vitest';
import { NotitiaTemplates, createNotitiaTemplates } from '../NotitiaTemplates';

describe('NotitiaTemplates - Template Rendering', () => {
  let templates: NotitiaTemplates;

  beforeEach(() => {
    templates = createNotitiaTemplates();
  });

  describe('Default Email Templates', () => {
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

  describe('Default SMS Templates', () => {
    it('should render welcome SMS template', () => {
      const result = templates.render('sms', 'welcome', {
        name: 'John Doe',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Welcome to Eventuras');
      expect(result.content).toContain('John Doe');
    });
  });

  describe('Conditional Rendering', () => {
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

  describe('Custom Template String Rendering', () => {
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
});
