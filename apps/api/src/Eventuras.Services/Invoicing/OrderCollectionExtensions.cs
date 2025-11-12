using System;
using System.Collections.Generic;
using System.Linq;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.Services.Invoicing;

internal static class OrderCollectionExtensions
{
    public static void Check(this IReadOnlyCollection<Order> orders)
    {
        if (orders == null)
        {
            throw new ArgumentNullException(nameof(orders));
        }

        if (!orders.Any())
        {
            throw new ArgumentException("Can't create invoice without orders");
        }

        if (orders.Any(o => o.Registration?.EventInfo == null ||
                            o.Registration.User == null ||
                            o.OrderLines == null ||
                            !o.OrderLines.Any()))
        {
            throw new ArgumentException("Found order without required information loaded");
        }

        if (orders.Select(o => o.PaymentMethod).Distinct().Count() > 1)
        {
            throw new ArgumentException(
                "Orders should have the same payment method to be included into the single invoice");
        }
    }

    public static string FirstFilled(this IEnumerable<Order> orders, Func<Order, string> selector) =>
        orders.Select(selector)
            .FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));

    public static LocalDate? CalculateDueDate(this IEnumerable<Order> orders) =>
        orders
            .Select(o => o.Registration.EventInfo)
            .Select(e => e.LastCancellationDate ?? e.LastRegistrationDate ?? e.DateStart)
            .Where(date => date != null)
            .Min();
}
