# Losol.Communication

[![Build status](https://ci.appveyor.com/api/projects/status/8024k9srg1u0aq9a?svg=true)](https://ci.appveyor.com/project/losolio/losol-communication)


```
// In Startup.cs in the ConfigureServices method
    services.AddScoped<IRegisterAccountService, RegisterAccountService>();
    services.AddScoped<IRazorViewToStringService, RazorViewToStringService>();

    services.AddTransient<IEmailSender, EmailSender>();
``` 

## Credits
* Scott Saubers tutorial: https://scottsauber.com/2018/07/07/walkthrough-creating-an-html-email-template-with-razor-and-razor-class-libraries-and-rendering-it-from-a-net-standard-class-library/
* Litmus email templates

