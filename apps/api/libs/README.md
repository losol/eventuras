# Losol.Communication

![](https://github.com/losol/Losol.Communication/workflows/Build/badge.svg)

## Email Services

Services available:

* [Mock](#email-mock) - used for integration testing purpose.
* [File](#email-file) - write email text to filesystem.
* [SMTP](#email-smtp) - send email through SMTP server. 
* [SendGrid](#email-sendgrid) - send email using SendGrid API.

### <a name="email-mock"></a> Mock

NuGet Console

```
Install-Package Losol.Communication.Email.Mock
```
 
`Startup.cs`

 ```
using Losol.Communication.Email.Mock;
...
services.AddMockEmailServices();
``` 

### <a name="email-file"></a>File

NuGet Console 

```
Install-Package Losol.Communication.Email.File
```

`appsettings.json`

```
{
    "Files": {
        "FilePath": "Path/To/EmailOutputDir"
    }
}
```

`Startup.cs`

 ```
using Losol.Communication.Email.File;
...
services.AddFileEmailServices(Configuration.GetSection("Files"));
```

### <a name="email-smtp"></a>SMTP

NuGet Console 

```
Install-Package Losol.Communication.Email.Smtp
```

`appsettings.json`

```
{
    "Smtp": {
        "Host": "smtp.host.com",
        "Port": 587,
        "From": "from@email.com",
        "Username": "smtpusername",
        "Password": "smtppassword"
    }
}
```

`Startup.cs`

 ```
using Losol.Communication.Email.Smtp;
...
services.AddSmtpEmailServices(Configuration.GetSection("Smtp"));
```

### <a name="email-sendgrid"></a>SendGrid

NuGet Console 

```
Install-Package Losol.Communication.Email.SendGrid
```

`appsettings.json`

```
{
    "SendGrid": {
        "User": "...",
        "Key": "...",
        "EmailAddress": "from@email.com",
        "Name": "From Name"
    }
}
```

`Startup.cs`

 ```
using Losol.Communication.Email.SendGrid;
...
services.AddSendGridEmailServices(Configuration.GetSection("SendGrid"));
```

## SMS Services

Services available:

* [Mock](#sms-mock) - used for integration testing purpose.
* [Twilio](#sms-twilio) - send SMSes using Twilio API.

### <a name="sms-mock"></a>Mock 

NuGet Console 

```
Install-Package Losol.Communication.Sms.Mock
```

`Startup.cs`

 ```
using Losol.Communication.Sms.Mock;
...
services.AddMockSmsServices();
```

### <a name="sms-twilio"></a>Twilio 

NuGet Console 

```
Install-Package Losol.Communication.Sms.Twilio
```

`appsettings.json`

```
{
    "Twilio": {
        "From": "+XXXXXXXXXXX",
        "Sid": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "AuthToken": "auth_token"
    }
}
```

`Startup.cs`

 ```
using Losol.Communication.Sms.Twilio;
...
services.AddTwilioSmsServices(Configuration.GetSection("Twilio"));
```
