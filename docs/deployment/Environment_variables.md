# Production Configuration Settings

This table outlines the necessary configuration settings for the production environment. These settings ensure the application's optimal functionality and security.

| SettingName                            | Description                                                        | Example Value                       |
| -------------------------------------- | ------------------------------------------------------------------ | ----------------------------------- |
| `AppSettings__AllowedOrigins`          | Specifies the CORS allowed origins.                                | `https://www.frontend-domain.com`   |
| `AppSettings__BaseUri`                 | The base URI for the application.                                  | `https://www.backend-domain.com.no` |
| `AppSettings__DefaultLocale`           | The default locale for the application.                            | `nb-NO`                             |
| `Auth__Issuer`                         | The issuer URL for the authentication service.                     | `https://authdomain.eu.auth0.com`   |
| `Converto__ApiToken`                   | The API token for accessing Converto services. (Sensitive info)    | `***`                               |
| `Converto__PdfEndpointUrl`             | The endpoint URL for PDF conversion services.                      | `https://url-to-pdf-service`        |
| `FeatureManagement__UsePowerOffice`    | Flag to enable PowerOffice integration.                            | `true`                              |
| `FeatureManagement__UseSentry`         | Flag to enable Sentry for error logging and monitoring.            | `True`                              |
| `FeatureManagement__UseHealthchecks`   | Flag to enable health checks for the application.                  | `True`                              |
| `FeatureManagement__UseHealthchecksUI` | Flag to enable a UI for health checks.                             | `True`                              |
| `FeatureManagement__UseStripeInvoice`  | Flag to enable or disable the Stripe invoicing feature.            | `false`                             |
| `Logging__LogLevel__Default`           | The default logging level.                                         | `Information`                       |
| `PowerOffice__Mode`                    | The operating mode for PowerOffice integration.                    | `Production`                        |
| `PowerOffice__TokenStoreName`          | The name of the token store for PowerOffice.                       | `kursinord.tokenstore`              |
| `Sentry__Debug`                        | Flag to enable debugging in Sentry.                                | `True`                              |
| `Sentry__Dsn`                          | The Data Source Name for Sentry.                                   | `https://sentry-dsn`                |
| `Sentry__Environment`                  | The logging environment name for Sentry.                           | `api-production`                    |
| `Sentry__SendDefaultPii`               | Whether to send default personally identifiable information (PII). | `true`                              |
| `WEBSITES_PORT`                        | The port used by the web services.                                 | `8080`                              |
| `HTTPS_PORT`                           | The port used for HTTPS connections.                               | `443`                               |
