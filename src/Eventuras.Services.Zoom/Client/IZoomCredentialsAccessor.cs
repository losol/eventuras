using System.Threading.Tasks;

namespace Eventuras.Services.Zoom.Client;

internal interface IZoomCredentialsAccessor
{
    Task<ZoomJwtCredentials> GetJwtCredentialsAsync();
}