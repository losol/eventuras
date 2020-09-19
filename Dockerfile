#
# Stage 0
# Build the project
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /app/src

# copy csproj and restore dependencies
COPY ./Eventuras.sln .
COPY ./src/Eventuras.Web/*.csproj ./src/Eventuras.Web/
COPY ./src/Eventuras.Services/*.csproj ./src/Eventuras.Services/
COPY ./src/Eventuras.Services.Converto/*.csproj ./src/Eventuras.Services.Converto/
COPY ./src/Eventuras.Services.Auth0/*.csproj ./src/Eventuras.Services.Auth0/
COPY ./src/Eventuras.Services.TalentLms/*.csproj ./src/Eventuras.Services.TalentLms/
COPY ./src/Eventuras.Services.Zoom/*.csproj ./src/Eventuras.Services.Zoom/
COPY ./src/Eventuras.Infrastructure/*.csproj ./src/Eventuras.Infrastructure/
COPY ./src/Eventuras.Domain/*.csproj ./src/Eventuras.Domain/
COPY ./tests/Eventuras.UnitTests/*.csproj ./tests/Eventuras.UnitTests/
COPY ./tests/Eventuras.IntegrationTests/*.csproj ./tests/Eventuras.IntegrationTests/
COPY ./tests/Eventuras.Services.Converto.Tests/*.csproj ./tests/Eventuras.Services.Converto.Tests/
COPY ./tests/Eventuras.Services.TalentLms.Tests/*.csproj ./tests/Eventuras.Services.TalentLms.Tests/
COPY ./tests/Eventuras.TestAbstractions/*.csproj ./tests/Eventuras.TestAbstractions/
RUN dotnet restore

# copy everything else
COPY . ./

# Publish
WORKDIR /app/src/src/Eventuras.Web
RUN dotnet publish -c Release -o /app/out

#
# Stage 1
# Copy the built files over
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1

# Copy files over from the build stage
WORKDIR /app
COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "Eventuras.Web.dll"]