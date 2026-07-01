using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Services.Registrations.Notifications;
using Xunit;

namespace Eventuras.Services.Tests.Registrations;

public class RegistrationEmailRendererTest
{
    private readonly RegistrationEmailRenderer _renderer = new();

    [Fact]
    public async Task Receipt_Renders_Subject_Body_And_Nested_Order_Lines()
    {
        var model = new RegistrationReceiptEmailModel(
            EventTitle: "Introduction to Machine Learning",
            EventWhen: "01.02.2026",
            EventLocation: "Oslo",
            ParticipantName: "Alex Taylor",
            RegistrationType: "Participant",
            HasOrders: true,
            Lines: new List<ReceiptOrderLine>
            {
                new("Course pass", "Standard", 2, "1500 kr", "3000 kr")
            },
            Total: "3000 kr");

        var email = await _renderer.RenderReceiptAsync(model, "en");

        Assert.Contains("Introduction to Machine Learning", email.Subject);
        Assert.Contains("Alex Taylor", email.HtmlBody);
        // Nested order-line members render -> DocComposer registered the nested type.
        Assert.Contains("Course pass", email.HtmlBody);
        Assert.Contains("Standard", email.HtmlBody);
        Assert.Contains("3000 kr", email.HtmlBody);
        // Signature no longer names Eventuras.
        Assert.DoesNotContain("Eventuras", email.HtmlBody);
    }

    [Fact]
    public async Task Waitlist_Renders_Waiting_List_Message()
    {
        var model = new RegistrationWaitlistEmailModel("Foundations of Statistics", "01.02.2026", "Alex Taylor");

        var email = await _renderer.RenderWaitlistAsync(model, "nb");

        Assert.Contains("Foundations of Statistics", email.Subject);
        Assert.Contains("venteliste", email.HtmlBody);
        Assert.Contains("Alex Taylor", email.HtmlBody);
    }

    [Fact]
    public async Task Unknown_Locale_Falls_Back_To_Default()
    {
        var model = new RegistrationWaitlistEmailModel("Foundations of Statistics", null, "Alex Taylor");

        var email = await _renderer.RenderWaitlistAsync(model, "de");

        Assert.Contains("venteliste", email.HtmlBody);
    }
}
