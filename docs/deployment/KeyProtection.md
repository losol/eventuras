# Configuring key data protection

For production deployments, it is important to configure the data protection system to persist keys to a location that is not lost when the application is restarted.

Configures the data protection system to persist keys to the specified directory. This path may be on the local machine or may point to a UNC share.

To enable storage of keys in a directory, set the folder name in `appSettings__DataProtectionKeysFolder`. The folder must exist and the application must have write permissions to it.

```json
{
  "AppSettings": {
    "DataProtectionKeysFolder": "/var/eventuras/dataprotectionkeys"
  }
}
```
