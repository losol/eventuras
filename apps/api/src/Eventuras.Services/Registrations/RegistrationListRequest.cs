namespace Eventuras.Services.Registrations;

public class RegistrationListRequest : PagingRequest
{
    public RegistrationFilter Filter { get; set; } = new();

    public RegistrationListOrder OrderBy { get; set; } = RegistrationListOrder.RegistrationTime;

    public bool Descending { get; set; }
}
