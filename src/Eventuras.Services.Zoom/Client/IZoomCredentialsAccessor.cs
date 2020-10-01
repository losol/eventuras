namespace Eventuras.Services.Zoom.Client
{
    internal interface IZoomCredentialsAccessor
    {
        public ZoomJwtCredentials GetJwtCredentials();
    }
}
