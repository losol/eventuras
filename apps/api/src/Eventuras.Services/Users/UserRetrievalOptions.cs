namespace Eventuras.Services.Users;

public class UserRetrievalOptions
{
    public static readonly UserRetrievalOptions Default = new();
    public bool IncludeOrgMembership { get; set; }
}
