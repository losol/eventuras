#nullable enable

using Eventuras.Domain;
using static Eventuras.Domain.Order;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.WebApi.Controllers.v3.Orders;

/// <summary>
///     DTO for partial updates to an order.
///     Only allows updating Status, Comments, and PaymentMethod fields.
/// </summary>
public class OrderPatchDto
{
    /// <summary>
    ///     The order status.
    /// </summary>
    public OrderStatus? Status { get; set; }

    /// <summary>
    ///     Comments about the order.
    /// </summary>
    public string? Comments { get; set; }

    /// <summary>
    ///     The payment method for the order.
    /// </summary>
    public PaymentProvider? PaymentMethod { get; set; }

    /// <summary>
    ///     Applies the changes from this DTO to an Order entity.
    /// </summary>
    /// <param name="order">The order to update</param>
    public void ApplyTo(Order order)
    {
        if (Status.HasValue && Status.Value != order.Status)
        {
            order.Status = Status.Value;
            order.AddLog($"Status updated to {Status.Value}");
        }

        if (Comments != null)
        {
            order.Comments = Comments;
        }

        if (PaymentMethod.HasValue && PaymentMethod.Value != order.PaymentMethod)
        {
            order.PaymentMethod = PaymentMethod.Value;
            order.AddLog($"Payment method updated to {PaymentMethod.Value}");
        }
    }
}
