# Eventuras - Event and Course Management Solution

![.NET Core CI](https://github.com/losol/eventuras/workflows/.NET%20Core%20CI/badge.svg)
![Docker Image CI](https://github.com/losol/eventuras/workflows/Docker%20Image%20CI/badge.svg)

Event and Course management solution.

## Quickstart

**Prerequisites:** `docker-compose`, 4GB RAM allocated to docker.

```bash
# Clone the repository
git clone https://github.com/losol/eventuras.git
cd eventuras

# Build and run the application
docker-compose up
```

The application will now be live at `localhost:5100`.  
Use the following credentials to login:

```text
Username: admin@email.com
Password: Str0ng!PaSsw0rd
```

## Build & run from source

**Prerequisites:** .NET Core 3.x, Postgres SQL server

1. Clone the repository

    ```bash
    git clone https://github.com/losol/eventuras.git
    cd eventuras
    ```

1. Set up postgres database. By default the application connects to

    - Database `eventuras`
    - Username `eventuras`
    - Password `Str0ng!PaSsw0rd`

1. After running the application, you could add events at the url `http://localhost:5555/admin/events`.
    - Username `admin@email.com`
    - Password `Str0ng!PaSsw0rd`

## Credits

-   Email templates from [https://www.sendwithus.com/resources/templates/neopolitan](SendWithUs.com), and [https://github.com/leemunroe]
