# Configuration

The JSON structure defines the configuration for the application.

```json
{
  "Site": {
    "Title": "Site Title",
    "Description": "Site description text goes here."
  },
  "AppSettings": {
    "EmailProvider": "SendGrid|SMTP|File|Mock",
    "SmsProvider": "Twilio|Mock",
    "UsePowerOffice": "false|true",
    "UseTalentLms": "false|true"
  },
  "Logging": {
    "IncludeScopes": false,
    "LogLevel": {
      "Default": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=127.0.0.1,1401;Database=EventDb;User ID=sa;Password=pass"
  },
  "SendGrid": {
    "EmailAddress": "hello@kursinord.no",
    "Name": "Jane Doe",
    "User": "asdf1234",
    "Key": "asdf1234"
  },
  "Smtp": {
    "Host": "smtp.sendgrid.net",
    "Port": 587,
    "From": "hello@its.me",
    "Username": "janedoe",
    "Password": "XUzTNrZm"
  },
  "SuperAdmin": {
    "Email": "admin@email.com",
    "Password": "Pa5sw0rd"
  },
  "Twilio":  {
    "From": "+15017250604",
    "Sid": "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "AuthToken": "auth_token"
  },
  "PowerOffice": {
    "ApplicationKey": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "ClientKey": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "Mode": "Production|Test|Beta|Demo|Debug",
    "TokenStoreName": "name.tokenstore"
  },
  "TalentLms": {
    "Domain": "appname.talentlms.com",
    "ApiKey": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }
}
```

While most of the configuration rests in the `appsettings.json` files, sensitive information like API keys and passwords can reside in environment variables instead using `__` or `:` as property qualifier. The dotnet usersecrets tool maybe used in place of environment variables during development.
