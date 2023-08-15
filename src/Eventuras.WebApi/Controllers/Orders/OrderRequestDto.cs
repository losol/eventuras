namespace Eventuras.WebApi.Controllers.Orders;

public class OrderRequestDto
{
    public bool IncludeUser { get; set; }

    public bool IncludeRegistration { get; set; }
}