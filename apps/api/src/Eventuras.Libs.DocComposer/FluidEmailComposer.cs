using System.Threading;
using System.Threading.Tasks;
using AngleSharp;
using AngleSharp.Dom;

namespace Eventuras.Libs.DocComposer;

public sealed class FluidEmailComposer : IEmailComposer
{
    private readonly IDocumentComposer _documentComposer;

    public FluidEmailComposer(IDocumentComposer documentComposer)
    {
        _documentComposer = documentComposer;
    }

    public async Task<RenderedEmail> ComposeAsync<TModel>(
        string templateName,
        TModel model,
        string locale,
        CancellationToken cancellationToken = default)
    {
        var rendered = await _documentComposer.ComposeAsync(templateName, model, locale, cancellationToken);

        var document = await BrowsingContext.New(Configuration.Default)
            .OpenAsync(req => req.Content(rendered.Html), cancellationToken);
        var subject = document.Title?.Trim() ?? string.Empty;
        var bodyNode = document.Body ?? (INode)document.DocumentElement;
        var textBody = PlainTextExtractor.ExtractFromNode(bodyNode);

        return new RenderedEmail(subject, rendered.Html, textBody);
    }
}
