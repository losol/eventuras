# Configuration

The JSON structure defines the configuration for the application.

```json
{
  "AppSettings": {
    "EmailProvider": "SendGrid|File|Mock",
    "SmsProvider": "Twilio|Mock"
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
  "SuperAdmin": {
    "Email": "admin@email.com",
    "Password": "Pa5sw0rd"
  },
  "Twilio":  {
    "From": "+15017250604",
    "Sid": "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "AuthToken": "auth_token"
  }
}
```

While most of the configuration rests in the `appsettings.json` files, sensitive information like API keys and passwords can reside in environment variables instead using `__` or `:` as property qualifier. The dotnet usersecrets tool maybe used in place of environment variables during development.
