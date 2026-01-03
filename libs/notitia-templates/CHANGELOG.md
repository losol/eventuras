# Changelog

## 0.2.0

### Minor Changes

- feat: adds shipping confirmation

## 0.1.1

### Patch Changes

- chore: update dependencies across frontend packages

All notable changes to `@eventuras/notitia-templates` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Features

- Multi-language support with built-in templates in three languages:
  - American English (en-US)
  - Norwegian Bokmål (nb-NO)
  - Norwegian Nynorsk (nn-NO)
- Set default locale when creating NotitiaTemplates instance
- Override locale per render with `locale` option in RenderOptions
- All built-in templates available in all three languages
- New `Locale` type for type-safe language selection
- Updated templates organized in `locales/` directory structure

## [0.1.0] - 2025-12-11

### Features

- Initial release of Notitia Templates library
- Handlebars-based template rendering for email and SMS
- Built-in templates for common notification scenarios:
  - Welcome messages
  - Event registration confirmations
  - Event reminders
  - Payment confirmations
  - Password reset notifications
  - Order confirmations and shipment notifications
- Support for custom templates and template overrides
- Built-in Handlebars helpers (formatDate, upper, lower, eq)
- Custom helper registration (global and per-render)
- Direct template string rendering without registration
- Template management API (register, unregister, list, check existence)
- Full TypeScript support with comprehensive type definitions
- Comprehensive test coverage
- Detailed documentation and usage examples
