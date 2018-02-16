# Installing SQL Server Linux in docker

SQL Server runs on running on Linux based on Ubuntu 16.04. It can be used with the Docker Engine 1.8+ on Linux or on Docker for Mac/Windows.

## Docker Community Edition
Install [Docker Community Edition](https://www.docker.com/community-edition)

## Sql Server in Docker
Install Sql Server by running commands in terminal: 
1. sudo docker pull microsoft/mssql-server-linux:2017-latest
2. sudo docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=<Strong!Passw0rd>' \
   -p 1401:1433 --name sql1 \
   -d microsoft/mssql-server-linux:2017-latest

Check that the docker is up with 'sudo docker ps -a'.

Change password for the sa user: 
sudo docker exec -it sql1 /opt/mssql-tools/bin/sqlcmd \
   -S localhost -U SA -P 'Strong!Passw0rd>' \
   -Q 'ALTER LOGIN SA WITH PASSWORD="<Apples345#$%>"'

Connect to the server: 
* sudo docker exec -it sql1 "bash"
* /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P '<Apples345#$%>'

Create a database for the app: 
* CREATE DATABASE EventDB
* GO

The connectionstring for use in your app will now be: 
'dotnet user-secrets set DefaultConnection "Server=127.0.0.1;Port=1401;Database=EventDb;User=sa;Password=<Apples345#$%>;"'

An alternative for running commands is to download the SQL Server Command line tools:
* Mac OS https://blogs.technet.microsoft.com/dataplatforminsider/2017/04/03/sql-server-command-line-tools-for-mac-preview-now-available/ 
* Windows: https://www.microsoft.com/en-us/download/details.aspx?id=53591


Source: Microsoft docs. Run the SQL Server 2017 container image with Docker. 
https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker
