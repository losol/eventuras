namespace Eventuras.Services.Orders;

public class OrderListRequest : PagingRequest
{
    public OrderListFilter Filter { get; set; }

    public OrderListOrder Order { get; set; } = OrderListOrder.Time;

    public bool Descending { get; set; }
}