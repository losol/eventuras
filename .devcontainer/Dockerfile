
ARG NET_VERSION="5.0"
ARG INSTALL_NODE="true"
ARG NODE_VERSION="lts/*"

FROM mcr.microsoft.com/vscode/devcontainers/dotnet:0-${NET_VERSION}

RUN if [ "${INSTALL_NODE}" = "true" ]; then su vscode -c "umask 0002 && . /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} 2>&1"; fi

