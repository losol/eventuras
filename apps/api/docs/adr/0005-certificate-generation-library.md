# ADR-0005: Move certificate generation to a dedicated library

## Status

Draft

## Context

Certificate generation is currently split across several places:

- `Eventuras.Services` contains certificate-specific rendering code (`CertificateRenderer`, `CertificateViewModel`, Razor templates)
- `Eventuras.Services` also contains generic Razor view rendering infrastructure used by certificates and email templates
- `Eventuras.Libs.Pdf` provides a generic PDF abstraction (`IPdfRenderService`) and basic implementations
- `Eventuras.Services.Converto` wires `IPdfRenderService` to the external Converto service
- `apps/convertoapi` is a separate runtime dependency for HTML-to-PDF generation

This creates a few problems:

1. Certificate generation is mixed into the general service layer instead of living in its own library boundary.
2. `Eventuras.Services` remains coupled to ASP.NET MVC/Razor concerns because certificate rendering lives there.
3. The PDF abstraction is generic, but the certificate-specific rendering pipeline is not isolated from infrastructure concerns.
4. The default runtime path depends on Converto even though Converto is an implementation detail, not a certificate domain concern.
5. The current structure makes it harder to replace Converto with an in-process PDF implementation.

We want certificate generation to be its own library, use `Eventuras.Libs.Pdf` for PDF rendering, keep certificate-specific code out of `Eventuras.Libs.Pdf`, and no longer require Converto to be the default path.

## Decision

Introduce a dedicated certificate generation library, tentatively named `Eventuras.Certificates`.

This library will own all certificate-specific rendering concerns:

- certificate document models/view models
- certificate HTML/template rendering
- certificate-specific renderer interfaces and implementations
- certificate templates and related assets

`Eventuras.Certificates` will depend on `Eventuras.Libs.Pdf` for PDF generation through its generic abstractions.

`Eventuras.Libs.Pdf` remains generic and may be extended with reusable PDF-related capabilities such as:

- additional rendering engines
- HTML-to-PDF adapters
- a generic HTML-to-PDF framework layer
- shared print theme primitives for common HTML elements such as `h1`, `h2`, paragraphs, tables, lists, and page layout
- PDF options, metadata, and common rendering helpers
- testing utilities for PDF output

`Eventuras.Libs.Pdf` must not contain certificate-specific code such as:

- certificate templates
- certificate view models
- certificate naming conventions
- certificate delivery workflows
- certificate business rules

Converto will no longer be the default rendering path for certificate generation.

- The new certificate library must depend only on the generic PDF abstraction, not directly on Converto.
- `Eventuras.Services.Converto` may remain in the solution as an optional adapter library during transition.
- `apps/convertoapi` may remain temporarily, but certificate generation should not require it by default.
- Once an in-process PDF path is production-ready, we should retire Converto usage entirely.

## Target architecture

### Dedicated certificate library

The new library should contain the current certificate rendering stack now living in `Eventuras.Services`, including equivalents of:

- `Certificates/ICertificateRenderer.cs`
- `Certificates/CertificateRenderer.cs`
- `Certificates/CertificateViewModel.cs`
- certificate Razor/templates currently under `Views/Shared/Templates/Certificates/`

The library may contain internal ASP.NET/Razor infrastructure if Razor templates remain the rendering mechanism.

### Service layer responsibilities

`Eventuras.Services` should keep orchestration and business workflow responsibilities, such as:

- issuing certificates
- retrieving certificate data
- delivery/email orchestration
- background job coordination

`Eventuras.Services` should consume a certificate generation interface from the new library rather than owning the rendering implementation itself.

### PDF responsibilities

`Eventuras.Libs.Pdf` remains the reusable PDF engine layer.

It may also provide a generic document styling layer for HTML-to-PDF scenarios, for example:

- a default print stylesheet
- typography presets for standard HTML elements
- reusable page layout primitives
- header/footer/page-number helpers
- asset resolution and shared rendering conventions

