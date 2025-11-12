using System.Threading;
using System.Threading.Tasks;
using Losol.Communication.Sms;

namespace Eventuras.Services.Sms;

public interface IConfigurableSmsSenderComponent
{
    /// <summary>
    ///     Creates new SMS sender, depending on organization settings.
    ///     If all settings are disabled, returns <c>null</c>.
    /// </summary>
    /// <returns>New <see cref="ISmsSender" /> or <c>null</c>.</returns>
    Task<ISmsSender> CreateSmsSenderAsync(int orgId, CancellationToken cancellationToken = default);
}
