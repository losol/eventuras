# Plan: File-based Email Template System with Scriban and Multi-language Support

Introduces a new templating system using Scriban, with file-based templates organized by BCP 47 language codes (nb-NO, nn-NO, en-US), and structured context classes for passing rich data to templates. The template service handles formatting based on language and currency code passed in. In the first phase, `nb-NO` and `NOK` are always used. Also includes configurable rate-limiting between emails.

## Steps

### 1. Create new module `Eventuras.Services.EmailTemplates`

Structure:

```
Eventuras.Services.EmailTemplates/
├── Eventuras.Services.EmailTemplates.csproj  (Scriban NuGet)
├── IEmailTemplateService.cs
├── EmailTemplateService.cs
├── EmailTemplateType.cs
├── EmailRenderRequest.cs
├── ServiceCollectionExtensions.cs
├── Rendering/
│   └── ScribanFunctions.cs
├── Contexts/
│   ├── EmailTemplateContextBase.cs
│   ├── OrderEmailContext.cs
│   ├── CertificateEmailContext.cs
│   ├── RegistrationEmailContext.cs
│   └── NotificationEmailContext.cs
└── Templates/
    ├── README.md  (documentation)
    ├── Layouts/_EmailLayout.sbn
    ├── nb-NO/
    │   ├── StandardEmail.sbn
    │   ├── CertificateDelivery.sbn
    │   ├── OrderConfirmation.sbn
    │   ├── RegistrationConfirmation.sbn
    │   ├── WaitingListNotification.sbn
    │   ├── WaitingListPromoted.sbn
    │   ├── RegistrationCancellation.sbn
    │   ├── EventReminder.sbn
    │   ├── EventCancelled.sbn
    │   └── WelcomeLetter.sbn
    ├── nn-NO/
    │   ├── StandardEmail.sbn
    │   ├── CertificateDelivery.sbn
    │   ├── OrderConfirmation.sbn
    │   ├── RegistrationConfirmation.sbn
    │   ├── WaitingListNotification.sbn
    │   ├── WaitingListPromoted.sbn
    │   ├── RegistrationCancellation.sbn
    │   ├── EventReminder.sbn
    │   ├── EventCancelled.sbn
    │   └── WelcomeLetter.sbn
    └── en-US/
        ├── StandardEmail.sbn
        ├── CertificateDelivery.sbn
        ├── OrderConfirmation.sbn
        ├── RegistrationConfirmation.sbn
        ├── WaitingListNotification.sbn
        ├── WaitingListPromoted.sbn
        ├── RegistrationCancellation.sbn
        ├── EventReminder.sbn
        ├── EventCancelled.sbn
        └── WelcomeLetter.sbn
```

### Email types

**All email templates to create:**

| Template | Description | Context |
|----------|-------------|---------|
| `StandardEmail` | General notification emails to recipients | NotificationEmailContext |
| `CertificateDelivery` | Certificate with PDF attachment | CertificateEmailContext |
| `WelcomeLetter` | Welcome letter on new registration | RegistrationEmailContext |
| `RegistrationConfirmation` | Confirmation that registration was received | RegistrationEmailContext |
| `OrderConfirmation` | Order confirmation with products/prices | OrderEmailContext |
| `WaitingListNotification` | Notification that user is on waiting list | RegistrationEmailContext |
| `WaitingListPromoted` | Notification when user is moved from waiting list to participant | RegistrationEmailContext |
| `RegistrationCancellation` | Confirmation of cancellation | RegistrationEmailContext |
| `EventReminder` | Reminder before event | RegistrationEmailContext |
| `EventCancelled` | Notification if event is cancelled | RegistrationEmailContext |

**Code integration priority:**
1. First phase: Migrate `StandardEmail`, `CertificateDelivery`, `WelcomeLetter`
2. Second phase: Implement `RegistrationConfirmation`, `OrderConfirmation`, `WaitingListNotification`
3. Future: Implement remaining templates as needed

### 2. Implement `EmailRenderRequest`

Parameter object for rendering:

```csharp
public record EmailRenderRequest(
    EmailTemplateType TemplateType,
    EmailTemplateContextBase Context,
    string Language = "nb-NO",
    string CurrencyCode = "NOK"
);
```

### 3. Implement context classes

With raw values (decimal/int):

- **OrderEmailContext**:
  - `Order`: `OrderId`, `Status`, `OrderTime`, `PaymentMethod` (name + type)
  - `OrderLines[]`: `ItemName`, `Quantity`, `Price`, `VatPercent`, `LineTotal`
  - `Totals`: `SubTotal`, `TotalVat`, `TotalAmount` (all as `decimal`)
  - `Registration`: `Status`, `Type`, `ParticipantName`
  - `Event`: `Title`, `DateStart`, `DateEnd`, `Location`, `City`
  - `Recipient`: `Name`, `Email`
  - `Organization`: `Name`, `Email`, `Phone`, `Url`

- **RegistrationEmailContext**:
  - `Registration`: `RegistrationId`, `Status`, `Type`, `ParticipantName`
  - `Event`: `Title`, `DateStart`, `DateEnd`, `Location`, `City`, `WelcomeLetter`
  - `Recipient`: `Name`, `Email`
  - `Organization`: `Name`, `Email`, `Phone`, `Url`

- **CertificateEmailContext**:
  - `Certificate`: `Title`, `Description`, `IssuedDate`, `CertificateId`
  - `Recipient`: `Name`, `Email`
  - `Organization`: `Name`, `Email`, `Phone`, `Url`

