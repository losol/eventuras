# Setting up environment

## Production
* Set up Microsoft Sql Server
* Set up Azure web app
* Get an sendgrid user and api key

Set environment variables before first run:
* AdminEmail
* AdminPassword
* SendGridUser
* SendGridKey


## Development

To start building .NET apps you just need to download and install the [.NET SDK](https://www.microsoft.com/net/learn/get-started/)

Clone this app to your computer
* [Stable version](https://github.com/losol/Eventer/archive/master.zip)
* [Development version](https://github.com/losol/Eventer/archive/dev.zip)

You will need an sql server to get this solution functional. Recommended solution is sql server in docker.
[Instructions for installing Docker and Sql Server](./Install_docker _sql_server)

Set database connection string


Set admin user email and password
> dotnet user-secrets set AdminEmail asdf@email.com
> dotnet user-secrets set AdminPassword Pa$$w0rd

Set Sendgrid-settings by setting environment variables or in terminal: 
> dotnet user-secrets set SendGridUser asdf1234
> dotnet user-secrets set SendGridKey asdf1234