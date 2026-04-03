using System;

namespace Eventuras.Services.Users;

public class UserSummaryDto
{
    public Guid UserId { get; set; }
    public string Name { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
}
