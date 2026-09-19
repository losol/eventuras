#nullable enable

using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services.DbInitializers;

public class DbInitializer : IDbInitializer
{
    private readonly ApplicationDbContext _db;

    public DbInitializer(ApplicationDbContext db)
    {
        _db = db;
    }

    public virtual async Task SeedAsync(bool runMigrations)
    {
        if (runMigrations && _db.Database.IsRelational())
        {
            await _db.Database.MigrateAsync();
        }

        // Seed the payment methods if none exist
        if (!await _db.PaymentMethods.AnyAsync())
        {
            var methods = new[]
            {
                new PaymentMethod
                {
                    Provider = PaymentProvider.EmailInvoice,
                    Name = "Email invoice",
                    Type = PaymentProviderType.Invoice,
                    Active = false
                },
                new PaymentMethod
                {
                    Provider = PaymentProvider.PowerOfficeEmailInvoice,
                    Name = "Epost-faktura",
                    Type = PaymentProviderType.Invoice,
                    Active = true,
                    IsDefault = true
                },
                new PaymentMethod
                {
                    Provider = PaymentProvider.PowerOfficeEHFInvoice,
                    Name = "EHF-faktura",
                    Type = PaymentProviderType.Invoice,
                    Active = true
                }
            };

            _db.PaymentMethods.AddRange(methods);
            await _db.SaveChangesAsync();
        }

        // A new database has no organization, and the apps assume one exists.
        if (!await _db.Organizations.AnyAsync())
        {
            _db.Organizations.Add(new Organization { Name = "Eventuras", IsRoot = true });
            await _db.SaveChangesAsync();
        }
    }
}
