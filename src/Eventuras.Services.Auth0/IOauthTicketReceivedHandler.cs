using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;

namespace Eventuras.Services.Auth0;

internal interface IOauthTicketReceivedHandler
{
    Task TicketReceivedAsync(TicketReceivedContext context);
}