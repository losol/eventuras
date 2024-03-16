namespace Eventuras.WebApi.Config;

public class AuthSettings
{
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public string ClientId { get; set; }
    public string ClientSecret { get; set; }
    public string ApiIdentifier { get; set; }
    public bool EnablePiiLogging { get; set; }
}
