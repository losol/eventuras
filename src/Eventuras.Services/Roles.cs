namespace Eventuras.Services
{
    public class Roles
    {
        public const string Admin = "Admin";
        public const string SuperAdmin = "SuperAdmin";
        public const string SystemAdmin = "SystemAdmin";

        public static string[] All => new[] {Admin, SuperAdmin, SystemAdmin};
    }
}