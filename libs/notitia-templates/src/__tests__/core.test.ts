import { describe, it, expect, beforeEach } from 'vitest';
import { NotitiaTemplates, createNotitiaTemplates } from '../NotitiaTemplates';
import type { Template } from '../types';

describe('NotitiaTemplates - Core Functionality', () => {
  let templates: NotitiaTemplates;

  beforeEach(() => {
    templates = createNotitiaTemplates();
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
