using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Auth0;

internal class Auth0IntegrationSettings
{
    internal const int MinScopes = 1;
    internal const int MinDomainLength = 5;
    internal const int MinClientIdLength = 5;
    internal const int MinClientSecretLength = 5;
    internal const string DefaultCallbackPath = "/callback";
    internal const string DefaultClaimsIssuer = "Auth0";
    internal const string DefaultNameClaimType = "name";
    internal const string DefaultRoleClaimType = "roles";

    [Required] [MinLength(MinScopes)] public string[] Scopes = { "openid", "profile", "email" };

    [Required]
    public string NameClaimType { get; set; } = DefaultNameClaimType;

    [Required]
    public string RoleClaimType { get; set; } = DefaultRoleClaimType;

    /// <summary>
    /// Auth0 will call back to http://{StartupUrl}{CallbackPath}. Ensure that you have added the URL as an Allowed Callback URL in your Auth0
    /// dashboard.
    /// </summary>
    public string CallbackPath { get; set; } = DefaultCallbackPath;

    /// <summary> Does someone need to change this? </summary>
    public string ClaimsIssuer { get; set; } = DefaultClaimsIssuer;

    /// <summary> Your Auth0 domain. </summary>
    [Required]
    [MinLength(MinDomainLength)]
    public string Domain { get; set; }

    /// <summary> Auth0 Client ID. </summary>
    [Required]
    [MinLength(MinClientIdLength)]
    public string ClientId { get; set; }

    /// <summary> Auth0 Client Secret. </summary>
    [Required]
    [MinLength(MinClientSecretLength)]
    public string ClientSecret { get; set; }

    /// <summary> Optional Auth0 API identifier to be used as the audience param when obtaining token from Auth0. </summary>
    public string ApiIdentifier { get; set; }

    /// <summary> This lambda determines whether user consent for non-essential cookies is needed for a given request. Set to true in production. </summary>
    public bool CheckConsentNeeded { get; set; }
}