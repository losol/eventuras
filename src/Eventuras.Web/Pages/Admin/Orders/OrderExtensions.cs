using Eventuras.Domain;
using static Eventuras.Domain.Order;

namespace Eventuras.Web.Pages.Admin.Orders;

public static class OrderExtensions
{
    public static OrderStatus? GetNextStatus(this Order order)
    {
        switch (order.Status)
        {
            case OrderStatus.Draft: return OrderStatus.Verified;
            case OrderStatus.Verified: return OrderStatus.Invoiced;
            default: return null;
        }
    }

    public static string GetOrderStatusActionText(this Order order)
    {
        var nextStatus = order.GetNextStatus();
        if (nextStatus == null) return "";

        switch (nextStatus)
        {
            case OrderStatus.Verified: return "Verify";
            case OrderStatus.Invoiced: return "Invoice";
            case OrderStatus.Cancelled: return "Cancel";
            default: return "!!!"; // Should not occur
        }
    }
}