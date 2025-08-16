using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Certificates;
public interface ICertificateManagementService
{
    Task UpdateCertificateAsync(Certificate certificate);
}
