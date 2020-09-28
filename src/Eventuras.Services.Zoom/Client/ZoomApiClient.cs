using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Pathoschild.Http.Client;
using ZoomNet;
using ZoomNet.Models;

namespace Eventuras.Services.Zoom.Client
{
    internal class ZoomApiClient : IZoomApiClient
    {
        private readonly ZoomClient _thirdPartyClient; // encapsulate third party code, don't expose its API, make it replaceable

        public ZoomApiClient(IOptions<ZoomSettings> options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }
            _thirdPartyClient = new ZoomClient(new JwtConnectionInfo(options.Value.ApiKey, options.Value.ApiSecret));
        }

        public async Task HealthCheckAsync(CancellationToken cancellationToken)
        {
            try
            {
                await _thirdPartyClient.Meetings.GetAllAsync("me", pagingToken: null, cancellationToken: cancellationToken);
            }
            catch (ApiException e)
            {
                throw new ZoomClientException("Failed to perform Zoom API health check", e);
            }
        }

        public async Task<MeetingRegistrantDto[]> ListMeetingRegistrantsAsync(
            long meetingId,
            CancellationToken cancellationToken)
        {
            var result = new List<MeetingRegistrantDto>();

            string nextPageToken = null;

            try
            {
                PaginatedResponseWithToken<Registrant> paginatedResponse;

                do
                {
                    paginatedResponse = await _thirdPartyClient.Meetings.GetRegistrantsAsync(meetingId,
                        RegistrantStatus.Approved,
                        pagingToken: nextPageToken,
                        cancellationToken: cancellationToken);

                    nextPageToken = paginatedResponse.NextPageToken;

                    result.AddRange(paginatedResponse.Records.Select(r => new MeetingRegistrantDto
                    {
                        Email = r.Email,
                        RegistrantId = r.Id
                    }).ToArray());

                } while (paginatedResponse.MoreRecordsAvailable);
            }
            catch (ApiException e)
            {
                throw new ZoomClientException($"Failed to retrieve registrants for meeting {meetingId}", e);
            }

            return result.ToArray();
        }

        public async Task<CreateMeetingRegistrantsResponseDto> CreateMeetingRegistrantsAsync(
            long meetingId,
            CreateMeetingRegistrantRequestDto requestDto,
            CancellationToken cancellationToken)
        {
            try
            {
                var registrant = await _thirdPartyClient.Meetings.AddRegistrantAsync(meetingId,
                    requestDto.Email,
                    requestDto.FirstName,
                    requestDto.LastName,
                    cancellationToken: cancellationToken);

                return new CreateMeetingRegistrantsResponseDto
                {
                    MeetingId = meetingId,
                    RegistrantId = registrant.Id
                };
            }
            catch (ApiException e)
            {
                throw new ZoomClientException($"Failed to create new registrant {requestDto.Email} for meeting {meetingId}", e);
            }
        }
    }
}
