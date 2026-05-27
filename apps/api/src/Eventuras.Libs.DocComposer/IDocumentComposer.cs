using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Libs.DocComposer;

public interface IDocumentComposer
{
    Task<RenderedDocument> ComposeAsync<TModel>(
        string templateName,
        TModel model,
        string locale,
        CancellationToken cancellationToken = default);
}
