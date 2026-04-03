using System;

namespace Eventuras.Domain;

public sealed record BusinessEventSubject(
    string Type,
    Guid Uuid);

public static class BusinessEventSubjects
{
    public static BusinessEventSubject ForOrder(Guid orderId) =>
        new("order", orderId);

    public static BusinessEventSubject ForRegistration(Guid registrationId) =>
        new("registration", registrationId);

    public static BusinessEventSubject ForUser(Guid userId) =>
        new("user", userId);
}
