using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Services.Registrations;

public interface IRegistrationExportService
{
    Task ExportParticipantListToExcelAsync(Stream stream, RegistrationListRequest request);
}
