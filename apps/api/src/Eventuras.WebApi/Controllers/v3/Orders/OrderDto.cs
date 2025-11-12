#nullable enable

using System;
using System.Linq;
using System.Text.Json.Serialization;
using Eventuras.Domain;
using Eventuras.WebApi.Controllers.v3.Registrations;
using Eventuras.WebApi.Controllers.v3.Users;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.WebApi.Controllers.v3.Orders;

public class OrderDto
{
    public int OrderId { get; set; }

    public Order.OrderStatus Status { get; set; }

    public DateTimeOffset Time { get; set; }

    public string UserId { get; set; }

    public int RegistrationId { get; set; }
    public PaymentProvider? PaymentMethod { get; set; }
    public string Comments { get; set; } = string.Empty;
    public string Log { get; set; } = string.Empty;

    public OrderLineDto[]? Items { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public RegistrationDto? Registration { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public UserDto? User { get; set; }


    [Obsolete("For JSON deserialization only, do not use manually", true)]
    public OrderDto()
    {
        UserId = null!;
    }

    public OrderDto(Order order)
    {
        OrderId = order.OrderId;
        Status = order.Status;
        Time = order.OrderTime.ToDateTimeOffset();
        UserId = order.UserId;
        RegistrationId = order.RegistrationId;
        PaymentMethod = order.PaymentMethod;
        Comments = order.Comments;
        Log = order.Log;

        if (order.Registration != null)
        {
            Registration = new RegistrationDto(order.Registration, includeOrders: false);
        }

        if (order.User != null)
        {
            User = new UserDto(order.User);
        }

        Items = order.OrderLines?
            .Select(l => new OrderLineDto(l))
            .ToArray();
    }

    public void CopyTo(Order order)
    {
        if (order == null)
            throw new ArgumentNullException(nameof(order));

        // Update properties of the Order entity from the DTO
        order.Status = this.Status;
        order.Comments = this.Comments;

        if (this.PaymentMethod.HasValue)
        {
            order.PaymentMethod = this.PaymentMethod.Value;
        }
    }
}
