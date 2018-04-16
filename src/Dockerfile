# Stage 0
# Build the project
FROM microsoft/dotnet:2.1-sdk AS build-env
WORKDIR /app

# copy csproj and restore as distinct layers
COPY ./EventManagement.Web/*.csproj ./EventManagement.Web/
COPY ./EventManagement.Services/*.csproj ./EventManagement.Services/
COPY ./EventManagement.Infrastructure/*.csproj ./EventManagement.Infrastructure/
COPY ./EventManagement.Domain/*.csproj ./EventManagement.Domain/
RUN dotnet restore EventManagement.Web/EventManagement.Web.csproj

# Install node
ENV NODE_VERSION 8.9.4
ENV NODE_DOWNLOAD_SHA 21fb4690e349f82d708ae766def01d7fec1b085ce1f5ab30d9bda8ee126ca8fc
RUN curl -SL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" --output nodejs.tar.gz \
    && echo "$NODE_DOWNLOAD_SHA nodejs.tar.gz" | sha256sum -c - \
    && tar -xzf "nodejs.tar.gz" -C /usr/local --strip-components=1 \
    && rm nodejs.tar.gz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Copy the package.json file
# The restoring will be done by the dotnet publish command
COPY ./EventManagement.Web/package*.json ./EventManagement.Web/

# This is needed for PhantomJS to successfully install
RUN apt-get update
RUN apt-get install bzip2

# copy everything else and build
COPY . ./
RUN dotnet publish ./EventManagement.Web/EventManagement.Web.csproj -c Release -o /app/out

# Stage 1
# Build runtime image
FROM microsoft/dotnet:2.1-aspnetcore-runtime
WORKDIR /app
COPY --from=build-env /app/out .

# Install node
ENV NODE_VERSION 8.9.4
ENV NODE_DOWNLOAD_SHA 21fb4690e349f82d708ae766def01d7fec1b085ce1f5ab30d9bda8ee126ca8fc
RUN curl -SL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" --output nodejs.tar.gz \
    && echo "$NODE_DOWNLOAD_SHA nodejs.tar.gz" | sha256sum -c - \
    && tar -xzf "nodejs.tar.gz" -C /usr/local --strip-components=1 \
    && rm nodejs.tar.gz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs
# RUN npm install html-pdf

ENTRYPOINT ["dotnet", "losol.EventManagement.Web.dll"]