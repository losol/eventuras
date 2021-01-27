namespace Eventuras.TestAbstractions
{
    public static class TestingConstants
    {
        public const string Placeholder = "__Placeholder__";
        public const string SuperAdminEmail = "super-admin@email.com";
        public const string SuperAdminPassword = "MySuperSecretKey1!";

        public static readonly string[] DefaultScopes = {
            "events:read",
            "events:write",
            "registrations:read",
            "registrations:write",
            "users:read",
            "users:write"
        };

        public const string DefaultPassword = "MySuperSecretPassword1!";
    }
}
