using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;

namespace losol.EventManagement.Services.DbInitializers
{
    public class DefaultDbInitializer : ProductionDbInitializer 
    {
        public DefaultDbInitializer(ApplicationDbContext db, RoleManager<IdentityRole> roleManager,  UserManager<ApplicationUser> userManager, IOptions<DbInitializerOptions> config)
            : base(db, roleManager, userManager, config)
         { }
    }
}
