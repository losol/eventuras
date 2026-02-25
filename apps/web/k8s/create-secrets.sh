#!/usr/bin/env bash
# create-secrets.sh – Create eventuras-web-secrets in one or more k8s namespaces.
#
# Usage:
#   TENANT=internal ENV=dev ./create-secrets.sh
#   TENANT=internal ENV=staging ./create-secrets.sh
#   TENANT=internal ENV=prod ./create-secrets.sh
#
# Prerequisites: kubectl configured against the target cluster.
#
# The secret name MUST be "eventuras-web-secrets" (matches deployment.yaml secretRef).
# Namespaces follow the chart default: eventuras-web-<tenant>-<env>
# Override with NAMESPACE= env var if you used namespace: override in values.

set -euo pipefail

TENANT="${TENANT:?Set TENANT env var, e.g. internal}"
ENV="${ENV:?Set ENV env var: dev | staging | prod}"
NAMESPACE="${NAMESPACE:-eventuras-web-${TENANT}-${ENV}}"
SECRET_NAME="eventuras-web-secrets"

echo "Creating secret '${SECRET_NAME}' in namespace '${NAMESPACE}'"
echo ""

# Prompt for secrets if not already set as env vars
read_secret() {
  local var="$1"
  local prompt="$2"
  if [[ -z "${!var:-}" ]]; then
    read -rsp "${prompt}: " value
    echo ""
    printf -v "$var" '%s' "$value"
  fi
}

read_secret AUTH0_CLIENT_ID    "AUTH0_CLIENT_ID"
read_secret AUTH0_CLIENT_SECRET "AUTH0_CLIENT_SECRET"
read_secret AUTH0_API_AUDIENCE "AUTH0_API_AUDIENCE"
read_secret SESSION_SECRET     "SESSION_SECRET"

kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic "${SECRET_NAME}" \
  --namespace="${NAMESPACE}" \
  --from-literal=AUTH0_CLIENT_ID="${AUTH0_CLIENT_ID}" \
  --from-literal=AUTH0_CLIENT_SECRET="${AUTH0_CLIENT_SECRET}" \
  --from-literal=AUTH0_API_AUDIENCE="${AUTH0_API_AUDIENCE}" \
  --from-literal=SESSION_SECRET="${SESSION_SECRET}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo ""
echo "Done. Secret '${SECRET_NAME}' is set in namespace '${NAMESPACE}'."
