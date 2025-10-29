using System;
using System.Linq;
using Eventuras.Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Infrastructure;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<ApplicationUser> ApplicationUsers { get; set; }
    public DbSet<EventInfo> EventInfos { get; set; }
    public DbSet<Registration> Registrations { get; set; }
    public DbSet<PaymentMethod> PaymentMethods { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductVariant> ProductVariants { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderLine> OrderLines { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<OrganizationMember> OrganizationMembers { get; set; }
    public DbSet<OrganizationMemberRole> OrganizationMemberRoles { get; set; }
    public DbSet<OrganizationHostname> OrganizationHostnames { get; set; }
    public DbSet<Certificate> Certificates { get; set; }

#pragma warning disable CS0618 // Type or member is obsolete
    [Obsolete("MessageLog is obsolete. Use NotificationLog instead. This DbSet will be removed in v3.")]
    public DbSet<MessageLog> MessageLogs { get; set; }
#pragma warning restore CS0618 // Type or member is obsolete

    public DbSet<Notification> Notifications { get; set; }
    public DbSet<NotificationRecipient> NotificationRecipients { get; set; }
    public DbSet<EmailNotification> EmailNotifications { get; set; }
    public DbSet<SmsNotification> SmsNotifications { get; set; }
    public DbSet<NotificationStatistics> NotificationStatistics { get; set; }
    public DbSet<ExternalAccount> ExternalAccounts { get; set; }
    public DbSet<ExternalEvent> ExternalEvents { get; set; }
    public DbSet<ExternalRegistration> ExternalRegistrations { get; set; }
    public DbSet<EventCollection> EventCollections { get; set; }
    public DbSet<EventCollectionMapping> EventCollectionMappings { get; set; }
    public DbSet<OrganizationSetting> OrganizationSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ExternalEvent>()
            .HasIndex(c => new { c.EventInfoId, c.ExternalServiceName, c.ExternalEventId })
            .IsUnique();

        builder.Entity<ExternalAccount>()
            .HasIndex(a => new { a.ExternalServiceName, a.ExternalAccountId })
            .IsUnique();

        builder.Entity<ExternalRegistration>()
            .HasIndex(e => new { e.ExternalAccountId, e.ExternalEventId })
            .IsUnique();

        builder.Entity<OrganizationHostname>()
            .HasKey(o => new { o.OrganizationId, o.Hostname });

        builder.Entity<OrganizationHostname>()
            .HasIndex(o => o.Hostname)
            .HasFilter($@"""{nameof(OrganizationHostname.Active)}"" = true")
            .IsUnique();

        builder.Entity<OrganizationMember>()
            .HasIndex(m => new { m.OrganizationId, m.UserId })
            .IsUnique();

        builder.Entity<OrganizationMemberRole>()
            .HasKey(o => new { o.OrganizationMemberId, o.Role });

        builder.Entity<OrganizationSetting>()
            .HasKey(s => new { s.OrganizationId, s.Name });

        // TODO: uncomment sometimes after db cleanup
        // builder.Entity<EventInfo>()
        //     .HasIndex(o => o.Code)
        //     .HasFilter($@"""{nameof(EventInfo.Archived)}"" = false")
        //     .IsUnique();

        var eventInfo = builder.Entity<EventInfo>();
        eventInfo.OwnsOne(e => e.Options,
            b1 =>
            {
                b1.OwnsOne(opt => opt.RegistrationPolicy);
                b1.Navigation(opt => opt.RegistrationPolicy).IsRequired();
            });
        eventInfo.Navigation(e => e.Options).IsRequired();

        builder.Entity<EventCollection>()
            .HasMany(c => c.Events)
            .WithMany(e => e.Collections)
            .UsingEntity<EventCollectionMapping>(
                j => j.HasOne(m => m.Event)
                    .WithMany(e => e.CollectionMappings)
                    .OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne(m => m.Collection)
                    .WithMany(c => c.EventMappings)
                    .OnDelete(DeleteBehavior.Cascade));

        builder.Entity<Notification>()
            .HasOne(n => n.Statistics)
            .WithOne(s => s.Notification)
            .HasForeignKey<NotificationStatistics>(s => s.NotificationId);

        builder.Entity<Notification>()
            .HasDiscriminator<NotificationType>(nameof(Notification.Type))
            .HasValue<EmailNotification>(NotificationType.Email)
            .HasValue<EmailNotification>(NotificationType.Email)
            .HasValue<SmsNotification>(NotificationType.Sms);

        builder.Entity<NotificationStatistics>()
            .HasIndex(s => s.NotificationId)
            .IsUnique();
    }

    public void DetachAllEntities()
    {
        var changedEntriesCopy = ChangeTracker.Entries()
            .Where(e => e.State != EntityState.Detached);
        foreach (var entity in changedEntriesCopy)
        {
            Entry(entity.Entity).State = EntityState.Detached;
        }
    }
}
