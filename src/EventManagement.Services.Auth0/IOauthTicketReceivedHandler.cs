using Microsoft.AspNetCore.Authentication;
using System.Threading.Tasks;

namespace EventManagement.Services.Auth0
{
    internal interface IOauthTicketReceivedHandler
    {
        Task TicketReceivedAsync(TicketReceivedContext context);
    }
}
