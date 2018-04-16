# Step 0
# Build the project
FROM microsoft/aspnetcore-build:2.0.5-2.1.4 AS build-env
WORKDIR /app

# copy csproj and restore as distinct layers
COPY ./EventManagement.Web/*.csproj ./EventManagement.Web/
COPY ./EventManagement.Services/*.csproj ./EventManagement.Services/
COPY ./EventManagement.Infrastructure/*.csproj ./EventManagement.Infrastructure/
COPY ./EventManagement.Domain/*.csproj ./EventManagement.Domain/
RUN dotnet restore EventManagement.Web/EventManagement.Web.csproj

# Copy the package.json file & restore from it
COPY ./EventManagement.Web/package*.json ./EventManagement.Web/
RUN npm --prefix ./EventManagement.Web install ./EventManagement.Web

# copy everything else and build
COPY . ./
RUN dotnet publish ./EventManagement.Web/EventManagement.Web.csproj -c Release -o /app/out

# Step 1
# Build runtime image
FROM microsoft/aspnetcore:2.0.5
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "losol.EventManagement.Web.dll"]