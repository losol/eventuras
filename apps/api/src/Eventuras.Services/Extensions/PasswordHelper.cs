using System;
using System.Text;

namespace Eventuras.Services.Extensions;

public static class PasswordHelper
{
    public static string GeneratePassword(int length = 6)
    {
        string[] randomChars =
        {
            "ABCDEFGHJKLMNPQRSTUVWXYZ", // uppercase 
            "abcdefghijkmnpqrstuvwxyz", // lowercase
            "123456789" // digits
        };

        var rand = new Random(Environment.TickCount);
        var builder = new StringBuilder();

        for (var i = 0; i < length; i++)
        {
            var rcs = randomChars[rand.Next(randomChars.Length)];
            builder.Append(rcs[rand.Next(rcs.Length)]);
        }

        return builder.ToString();
    }
}
