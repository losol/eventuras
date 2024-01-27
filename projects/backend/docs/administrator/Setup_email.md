# Email setup

## Email configuration

Either Sengrid API or SMTP should be set up for each organization. To update settings you do `PUT {{Api base url}}/v3/organizations/1/settings?organizationId=<organizationId>` with the following body:

```json
{
    "name": "OrganizationSendGridSettings.FromName",
    "value": "Eventuras admin"
}
```

### Email over Sengrid API

-   OrganizationSendGridSettings.Enabled
-   OrganizationSendGridSettings.FromAddress
-   OrganizationSendGridSettings.FromName
-   OrganizationSendGridSettings.Key

### Email over SMTP

-   OrganizationSmtpSettings.Enabled
-   OrganizationSmtpSettings.FromAddress
-   OrganizationSmtpSettings.FromName
-   OrganizationSmtpSettings.Host
-   OrganizationSmtpSettings.Password
-   OrganizationSmtpSettings.Port
-   OrganizationSmtpSettings.User
