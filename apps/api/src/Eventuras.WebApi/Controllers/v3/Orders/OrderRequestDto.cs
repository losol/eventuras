namespace Eventuras.WebApi.Controllers.v3.Orders;

public class OrderRequestDto
{
    public bool IncludeUser { get; set; }

    public bool IncludeRegistration { get; set; }
}
