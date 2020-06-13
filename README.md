# Eventuras - Event Management Solution

[![Build Status](https://travis-ci.com/losol/Eventuras.svg?branch=master)](https://travis-ci.com/losol/Eventuras)
[![Build status](https://losolio.visualstudio.com/Eventuras/_apis/build/status/legekurs%20-%20CI)](https://losolio.visualstudio.com/Eventuras/_build/latest?definitionId=11)

Asp.net core event management solution. In development now, using agile development.

## Quickstart

**Prerequisites:** `docker-compose`, 4GB RAM allocated to docker.

```bash
# Clone the repository
git clone https://github.com/losol/Eventuras.git
cd Eventuras

# Build and run the application
docker-compose build
docker-compose up
```

The application will now be live at `localhost:5100`.  
Use the following credentials to login:

```text
Username: admin@email.com
Password: Str0ng!PaSsw0rd
```

## Build & run from source

**Prerequisites:** .NET Core 2.x, Node, SQL Server

1. Clone the repository

    ```bash
    git clone https://github.com/losol/Eventuras.git
    cd Eventuras
    ```

1. Run tests

    ```bash
    ls tests/**/*.csproj | xargs -L1 dotnet test
    ```

1. Install node dependencies

    ```bash
    cd src/Eventuras.Web
    npm install
    ```

1. Run the gulp task

    ```bash
    ./node_modules/.bin/gulp
    ```

1. Configure the application following the steps [here](./docs/Setup/Install.md#configure-your-app). The complete application configuration is documented [here](./docs/Setup/Configuration.md).

1. Run the application

    ```bash
    # Ensure you're in the src/Eventuras.Web directory
    dotnet run
    ```

## Credits

-   Email templates from [https://www.sendwithus.com/resources/templates/neopolitan](SendWithUs.com), and [https://github.com/leemunroe]
