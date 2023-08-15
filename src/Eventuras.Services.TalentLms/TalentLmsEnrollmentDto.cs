using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Eventuras.Services.TalentLms;

internal class TalentLmsEnrollmentDto
{
    public const string Learner = "learner";
    public const string Instructor = "instructor";

    [Required]
    [JsonProperty("user_id")]
    public string UserId { get; set; }

    [Required]
    [JsonProperty("course_id")]
    public string CourseId { get; set; }

    [Required]
    [JsonProperty("role")]
    public string Role { get; set; } = Learner;
}