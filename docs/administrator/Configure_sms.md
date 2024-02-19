# Configure SMS

Eventuras uses Twilio to send SMS. To update settings you do `PUT {{Api base url}}/v3/organizations/1/settings` with the following bodies:

```json
{
  "name": "OrganizationTwilioSettings.Enabled",
  "value": "true"
}
```

```json
{
  "name": "OrganizationTwilioSettings.From",
  "value": "Sender name"
}
```

```json
{
  "name": "OrganizationTwilioSettings.Sid",
  "value": "1234"
}
```
