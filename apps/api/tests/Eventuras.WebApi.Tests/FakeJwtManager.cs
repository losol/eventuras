using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace Eventuras.WebApi.Tests
{
    // https://auth0.com/blog/xunit-to-test-csharp-code/

    public static class FakeJwtManager
    {
        public static string Issuer { get; } = Guid.NewGuid().ToString();
        public static string Audience { get; } = Guid.NewGuid().ToString();
        public static SecurityKey SecurityKey { get; }
        public static SigningCredentials SigningCredentials { get; }

        private static readonly JwtSecurityTokenHandler TokenHandler = new JwtSecurityTokenHandler();
        private static readonly RandomNumberGenerator Generator = RandomNumberGenerator.Create();
        private static readonly byte[] Key = new byte[32];

        static FakeJwtManager()
        {
            Generator.GetBytes(Key);
            SecurityKey = new SymmetricSecurityKey(Key)
            {
                KeyId = Guid.NewGuid().ToString()
            };
            SigningCredentials = new SigningCredentials(SecurityKey,
                SecurityAlgorithms.HmacSha256);
        }

        public static string GenerateJwtToken(params Claim[] claims)
        {
            return TokenHandler.WriteToken(new JwtSecurityToken(
                Issuer, Audience, claims, null,
                DateTime.UtcNow.AddMinutes(10), SigningCredentials));
        }
    }
}
