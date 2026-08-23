using System;

namespace Eventuras.Domain;

public sealed record BusinessEventSubject(
    string Type,
    Guid Uuid);

public static class BusinessEventSubjects
{
    public const string OrderType = "order";
    public const string RegistrationType = "registration";
    public const string EventType = "event";
    public const string UserType = "user";

    public static BusinessEventSubject ForOrder(Guid orderId) =>
        new(OrderType, orderId);

    public static BusinessEventSubject ForRegistration(Guid registrationId) =>
        new(RegistrationType, registrationId);

    public static BusinessEventSubject ForEvent(Guid eventInfoUuid) =>
        new(EventType, eventInfoUuid);

    public static BusinessEventSubject ForUser(Guid userId) =>
        new(UserType, userId);
}
