#nullable enable

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Losol.Communication.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NodaTime;

namespace Eventuras.Services.Registrations.Notifications;

public interface IRegistrationNotificationService
{
    /// <summary>
    ///     Sends the email that matches the registration's current status (receipt for Verified,
    ///     waiting-list for WaitingList; nothing otherwise). No-op when the status did not change.
    /// </summary>
    Task NotifyStatusChangeAsync(
        Registration registration,
        Registration.RegistrationStatus? previousStatus,
        CancellationToken cancellationToken = default);
}

public sealed class RegistrationNotificationService : IRegistrationNotificationService
{
    private const string DefaultLocale = "nb";
    private static readonly CultureInfo MoneyCulture = CultureInfo.GetCultureInfo("nb-NO");

    private readonly ApplicationDbContext _context;
    private readonly IEmailSender _emailSender;
    private readonly RegistrationEmailRenderer _renderer;
    private readonly ILogger<RegistrationNotificationService> _logger;

    public RegistrationNotificationService(
        ApplicationDbContext context,
        IEmailSender emailSender,
        RegistrationEmailRenderer renderer,
        ILogger<RegistrationNotificationService> logger)
    {
        _context = context;
        _emailSender = emailSender;
        _renderer = renderer;
        _logger = logger;
    }

    public async Task NotifyStatusChangeAsync(
        Registration registration,
        Registration.RegistrationStatus? previousStatus,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(registration);

        var status = registration.Status;

        // Idempotent: only act on an actual transition into a notifiable state.
        if (previousStatus == status
            || (status != Registration.RegistrationStatus.Verified
                && status != Registration.RegistrationStatus.WaitingList))
        {
            return;
        }

        var reg = await _context.Registrations
            .AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.EventInfo)
            .Include(r => r.Orders).ThenInclude(o => o.OrderLines)
            .FirstOrDefaultAsync(r => r.RegistrationId == registration.RegistrationId, cancellationToken);

        if (reg?.EventInfo == null)
        {
            _logger.LogWarning(
                "Registration {RegistrationId} not found or missing event; skipping {Status} email",
                registration.RegistrationId, status);
            return;
        }

        var recipientEmail = reg.User?.Email ?? reg.CustomerEmail;
        if (string.IsNullOrWhiteSpace(recipientEmail))
        {
            _logger.LogWarning(
                "No recipient email for registration {RegistrationId}; skipping {Status} email",
                reg.RegistrationId, status);
            return;
        }

        var participantName = !string.IsNullOrWhiteSpace(reg.ParticipantName)
            ? reg.ParticipantName
            : reg.User?.Name ?? recipientEmail;

        var rendered = status == Registration.RegistrationStatus.WaitingList
            ? await _renderer.RenderWaitlistAsync(
                new RegistrationWaitlistEmailModel(reg.EventInfo.Title, FormatWhen(reg.EventInfo), participantName),
                DefaultLocale, cancellationToken)
            : await _renderer.RenderReceiptAsync(
                BuildReceiptModel(reg, participantName), DefaultLocale, cancellationToken);

        var email = new EmailModel
        {
            Recipients = new[] { new Address { Email = recipientEmail } },
            Subject = rendered.Subject,
            HtmlBody = rendered.HtmlBody,
            TextBody = rendered.TextBody
        };

        await _emailSender.SendEmailAsync(email, new EmailOptions { OrganizationId = reg.EventInfo.OrganizationId });
        _logger.LogInformation(
            "Sent {Status} email for registration {RegistrationId}", status, reg.RegistrationId);
    }

    private static RegistrationReceiptEmailModel BuildReceiptModel(Registration reg, string participantName)
    {
        var lines = new List<ReceiptOrderLine>();
        var total = 0m;

        foreach (var order in reg.Orders ?? Enumerable.Empty<Order>())
        {
            if (order.Status is Order.OrderStatus.Cancelled or Order.OrderStatus.Refunded)
            {
                continue;
            }

            foreach (var line in order.OrderLines ?? Enumerable.Empty<OrderLine>())
            {
                total += line.LineTotal;
                lines.Add(new ReceiptOrderLine(
                    line.ProductName,
                    line.ProductVariantName,
                    line.Quantity,
                    Money(line.Price),
                    Money(line.LineTotal)));
            }
        }

        return new RegistrationReceiptEmailModel(
            reg.EventInfo!.Title,
            FormatWhen(reg.EventInfo),
            FormatLocation(reg.EventInfo),
            participantName,
            reg.Type.ToString(),
            lines.Count > 0,
            lines,
            Money(total));
    }

    private static string Money(decimal amount) => amount.ToString("#,##0.##", MoneyCulture) + " kr";

    private static string? FormatWhen(EventInfo eventInfo)
    {
        if (eventInfo.DateStart is not { } start)
        {
            return null;
        }

        var startText = FormatDate(start);
        return eventInfo.DateEnd is { } end && end != start
            ? $"{startText}–{FormatDate(end)}"
            : startText;
    }

    private static string FormatDate(LocalDate date) => $"{date.Day:D2}.{date.Month:D2}.{date.Year}";

    private static string? FormatLocation(EventInfo eventInfo)
    {
        var joined = string.Join(", ",
            new[] { eventInfo.Location, eventInfo.City }.Where(s => !string.IsNullOrWhiteSpace(s)));
        return string.IsNullOrWhiteSpace(joined) ? null : joined;
    }
}
