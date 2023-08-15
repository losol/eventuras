using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Pathoschild.Http.Client;
using ZoomNet;
using ZoomNet.Models;

namespace Eventuras.Services.Zoom.Client;

internal class ZoomApiClient : IZoomApiClient
{
    private readonly IZoomCredentialsAccessor _zoomCredentialsAccessor;

    /// <summary> encapsulate third party code, don't expose its API, make it replaceable. </summary>
    private ZoomClient _thirdPartyClient;

    public ZoomApiClient(IZoomCredentialsAccessor zoomCredentialsAccessor)
    {
        _zoomCredentialsAccessor = zoomCredentialsAccessor ?? throw new ArgumentNullException(nameof(zoomCredentialsAccessor));
    }

    public async Task HealthCheckAsync(CancellationToken cancellationToken)
    {
        try
        {
            var client = await GetClientAsync();
            await client.Meetings.GetAllAsync("me", pagingToken: null, cancellationToken: cancellationToken);
        }
        catch (ApiException e) { throw new ZoomClientException("Failed to perform Zoom API health check", e); }
    }

    public async Task<MeetingRegistrantDto[]> ListMeetingRegistrantsAsync(long meetingId, CancellationToken cancellationToken)
    {
        var result = new List<MeetingRegistrantDto>();

        string nextPageToken = null;

        try
        {
            PaginatedResponseWithToken<Registrant> paginatedResponse;

            do
            {
                var client = await GetClientAsync();
                paginatedResponse = await client.Meetings.GetRegistrantsAsync(meetingId,
                    RegistrantStatus.Approved,
                    pagingToken: nextPageToken,
                    cancellationToken: cancellationToken);

                nextPageToken = paginatedResponse.NextPageToken;

                result.AddRange(paginatedResponse.Records.Select(r => new MeetingRegistrantDto
                    {
                        Email = r.Email,
                        RegistrantId = r.Id,
                    })
                    .ToArray());
            }
            while (paginatedResponse.MoreRecordsAvailable);
        }
        catch (ApiException e) { throw new ZoomClientException($"Failed to retrieve registrants for meeting {meetingId}", e); }

        return result.ToArray();
    }

    public async Task<CreateMeetingRegistrantsResponseDto> CreateMeetingRegistrantsAsync(
        long meetingId,
        CreateMeetingRegistrantRequestDto requestDto,
        CancellationToken cancellationToken)
    {
        try
        {
            var client = await GetClientAsync();
            var registrant = await client.Meetings.AddRegistrantAsync(meetingId,
                requestDto.Email,
                requestDto.FirstName,
                requestDto.LastName,
                cancellationToken: cancellationToken);

            return new CreateMeetingRegistrantsResponseDto
            {
                MeetingId = meetingId,
                RegistrantId = registrant.Id,
            };
        }
        catch (ApiException e) { throw new ZoomClientException($"Failed to create new registrant {requestDto.Email} for meeting {meetingId}", e); }
    }

    private async Task<ZoomClient> GetClientAsync()
    {
        if (_thirdPartyClient != null) return _thirdPartyClient;

        var zoomCredentials = await _zoomCredentialsAccessor.GetJwtCredentialsAsync();

        return _thirdPartyClient = new ZoomClient(new JwtConnectionInfo(zoomCredentials.ApiKey, zoomCredentials.ApiSecret));
    }
}