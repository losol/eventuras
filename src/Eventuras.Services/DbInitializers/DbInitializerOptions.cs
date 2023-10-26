namespace Eventuras.Services.DbInitializers
{
    public class DbInitializerOptions
    {
        public DefaultUser SuperAdmin { get; set; }


        public class DefaultUser
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }
    }
}