- **NotificationEmailContext**:
  - `Subject`, `Message`
  - `Recipient`: `Name`, `Email`
  - `Organization`: `Name`, `Email`, `Phone`, `Url`

### 4. Implement `ScribanFunctions`

Formatting based on request parameters:

- `currency(amount)` → uses `CurrencyCode` from request (e.g., `1 250,00 kr` for NOK/nb-NO)
- `date(value, format?)` → formats date according to `Language`

Usage in templates:

```scriban
{{ totals.total_amount | currency }}
{{ event.date_start | date }}
```

### 5. Migrate existing templates to Scriban

- Convert `src/Eventuras.Services/Views/Shared/_EmailLayout.cshtml` → `_EmailLayout.sbn`
- Convert `src/Eventuras.Services/Views/Shared/Templates/Email/StandardEmail.cshtml` → `nb-NO/StandardEmail.sbn` + `en-US/StandardEmail.sbn`
- Replace hardcoded "Nordland legeforening" with `{{ organization.name }}`

### 6. Create `Templates/README.md`

Documentation of:

- Available template types and their use cases
- Variables per context type (Order, Certificate, Notification)
- Available functions (`currency`, `date`)
- Usage examples in templates

### 7. Add configurable rate-limiting

- Create `EmailSettings` with `DelayBetweenEmailsMs` (default: 1000)
- Update `src/Eventuras.Services/BackgroundJobs/NotificationBackgroundWorker.cs`:
  - Change from hardcoded 500ms to `IOptions<EmailSettings>`
- Update `src/Eventuras.Services/BackgroundJobs/CertificateBackgroundWorker.cs`:
  - Add equivalent delay (currently missing)

### 8. Update background workers to use `IEmailTemplateService`

- **NotificationBackgroundWorker.cs**: Use `NotificationEmailContext` with hardcoded `"nb-NO"` and `"NOK"`
- **CertificateBackgroundWorker.cs**: Replace hardcoded "Kursbevis for..." (line 116) with `CertificateEmailContext`

### 9. Add project reference and DI registration

- Add reference in `Eventuras.Services.csproj`
- Register services in `Eventuras.WebApi` startup

### 10. Create test project `Eventuras.Services.EmailTemplates.Tests`

Structure:

```
tests/Eventuras.Services.EmailTemplates.Tests/
├── Eventuras.Services.EmailTemplates.Tests.csproj
├── EmailTemplateServiceTests.cs
├── ScribanFunctionsTests.cs
└── Contexts/
    └── OrderEmailContextTests.cs
```

**Test coverage:**

- **EmailTemplateServiceTests**:
  - `RenderAsync_WithValidTemplate_ReturnsRenderedContent`
  - `RenderAsync_WithMissingTemplate_FallsBackToDefaultLanguage`
  - `RenderAsync_WithInvalidTemplateType_ThrowsException`
  - `RenderAsync_WithLayoutTemplate_WrapsContentCorrectly`

- **ScribanFunctionsTests**:
  - `Currency_WithNOK_FormatsNorwegianStyle` (e.g., `1 250,00 kr`)
  - `Currency_WithUSD_FormatsAmericanStyle` (e.g., `$1,250.00`)
  - `Date_WithNbNO_FormatsNorwegianStyle` (e.g., `11. desember 2025`)
  - `Date_WithEnUS_FormatsAmericanStyle` (e.g., `December 11, 2025`)

- **OrderEmailContextTests**:
  - `Totals_CalculatesCorrectly_FromOrderLines`
  - `FromOrder_MapsAllPropertiesCorrectly`

## Further Considerations

1. **Future currency handling:** When multiple currencies are needed, `CurrencyCode` can be fetched from `Organization.Currency` or `Event.Currency` in calling code - the template library remains unchanged.

2. **Future language selection:** Can be fetched from `User.PreferredLanguage ?? Organization.DefaultLanguage ?? "nb-NO"` when user profile is implemented.

## Language Translations

All templates will be created in three languages: Norwegian Bokmål (nb-NO), Norwegian Nynorsk (nn-NO), and English (en-US).

### Key phrases per language

| Key | nb-NO | nn-NO | en-US |
|-----|-------|-------|-------|
| Registration confirmation | Bekreftelse på påmelding | Stadfesting av påmelding | Registration Confirmation |
| You are now registered | Du er nå påmeldt | Du er no påmeld | You are now registered |
| Order confirmation | Ordrebekreftelse | Ordrestadfesting | Order Confirmation |
| Waiting list | Venteliste | Venteliste | Waiting List |
| You are on the waiting list | Du står på venteliste | Du står på venteliste | You are on the waiting list |
| Promoted from waiting list | Plass ledig fra venteliste | Plass ledig frå venteliste | Promoted from Waiting List |
| Event cancelled | Arrangementet er avlyst | Arrangementet er avlyst | Event Cancelled |
| Reminder | Påminnelse | Påminning | Reminder |
| Certificate | Kursbevis | Kursbevis | Certificate |
| Cancellation confirmed | Avmelding bekreftet | Avmelding stadfesta | Cancellation Confirmed |
| Thank you for your registration | Takk for din påmelding | Takk for påmeldinga di | Thank you for your registration |
| Best regards | Med vennlig hilsen | Med venleg helsing | Best regards |
| Questions? Contact us | Spørsmål? Kontakt oss | Spørsmål? Kontakt oss | Questions? Contact us |
| Total | Totalt | Totalt | Total |
| Price | Pris | Pris | Price |
| Quantity | Antall | Tal | Quantity |
| VAT | MVA | MVA | VAT |

