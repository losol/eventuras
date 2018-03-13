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

## Docker

Run the following to get the up and running on `localhost:5100`:
```bash
docker-compose build
docker-compose up
```

Ensure you got docker compose installed. You may need to allocate 4GB to docker to get SQL Server working.

## Development

### Using Docker

To start building .NET apps you just need to download and install the [.NET SDK](https://www.microsoft.com/net/learn/get-started/)

Clone this app to your computer
* [Stable version](https://github.com/losol/Eventer/archive/master.zip)
* [Development version](https://github.com/losol/Eventer/archive/dev.zip)

You will need an sql server to get this solution functional. Recommended solution is sql server in docker.
[Instructions for installing Docker and Sql Server](./Install_docker_sql_server.md)

### Configure your app
In development mode it is recommended to set options by dotnet user-secrets. In a terminal window at your root folder you may: 

Set database connection string
```bash
dotnet user-secrets set ConnectionStrings:DefaultConnection "Server=127.0.0.1,1401;Initial Catalog=EventDb;User ID=sa;Password=<Apples345#$%>"
```

Set admin user email and password
```bash
dotnet user-secrets set SuperAdmin:Email asdf@email.com
dotnet user-secrets set SuperAdmin:Password Pa$$w0rd
```

Set Sendgrid-settings by setting environment variables or in terminal: 
```
dotnet user-secrets set SendGrid:User asdf1234
dotnet user-secrets set SendGrid:Key asdf1234
```

### Run your app!

```
dotnet run
```