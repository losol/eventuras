using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.WebApi.Tests;

public static class HttpResponseMessageExtensions
{
    public static async Task CheckNotificationResponse(
        this HttpResponseMessage response,
        TestServiceScope scope,
        params ApplicationUser[] recipientUsers) =>
        await response.CheckNotificationResponse(scope, recipientUsers.Length);

    public static async Task CheckNotificationResponse(
        this HttpResponseMessage response,
        TestServiceScope scope,
        int totalRecipients)
    {
        var token = await response.CheckOk().AsTokenAsync();
        token.CheckNotification(await scope.Db.Notifications
            .AsNoTracking()
            .OrderBy(n => n.Created)
            .LastAsync());
    }
}
