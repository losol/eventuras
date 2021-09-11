using System.Threading.Tasks;

namespace Eventuras.Services.Google.RecaptchaV3
{
    public interface IRecaptchaV3VerificationService
    {
        Task<bool> VerifyTokenAsync(string token);
    }
}
