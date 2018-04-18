# 
# Stage 0
# Build the project
FROM microsoft/dotnet:2.1-sdk AS build-env

# Install node
ENV NODE_VERSION 8.11.1
ENV NODE_DOWNLOAD_SHA 0e20787e2eda4cc31336d8327556ebc7417e8ee0a6ba0de96a09b0ec2b841f60
RUN curl -SL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" --output nodejs.tar.gz \
    && echo "$NODE_DOWNLOAD_SHA nodejs.tar.gz" | sha256sum -c - \
    && tar -xzf "nodejs.tar.gz" -C /usr/local --strip-components=1 \
    && rm nodejs.tar.gz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# This is needed for PhantomJS to successfully install
RUN apt-get update
RUN apt-get install bzip2

# Install html-pdf
WORKDIR /app/packages
RUN npm install html-pdf

# copy csproj and restore dependencies
WORKDIR /app/src
COPY ./EventManagement.Web/*.csproj ./EventManagement.Web/
COPY ./EventManagement.Services/*.csproj ./EventManagement.Services/
COPY ./EventManagement.Infrastructure/*.csproj ./EventManagement.Infrastructure/
COPY ./EventManagement.Domain/*.csproj ./EventManagement.Domain/
RUN dotnet restore EventManagement.Web/EventManagement.Web.csproj

# Copy the package.json file
COPY ./EventManagement.Web/package*.json ./EventManagement.Web/
RUN npm --prefix ./EventManagement.Web install ./EventManagement.Web

# copy everything else and build
COPY . ./
RUN dotnet publish ./EventManagement.Web/EventManagement.Web.csproj -c Release -o /app/out

# Install html-pdf in the publish directory
WORKDIR /app/out
RUN cp -r /app/packages/node_modules .

# 
# Stage 1
# Copy the built files over
FROM microsoft/dotnet:2.1-aspnetcore-runtime

# Install node (required for NodeServices)
ENV NODE_VERSION 8.11.1
ENV NODE_DOWNLOAD_SHA 0e20787e2eda4cc31336d8327556ebc7417e8ee0a6ba0de96a09b0ec2b841f60
RUN curl -SL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" --output nodejs.tar.gz \
    && echo "$NODE_DOWNLOAD_SHA nodejs.tar.gz" | sha256sum -c - \
    && tar -xzf "nodejs.tar.gz" -C /usr/local --strip-components=1 \
    && rm nodejs.tar.gz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Install libfontconfig (required by PhantomJS)
RUN apt-get -qq update && apt-get --assume-yes install libfontconfig

# Copy files over from the build-env stage
WORKDIR /app
COPY --from=build-env /app/out .

ENTRYPOINT ["dotnet", "losol.EventManagement.Web.dll"]