# Installing SQL Server Linux in docker

## Prerequisites

Docker for Mac, Docker for Windows or Docker Engine 1.8+ for Linux.

## Setting up mssql on Docker

1. Start Docker.
2. Setup an `mssql` container.

```bash
# Create mssql and install SQL Server 2017 for Linux
docker pull mcr.microsoft.com/mssql/server:2019-latest
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Strong#Passw0rd" -p 1433:1433 --name eventdb -d mcr.microsoft.com/mssql/server:2019-latest
```



3. Create our database and change sa password
```bash
# Connect to the mssql container
docker exec -it eventdb "bash"
# Connect to SQL Server
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Strong#Passw0rd'
```

```sql
-- Create the EventDB database for the app
CREATE DATABASE eventuras
GO
```

4. Change the password (optional)

```sql
-- Change the password to 1Super#Secret!
ALTER LOGIN SA WITH PASSWORD="1Super#Secret!"
GO
```

You may now exit the SQL session using `quit` and then the bash session using `exit`.

The connection string will now be:
```
Server=event_db,1433;Database=eventuras;User Id=sa;Password=1Super#Secret!;Trusted_Connection=False;
```

## Using the mssql container

You now can start this container anytime using:

```bash
docker start eventdb
```

To run interactive sql
```bash
# Connect to the mssql container
docker exec -it eventdb "bash"
# Connect to SQL Server
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P '1Super#Secret!'
```

To stop use:

```bash
docker stop eventdb
```

To see the running containers:

```
docker ps
```

To see all containers:

```
docker ps -a
```

To remove `eventdb` container (and its data):

```bash
docker rm eventdb
```

## Related links

* Docker: https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker
* Mac OS: https://blogs.technet.microsoft.com/dataplatforminsider/2017/04/03/sql-server-command-line-tools-for-mac-preview-now-available/
* Windows: https://www.microsoft.com/en-us/download/details.aspx?id=53591
