namespace Eventuras.AppHost;

/// <summary>
/// The environment the Playwright suite needs, written to tests/e2e/.env.
///
/// The suite can be started as a resource, which carries the same values, but the
/// everyday loop is a terminal: a single spec, --ui, --headed. Those runs read the
/// file, so `pnpm test` works without repeating the stack's URLs and ports by hand.
///
/// Rewritten on every start, because the values describe this stack and must not
/// survive it. The file is gitignored; anything of your own belongs in the
/// environment, which the Playwright config leaves untouched.
/// </summary>
internal static class E2EEnvironmentFile
{
    public static void Write(string appHostDirectory, IReadOnlyDictionary<string, string> environment)
    {
        var path = Path.GetFullPath(Path.Combine(appHostDirectory, "../../../../tests/e2e/.env"));
        var directory = Path.GetDirectoryName(path);

        if (directory is null || !Directory.Exists(directory))
        {
            return;
        }

        var lines = new List<string>
        {
            "# Written by the Aspire AppHost on every start. Edits are lost; set your own",
            "# values in the environment instead, which the Playwright config leaves alone.",
            ""
        };
        lines.AddRange(environment.Select(pair => $"{pair.Key}={pair.Value}"));

        try
        {
            File.WriteAllLines(path, lines);
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            // A convenience for terminal runs, and the resource carries the same values, so a
            // read-only or locked file is no reason to refuse to start the stack.
            Console.Error.WriteLine($"Could not write {path}: {exception.Message}");
        }
    }
}
