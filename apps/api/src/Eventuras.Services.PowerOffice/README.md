# PowerOffice Integration

This service provides integration with PowerOffice Go API for invoice management.

## Features

- **Email Invoicing**: Send invoices via email through PowerOffice
- **EHF Invoicing**: Send electronic invoices (EHF) through PowerOffice
- **Customer Management**: Automatically create or update customers in PowerOffice
- **Product Management**: Automatically create products in PowerOffice if they don't exist

## Configuration

### Feature Flag

Enable PowerOffice in `appsettings.json`:

```json
{
  "FeatureManagement": {
    "UsePowerOffice": true
  }
}
```

### Organization Settings

PowerOffice credentials must be configured per organization through the organization settings interface:

| Setting Name              | Description                 |
| ------------------------- | --------------------------- |
| `POWER_OFFICE_APP_KEY`    | PowerOffice Application Key |
| `POWER_OFFICE_CLIENT_KEY` | PowerOffice Client Key      |

**Note**: These settings are stored securely in the database per organization, not in configuration files.

## Usage

### Supported Payment Methods

The service handles invoices for the following payment methods:

- `PaymentProvider.PowerOfficeEmailInvoice` - PDF invoice sent via email
- `PaymentProvider.PowerOfficeEHFInvoice` - Electronic invoice (EHF)

### Invoice Creation Flow

1. **Customer Lookup/Creation**
   - Searches for existing customer by VAT number
   - Falls back to search by email if VAT number not found
   - Creates new customer if not found

2. **Product Creation**
   - Creates products in PowerOffice if they don't exist
   - Uses product codes to avoid duplicates

3. **Invoice Generation**
   - Creates draft invoice in PowerOffice
   - Links invoice to customer and products
   - Returns invoice ID for tracking

### EHF Requirements

For EHF invoicing to work:

- Organization must be registered for EHF with PowerOffice
- Customer must have a valid Norwegian organization number
- Customer's organization must be registered for EHF reception

If EHF registration is missing, the service will throw an `EhfValidationException` with a user-friendly error message.

## Error Handling

### EhfValidationException

Thrown when an organization number is not registered for EHF invoicing.

**Example error message:**

```text
Organization number 12345678 is not registered for EHF invoicing.
Please contact the organization to enable EHF, or select email as the invoicing method.
```

**HTTP Response**: `400 Bad Request`

### InvoicingException

Generic exception for other invoicing errors (missing customer name, PowerOffice client not found, etc.).

**HTTP Response**: `400 Bad Request`

## Development

### Running Tests

Tests for PowerOffice integration will only run if:

1. `FeatureManagement:UsePowerOffice` is `true`
2. Organization settings are configured with valid PowerOffice credentials

```bash
dotnet test --filter "FullyQualifiedName~InvoicesControllerTest"
```

**Note**: Tests will be skipped if PowerOffice credentials are not configured in organization settings.

### Debugging

The service logs important events at different levels:

- **Information**: Customer creation, API usage, successful operations
- **Warning**: EHF validation failures, missing configurations
- **Error**: API failures, exception details

## Architecture

### Service Dependencies

- `IOrganizationSettingsAccessorService` - Retrieves organization-specific settings from database

### Configuration Priority

PowerOffice credentials are **only** loaded from organization settings. There is no fallback to global configuration files.

## Security Notes

⚠️ **Best Practice**: PowerOffice credentials are stored securely per organization in the database. This approach:

- Prevents credentials from being committed to source control
- Allows different organizations to use different PowerOffice accounts
- Provides better security and isolation
- Ensures credentials are managed through the organization settings interface

## Related Documentation

- [PowerOffice Go API Documentation](https://go.poweroffice.net/)
- [EHF Documentation](https://www.anskaffelser.no/electronic-invoicing/about-ehf)
- Organization Settings: See `Eventuras.Services.Organizations.Settings`

## Support

For issues related to PowerOffice integration:

1. Check organization settings are correctly configured
2. Verify feature flag is enabled
3. Review application logs for detailed error messages
4. Contact PowerOffice support for API-related issues
