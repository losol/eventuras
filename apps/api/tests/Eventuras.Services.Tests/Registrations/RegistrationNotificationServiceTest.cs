#nullable enable

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Registrations.Notifications;
using Losol.Communication.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Eventuras.Services.Tests.Registrations;

public class RegistrationNotificationServiceTest : IDisposable
{
    private readonly ApplicationDbContext _context;

    public RegistrationNotificationServiceTest()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task Transition_To_WaitingList_Sends_Waitlist_Email_Not_Confirmation()
    {
        var reg = await SeedRegistrationAsync(Registration.RegistrationStatus.WaitingList);
        var (service, sent) = BuildService();

        await service.NotifyStatusChangeAsync(reg, Registration.RegistrationStatus.Verified);

        var email = Assert.Single(sent);
        Assert.Contains("venteliste", email.HtmlBody);
        // Not the receipt wording.
        Assert.DoesNotContain("registrert påmeldingen", email.HtmlBody);
    }

    [Fact]
    public async Task Transition_To_Verified_Sends_Receipt()
    {
        var reg = await SeedRegistrationAsync(Registration.RegistrationStatus.Verified);
        var (service, sent) = BuildService();

        await service.NotifyStatusChangeAsync(reg, previousStatus: null);

        var email = Assert.Single(sent);
        Assert.Contains("Introduction to Machine Learning", email.Subject);
        Assert.Contains("registrert påmeldingen", email.HtmlBody);
    }

    [Fact]
    public async Task No_Email_When_Status_Unchanged()
    {
        var reg = await SeedRegistrationAsync(Registration.RegistrationStatus.Verified);
        var (service, sent) = BuildService();

        await service.NotifyStatusChangeAsync(reg, Registration.RegistrationStatus.Verified);

        Assert.Empty(sent);
    }

    [Fact]
    public async Task No_Email_For_Non_Notifiable_Status()
    {
        var reg = await SeedRegistrationAsync(Registration.RegistrationStatus.Cancelled);
        var (service, sent) = BuildService();

        await service.NotifyStatusChangeAsync(reg, Registration.RegistrationStatus.Verified);

        Assert.Empty(sent);
    }

    private (RegistrationNotificationService Service, List<EmailModel> Sent) BuildService()
    {
        var sent = new List<EmailModel>();
        var emailSender = new Mock<IEmailSender>();
        emailSender
            .Setup(s => s.SendEmailAsync(It.IsAny<EmailModel>(), It.IsAny<EmailOptions>()))
            .Callback<EmailModel, EmailOptions>((model, _) => sent.Add(model))
            .Returns(Task.CompletedTask);

        var service = new RegistrationNotificationService(
            _context,
            emailSender.Object,
            new RegistrationEmailRenderer(),
            NullLogger<RegistrationNotificationService>.Instance);

        return (service, sent);
    }

    private async Task<Registration> SeedRegistrationAsync(Registration.RegistrationStatus status)
    {
        var user = new ApplicationUser
        {
            GivenName = "Alex",
            FamilyName = "Taylor",
            Email = "alex@example.com",
            NormalizedEmail = "ALEX@EXAMPLE.COM"
        };
        _context.Users.Add(user);

        var eventInfo = new EventInfo
        {
            Title = "Introduction to Machine Learning",
            Slug = "introduction-to-machine-learning",
            OrganizationId = 1
        };
        _context.EventInfos.Add(eventInfo);
        await _context.SaveChangesAsync();

        var registration = new Registration
        {
            EventInfoId = eventInfo.EventInfoId,
            UserId = user.Id,
            ParticipantName = "Alex Taylor",
            Status = status
        };
        _context.Registrations.Add(registration);
        await _context.SaveChangesAsync();

        return registration;
    }
}