If certificate generation needs features not currently available in `Eventuras.Libs.Pdf`, those features should be added there only when they are generic. Examples:

- a production-grade HTML-to-PDF renderer
- a shared print theme for generic document rendering
- better paper size and margin options
- stream/file helpers
- diagnostics or validation helpers

If a feature only exists to support certificates, it belongs in the new certificate library instead.

Rule of thumb:

- If the concern is "how should generic HTML documents render to PDF?", it belongs in `Eventuras.Libs.Pdf`.
- If the concern is "how should an Eventuras certificate look or behave?", it belongs in `Eventuras.Certificates`.

That means generic `h1`/`h2`/body/table styling may live in `Eventuras.Libs.Pdf`, while certificate-specific branding, wording, signature blocks, logos, and layout composition must stay outside it.

### Converto responsibilities

Converto becomes an optional adapter, not part of the default certificate architecture.

Possible end state:

- `Eventuras.Certificates` renders HTML/templates
- `Eventuras.Libs.Pdf` provides the PDF engine abstraction and in-process implementation
- `Eventuras.Services.Converto` remains available only as an adapter for environments that still need it
- `apps/convertoapi` can be archived or removed when no consumers remain

## Scope

This ADR is intentionally limited to certificate generation.

It does **not** by itself make `Eventuras.Services` ASP.NET-free. That project still contains other ASP.NET dependencies such as `IHttpContextAccessor` and generic Razor/email rendering. Those concerns can be addressed separately.

## Consequences

### Positive

- Certificate generation gets a clear architectural boundary.
- The service layer stops owning certificate-specific rendering internals.
- `Eventuras.Libs.Pdf` stays generic and reusable.
- Converto becomes replaceable infrastructure rather than a baked-in runtime dependency.
- It becomes easier to test certificate generation independently from the rest of the service layer.
- This creates a path toward removing `apps/convertoapi` later.

### Negative

- Adds another project to the solution.
- There will be a transition period where old and new rendering paths may coexist.
- Some ASP.NET/Razor dependencies may move into the new library rather than disappear immediately.
- DI registration and health checks will need refactoring to make Converto optional.

## Implementation plan

### Phase 1: Introduce the new library

1. Create a new certificate generation project.
2. Move certificate-specific rendering types and templates out of `Eventuras.Services`.
3. Expose a narrow interface for generating certificate HTML/PDF output.
4. Keep current service workflows unchanged except for consuming the new interface.

### Phase 2: Make PDF rendering generic

1. Use `Eventuras.Libs.Pdf.IPdfRenderService` as the only PDF dependency of the new certificate library.
2. Deprecate the `Eventuras.Services.Pdf` re-export layer if it no longer adds value.
3. Extend `Eventuras.Libs.Pdf` only with generic rendering capabilities needed by certificates.

### Phase 3: Stop using Converto by default

1. Remove `AddConvertoServices(...)` from the default Web API composition root.
2. Remove or gate `/health/converto` behind explicit Converto enablement.
3. Ensure certificate generation works with an in-process PDF implementation.
4. Keep Converto available only as an opt-in adapter while parity is being verified.

### Phase 4: Retire Converto if no longer needed

1. Remove `Eventuras.Services.Converto` from the default runtime path.
2. Archive or delete `apps/convertoapi` once there are no remaining consumers.
3. Remove related configuration, health checks, and tests.

## Files and areas affected

| Area | Likely impact |
| --- | --- |
| New project | Dedicated certificate generation library (`Eventuras.Certificates`) |
| Current certificate rendering | `src/Eventuras.Services/Certificates/*` |
| Certificate templates | `src/Eventuras.Services/Views/Shared/Templates/Certificates/*` |
| Generic PDF abstraction | `src/Eventuras.Libs.Pdf/*` |
| Converto adapter | `src/Eventuras.Services.Converto/*` |
| Web API composition root | `src/Eventuras.WebApi/Extensions/ServiceCollectionExtensions.cs`, `Program.cs` |
| Background jobs and delivery | certificate delivery and background worker code in `Eventuras.Services` |
