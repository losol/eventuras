using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Services.Registrations
{
    public interface IRegistrationExportService
    {
        Task ExportParticipantListToExcelAsync(Stream stream, Options options = null);

        public class Options
        {
            public int? EventInfoId { get; set; }

            public bool ExportHeader { get; set; }
        }
    }
}
