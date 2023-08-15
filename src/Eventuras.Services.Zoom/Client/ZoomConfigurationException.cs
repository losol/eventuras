using System;

namespace Eventuras.Services.Zoom.Client;

public class ZoomConfigurationException : Exception
{
    public ZoomConfigurationException(string message) : base(message) { }
}