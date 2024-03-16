using Eventuras.Domain;

namespace Eventuras.Services.Orders;

public class OrderListFilter
{
    public string UserId { get; set; }
    public int? EventId { get; set; }
    public int? RegistrationId { get; set; }
    public Order.OrderStatus? Status { get; set; }
    public bool AccessibleOnly { get; set; }
    public int? OrganizationId { get; set; }
}
