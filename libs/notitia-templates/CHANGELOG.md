# Changelog

## 0.2.4

### Patch Changes

- a29b507: Stop bundling runtime dependencies into published library output, and stop minifying.

  The vanilla/react/next library presets used to inline every transitive dep (e.g. `oauth4webapi` was bundled into `@eventuras/fides-auth`) and minify class/function names. Two consequences:
  - **`instanceof` failed across module boundaries.** A consumer importing `ResponseBodyError` from `openid-client` got a different class than the one a library threw, because the library carried its own bundled+renamed copy.
  - **Stack traces were unreadable** — minified names like `j` instead of `ResponseBodyError`.

  The presets now:
  - Auto-externalize every entry in the consumer's `dependencies`, `peerDependencies`, and `optionalDependencies` (plus `node:*` built-ins).
  - Set `build.minify: false` (libraries should not minify — consumers minify their own bundle).
  - Emit sourcemaps so consumer stack traces map back to original sources.

  No API changes — all affected packages are bumped `patch`. The only observable effect is leaner, more debuggable output: deps are required at install time (already the case via each lib's `dependencies`) instead of duplicated inside the bundle.

## 0.2.3

### Patch Changes

- 7c9fe79: chore: update dependencies

## 0.2.2

### Patch Changes

- b3d101f: Fix SonarCloud reliability issues: use locale-aware string sorting and replace unsafe `any` intersection type

## 0.2.1

### Patch Changes

- ### 🧱 Features

  **historia:**
  - Implement site roles RBAC system (ADR 0001) for fine-grained access control
  - Add Vipps Login authentication plugin for Payload CMS
  - Implement dynamic allowed domains for images
  - Add square1080 media sizes for better image handling
  - Enhance product handling with dynamic rendering and showImage prop
  - Implement order status email notifications
  - Add tax exemption handling and order received email template
  - Add customer phone handling in order notifications
  - Add 'data' column to transactions table
  - Implement database storage for carts during payment initiation
  - Enhance webhook processing with tenant determination and improved logging
  - Handle transactions without orders better
  - Update media and SEO for sites
  - Update collections pages layout
  - Update shipping option names for clarity
  - Add Sentry integration for error tracking and monitoring
  - Enhance image handling and build configuration

  **notitia-templates:**
  - Support for order status notifications
  - Enhanced email templates for customer communication

  ### 🐞 Bug Fixes

  **historia:**
  - Update architecture decision links and role descriptions in RBAC guide
  - Correct image size handling
  - Remove unused ProductDetailClient import
  - Update order confirmation hook to fetch populated product relationships
  - Enhance Vipps payment fetching and logging
  - Log warning when transaction exists but order is not created
  - Improve webhook URL handling
  - Allow null values for order_id in transactions table
  - Fetch user email directly for sales contacts in order confirmation
  - Standardize Sentry DSN configuration
  - Update Sentry configuration for proper error tracking
  - Increase Node.js heap size for large builds
  - Update Sentry auth token handling
  - Update Sentry configuration to use NEXT_PUBLIC_CMS_SENTRY_DSN

  ### ♻️ Refactoring

  **historia:**
  - Streamline access control for system admins
  - Remove admin and user from global roles
  - Enhance image handling and build configuration for Next.js
  - Enhance payment validation and logging in checkout process
  - Implement hooks for auto-populating order item fields
  - Enhance tenant determination logic in payment processing
  - Code review fixes and improvements

  ### 📝 Documentation

  **historia:**
  - Accept ADR 0001 - Site Roles and Access Control
  - Add role-based auth specification
  - Update editor rights documentation

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
