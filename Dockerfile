#
# Stage 0
# Build the project
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /app/src

# copy csproj and restore dependencies
COPY ./EventManagement.sln .
COPY ./src/EventManagement.Web/*.csproj ./src/EventManagement.Web/
COPY ./src/EventManagement.Services/*.csproj ./src/EventManagement.Services/
COPY ./src/EventManagement.Services.Converto/*.csproj ./src/EventManagement.Services.Converto/
COPY ./src/EventManagement.Infrastructure/*.csproj ./src/EventManagement.Infrastructure/
COPY ./src/EventManagement.Domain/*.csproj ./src/EventManagement.Domain/
COPY ./tests/EventManagement.UnitTests/*.csproj ./tests/EventManagement.UnitTests/
COPY ./tests/EventManagement.IntegrationTests/*.csproj ./tests/EventManagement.IntegrationTests/
COPY ./tests/EventManagement.Services.Converto.Tests/*.csproj ./tests/EventManagement.Services.Converto.Tests/
RUN dotnet restore

# copy everything else
COPY . ./

# Publish
WORKDIR /app/src/src/EventManagement.Web
RUN dotnet publish -c Release -o /app/out

#
# Stage 1
# Copy the built files over
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1

# Copy files over from the build stage
WORKDIR /app
COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "losol.EventManagement.Web.dll"]