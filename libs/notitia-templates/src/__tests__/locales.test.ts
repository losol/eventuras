import { describe, it, expect, beforeEach } from 'vitest';
import { NotitiaTemplates, createNotitiaTemplates } from '../NotitiaTemplates';

describe('NotitiaTemplates - Multi-language Support', () => {
  describe('American English (en-US)', () => {
    let templates: NotitiaTemplates;

    beforeEach(() => {
      templates = createNotitiaTemplates('en-US');
    });

    it('should render welcome email in English', () => {
      const result = templates.render('email', 'welcome', {
        name: 'John Doe',
        organizationName: 'Eventuras',
      });

      expect(result.subject).toBe('Welcome to Eventuras');
      expect(result.content).toContain('Hello John Doe');
      expect(result.content).toContain('Welcome to Eventuras');
    });

    it('should render order confirmation in English', () => {
      const result = templates.render('email', 'order-confirmation', {
        name: 'Jane Smith',
        orderId: 'ORD-123',
        orderDate: '2025-06-10',
        organizationName: 'My Shop',
      });

      expect(result.subject).toContain('Order Confirmation');
      expect(result.content).toContain('Thank you for your order');
    });
  });

  describe('Norwegian Bokmål (nb-NO)', () => {
    let templates: NotitiaTemplates;

    beforeEach(() => {
      templates = createNotitiaTemplates('nb-NO');
    });

    it('should render welcome email in Bokmål', () => {
      const result = templates.render('email', 'welcome', {
        name: 'Ola Nordmann',
        organizationName: 'Eventuras',
      });

      expect(result.subject).toBe('Velkommen til Eventuras');
      expect(result.content).toContain('Hei Ola Nordmann');
      expect(result.content).toContain('Velkommen til Eventuras');
      expect(result.content).toContain('Beste hilsen');
    });

    it('should render order confirmation in Bokmål', () => {
      const result = templates.render('email', 'order-confirmation', {
        name: 'Kari Hansen',
        orderId: 'ORD-456',
        orderDate: '2025-06-15',
        organizationName: 'Min Butikk',
      });

      expect(result.subject).toContain('Ordrebekreftelse');
      expect(result.content).toContain('Takk for din bestilling');
      expect(result.content).toContain('Ordredetaljer');
    });

    it('should render SMS in Bokmål', () => {
      const result = templates.render('sms', 'welcome', {
        name: 'Ola',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Velkommen til Eventuras');
    });
  });

  describe('Norwegian Nynorsk (nn-NO)', () => {
    let templates: NotitiaTemplates;

    beforeEach(() => {
      templates = createNotitiaTemplates('nn-NO');
    });

    it('should render welcome email in Nynorsk', () => {
      const result = templates.render('email', 'welcome', {
        name: 'Ola Nordmann',
        organizationName: 'Eventuras',
      });

      expect(result.subject).toBe('Velkomen til Eventuras');
      expect(result.content).toContain('Hei Ola Nordmann');
      expect(result.content).toContain('Velkomen til Eventuras');
      expect(result.content).toContain('Beste helsing');
    });

    it('should render order confirmation in Nynorsk', () => {
      const result = templates.render('email', 'order-confirmation', {
        name: 'Kari Hansen',
        orderId: 'ORD-789',
        orderDate: '2025-06-20',
        organizationName: 'Min Butikk',
      });

      expect(result.subject).toContain('Ordrestadfesting');
      expect(result.content).toContain('Takk for bestillinga di');
      expect(result.content).toContain('Ordredetaljar');
    });

    it('should render SMS in Nynorsk', () => {
      const result = templates.render('sms', 'welcome', {
        name: 'Ola',
        organizationName: 'Eventuras',
      });

      expect(result.content).toContain('Velkomen til Eventuras');
    });
  });

  describe('Locale Override in Render Options', () => {
    let templates: NotitiaTemplates;

    beforeEach(() => {
      // Default to English
      templates = createNotitiaTemplates('en-US');
    });

    it('should render in Norwegian Bokmål when specified in options', () => {
      const result = templates.render(
        'email',
        'welcome',
        {
          name: 'Ola',
          organizationName: 'Eventuras',
        },
        { locale: 'nb-NO' }
      );

      expect(result.subject).toBe('Velkommen til Eventuras');
      expect(result.content).toContain('Hei Ola');
    });

    it('should render in Nynorsk when specified in options', () => {
      const result = templates.render(
        'email',
        'welcome',
        {
          name: 'Ola',
          organizationName: 'Eventuras',
        },
        { locale: 'nn-NO' }
      );

      expect(result.subject).toBe('Velkomen til Eventuras');
      expect(result.content).toContain('Velkomen til Eventuras');
    });

    it('should use default locale when not specified', () => {
      const result = templates.render('email', 'welcome', {
        name: 'John',
        organizationName: 'Eventuras',
      });

      expect(result.subject).toBe('Welcome to Eventuras');
      expect(result.content).toContain('Hello John');
    });
  });

  describe('All Template Types in All Languages', () => {
    const templateTypes = [
      'welcome',
      'registration-confirmation',
      'event-reminder',
      'payment-confirmation',
      'password-reset',
      'order-confirmation',
      'order-shipped',
    ] as const;

    const locales = ['en-US', 'nb-NO', 'nn-NO'] as const;

    locales.forEach((locale) => {
      describe(`Locale: ${locale}`, () => {
        let templates: NotitiaTemplates;

        beforeEach(() => {
          templates = createNotitiaTemplates(locale);
        });

        templateTypes.forEach((templateType) => {
          it(`should have email template for ${templateType}`, () => {
            expect(templates.hasTemplate('email', templateType)).toBe(true);
          });

          it(`should have SMS template for ${templateType}`, () => {
            expect(templates.hasTemplate('sms', templateType)).toBe(true);
          });
        });
      });
    });
  });
});
