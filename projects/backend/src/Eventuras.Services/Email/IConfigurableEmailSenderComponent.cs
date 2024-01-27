using Losol.Communication.Email;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Email
{
    public interface IConfigurableEmailSenderComponent
    {
        /// <summary>
        /// Creates new email sender, depending on organization settings.
        /// If all settings are disabled, returns <c>null</c>.
        /// </summary>
        /// <returns>New <see cref="IEmailSender"/> or <c>null</c>.</returns>
        Task<IEmailSender> CreateEmailSenderAsync(CancellationToken cancellationToken = default);
    }
}
