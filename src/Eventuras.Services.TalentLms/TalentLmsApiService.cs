using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace Eventuras.Services.TalentLms;

internal class TalentLmsApiService : ITalentLmsApiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IOptions<TalentLmsSettings> _options;
    private readonly ILogger<TalentLmsApiService> _logger;

    public TalentLmsApiService(IHttpClientFactory httpClientFactory, IOptions<TalentLmsSettings> options, ILogger<TalentLmsApiService> logger)
    {
        _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        _options = options ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<TalentLmsUserDto> UserSignUpAsync(TalentLmsUserSignUpRequest request)
    {
        ValidationHelper.ValidateObject(request);
        return await PostAsync<TalentLmsUserDto>("usersignup",
            new[]
            {
                new KeyValuePair<string, string>("first_name", request.FirstName),
                new KeyValuePair<string, string>("last_name", request.LastName),
                new KeyValuePair<string, string>("email", request.Email),
                new KeyValuePair<string, string>("login", request.Login),
                new KeyValuePair<string, string>("password", request.Password),
            });
    }

    public async Task<TalentLmsEnrollmentDto> EnrollUserToCourseAsync(TalentLmsEnrollmentDto request)
    {
        ValidationHelper.ValidateObject(request);

        if (!TalentLmsEnrollmentDto.Learner.Equals(request.Role) && !TalentLmsEnrollmentDto.Instructor.Equals(request.Role))
            throw new ValidationException($"Invalid enrollment role: {request.Role}");

        var response = await PostAsync<TalentLmsEnrollmentDto[]>("addusertocourse",
            new[]
            {
                new KeyValuePair<string, string>("user_id", request.UserId),
                new KeyValuePair<string, string>("course_id", request.CourseId),
                new KeyValuePair<string, string>("role", request.Role),
            });

        if (!response.Any()) throw new TalentLmsException("Empty response returned by enrollment method");

        return response.First();
    }

    public async Task DeleteUserAsync(string userId, string deletedByUserId)
    {
        if (string.IsNullOrEmpty(userId)) throw new ArgumentException(nameof(userId));

        if (string.IsNullOrEmpty(deletedByUserId)) throw new ArgumentException(nameof(deletedByUserId));

        await PostAsync<TalentLmsDeleteUserResponse>("deleteuser",
            new[]
            {
                new KeyValuePair<string, string>("user_id", userId),
                new KeyValuePair<string, string>("deleted_by_user_id", deletedByUserId),
            });
    }

    public async Task<TalentLmsUserDto[]> ListAllUsersAsync() => await GetAsync<TalentLmsUserDto[]>("users");

    private async Task<T> GetAsync<T>(string apiMethod)
    {
        var httpClient = _httpClientFactory.CreateTalentLmsHttpClient(_options.Value);
        var response = await httpClient.GetAsync(apiMethod);
        return await ReadTalentLmsResponseAsync<T>(response);
    }

    private async Task<T> PostAsync<T>(string apiMethod, IEnumerable<KeyValuePair<string, string>> postParams)
    {
        var httpClient = _httpClientFactory.CreateTalentLmsHttpClient(_options.Value);
        var response = await httpClient.PostAsync(apiMethod, new FormUrlEncodedContent(postParams));
        return await ReadTalentLmsResponseAsync<T>(response);
    }

    private async Task<T> ReadTalentLmsResponseAsync<T>(HttpResponseMessage response)
    {
        var responseText = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("{statusCode} status code returned by TalentLMS endpoint ({responseText})", response.StatusCode, responseText);

            switch (response.StatusCode)
            {
                case HttpStatusCode.BadRequest:
                    throw new TalentLmsException(
                        $"A required parameter is missing or an invalid type (e.g.a string) was supplied instead of an integer ({responseText})");

                case HttpStatusCode.Unauthorized: throw new TalentLmsException($"Invalid API key provided ({responseText})");

                case HttpStatusCode.Forbidden:
                    throw new TalentLmsException($"API is not enabled for the specified domain or the domain is currently inactive ({responseText})");

                case HttpStatusCode.NotFound: throw new TalentLmsException($"The requested resource (e.g. user) does not exist ({responseText})");

                case HttpStatusCode.InternalServerError: throw new TalentLmsException($"Internal server error ({responseText})");

                default: throw new TalentLmsException($"Unrecognized server response ({responseText})");
            }
        }

        try
        {
            var result = JsonConvert.DeserializeObject<T>(responseText);
            if (result == null) throw new TalentLmsException($"Failed to read TalentLMS response: {responseText}");

            ValidationHelper.ValidateObject(result);
            return result;
        }
        catch (JsonException e) { throw new TalentLmsException($"Failed to read TalentLMS response: {responseText}", e); }
        catch (ValidationException e) { throw new TalentLmsException($"TalentLMS returned invalid response: {responseText}", e); }
    }
}