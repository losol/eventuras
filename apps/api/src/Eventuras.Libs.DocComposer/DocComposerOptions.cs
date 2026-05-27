using Microsoft.Extensions.FileProviders;

namespace Eventuras.Libs.DocComposer;

public sealed class DocComposerOptions
{
    public IFileProvider? TemplateFileProvider { get; set; }

    public string DefaultLocale { get; set; } = "en";
}
