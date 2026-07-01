#nullable enable

using System.Collections.Generic;

namespace Eventuras.Services.Registrations.Notifications;

/// <summary>Receipt email for a confirmed registration: a copy of the registration and its orders.</summary>
public sealed record RegistrationReceiptEmailModel(
    string EventTitle,
    string? EventWhen,
    string? EventLocation,
    string ParticipantName,
    string RegistrationType,
    bool HasOrders,
    IReadOnlyList<ReceiptOrderLine> Lines,
    string Total);

/// <summary>A single order line shown in the receipt.</summary>
public sealed record ReceiptOrderLine(
    string ProductName,
    string? VariantName,
    int Quantity,
    string UnitPrice,
    string LineTotal);

/// <summary>Waiting-list email: informs the participant they are on the waiting list.</summary>
public sealed record RegistrationWaitlistEmailModel(
    string EventTitle,
    string? EventWhen,
    string ParticipantName);
