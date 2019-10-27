# Losol.Communication



```
// In Startup.cs in the ConfigureServices method
    services.AddScoped<IRegisterAccountService, RegisterAccountService>();
    services.AddScoped<IRazorViewToStringService, RazorViewToStringService>();

    services.AddTransient<IEmailSender, EmailSender>();
``` 

## Credits
* Scott Saubers tutorial: https://scottsauber.com/2018/07/07/walkthrough-creating-an-html-email-template-with-razor-and-razor-class-libraries-and-rendering-it-from-a-net-standard-class-library/
* Litmus email templates

