namespace Eventuras.Services.PowerOffice;

internal static class PowerOfficeConstants
{
    internal const string SectionName = "PowerOffice";
    internal const string ApplicationKey = "POWER_OFFICE_APP_KEY";
    internal const string ApplicationKeyDescription = "PowerOffice Application key";
    internal const string ClientKey = "POWER_OFFICE_CLIENT_KEY";
    internal const string ClientKeyDescription = "PowerOffice Client key";
    internal const string DefaultSalesAccountKey = "POWER_OFFICE_DEFAULT_SALES_ACCOUNT";
    internal const string DefaultSalesAccountDescription =
        "Fallback sales account (kontokode) used when a product is first created in PowerOffice and the product itself has no sales account set. Falls back to 3100 if unset or invalid.";
    internal const int FallbackSalesAccount = 3100;
}
