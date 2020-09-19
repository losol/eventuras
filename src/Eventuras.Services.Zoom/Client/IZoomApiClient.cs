using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Zoom.Client
{
    internal interface IZoomApiClient
    {
        Task HealthCheckAsync(CancellationToken cancellationToken = default);

        Task<MeetingRegistrantDto[]> ListMeetingRegistrantsAsync(
            long meetingId,
            CancellationToken cancellationToken = default);

        Task<CreateMeetingRegistrantsResponseDto> CreateMeetingRegistrantsAsync(
            long meetingId,
            CreateMeetingRegistrantRequestDto requestDto,
            CancellationToken cancellationToken = default);
    }
}
