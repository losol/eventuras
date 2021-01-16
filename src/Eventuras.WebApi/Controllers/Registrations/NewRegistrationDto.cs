namespace Eventuras.WebApi.Controllers.Registrations
{
    public class NewRegistrationDto : RegistrationFormDto
    {
        public string UserId { get; set; }

        public int EventId { get; set; }
    }
}