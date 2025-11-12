using System.Threading;
using System.Threading.Tasks;
using Losol.Communication.Email;

namespace Eventuras.Services.Email;

public interface IConfigurableEmailSenderComponent
{
    /// <summary>
    ///     Creates new email sender, depending on organization settings.
    ///     If all settings are disabled, returns <c>null</c>.
    /// </summary>
    /// <returns>New <see cref="IEmailSender" /> or <c>null</c>.</returns>
    Task<IEmailSender> CreateEmailSenderAsync(int? organizationId = null,
        CancellationToken cancellationToken = default);
}
