using System.Diagnostics;

namespace Eventuras.AppHost;

/// <summary>
/// TLS material for the development Keycloak.
///
/// Keycloak has to serve HTTPS locally: the web app's OIDC client refuses a
/// plain-http issuer, and the API validates the issuer's metadata over TLS. So
/// both runtimes must trust whatever Keycloak presents.
///
/// The ASP.NET Core development certificate is the one certificate a .NET
/// machine already trusts, which is why it is reused here rather than a
/// freshly generated self-signed one: `dotnet dev-certs https --trust` is a
/// step developers already run, and it makes the API's metadata fetch work
/// with no further configuration. Node does not read the OS trust store, so
/// the web app points NODE_EXTRA_CA_CERTS at the same PEM.
/// </summary>
internal static class DevCertificate
{
    /// <summary>Exports the dev certificate as PEM, returning the directory holding it.</summary>
    public static string Export(string appHostDirectory)
    {
        var directory = Path.Combine(appHostDirectory, ".certs");
        Directory.CreateDirectory(directory);

        var certificate = Path.Combine(directory, "kc.pem");
        var key = Path.Combine(directory, "kc.key");

        // Re-export whenever either half is missing; `dotnet dev-certs` is cheap
        // and this keeps a half-written export from wedging startup.
        if (File.Exists(certificate) && File.Exists(key))
        {
            return directory;
        }

        File.Delete(certificate);
        File.Delete(key);

        var exit = Run("dotnet", $"dev-certs https --export-path \"{certificate}\" --format PEM --no-password");
        if (exit != 0 || !File.Exists(certificate) || !File.Exists(key))
        {
            throw new InvalidOperationException(
                "Could not export the ASP.NET Core development certificate. "
                    + "Run `dotnet dev-certs https --trust` once, then start the AppHost again.");
        }

        return directory;
    }

    private static int Run(string fileName, string arguments)
    {
        using var process = Process.Start(
            new ProcessStartInfo(fileName, arguments) { RedirectStandardOutput = true, RedirectStandardError = true })
            ?? throw new InvalidOperationException($"Could not start `{fileName}`.");

        process.WaitForExit();
        return process.ExitCode;
    }
}
