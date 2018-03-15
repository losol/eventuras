# Installing SQL Server Linux in docker

## Prerequisites

Docker for Mac, Docker for Windows or Docker Engine 1.8+ for Linux.

## Setting up mssql on Docker

1. Start Docker.
2. Setup an `mssql` container.

```bash
# Create mssql and install SQL Server 2017 for Linux
docker pull microsoft/mssql-server-linux:2017-latest
docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=<Strong!Passw0rd>' \
   -p 1401:1433 --name mssql \
   -d microsoft/mssql-server-linux:2017-latest
```



3. Create our database and change sa password
```bash
# Connect to the mssql container
docker exec -it mssql "bash"
# Connect to SQL Server
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P '<Strong!Passw0rd>'
```

```sql
-- Create the EventDB database for the app
CREATE DATABASE EventDB
GO
```

4. Change the password (optional)

```sql
-- Change the password to <Apples345#$%>
ALTER LOGIN SA WITH PASSWORD="<Apples345#$%>"
GO
```

You may now exit the SQL session using `quit` and then the bash session using `exit`.

The connection string will now be:
```
Server=127.0.0.1,1401;Database=EventDB;User=sa;Password=<Apples345#$%>;
```

## Using the mssql container

You now can start this container anytime using:

```bash
docker start mssql
```

To run interactive sql
```bash
# Connect to the mssql container
docker exec -it mssql "bash"
# Connect to SQL Server
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P '<Apples345#$%>'
```

To stop use:

```bash
docker stop mssql
```

To see the running containers:

```
docker ps
```

To see all containers:

```
docker ps -a
```

To remove `mssql` container (and its data):

```bash
docker rm mssql
```

## Related links

* Docker: https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker
* Mac OS: https://blogs.technet.microsoft.com/dataplatforminsider/2017/04/03/sql-server-command-line-tools-for-mac-preview-now-available/
* Windows: https://www.microsoft.com/en-us/download/details.aspx?id=53591
