namespace Eventuras.Services.Users;

public class UserRetrievalOptions
{
    public bool IncludeOrgMembership { get; set; }

    public static readonly UserRetrievalOptions Default = new UserRetrievalOptions();
}
